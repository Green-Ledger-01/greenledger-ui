import React, { useState, useEffect } from 'react';
import { Card, Input, Table, Tag, Typography, Space, Button, Modal, Timeline, Descriptions, Alert, Select, Spin, Row, Col } from 'antd';
import { SearchOutlined, EyeOutlined, EnvironmentOutlined, UserOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons';
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
// import { useCropBatchTokens } from '../hooks/useCropBatchToken';
import { SUPPLY_CHAIN_STATES, SUPPLY_CHAIN_STATE_LABELS } from '../config/constants';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface TokenData {
  tokenId: bigint;
  cropType: string;
  quantity: number;
  location: string;
  harvestDate: bigint;
  farmer: string;
  currentState: number;
  currentOwner: string;
  ipfsHash: string;
}

interface ProvenanceModalData {
  visible: boolean;
  tokenId?: bigint;
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

  // Hooks - temporarily disabled
  // const { data: allTokens, isLoading: tokensLoading } = useCropBatchTokens();
  const allTokens: any[] = [];
  const tokensLoading = false;
  const { data: provenanceHistory } = useProvenanceHistory(provenanceModal.tokenId);

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

      for (let i = 0; i < totalSteps; i++) {
        // Note: In a real implementation, you'd call getProvenanceStep for each step
        // For now, we'll create a mock step structure
        const step: ProvenanceStep = {
          actor: i === 0 ? provenanceHistory[1] : '0x...', // originalFarmer for first step
          state: i,
          timestamp: provenanceHistory[2], // creationTime for first step
          location: 'Location data would come from contract',
          notes: 'Step notes would come from contract',
          transactionHash: '0x...'
        };
        steps.push(step);
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
      render: (tokenId: bigint) => <Text strong>#{tokenId.toString()}</Text>,
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
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
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
          View Provenance
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SearchOutlined /> Supply Chain Explorer
      </Title>

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
              <Descriptions.Item label="Crop Type">{provenanceModal.tokenData.cropType}</Descriptions.Item>
              <Descriptions.Item label="Quantity">{provenanceModal.tokenData.quantity} kg</Descriptions.Item>
              <Descriptions.Item label="Original Farmer">{formatAddress(provenanceModal.tokenData.farmer)}</Descriptions.Item>
              <Descriptions.Item label="Current Owner">{formatAddress(provenanceModal.tokenData.currentOwner)}</Descriptions.Item>
              <Descriptions.Item label="Current State">
                <Tag color={getStateColor(provenanceModal.tokenData.currentState)}>
                  {getStateLabel(provenanceModal.tokenData.currentState)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Harvest Date">
                {formatTimestamp(provenanceModal.tokenData.harvestDate)}
              </Descriptions.Item>
            </Descriptions>

            <Title level={4}>Supply Chain Journey</Title>
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
