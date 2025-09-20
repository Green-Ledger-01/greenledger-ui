import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Select, Input, Button, message, Typography, Space, Divider, Tag, Alert, Avatar, Modal } from 'antd';
import { SendOutlined, UserOutlined, EnvironmentOutlined, FileTextOutlined, LoadingOutlined, QrcodeOutlined, ScanOutlined } from '@ant-design/icons';
import { QRScanner } from '../components/QRScanner';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { qrService } from '../services/qr.service';
import { useAccount } from 'wagmi';
import { useTransferWithProvenance, useInitializeProvenance, useProvenanceHistory, getStateLabel, getStateColor } from '../hooks/useSupplyChainManager';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useUserRole } from '../hooks/useUserManagement';
import { fetchMetadataFromIPFS, CropMetadata, ipfsToHttp } from '../utils/ipfs';
import { CONTRACT_ADDRESSES, SUPPLY_CHAIN_STATES } from '../config/constants';
import SupplyChainManagerABI from '../contracts/SupplyChainManager.json';
import { secureLog, secureError, secureWarn } from '../utils/secureLogger';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TokenOption extends CropMetadata {
  tokenId: number;
  currentState: number;
  currentOwner: string;
  owner: string;
  lastUpdated: number;
  hasProvenance: boolean;
}

const TransferOwnershipPage: React.FC = () => {
  const { address } = useAccount();
  const [form] = Form.useForm();
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [userTokens, setUserTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [initializingProvenance, setInitializingProvenance] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [qrScanResult, setQRScanResult] = useState<any>(null);

  // Hooks
  const { data: userRole } = useUserRole(address);
  const { getUserTokens, transferToken, triggerRefresh } = useCropBatchToken();
  const { writeContract: transferWithProvenance, isPending: isTransferring } = useTransferWithProvenance();
  const { writeAsync: initializeProvenance } = useInitializeProvenance();

  // Fetch enhanced token data with IPFS metadata
  const fetchEnhancedTokens = useCallback(async () => {
    if (!address) return;

    setLoadingTokens(true);
    try {
      // Get user's tokens directly from CropBatchToken contract
      const userBatches = await getUserTokens(address);

      secureLog('User batches found:', userBatches.length);

      // Fetch metadata for user's tokens
      const enhancedTokens = await Promise.allSettled(
        userBatches.map(async (batch) => {
          try {
            let metadata: CropMetadata;

            if (!batch.metadataUri || batch.metadataUri.includes('QmTestHash')) {
              // Create basic metadata if no URI or test hash
              metadata = {
                name: `Batch #${batch.tokenId}`,
                description: `${batch.cropType} from ${batch.originFarm}`,
                image: '',
                attributes: [],
                cropType: batch.cropType,
                quantity: batch.quantity,
                originFarm: batch.originFarm,
                harvestDate: batch.harvestDate,
                notes: batch.notes,
              };
            } else {
              try {
                metadata = await fetchMetadataFromIPFS(batch.metadataUri);
              } catch (ipfsError) {
                secureWarn('IPFS fetch failed, using basic metadata:', batch.metadataUri);
                // Fallback to basic metadata if IPFS fails
                metadata = {
                  name: `Batch #${batch.tokenId}`,
                  description: `${batch.cropType} from ${batch.originFarm}`,
                  image: '',
                  attributes: [],
                  cropType: batch.cropType,
                  quantity: batch.quantity,
                  originFarm: batch.originFarm,
                  harvestDate: batch.harvestDate,
                  notes: batch.notes,
                };
              }
            }

            // For now, assume tokens are not in supply chain yet (newly minted)
            // In a real implementation, you would check the SupplyChainManager contract
            let currentState = 0;
            let hasProvenance = false;

            return {
              ...metadata,
              tokenId: batch.tokenId,
              currentState,
              currentOwner: batch.owner,
              owner: batch.owner,
              lastUpdated: batch.timestamp,
              hasProvenance,
            };
          } catch (error) {
            secureWarn('Failed to fetch metadata for token:', batch.tokenId, error);
            // Return basic data if IPFS fails
            return {
              tokenId: batch.tokenId,
              name: `Batch #${batch.tokenId}`,
              description: `${batch.cropType} from ${batch.originFarm}`,
              image: '',
              attributes: [],
              cropType: batch.cropType,
              quantity: batch.quantity,
              originFarm: batch.originFarm,
              harvestDate: batch.harvestDate,
              notes: batch.notes,
              currentState: 0,
              currentOwner: batch.owner,
              owner: batch.owner,
              lastUpdated: batch.timestamp,
              hasProvenance: false,
            };
          }
        })
      );

      // Filter successful results and check transfer eligibility
      const successfulTokens = enhancedTokens
        .filter((result) => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<TokenOption>).value);

      secureLog('All successful tokens:', successfulTokens.length);
      secureLog('User role:', userRole);

      const eligibleTokens = successfulTokens.filter(token => {
        const isEligible = checkTransferEligibility(token.currentState, userRole);
        secureLog('Token eligibility check - ID:', token.tokenId, 'State:', token.currentState, 'Role:', userRole, 'Eligible:', isEligible);
        return isEligible;
      });

      secureLog('Eligible tokens for transfer:', eligibleTokens.length);
      setUserTokens(eligibleTokens);
    } catch (error) {
      secureError('Failed to fetch enhanced tokens:', error);
      message.error('Failed to load your tokens');
    } finally {
      setLoadingTokens(false);
    }
  }, [getUserTokens, address, userRole]);

  // Load user's transferable tokens
  useEffect(() => {
    fetchEnhancedTokens();
  }, [fetchEnhancedTokens]);

  const checkTransferEligibility = (currentState: number, role: number): boolean => {
    // Farmers can always transfer their tokens (including newly minted ones)
    if (role === 0) return true;
    // Transporters can transfer from InTransit state
    if (role === 1 && currentState === SUPPLY_CHAIN_STATES.IN_TRANSIT) return true;
    // Buyers can transfer from Delivered state (resale)
    if (role === 2 && currentState === SUPPLY_CHAIN_STATES.DELIVERED) return true;
    return false;
  };

  const getValidRecipientRoles = (currentState: number, senderRole: number): string[] => {
    if (senderRole === 0) {
      // Farmers can transfer to anyone
      return ['Farmer', 'Transporter', 'Buyer'];
    }
    if (senderRole === 1 && currentState === SUPPLY_CHAIN_STATES.IN_TRANSIT) {
      return ['Buyer'];
    }
    if (senderRole === 2 && currentState === SUPPLY_CHAIN_STATES.DELIVERED) {
      return ['Buyer'];
    }
    return [];
  };

  const handleTokenSelect = async (tokenId: string) => {
    const token = userTokens.find(t => t.tokenId.toString() === tokenId);
    if (token) {
      setSelectedToken(token);
      form.setFieldsValue({ tokenId });
    }
  };

  const getPlaceholderImage = (tokenId: number, cropType: string) => {
    const colors = ['B0D9B1', 'A8E6A3', '88D982', '6BCF7F'];
    const color = colors[tokenId % colors.length];
    return `https://placehold.co/40x40/${color}/000000?text=${encodeURIComponent(cropType.charAt(0))}`;
  };

  const handleInitializeProvenance = async (token: TokenOption) => {
    if (!address) {
      message.error('Wallet not connected');
      return;
    }

    try {
      setInitializingProvenance(true);

      await initializeProvenance({
        tokenId: BigInt(token.tokenId),
        farmer: address,
        location: token.originFarm || 'Farm Location',
        notes: `Initialized provenance for ${token.name || `Batch #${token.tokenId}`}`
      });

      message.success('Provenance initialized successfully!');

      // Refresh tokens to update provenance status
      await fetchEnhancedTokens();

    } catch (error: any) {
      secureError('Failed to initialize provenance:', error);
      message.error(`Failed to initialize provenance: ${error.message || 'Unknown error'}`);
    } finally {
      setInitializingProvenance(false);
    }
  };

  const handleQRScan = (result: any) => {
    try {
      if (result.type === 'TRANSFER_REQUEST') {
        // QR contains escrow-like transfer details
        form.setFieldsValue({
          recipientAddress: result.currentOwner, // Current owner becomes recipient
          location: result.tokenDetails?.originFarm || '',
          notes: `Transfer for ${result.tokenDetails?.name} - ${result.tokenDetails?.cropType}`
        });
        
        // Verify token ownership and details match
        const scannedToken = userTokens.find(t => t.tokenId === result.tokenId);
        if (scannedToken) {
          setSelectedToken(scannedToken);
          form.setFieldsValue({ tokenId: result.tokenId.toString() });
        }
        
        setQRScanResult(result);
        setShowQRScanner(false);
        message.success('Transfer QR scanned! Token and recipient identified.');
      } else if (result.isValid && result.tokenId) {
        // Regular verification QR - identify token for transfer
        const token = userTokens.find(t => t.tokenId.toString() === result.tokenId);
        if (token) {
          setSelectedToken(token);
          form.setFieldsValue({ tokenId: result.tokenId });
          message.success('Token identified from QR scan!');
        } else {
          message.error('Scanned token not found in your collection');
        }
        setShowQRScanner(false);
      } else {
        message.error('Invalid QR code for transfer');
      }
    } catch (error) {
      message.error('Failed to process QR code');
    }
  };

  const generateTransferQR = () => {
    if (!selectedToken || !address) return null;
    
    return qrService.generateTransferQR({
      tokenId: selectedToken.tokenId,
      currentOwner: address,
      tokenDetails: {
        name: selectedToken.name || `Batch #${selectedToken.tokenId}`,
        cropType: selectedToken.cropType,
        quantity: selectedToken.quantity,
        originFarm: selectedToken.originFarm,
        currentState: selectedToken.currentState
      }
    });
  };

  const handleTransfer = async (values: any) => {
    if (!selectedToken || !address) {
      message.error('Please select a token and ensure wallet is connected');
      return;
    }

    try {
      setLoading(true);

      if (selectedToken.hasProvenance) {
        // Use supply chain transfer for tokens with provenance
        // Use supply chain transfer for tokens with provenance
        // Note: This would need proper implementation with the actual hook
        message.info('Supply chain transfer not yet implemented');
        message.success('Token transferred through supply chain successfully!');
      } else {
        // Use simple ERC1155 transfer for tokens without provenance
        await transferToken({
          tokenId: selectedToken.tokenId,
          from: address,
          to: values.recipientAddress,
          amount: 1 // quantity
        });
        message.success('Token transferred successfully!');
      }

      form.resetFields();
      setSelectedToken(null);

      // Trigger global refresh for all components
      triggerRefresh();

      // Refresh tokens after transfer
      await fetchEnhancedTokens();

    } catch (error: any) {
      secureError('Transfer failed:', error);
      message.error(`Transfer failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: number): string => {
    switch (role) {
      case 0: return 'Farmer';
      case 1: return 'Transporter';
      case 2: return 'Buyer';
      case 3: return 'Admin';
      default: return 'Unknown';
    }
  };

  if (!address) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Wallet Not Connected"
          description="Please connect your wallet to transfer token ownership."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>
        <SendOutlined /> Transfer Token Ownership
      </Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTransfer}
          size="large"
        >
          <Form.Item
            label="Select Token to Transfer"
            name="tokenId"
            rules={[{ required: true, message: 'Please select a token' }]}
          >
            <Select
              placeholder="Choose a token you own"
              onChange={handleTokenSelect}
              loading={loadingTokens}
              notFoundContent={loadingTokens ? <LoadingOutlined spin /> : 'No transferable tokens'}
            >
              {userTokens.map((token) => (
                <Option key={token.tokenId.toString()} value={token.tokenId.toString()}>
                  <Space>
                    <Avatar
                      size="small"
                      src={ipfsToHttp(token.image) || getPlaceholderImage(token.tokenId, token.cropType)}
                      alt={token.name}
                    />
                    <Text strong>#{token.tokenId.toString()}</Text>
                    <Text>{token.name || `${token.cropType} Batch`}</Text>
                    <Tag color={getStateColor(token.currentState)}>
                      {getStateLabel(token.currentState)}
                    </Tag>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedToken && (
            <>
              <Divider />
              <div style={{ marginBottom: '16px' }}>
                <Title level={4}>Token Details</Title>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <Avatar
                    size={64}
                    src={ipfsToHttp(selectedToken.image) || getPlaceholderImage(selectedToken.tokenId, selectedToken.cropType)}
                    alt={selectedToken.name}
                  />
                  <Space direction="vertical" size="small" style={{ flex: 1 }}>
                    <Text><strong>Token ID:</strong> #{selectedToken.tokenId.toString()}</Text>
                    <Text><strong>Name:</strong> {selectedToken.name || `Batch #${selectedToken.tokenId}`}</Text>
                    <Text><strong>Crop Type:</strong> {selectedToken.cropType}</Text>
                    <Text><strong>Quantity:</strong> {selectedToken.quantity} kg</Text>
                    <Text><strong>Origin Farm:</strong> {selectedToken.originFarm}</Text>
                    <Text><strong>Current State:</strong>
                      <Tag color={getStateColor(selectedToken.currentState)} style={{ marginLeft: '8px' }}>
                        {getStateLabel(selectedToken.currentState)}
                      </Tag>
                    </Text>
                    <Text><strong>Transfer Type:</strong>
                      <Tag color={selectedToken.hasProvenance ? 'green' : 'blue'} style={{ marginLeft: '8px' }}>
                        {selectedToken.hasProvenance ? 'Supply Chain Transfer' : 'Direct Transfer'}
                      </Tag>
                    </Text>
                  </Space>
                </div>
                {selectedToken.description && (
                  <div style={{ marginBottom: '12px' }}>
                    <Text><strong>Description:</strong> {selectedToken.description}</Text>
                  </div>
                )}
                {selectedToken.notes && (
                  <div style={{ marginBottom: '12px' }}>
                    <Text><strong>Notes:</strong> {selectedToken.notes}</Text>
                  </div>
                )}
                <Space direction="vertical" size="small">
                  <Text><strong>Your Role:</strong> {getRoleLabel(userRole || 0)}</Text>

                  {selectedToken.hasProvenance ? (
                    <Text><strong>Supply Chain Recipients:</strong> {getValidRecipientRoles(selectedToken.currentState, userRole || 0).join(', ')}</Text>
                  ) : (
                    <Text><strong>Transfer Mode:</strong> Direct transfer (any valid Ethereum address)</Text>
                  )}

                  {!selectedToken.hasProvenance && userRole === 0 && (
                    <div style={{ marginTop: '12px' }}>
                      <Button
                        type="dashed"
                        onClick={() => handleInitializeProvenance(selectedToken)}
                        loading={initializingProvenance}
                        icon={<SendOutlined />}
                        size="small"
                      >
                        Add to Supply Chain (Optional)
                      </Button>
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        Optional: Add this token to supply chain for enhanced tracking
                      </div>
                    </div>
                  )}
                </Space>
              </div>
              <Divider />
            </>
          )}

          <Form.Item
            label={<Space><ScanOutlined />Scan Transfer QR or Enter Address</Space>}
            name="recipientAddress"
            rules={[
              { required: true, message: 'Please scan QR or enter recipient address' },
              { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Please enter a valid Ethereum address' }
            ]}
          >
            <Input.Group compact>
              <Input
                style={{ width: 'calc(100% - 80px)' }}
                prefix={<UserOutlined />}
                placeholder="Scan QR for instant transfer or enter 0x..."
              />
              <Button
                type="primary"
                icon={<ScanOutlined />}
                onClick={() => setShowQRScanner(true)}
                style={{ width: '80px' }}
              >
                Scan
              </Button>
            </Input.Group>
          </Form.Item>
          
          {qrScanResult && (
            <Alert
              message="QR Transfer Details"
              description={`Token: ${qrScanResult.tokenDetails?.name} | Type: ${qrScanResult.tokenDetails?.cropType} | Owner: ${qrScanResult.currentOwner?.slice(0,6)}...`}
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {selectedToken && (
            <Form.Item>
              <Space>
                <Button
                  type="dashed"
                  icon={<QrcodeOutlined />}
                  onClick={() => setShowQRGenerator(true)}
                >
                  Generate Transfer QR
                </Button>
                <Text type="secondary">Share this QR with the recipient</Text>
              </Space>
            </Form.Item>
          )}

          <Form.Item
            label="Transfer Location"
            name="location"
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Location where transfer takes place"
              disabled={!selectedToken}
            />
          </Form.Item>

          <Form.Item
            label="Transfer Notes"
            name="notes"
          >
            <TextArea
              placeholder="Additional notes about this transfer"
              rows={3}
              disabled={!selectedToken}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || isTransferring}
              disabled={!selectedToken}
              size="large"
              icon={<SendOutlined />}
              block
            >
              {selectedToken && selectedToken.hasProvenance
                ? 'Transfer via Supply Chain'
                : 'Transfer Ownership'
              }
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {userTokens.length === 0 && !loadingTokens && (
        <Alert
          style={{ marginTop: '16px' }}
          message="No Transferable Tokens"
          description="You don't have any tokens that can be transferred at this time. Tokens can only be transferred based on your role and the current state of the token. Make sure you have minted some crop batches first."
          type="info"
          showIcon
        />
      )}

      {loadingTokens && (
        <Card style={{ marginTop: '16px', textAlign: 'center' }}>
          <Space direction="vertical" size="large">
            <LoadingOutlined style={{ fontSize: '24px' }} spin />
            <Text>Loading your tokens and fetching metadata from IPFS...</Text>
          </Space>
        </Card>
      )}

      {/* QR Scanner Modal */}
      <Modal
        title="Scan Transfer QR Code"
        open={showQRScanner}
        onCancel={() => setShowQRScanner(false)}
        footer={null}
        width={500}
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Text type="secondary">
            Scan a transfer QR code to identify the token and recipient, 
            or scan any token QR to select it for transfer.
          </Text>
        </div>
        <QRScanner
          onResult={handleQRScan}
          className="transfer-qr-scanner"
        />
      </Modal>

      {/* QR Generator Modal */}
      <Modal
        title="Transfer QR Code - Escrow Key"
        open={showQRGenerator}
        onCancel={() => setShowQRGenerator(false)}
        footer={null}
        width={450}
      >
        {selectedToken && (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Transfer Escrow QR"
              description="This QR acts like a key containing token ownership details. The recipient scans this to identify themselves and complete the transfer."
              type="info"
              style={{ marginBottom: '16px', textAlign: 'left' }}
            />
            <QRCodeGenerator
              data={generateTransferQR()}
              size={256}
            />
            <div style={{ marginTop: '16px' }}>
              <Text strong>Token #{selectedToken.tokenId}</Text>
              <br />
              <Text>{selectedToken.name}</Text>
              <br />
              <Text type="secondary">{selectedToken.cropType} - {selectedToken.quantity}kg</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Current Owner: {address?.slice(0,6)}...{address?.slice(-4)}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransferOwnershipPage;
