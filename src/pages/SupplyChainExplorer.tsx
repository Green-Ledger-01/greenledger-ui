import React, { useState, useEffect } from 'react';
import { Card, Input, Table, Tag, Typography, Space, Button, Modal, Timeline, Descriptions, Alert, Select, Spin, Row, Col } from 'antd';
import { SearchOutlined, EyeOutlined, EnvironmentOutlined, UserOutlined, ClockCircleOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAccount } from 'wagmi';
import {
  useTokensInState,
  useProvenanceHistory,
  useProvenanceStep,
  getStateLabel,
  getStateColor,
  formatTimestamp,
  formatAddress,
  ProvenanceRecord,
  ProvenanceStep
} from '../hooks/useSupplyChainManager';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { fetchMetadataFromIPFS, CropMetadata } from '../utils/ipfs';
import { SUPPLY_CHAIN_STATES, SUPPLY_CHAIN_STATE_LABELS } from '../config/constants';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface TokenData extends CropMetadata {
  tokenId: number;
  currentState: number;
  currentOwner: string;
  originalFarmer: string;
  creationTime: number;
  totalSteps: number;
  hasProvenance: boolean;
}

interface ProvenanceModalData {
  visible: boolean;
  tokenId?: number;
  tokenData?: TokenData;
}

const SupplyChainExplorer: React.FC = () => {
  const { address } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<number | undefined>(undefined);
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>([]);
  const [provenanceModal, setProvenanceModal] = useState<ProvenanceModalData>({ visible: false });
  const [provenanceSteps, setProvenanceSteps] = useState<ProvenanceStep[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [allTokens, setAllTokens] = useState<TokenData[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);

  // Hooks
  const { getAllBatches } = useCropBatchToken();
  const { data: provenanceHistory } = useProvenanceHistory(provenanceModal.tokenId ? BigInt(provenanceModal.tokenId) : undefined);

  // Fetch all tokens with provenance data
  const fetchAllTokensWithProvenance = async () => {
    setTokensLoading(true);
    try {
      // Get all minted tokens from CropBatchToken contract
      const allBatches = await getAllBatches();

      const tokensWithProvenance: TokenData[] = [];

      for (const batch of allBatches) {
        try {
          // Try to fetch metadata from IPFS
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
              console.warn(`IPFS fetch failed for ${batch.metadataUri}, using basic metadata`);
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

          // Create token data with default values (no provenance)
          const tokenData: TokenData = {
            ...metadata,
            tokenId: batch.tokenId,
            currentState: 0, // Default to Produced state
            currentOwner: batch.owner,
            originalFarmer: batch.minter,
            creationTime: batch.timestamp,
            totalSteps: 0,
            hasProvenance: false,
          };

          tokensWithProvenance.push(tokenData);
        } catch (error) {
          console.warn(`Failed to process token ${batch.tokenId}:`, error);
          // Add basic token data even if processing fails
          const basicTokenData: TokenData = {
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
            originalFarmer: batch.minter,
            creationTime: batch.timestamp,
            totalSteps: 0,
            hasProvenance: false,
          };
          tokensWithProvenance.push(basicTokenData);
        }
      }

      setAllTokens(tokensWithProvenance);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setTokensLoading(false);
    }
  };

  // Load tokens on component mount
  useEffect(() => {
    fetchAllTokensWithProvenance();
  }, []);

  // Filter tokens based on search and state
  useEffect(() => {
    if (!allTokens) return;

    let filtered = allTokens.filter((token: TokenData) => {
      const matchesSearch = !searchTerm ||
        token.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.tokenId.toString().includes(searchTerm) ||
        token.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState = selectedState === undefined || token.currentState === selectedState;

      return matchesSearch && matchesState;
    });

    setFilteredTokens(filtered);
  }, [allTokens, searchTerm, selectedState]);

  // Load provenance steps when modal opens
  useEffect(() => {
    if (provenanceModal.visible && provenanceModal.tokenId && provenanceHistory) {
      loadProvenanceSteps();
    }
  }, [provenanceModal.visible, provenanceModal.tokenId, provenanceHistory]);

  const loadProvenanceSteps = async () => {
    if (!provenanceHistory || !provenanceModal.tokenId) return;

    setLoadingSteps(true);
    try {
      const steps: ProvenanceStep[] = [];
      const totalSteps = Number(provenanceHistory[5]); // totalSteps from getProvenanceHistory

      // If no steps in provenance, show basic token info
      if (totalSteps === 0) {
        const basicStep: ProvenanceStep = {
          actor: provenanceHistory[1] as string, // originalFarmer
          state: 0, // Produced state
          timestamp: provenanceHistory[2] as bigint, // creationTime
          location: 'Farm Location',
          notes: 'Token minted but not yet in supply chain',
          transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
        };
        steps.push(basicStep);
      } else {
        // Fetch each provenance step from the contract
        for (let i = 0; i < totalSteps; i++) {
          try {
            // Note: We would need to implement useProvenanceStep hook call here
            // For now, create a basic step structure with available data
            const step: ProvenanceStep = {
              actor: i === 0 ? provenanceHistory[1] as string : provenanceHistory[4] as string, // originalFarmer or currentOwner
              state: i, // Step index as state approximation
              timestamp: provenanceHistory[2] as bigint, // creationTime
              location: `Step ${i + 1} Location`,
              notes: `Supply chain step ${i + 1}`,
              transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
            };
            steps.push(step);
          } catch (stepError) {
            console.warn(`Failed to fetch step ${i}:`, stepError);
          }
        }
      }

      setProvenanceSteps(steps);
    } catch (error) {
      console.error('Error loading provenance steps:', error);
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleViewProvenance = (record: TokenData) => {
    setProvenanceModal({
      visible: true,
      tokenId: record.tokenId,
      tokenData: record
    });
  };

  const handleCloseModal = () => {
    setProvenanceModal({ visible: false });
    setProvenanceSteps([]);
  };

  const columns = [
    {
      title: 'Token ID',
      dataIndex: 'tokenId',
      key: 'tokenId',
      render: (tokenId: number) => <Text strong>#{tokenId.toString()}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TokenData) => name || `${record.cropType} Batch`,
    },
    {
      title: 'Crop Type',
      dataIndex: 'cropType',
      key: 'cropType',
    },
    {
      title: 'Quantity (kg)',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Current State',
      dataIndex: 'currentState',
      key: 'currentState',
      render: (state: number) => (
        <Tag color={getStateColor(state)}>
          {getStateLabel(state)}
        </Tag>
      ),
    },
    {
      title: 'Current Owner',
      dataIndex: 'currentOwner',
      key: 'currentOwner',
      render: (address: string) => formatAddress(address),
    },
    {
      title: 'Origin Farm',
      dataIndex: 'originFarm',
      key: 'originFarm',
    },
    {
      title: 'Supply Chain',
      dataIndex: 'hasProvenance',
      key: 'hasProvenance',
      render: (hasProvenance: boolean) => (
        <Tag color={hasProvenance ? 'green' : 'orange'}>
          {hasProvenance ? 'Tracked' : 'Basic'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TokenData) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewProvenance(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          <SearchOutlined /> Supply Chain Explorer
        </Title>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={fetchAllTokensWithProvenance}
          loading={tokensLoading}
        >
          Refresh Data
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Search
              placeholder="Search by token ID, crop type, farmer, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col span={12}>
            <Select
              placeholder="Filter by state"
              value={selectedState}
              onChange={setSelectedState}
              allowClear
              size="large"
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              {Object.entries(SUPPLY_CHAIN_STATE_LABELS).map(([value, label]) => (
                <Option key={value} value={parseInt(value)}>
                  <Tag color={getStateColor(parseInt(value))}>{label}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredTokens}
          rowKey={(record) => record.tokenId.toString()}
          loading={tokensLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tokens`,
          }}
        />
      </Card>

      {/* Provenance Modal */}
      <Modal
        title={`Provenance History - Token #${provenanceModal.tokenId?.toString()}`}
        open={provenanceModal.visible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        {provenanceModal.tokenData && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Name">{provenanceModal.tokenData.name}</Descriptions.Item>
              <Descriptions.Item label="Crop Type">{provenanceModal.tokenData.cropType}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{provenanceModal.tokenData.quantity} kg</Descriptions.Item>
              <Descriptions.Item label="Origin Farm">{provenanceModal.tokenData.originFarm}</Descriptions.Item>
              <Descriptions.Item label="Original Farmer">{formatAddress(provenanceModal.tokenData.originalFarmer)}</Descriptions.Item>
              <Descriptions.Item label="Current Owner">{formatAddress(provenanceModal.tokenData.currentOwner)}</Descriptions.Item>
              <Descriptions.Item label="Current State">
                <Tag color={getStateColor(provenanceModal.tokenData.currentState)}>
                  {getStateLabel(provenanceModal.tokenData.currentState)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Harvest Date">
                {formatTimestamp(BigInt(provenanceModal.tokenData.harvestDate))}
              </Descriptions.Item>
              <Descriptions.Item label="Supply Chain Status">
                <Tag color={provenanceModal.tokenData.hasProvenance ? 'green' : 'orange'}>
                  {provenanceModal.tokenData.hasProvenance ? 'Fully Tracked' : 'Basic Token'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Steps">{provenanceModal.tokenData.totalSteps}</Descriptions.Item>
            </Descriptions>

            {provenanceModal.tokenData.description && (
              <div style={{ marginBottom: '16px' }}>
                <Text><strong>Description:</strong> {provenanceModal.tokenData.description}</Text>
              </div>
            )}

            {provenanceModal.tokenData.notes && (
              <div style={{ marginBottom: '16px' }}>
                <Text><strong>Notes:</strong> {provenanceModal.tokenData.notes}</Text>
              </div>
            )}

            <Title level={4}>
              {provenanceModal.tokenData.hasProvenance ? 'Supply Chain Journey' : 'Token History'}
            </Title>
            {loadingSteps ? (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>Loading provenance steps...</div>
              </div>
            ) : (
              <Timeline>
                {provenanceSteps.map((step, index) => (
                  <Timeline.Item
                    key={index}
                    color={getStateColor(step.state)}
                    dot={<ClockCircleOutlined />}
                  >
                    <div>
                      <Text strong>{getStateLabel(step.state)}</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space direction="vertical" size="small">
                          <Text><UserOutlined /> Actor: {formatAddress(step.actor)}</Text>
                          <Text><EnvironmentOutlined /> Location: {step.location}</Text>
                          <Text><ClockCircleOutlined /> Time: {formatTimestamp(step.timestamp)}</Text>
                          {step.notes && <Text>Notes: {step.notes}</Text>}
                        </Space>
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default SupplyChainExplorer;
