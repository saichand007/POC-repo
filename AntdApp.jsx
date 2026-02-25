import React, { useState, useMemo, useEffect } from 'react';
import {
    Layout, Menu, Typography, Card, Tag, Button, Table, Input,
    Space, Collapse, Progress, Divider, Badge, Tooltip, Row, Col,
    Breadcrumb, Statistic, theme as antTheme, ConfigProvider, Select,
    Checkbox
} from 'antd';
import {
    CheckOutlined, EditOutlined, ArrowUpOutlined, SearchOutlined,
    ArrowLeftOutlined, ThunderboltOutlined, LikeOutlined, DislikeOutlined,
    DownOutlined, RightOutlined, ExclamationCircleFilled, BulbOutlined,
    CheckCircleFilled, InfoCircleFilled
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const ERRORS = [
    {
        id: 1, title: 'Identifier Issue', count: 5, severity: 'HIGH', code: 'SOP-DQ-014',
        pending: 2, accepted: 1, corrected: 1, escalated: 1, total: 5,
        aiRecommendation: 'Cast all AMOUNT fields to DECIMAL(18,2) before loading. Ensure source system exports numeric fields without currency symbols.',
        analysisSummary: 'SOP-DQ-014 pattern matching detected currency prefixes ($, £, €) in 1,243 AMOUNT-family columns. All instances follow identical transformation: strip symbol → parse float → round to 2dp. No ambiguous cases found.',
        confidence: 94, confidenceLabel: 'Very High',
    },
    {
        id: 2, title: 'Missing Maturity Date', count: 4, severity: 'HIGH', code: 'SOP-DQ-007',
        pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4,
        aiRecommendation: 'Impute missing maturity dates using standard 10-year generic bond offset from issuance date.',
        analysisSummary: 'Dates are null in the source feed. Historical analysis shows 98% of these specific bond types default to a 10-year term.',
        confidence: 88, confidenceLabel: 'High',
    },
    {
        id: 3, title: 'Incorrect Asset Class', count: 4, severity: 'MEDIUM', code: 'SOP-DQ-019',
        pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4,
        aiRecommendation: 'Review asset class mapping table and apply correct classification rules.',
        analysisSummary: 'Asset class field contains legacy codes not matching current schema. Requires remapping.',
        confidence: 76, confidenceLabel: 'Medium',
    },
    {
        id: 4, title: 'Pricing Source Mismatch', count: 3, severity: 'HIGH', code: 'SOP-DQ-031',
        pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3,
        aiRecommendation: 'Reconcile pricing sources with Bloomberg and Reuters reference data.',
        analysisSummary: 'Pricing source codes conflict between input feed and master reference data.',
        confidence: 82, confidenceLabel: 'High',
    },
    {
        id: 5, title: 'Duplicate Security', count: 3, severity: 'MEDIUM', code: 'SOP-DQ-003',
        pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3,
        aiRecommendation: 'Deduplicate using ISIN as primary key, retaining the record with most recent update timestamp.',
        analysisSummary: 'Three ISIN duplicates found across two source feeds. Same instrument with different CUSIPs.',
        confidence: 91, confidenceLabel: 'Very High',
    },
];

const MOCK_RECORDS = [
    {
        key: 'SM-001', id: 'SM-001', name: 'Acme Corp 5.5% 2028', ticker: 'ACME', cusip: '00123456',
        isin: '—', country: 'US', aiFixes: [{ field: 'isin', value: 'US0012345678' }],
        confidence: '94%', severity: 'HIGH', status: 'pending', errorType: 'Missing ISIN',
        errorDescription: 'ISIN field is blank for this fixed income security. Downstream pricing and settlement systems require a valid ISIN.',
        aiAnalysis: 'CUSIP 00123456 is present and valid. Applying ISO 6166 derivation: prefix US + CUSIP + computed check digit = US0012345678.',
        aiSolution: 'Generated standard ISIN.',
    },
    {
        key: 'SM-002', id: 'SM-002', name: 'Banque Paribas SA', ticker: 'BNP', cusip: '—',
        isin: '—', country: 'FR', aiFixes: [{ field: 'isin', value: 'FR0000131104' }, { field: 'cusip', value: '131104999' }],
        confidence: '87%', severity: 'HIGH', status: 'accepted', errorType: 'Missing Identifiers',
        errorDescription: 'Missing primary identifiers for European equity instrument.',
        aiAnalysis: 'Security name and ticker map directly to BNP Paribas on Euronext Paris.',
        aiSolution: 'Applied ISIN FR0000131104 and CUSIP 131104999.',
    },
    {
        key: 'SM-003', id: 'SM-003', name: 'Tokyo Metro Bond', ticker: 'TKYB', cusip: 'N/A',
        isin: '—', country: 'JP', aiFixes: [{ field: 'isin', value: 'JP3633400099', originalValue: 'JP3633400991' }],
        confidence: '91%', severity: 'MEDIUM', status: 'corrected', errorType: 'Missing ISIN',
        errorDescription: 'Japanese municipal bond has no ISIN populated.',
        aiAnalysis: 'Non-US security — CUSIP not applicable. ISIN derivable from SEDOL + country prefix JP.',
        aiSolution: 'Applied ISIN JP3633400099.',
    },
    {
        key: 'SM-004', id: 'SM-004', name: 'GreenEnergy ETF', ticker: 'GRNE', cusip: '345678AB',
        isin: '—', country: 'US', aiFixes: [{ field: 'isin', value: 'US3456780012' }],
        confidence: '96%', severity: 'MEDIUM', status: 'pending', errorType: 'ISIN not populated',
        errorDescription: 'ETF missing ISIN despite valid CUSIP present.',
        aiAnalysis: 'Standard ISIN generation rules apply for US ETFs.',
        aiSolution: 'Generated US3456780012 from base CUSIP.',
    },
    {
        key: 'SM-005', id: 'SM-005', name: 'HDFC Bank Ltd ADR', ticker: 'HDB', cusip: '40415F101',
        isin: '—', country: 'IN', aiFixes: [{ field: 'country', value: 'US', originalValue: 'IN' }],
        confidence: '89%', severity: 'HIGH', status: 'escalated', errorType: 'Mismatching Wrapper',
        errorDescription: 'ADR mismatch. Underlying asset is IN domicile but wrapper is US.',
        aiAnalysis: 'Conflict between depository receipt ISIN and underlying equity ISIN.',
        aiSolution: 'Changed country domicile to US for ADR wrapper.',
    },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const severityColor = (s) => (s === 'HIGH' ? 'error' : 'warning');

const statusConfig = {
    pending: { color: 'default', label: 'Pending' },
    accepted: { color: 'success', label: 'Accepted' },
    corrected: { color: 'warning', label: 'Corrected' },
    escalated: { color: 'purple', label: 'Escalated' },
};

const StatusTag = ({ status }) => {
    const cfg = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return <Tag color={cfg.color} style={{ borderRadius: 12, fontWeight: 600, fontSize: 11 }}>{cfg.label}</Tag>;
};

const SeverityTag = ({ severity }) => (
    <Tag color={severityColor(severity)} style={{ borderRadius: 4, fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}>
        {severity}
    </Tag>
);

// ─── EDITABLE AI CELL ─────────────────────────────────────────────────────────
const AiFixCell = ({ value, fix, status }) => {
    if (!fix) return <Text style={{ fontSize: 12 }}>{value}</Text>;
    const bgMap = { accepted: '#f6ffed', corrected: '#fffbe6', default: '#e6f4ff' };
    const borderMap = { accepted: '#52c41a', corrected: '#faad14', default: '#1677ff' };
    const bg = bgMap[status] || bgMap.default;
    const border = borderMap[status] || borderMap.default;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {fix.originalValue && (
                <Text delete style={{ fontSize: 10, color: '#bfbfbf' }}>{fix.originalValue}</Text>
            )}
            <Input
                defaultValue={fix.value}
                size="small"
                style={{ fontFamily: 'monospace', fontSize: 12, background: bg, borderColor: border, borderRadius: 6 }}
                suffix={status !== 'corrected' && status !== 'accepted'
                    ? <ThunderboltOutlined style={{ color: '#1677ff', fontSize: 11 }} />
                    : null}
            />
        </div>
    );
};

// ─── REVIEW TABLE VIEW ────────────────────────────────────────────────────────
function ReviewTableView({ category, onBack }) {
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedKeys, setSelectedKeys] = useState([]);

    useEffect(() => setSelectedKeys([]), [filterStatus]);

    const data = useMemo(() => {
        if (filterStatus === 'All') return MOCK_RECORDS;
        return MOCK_RECORDS.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
    }, [filterStatus]);

    const columns = [
        { title: 'RECORD ID', dataIndex: 'id', key: 'id', width: 90, render: v => <Text code style={{ fontSize: 11 }}>{v}</Text> },
        {
            title: 'SECURITY NAME', dataIndex: 'name', key: 'name', width: 170,
            render: v => <Text strong style={{ fontSize: 12 }}>{v}</Text>
        },
        {
            title: 'TICKER', dataIndex: 'ticker', key: 'ticker', width: 80,
            render: (v, row) => <AiFixCell value={v} fix={row.aiFixes?.find(f => f.field === 'ticker')} status={row.status} />
        },
        {
            title: 'CUSIP', dataIndex: 'cusip', key: 'cusip', width: 110,
            render: (v, row) => <AiFixCell value={v} fix={row.aiFixes?.find(f => f.field === 'cusip')} status={row.status} />
        },
        {
            title: 'ISIN', dataIndex: 'isin', key: 'isin', width: 140,
            render: (v, row) => <AiFixCell value={v} fix={row.aiFixes?.find(f => f.field === 'isin')} status={row.status} />
        },
        {
            title: 'COUNTRY', dataIndex: 'country', key: 'country', width: 80,
            render: (v, row) => <AiFixCell value={v} fix={row.aiFixes?.find(f => f.field === 'country')} status={row.status} />
        },
        {
            title: 'ERROR TYPE', dataIndex: 'errorType', key: 'errorType', width: 130,
            render: v => <Text style={{ fontSize: 11 }}>{v}</Text>
        },
        {
            title: () => (
                <Space direction="vertical" size={0}>
                    <Text style={{ fontSize: 10, fontWeight: 700, color: '#1677ff', letterSpacing: 0.5 }}>CONFIDENCE</Text>
                    <Space size={2}>
                        <ThunderboltOutlined style={{ fontSize: 9, color: '#1677ff' }} />
                        <Text style={{ fontSize: 9, fontWeight: 700, color: '#1677ff' }}>AI</Text>
                    </Space>
                </Space>
            ),
            dataIndex: 'confidence', key: 'confidence', width: 90,
            render: v => <Text strong style={{ color: '#1677ff', fontSize: 13 }}>{v}</Text>,
        },
        {
            title: 'SEVERITY', dataIndex: 'severity', key: 'severity', width: 90,
            render: v => <SeverityTag severity={v} />
        },
        {
            title: 'STATUS', dataIndex: 'status', key: 'status', width: 100,
            render: v => <StatusTag status={v} />
        },
        {
            title: 'ACTIONS', key: 'actions', width: 150,
            render: (_, row) => (
                <Space size={4}>
                    <Button
                        size="small" icon={<CheckOutlined />} type={row.status === 'accepted' ? 'primary' : 'default'}
                        style={{ background: row.status === 'accepted' ? '#52c41a' : '#f6ffed', color: row.status === 'accepted' ? '#fff' : '#389e0d', borderColor: row.status === 'accepted' ? '#52c41a' : '#b7eb8f', fontSize: 11, fontWeight: 700 }}
                    >Accept</Button>
                    <Button
                        size="small" icon={<EditOutlined />} type={row.status === 'corrected' ? 'primary' : 'default'}
                        style={{ background: row.status === 'corrected' ? '#faad14' : '#fffbe6', color: row.status === 'corrected' ? '#fff' : '#d48806', borderColor: row.status === 'corrected' ? '#faad14' : '#ffe58f', fontSize: 11, fontWeight: 700 }}
                    >Edit</Button>
                    <Tooltip title="Escalate">
                        <Button
                            size="small" icon={<ArrowUpOutlined />}
                            style={{ background: row.status === 'escalated' ? '#722ed1' : '#f9f0ff', color: row.status === 'escalated' ? '#fff' : '#722ed1', borderColor: row.status === 'escalated' ? '#722ed1' : '#d3adf7' }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const expandedRowRender = (row) => (
        <Row gutter={24} style={{ padding: '16px 12px', background: '#fafafa', borderTop: '2px solid #f0f0f0', borderRadius: '0 0 8px 8px' }}>
            <Col span={8}>
                <Space align="center" style={{ marginBottom: 8 }}>
                    <div style={{ background: '#ff4d4f', color: '#fff', width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900 }}>!</div>
                    <Text style={{ fontWeight: 800, color: '#ff4d4f', fontSize: 11, letterSpacing: 0.5 }}>ERROR DESCRIPTION</Text>
                </Space>
                <Paragraph style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>{row.errorDescription}</Paragraph>
            </Col>
            <Col span={8}>
                <Space align="center" style={{ marginBottom: 8 }}>
                    <div style={{ background: '#1677ff', color: '#fff', width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900 }}>AI</div>
                    <Text style={{ fontWeight: 800, color: '#1677ff', fontSize: 11, letterSpacing: 0.5 }}>AI ANALYSIS</Text>
                </Space>
                <Paragraph type="secondary" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>{row.aiAnalysis}</Paragraph>
            </Col>
            <Col span={8}>
                <Space align="center" style={{ marginBottom: 8 }}>
                    <div style={{ background: '#52c41a', color: '#fff', width: 16, height: 16, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>✓</div>
                    <Text style={{ fontWeight: 800, color: '#52c41a', fontSize: 11, letterSpacing: 0.5 }}>AI SOLUTION</Text>
                    <Tag color="blue" style={{ fontSize: 9, borderRadius: 4, fontWeight: 800, padding: '0 4px' }}>EDITABLE</Tag>
                </Space>
                <Paragraph type="secondary" style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>{row.aiSolution}</Paragraph>
            </Col>
        </Row>
    );

    const TABS = ['All', 'Pending', 'Accepted', 'Corrected', 'Escalated'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 28 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Breadcrumb
                    items={[
                        { title: <Text strong style={{ color: '#595959' }}>Security Master Errors</Text> },
                        { title: <Text strong style={{ color: '#1677ff' }}>{category?.title}</Text> },
                    ]}
                />
                <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ fontWeight: 600, borderRadius: 8 }}>
                    Back to Categories
                </Button>
            </div>

            {/* Filter Tabs + Bulk Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Space>
                    <div style={{ background: '#f5f5f5', padding: '3px 4px', borderRadius: 20, display: 'flex', gap: 2 }}>
                        {TABS.map(tab => (
                            <Button
                                key={tab}
                                type={filterStatus === tab ? 'primary' : 'text'}
                                size="small"
                                onClick={() => setFilterStatus(tab)}
                                style={{ borderRadius: 16, fontWeight: 600, fontSize: 12, height: 26, padding: '0 12px' }}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>
                    {selectedKeys.length > 0 && (
                        <Space>
                            <Divider type="vertical" />
                            <Text strong style={{ color: '#1677ff', fontSize: 12 }}>{selectedKeys.length} selected</Text>
                            <Button size="small" icon={<CheckOutlined />} style={{ background: '#52c41a', color: '#fff', borderColor: '#52c41a', fontWeight: 700, fontSize: 11, borderRadius: 6 }}>Accept</Button>
                            <Button size="small" icon={<EditOutlined />} style={{ background: '#faad14', color: '#fff', borderColor: '#faad14', fontWeight: 700, fontSize: 11, borderRadius: 6 }}>Correct</Button>
                        </Space>
                    )}
                </Space>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>{data.length} of {MOCK_RECORDS.length} records</Text>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={data}
                size="small"
                scroll={{ x: 1400 }}
                rowSelection={{
                    selectedRowKeys: selectedKeys,
                    onChange: setSelectedKeys,
                }}
                expandable={{ expandedRowRender }}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
                rowClassName={(row) => row.status === 'accepted' ? 'row-accepted' : ''}
                style={{ flex: 1 }}
            />
        </div>
    );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function AntdApp() {
    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedKeys, setExpandedKeys] = useState(['1']);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredErrors = useMemo(() =>
        ERRORS.filter(e =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (e.code && e.code.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
        [searchQuery]
    );

    const sidebarItems = [
        {
            key: 'security-master',
            icon: <Badge color="red" />,
            label: <Text strong style={{ fontSize: 12 }}>SECURITY MASTER ERRORS</Text>,
            children: ERRORS.map(item => ({
                key: `error-${item.id}`,
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Text style={{ fontSize: 12 }}>{item.title}</Text>
                        <Tag style={{ fontSize: 10, borderRadius: 10, marginRight: 0, minWidth: 22, textAlign: 'center' }}>{item.count}</Tag>
                    </div>
                ),
            })),
        },
    ];

    const kpis = [
        { title: 'PENDING REVIEW', value: 19, suffix: 'awaiting decision', color: '#595959' },
        { title: 'ACCEPTED', value: 10, suffix: 'AI suggestion applied', color: '#52c41a' },
        { title: 'CORRECTED', value: 6, suffix: 'reviewer value applied', color: '#faad14' },
        { title: 'ESCALATED', value: 1, suffix: 'flagged for specialist', color: '#722ed1' },
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#1677ff',
                    borderRadius: 8,
                    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
                },
            }}
        >
            <Layout style={{ height: '100vh', background: '#f8f9fb' }}>
                {/* SIDEBAR */}
                <Sider
                    width={260}
                    style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflow: 'auto' }}
                >
                    <div style={{ padding: '20px 24px 12px' }}>
                        <Space align="center">
                            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #1677ff' }} />
                            <Title level={5} style={{ margin: 0, fontWeight: 800 }}>RCA Intelligence</Title>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, display: 'block', marginLeft: 22 }}>
                            AI Root Cause Analysis
                        </Text>
                    </div>
                    <div style={{ padding: '0 8px' }}>
                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, paddingLeft: 16 }}>
                            ERROR CATEGORIES
                        </Text>
                        <Menu
                            mode="inline"
                            defaultOpenKeys={['security-master']}
                            selectedKeys={activeCategory ? [`error-${activeCategory.id}`] : []}
                            onSelect={({ key }) => {
                                const id = parseInt(key.replace('error-', ''), 10);
                                const err = ERRORS.find(e => e.id === id);
                                if (err) setActiveCategory(err);
                            }}
                            items={sidebarItems}
                            style={{ border: 'none', fontSize: 12, marginTop: 6 }}
                        />
                    </div>
                </Sider>

                {/* MAIN CONTENT */}
                <Layout style={{ background: '#f8f9fb', overflow: 'hidden' }}>
                    <Content style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* KPI BAR */}
                        <div style={{ padding: '24px 40px 0' }}>
                            <Card bodyStyle={{ padding: 0 }} style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: 'none', marginBottom: 16 }}>
                                <Row>
                                    {kpis.map((kpi, i) => (
                                        <React.Fragment key={kpi.title}>
                                            <Col flex={1} style={{ padding: '18px 20px' }}>
                                                <Text style={{ fontSize: 10, fontWeight: 700, color: kpi.color, letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                                                    {kpi.title}
                                                </Text>
                                                <Title level={2} style={{ margin: 0, color: kpi.color, lineHeight: 1, fontWeight: 800 }}>{kpi.value}</Title>
                                                <Text type="secondary" style={{ fontSize: 11 }}>{kpi.suffix}</Text>
                                            </Col>
                                            {i < kpis.length - 1 && <Divider type="vertical" style={{ height: 'auto', margin: 0 }} />}
                                        </React.Fragment>
                                    ))}
                                </Row>
                            </Card>

                            {/* Progress Bar */}
                            <Card bodyStyle={{ padding: '14px 20px' }} style={{ borderRadius: 12, border: '1px solid #f0f0f0', boxShadow: 'none', marginBottom: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <Text strong>Review Progress</Text>
                                    <Text strong>47% complete</Text>
                                </div>
                                <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', background: '#f0f0f0' }}>
                                    <div style={{ width: '28%', background: '#52c41a' }} />
                                    <div style={{ width: '17%', background: '#faad14' }} />
                                    <div style={{ width: '2%', background: '#722ed1' }} />
                                </div>
                            </Card>
                        </div>

                        {/* MAIN BODY */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0 40px 40px' }}>
                            {activeCategory ? (
                                <ReviewTableView category={activeCategory} onBack={() => setActiveCategory(null)} />
                            ) : (
                                <div>
                                    {/* Title + Search */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                                            ERROR CATEGORIES — AI ROOT CAUSE ANALYSIS
                                        </Text>
                                        <Input
                                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                                            placeholder="Search categories..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            style={{ width: 260, borderRadius: 8 }}
                                            size="small"
                                        />
                                    </div>

                                    {/* Accordion */}
                                    {filteredErrors.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: 40, color: '#bfbfbf' }}>
                                            <SearchOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                                            <Paragraph type="secondary">No categories found matching "{searchQuery}"</Paragraph>
                                        </div>
                                    ) : (
                                        <Collapse
                                            activeKey={expandedKeys}
                                            onChange={setExpandedKeys}
                                            expandIconPosition="end"
                                            style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}
                                        >
                                            {filteredErrors.map(error => (
                                                <Panel
                                                    key={String(error.id)}
                                                    style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 10, overflow: 'hidden', marginBottom: 0 }}
                                                    header={
                                                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 8 }}>
                                                            {/* Title */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
                                                                <Badge color={error.severity === 'HIGH' ? 'red' : 'orange'} />
                                                                <Text strong style={{ fontSize: 13 }}>{error.title}</Text>
                                                            </div>
                                                            {/* Tags */}
                                                            <Space size={4} style={{ flex: 1 }}>
                                                                <SeverityTag severity={error.severity || 'HIGH'} />
                                                                <Tag color="blue" style={{ fontSize: 10, fontWeight: 700, borderRadius: 4 }}>{error.code}</Tag>
                                                            </Space>
                                                            {/* Metrics */}
                                                            <Space size={16} style={{ marginRight: 8 }}>
                                                                <Space size={4}>
                                                                    <Badge status="default" />
                                                                    <Text style={{ fontSize: 11, fontWeight: 700 }}>{error.pending}</Text>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>pending</Text>
                                                                </Space>
                                                                <Space size={4}>
                                                                    <CheckOutlined style={{ color: '#52c41a', fontSize: 11 }} />
                                                                    <Text style={{ fontSize: 11, fontWeight: 700 }}>{error.accepted}</Text>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>accepted</Text>
                                                                </Space>
                                                                <Space size={4}>
                                                                    <EditOutlined style={{ color: '#faad14', fontSize: 11 }} />
                                                                    <Text style={{ fontSize: 11, fontWeight: 700 }}>{error.corrected}</Text>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>corrected</Text>
                                                                </Space>
                                                                <Space size={4}>
                                                                    <ArrowUpOutlined style={{ color: '#722ed1', fontSize: 11 }} />
                                                                    <Text style={{ fontSize: 11, fontWeight: 700 }}>{error.escalated}</Text>
                                                                    <Text type="secondary" style={{ fontSize: 11 }}>escalated</Text>
                                                                </Space>
                                                                <Text type="secondary" style={{ fontSize: 11 }}>/ {error.total} total</Text>
                                                            </Space>
                                                        </div>
                                                    }
                                                >
                                                    <div style={{ background: '#fafafa', borderTop: '1px solid #f5f5f5' }}>
                                                        {/* Bulk Actions */}
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                                                            <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, marginRight: 4 }}>BULK ACTION</Text>
                                                            <Button size="small" style={{ background: '#52c41a', color: '#fff', borderColor: '#52c41a', fontWeight: 700, fontSize: 12, borderRadius: 6 }}>
                                                                Accept All ({error.pending})
                                                            </Button>
                                                            <Button size="small" style={{ background: '#faad14', color: '#fff', borderColor: '#faad14', fontWeight: 700, fontSize: 12, borderRadius: 6 }}>
                                                                Correct All ({error.pending})
                                                            </Button>
                                                            <Button size="small" style={{ background: '#722ed1', color: '#fff', borderColor: '#722ed1', fontWeight: 700, fontSize: 12, borderRadius: 6 }}>
                                                                Escalate All ({error.pending})
                                                            </Button>
                                                        </div>

                                                        {/* AI Recommendation */}
                                                        <div style={{ padding: '16px 16px 0' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                                <Space>
                                                                    <ThunderboltOutlined style={{ color: '#1677ff' }} />
                                                                    <Text strong style={{ color: '#1677ff', fontSize: 12, letterSpacing: 0.5 }}>AI RECOMMENDATION</Text>
                                                                </Space>
                                                                <Space>
                                                                    <Tooltip title="Confidence level">
                                                                        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid #52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Text style={{ fontSize: 9, fontWeight: 800, color: '#52c41a' }}>{error.confidence}%</Text>
                                                                        </div>
                                                                    </Tooltip>
                                                                    <Text style={{ color: '#52c41a', fontWeight: 700, fontSize: 12 }}>{error.confidenceLabel}</Text>
                                                                </Space>
                                                            </div>
                                                            <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>{error.aiRecommendation || 'No general recommendation available.'}</Text>
                                                            <Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>ANALYSIS SUMMARY</Text>
                                                            <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 14 }}>{error.analysisSummary || 'Requires manual review.'}</Paragraph>
                                                        </div>

                                                        <Divider style={{ margin: '0 16px', width: 'calc(100% - 32px)', minWidth: 'unset' }} />

                                                        {/* Footer */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                                                            <Space>
                                                                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>AI FEEDBACK</Text>
                                                                <Button size="small" icon={<LikeOutlined />} style={{ borderRadius: 6, color: '#faad14', borderColor: '#ffe58f', background: '#fffbe6' }} />
                                                                <Button size="small" icon={<DislikeOutlined />} style={{ borderRadius: 6, color: '#faad14', borderColor: '#ffe58f', background: '#fffbe6' }} />
                                                            </Space>
                                                            <Button
                                                                onClick={() => setActiveCategory(error)}
                                                                style={{ fontWeight: 700, fontSize: 12, borderRadius: 8, borderColor: '#f0f0f0', color: '#595959', background: '#fff' }}
                                                                size="small"
                                                            >
                                                                Review Rows →
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Panel>
                                            ))}
                                        </Collapse>
                                    )}
                                </div>
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
