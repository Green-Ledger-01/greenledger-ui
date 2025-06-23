import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Input, Button, message, Typography, Space, Divider, Tag, Alert } from 'antd';
import { SendOutlined, UserOutlined, EnvironmentOutlined, FileTextOutlined } from '@ant-design/icons';
import { useAccount } from 'wagmi';
import { useTransferWithProvenance, useUserTokenHistory, useProvenanceHistory, getStateLabel, getStateColor } from '../hooks/useSupplyChainManager';
import { useCropBatchTokens } from '../hooks/useCropBatchToken';
import { useUserRole } from '../hooks/useUserManagement';
import { CONTRACT_ADDRESSES, SUPPLY_CHAIN_STATES } from '../config/constants';
import SupplyChainManagerABI from '../contracts/SupplyChainManager.json';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TokenOption {
  tokenId: bigint;
  cropType: string;
  currentState: number;
  currentOwner: string;
}

const TransferOwnershipPage: React.FC = () => {
  const { address } = useAccount();
  const [form] = Form.useForm();
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [userTokens, setUserTokens] = useState<TokenOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Hooks
  const { data: userRole } = useUserRole(address);
  const { data: tokenHistory } = useUserTokenHistory(address);
  const { data: allTokens } = useCropBatchTokens();
  const { writeContract: transferWithProvenance, isPending: isTransferring } = useTransferWithProvenance();

  // Load user's transferable tokens
  useEffect(() => {
    if (tokenHistory && allTokens) {
      const transferableTokens: TokenOption[] = [];
      
      tokenHistory.forEach((tokenId: bigint) => {
        const tokenData = allTokens.find((token: any) => token.tokenId === tokenId);
        if (tokenData) {
          // Check if user can transfer this token based on current state and role
          const canTransfer = checkTransferEligibility(tokenData.currentState, userRole);
          if (canTransfer) {
            transferableTokens.push({
              tokenId: tokenData.tokenId,
              cropType: tokenData.cropType,
              currentState: tokenData.currentState,
              currentOwner: tokenData.currentOwner,
            });
          }
        }
      });
      
      setUserTokens(transferableTokens);
    }
  }, [tokenHistory, allTokens, userRole]);

  const checkTransferEligibility = (currentState: number, role: number): boolean => {
    // Farmers can transfer from Produced state
    if (role === 0 && currentState === SUPPLY_CHAIN_STATES.PRODUCED) return true;
    // Transporters can transfer from InTransit state
    if (role === 1 && currentState === SUPPLY_CHAIN_STATES.IN_TRANSIT) return true;
    // Buyers can transfer from Delivered state (resale)
    if (role === 2 && currentState === SUPPLY_CHAIN_STATES.DELIVERED) return true;
    return false;
  };

  const getValidRecipientRoles = (currentState: number, senderRole: number): string[] => {
    if (senderRole === 0 && currentState === SUPPLY_CHAIN_STATES.PRODUCED) {
      return ['Transporter', 'Buyer'];
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

  const handleTransfer = async (values: any) => {
    if (!selectedToken || !address) {
      message.error('Please select a token and ensure wallet is connected');
      return;
    }

    try {
      setLoading(true);

      transferWithProvenance({
        address: CONTRACT_ADDRESSES.SupplyChainManager as `0x${string}`,
        abi: SupplyChainManagerABI.abi,
        functionName: 'transferWithProvenance',
        args: [
          selectedToken.tokenId,
          address,
          values.recipientAddress,
          values.location || '',
          values.notes || ''
        ]
      });

      message.success('Token transfer initiated successfully!');
      form.resetFields();
      setSelectedToken(null);

    } catch (error: any) {
      console.error('Transfer failed:', error);
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
              loading={!userTokens.length}
            >
              {userTokens.map((token) => (
                <Option key={token.tokenId.toString()} value={token.tokenId.toString()}>
                  <Space>
                    <Text strong>#{token.tokenId.toString()}</Text>
                    <Text>{token.cropType}</Text>
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
                <Space direction="vertical" size="small">
                  <Text><strong>Token ID:</strong> #{selectedToken.tokenId.toString()}</Text>
                  <Text><strong>Crop Type:</strong> {selectedToken.cropType}</Text>
                  <Text><strong>Current State:</strong> 
                    <Tag color={getStateColor(selectedToken.currentState)} style={{ marginLeft: '8px' }}>
                      {getStateLabel(selectedToken.currentState)}
                    </Tag>
                  </Text>
                  <Text><strong>Your Role:</strong> {getRoleLabel(userRole || 0)}</Text>
                  <Text><strong>Can Transfer To:</strong> {getValidRecipientRoles(selectedToken.currentState, userRole || 0).join(', ')}</Text>
                </Space>
              </div>
              <Divider />
            </>
          )}

          <Form.Item
            label="Recipient Address"
            name="recipientAddress"
            rules={[
              { required: true, message: 'Please enter recipient address' },
              { pattern: /^0x[a-fA-F0-9]{40}$/, message: 'Please enter a valid Ethereum address' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="0x..."
              disabled={!selectedToken}
            />
          </Form.Item>

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
              prefix={<FileTextOutlined />}
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
              Transfer Ownership
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {userTokens.length === 0 && (
        <Alert
          style={{ marginTop: '16px' }}
          message="No Transferable Tokens"
          description="You don't have any tokens that can be transferred at this time. Tokens can only be transferred based on your role and the current state of the token."
          type="info"
          showIcon
        />
      )}
    </div>
  );
};

export default TransferOwnershipPage;
