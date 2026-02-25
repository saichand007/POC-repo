import React, { useState, useMemo, useEffect } from 'react';
import {
  Layout, Typography, Card, Tag, Button, Table, Input,
  Space, Divider, Badge, Tooltip, Row, Col,
  Breadcrumb, ConfigProvider, Checkbox, Popover, Progress,
  Switch,
} from 'antd';
import {
  CheckOutlined, EditOutlined, ArrowUpOutlined, SearchOutlined,
  ArrowLeftOutlined, ThunderboltOutlined, LikeOutlined, DislikeOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FireOutlined, WarningOutlined, MinusCircleOutlined,
  DownOutlined, RightOutlined, AppstoreOutlined,
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const CATEGORY_TREE = [
  {
    id: 'identifier-issues', title: 'Identifier Issues', severity: 'HIGH',
    pending: 4, total: 4, errorId: 1,
    children: [
      { id: 'common-stock', title: 'COMMON STOCK', count: 3, pending: 3, approved: 0, confidence: 85, errorId: 1 },
      { id: 'mutual-funds', title: 'MUTUAL FUNDS', count: 1, pending: 1, approved: 0, confidence: 85, errorId: 1 },
    ],
  },
  {
    id: 'missing-maturity', title: 'Missing Maturity Date', severity: 'HIGH',
    pending: 2, total: 4, errorId: 2,
    children: [
      { id: 'fixed-income', title: 'FIXED INCOME', count: 2, pending: 2, approved: 0, confidence: 88, errorId: 2 },
      { id: 'bonds',        title: 'BONDS',        count: 2, pending: 0, approved: 2, confidence: 88, errorId: 2 },
    ],
  },
  {
    id: 'asset-class', title: 'Incorrect Asset Class', severity: 'MEDIUM',
    pending: 2, total: 4, errorId: 3,
    children: [
      { id: 'equity',      title: 'EQUITY',      count: 2, pending: 2, approved: 0, confidence: 76, errorId: 3 },
      { id: 'derivatives', title: 'DERIVATIVES', count: 2, pending: 0, approved: 2, confidence: 76, errorId: 3 },
    ],
  },
  {
    id: 'pricing-source', title: 'Pricing Source Mismatch', severity: 'HIGH',
    pending: 2, total: 3, errorId: 4,
    children: [
      { id: 'bloomberg', title: 'BLOOMBERG', count: 2, pending: 2, approved: 0, confidence: 82, errorId: 4 },
      { id: 'reuters',   title: 'REUTERS',   count: 1, pending: 0, approved: 1, confidence: 82, errorId: 4 },
    ],
  },
  {
    id: 'duplicate-security', title: 'Duplicate Security', severity: 'MEDIUM',
    pending: 2, total: 3, errorId: 5,
    children: [
      { id: 'isin-dup',  title: 'ISIN DUPLICATES', count: 2, pending: 2, approved: 0, confidence: 91, errorId: 5 },
      { id: 'cusip-dup', title: 'CUSIP CONFLICTS',  count: 1, pending: 0, approved: 1, confidence: 91, errorId: 5 },
    ],
  },
];

const ERRORS = [
  {
    id: 1, title: 'Identifier Issue', severity: 'HIGH', code: 'SOP-DQ-014',
    pending: 2, accepted: 1, corrected: 1, escalated: 1, total: 5,
    critical: 0, high: 4, medium: 0, resolutionRate: 0, resolved: 0,
    highConfidence: 4, mediumConfidence: 0, lowConfidence: 0,
    aiRecommendation: 'Cast all AMOUNT fields to DECIMAL(18,2) before loading. Ensure source system exports numeric fields without currency symbols.',
    analysisSummary: 'SOP-DQ-014 pattern matching detected currency prefixes ($, £, €) in 1,243 AMOUNT-family columns. All instances follow identical transformation: strip symbol → parse float → round to 2dp. No ambiguous cases found — transformation is fully deterministic.',
    confidence: 94, confidenceLabel: 'Very High',
  },
  {
    id: 2, title: 'Missing Maturity Date', severity: 'HIGH', code: 'SOP-DQ-007',
    pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4,
    critical: 0, high: 4, medium: 0, resolutionRate: 50, resolved: 2,
    highConfidence: 3, mediumConfidence: 1, lowConfidence: 0,
    aiRecommendation: 'Impute missing maturity dates using standard 10-year generic bond offset from issuance date.',
    analysisSummary: 'Dates are null in the source feed. Historical analysis shows 98% of these specific bond types default to a 10-year term.',
    confidence: 88, confidenceLabel: 'High',
  },
  {
    id: 3, title: 'Incorrect Asset Class', severity: 'MEDIUM', code: 'SOP-DQ-019',
    pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4,
    critical: 0, high: 0, medium: 4, resolutionRate: 50, resolved: 2,
    highConfidence: 2, mediumConfidence: 2, lowConfidence: 0,
    aiRecommendation: 'Review asset class mapping table and apply correct classification rules.',
    analysisSummary: 'Asset class field contains legacy codes not matching current schema. Requires remapping.',
    confidence: 76, confidenceLabel: 'Medium',
  },
  {
    id: 4, title: 'Pricing Source Mismatch', severity: 'HIGH', code: 'SOP-DQ-031',
    pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3,
    critical: 0, high: 3, medium: 0, resolutionRate: 33, resolved: 1,
    highConfidence: 3, mediumConfidence: 0, lowConfidence: 0,
    aiRecommendation: 'Reconcile pricing sources with Bloomberg and Reuters reference data.',
    analysisSummary: 'Pricing source codes conflict between input feed and master reference data.',
    confidence: 82, confidenceLabel: 'High',
  },
  {
    id: 5, title: 'Duplicate Security', severity: 'MEDIUM', code: 'SOP-DQ-003',
    pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3,
    critical: 0, high: 0, medium: 3, resolutionRate: 33, resolved: 1,
    highConfidence: 3, mediumConfidence: 0, lowConfidence: 0,
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
    aiAnalysis: 'CUSIP 00123456 is valid. Applying ISO 6166: prefix US + CUSIP + check digit = US0012345678.',
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

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
const SeverityTag = ({ severity }) => (
  <Tag
    color={severity === 'CRITICAL' ? 'red' : severity === 'HIGH' ? 'error' : 'warning'}
    style={{ borderRadius: 4, fontWeight: 700, fontSize: 10, letterSpacing: 0.5 }}
  >
    {severity}
  </Tag>
);

const StatusTag = ({ status }) => {
  const cfg = {
    pending:  { color: 'default', label: 'Pending'   },
    accepted: { color: 'success', label: 'Accepted'  },
    corrected:{ color: 'warning', label: 'Corrected' },
    escalated:{ color: 'purple',  label: 'Escalated' },
  }[status?.toLowerCase()] || { color: 'default', label: status };
  return <Tag color={cfg.color} style={{ borderRadius: 12, fontWeight: 600, fontSize: 11 }}>{cfg.label}</Tag>;
};

const AiFixCell = ({ value, fix, status }) => {
  if (!fix) return <Text style={{ fontSize: 12 }}>{value}</Text>;
  const bg     = { accepted: '#f6ffed', corrected: '#fffbe6' }[status] || '#e6f4ff';
  const border = { accepted: '#52c41a', corrected: '#faad14' }[status] || '#1677ff';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fix.originalValue && <Text delete style={{ fontSize: 10, color: '#bfbfbf' }}>{fix.originalValue}</Text>}
      <Input
        defaultValue={fix.value} size="small"
        style={{ fontFamily: 'monospace', fontSize: 12, background: bg, borderColor: border, borderRadius: 6 }}
        suffix={status !== 'corrected' && status !== 'accepted'
          ? <ThunderboltOutlined style={{ color: '#1677ff', fontSize: 11 }} /> : null}
      />
    </div>
  );
};

// ─── METRIC CARDS ─────────────────────────────────────────────────────────────
function MetricCards({ error }) {
  const total = error.total || 1;
  const pct   = error.resolutionRate || 0;

  const workflowRows = [
    { icon: <ClockCircleOutlined style={{ color: '#faad14' }} />, label: 'Pending',  value: error.pending,   color: '#faad14' },
    { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, label: 'Approved', value: error.accepted,  color: '#52c41a' },
    { icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />, label: 'Rejected', value: error.escalated, color: '#ff4d4f' },
  ];
  const severityRows = [
    { icon: <FireOutlined        style={{ color: '#cf1322' }} />, label: 'Critical', value: error.critical || 0, color: '#cf1322' },
    { icon: <WarningOutlined     style={{ color: '#ff7a00' }} />, label: 'High',     value: error.high     || 0, color: '#ff7a00' },
    { icon: <MinusCircleOutlined style={{ color: '#faad14' }} />, label: 'Medium',   value: error.medium   || 0, color: '#faad14' },
  ];
  const confRows = [
    { label: 'High (≥85%)',     v: error.highConfidence   || 0, pct: Math.round(((error.highConfidence   || 0) / total) * 100), color: '#52c41a' },
    { label: 'Medium (70-84%)', v: error.mediumConfidence || 0, pct: Math.round(((error.mediumConfidence || 0) / total) * 100), color: '#faad14' },
    { label: 'Low (<70%)',      v: error.lowConfidence    || 0, pct: Math.round(((error.lowConfidence    || 0) / total) * 100), color: '#ff4d4f' },
  ];

  const cardStyle = { borderRadius: 10, border: '1px solid #f0f0f0', boxShadow: 'none' };
  const rowS = (last) => ({
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '7px 0', ...(last ? {} : { borderBottom: '1px dashed #f0f0f0' }),
  });
  const head = { fontSize: 10, fontWeight: 800, letterSpacing: 0.5, color: '#8c8c8c', marginBottom: 8, display: 'block' };

  return (
    <Row gutter={10} style={{ marginBottom: 14 }}>
      <Col flex={1}>
        <Card bodyStyle={{ padding: '14px 16px' }} style={cardStyle}>
          <Text style={head}>WORKFLOW STATUS</Text>
          {workflowRows.map((r, i) => (
            <div key={r.label} style={rowS(i === workflowRows.length - 1)}>
              <Space size={6}>{r.icon}<Text style={{ fontSize: 12 }}>{r.label}</Text></Space>
              <Text strong style={{ fontSize: 13, color: r.value > 0 ? r.color : '#595959' }}>{r.value}</Text>
            </div>
          ))}
        </Card>
      </Col>
      <Col flex={1}>
        <Card bodyStyle={{ padding: '14px 16px' }} style={cardStyle}>
          <Text style={head}>SEVERITY BREAKDOWN</Text>
          {severityRows.map((r, i) => (
            <div key={r.label} style={rowS(i === severityRows.length - 1)}>
              <Space size={6}>{r.icon}<Text style={{ fontSize: 12 }}>{r.label}</Text></Space>
              <Text strong style={{ fontSize: 13, color: r.value > 0 ? r.color : '#595959' }}>{r.value}</Text>
            </div>
          ))}
        </Card>
      </Col>
      <Col flex={1}>
        <Card bodyStyle={{ padding: '14px 16px' }} style={cardStyle}>
          <Text style={head}>RESOLUTION RATE</Text>
          <Title level={2} style={{ margin: 0, fontWeight: 800, lineHeight: 1.1, color: '#1d1d1d' }}>{pct}%</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{error.resolved || 0} of {total} resolved</Text>
          <Progress percent={pct} showInfo={false} strokeColor="#1677ff" trailColor="#e8e8e8" strokeWidth={6} style={{ marginTop: 8 }} />
        </Card>
      </Col>
      <Col flex={1}>
        <Card bodyStyle={{ padding: '14px 16px' }} style={cardStyle}>
          <Text style={head}>AI CONFIDENCE LEVELS</Text>
          {confRows.map((r, i) => (
            <div key={r.label} style={rowS(i === confRows.length - 1)}>
              <Space size={5}><ThunderboltOutlined style={{ color: r.color, fontSize: 12 }} /><Text style={{ fontSize: 12 }}>{r.label}</Text></Space>
              <Space size={4}>
                <Text strong style={{ fontSize: 13, color: r.v > 0 ? r.color : '#595959' }}>{r.v}</Text>
                <Text type="secondary" style={{ fontSize: 11 }}>({r.pct}%)</Text>
              </Space>
            </div>
          ))}
        </Card>
      </Col>
    </Row>
  );
}

// ─── CATEGORY TREE SIDEBAR ────────────────────────────────────────────────────
// Sidebar only HIGHLIGHTS the active accordion item — does NOT navigate to table
function CategoryTree({ activeCategoryId, onHighlight }) {
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState({ 'identifier-issues': true });
  const [checked,  setChecked]  = useState({});

  const toggleCheck  = (id, e) => { e.stopPropagation(); setChecked(p => ({ ...p, [id]: !p[id] })); };
  const toggleExpand = (id)    => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const filtered = search
    ? CATEGORY_TREE.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.children?.some(ch => ch.title.toLowerCase().includes(search.toLowerCase()))
      )
    : CATEGORY_TREE;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px' }}>
        <Space align="center">
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #1677ff' }} />
          <Text strong style={{ fontSize: 14, fontWeight: 800 }}>RCA Intelligence</Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, display: 'block', marginLeft: 22 }}>
          AI Root Cause Analysis
        </Text>
      </div>
      <Divider style={{ margin: '0 0 10px' }} />

      {/* Search */}
      <div style={{ padding: '0 12px 10px' }}>
        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Root Cause Categories</Text>
        <Input
          prefix={<SearchOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />}
          placeholder="Filter categories..."
          size="small" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ borderRadius: 8, fontSize: 12 }}
        />
      </div>

      {/* Tree */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 8px 8px' }}>
        {filtered.map(cat => {
          const isActive = activeCategoryId === cat.errorId;
          const isOpen   = expanded[cat.id];
          return (
            <div key={cat.id} style={{ marginBottom: 6 }}>
              {/* Parent */}
              <div
                onClick={() => { toggleExpand(cat.id); onHighlight(cat.errorId); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px',
                  borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                  border:     isActive ? '1.5px solid #1677ff' : '1px solid #f0f0f0',
                  background: isActive ? '#e6f4ff' : '#fff',
                }}
              >
                <Checkbox checked={!!checked[cat.id]} onClick={e => toggleCheck(cat.id, e)} />
                <span style={{ color: '#8c8c8c', fontSize: 10 }}>
                  {isOpen ? <DownOutlined /> : <RightOutlined />}
                </span>
                <Text strong style={{ fontSize: 12, flex: 1 }}>{cat.title}</Text>
                <Tag
                  color={cat.severity === 'HIGH' ? 'orange' : 'gold'}
                  style={{ fontSize: 10, borderRadius: 8, fontWeight: 700, padding: '0 6px', margin: 0 }}
                >
                  {cat.severity.toLowerCase()}
                </Tag>
              </div>

              {/* Pending label */}
              {isOpen && (
                <div style={{ marginLeft: 34, marginTop: 3, marginBottom: 3 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{cat.children?.length} types</Text>
                  {cat.pending > 0 && (
                    <Tag color="gold" style={{ fontSize: 10, borderRadius: 8, fontWeight: 600, marginLeft: 6 }}>
                      {cat.pending} pending
                    </Tag>
                  )}
                </div>
              )}

              {/* Children */}
              {isOpen && cat.children?.map(child => {
                const show = !search || child.title.toLowerCase().includes(search.toLowerCase());
                if (!show) return null;
                return (
                  <div
                    key={child.id}
                    onClick={() => onHighlight(child.errorId)}
                    style={{
                      marginLeft: 24, marginTop: 3, padding: '8px 10px', borderRadius: 7,
                      border: '1px solid #f5f5f5', background: '#fafafa', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Checkbox checked={!!checked[child.id]} onClick={e => toggleCheck(child.id, e)} />
                      <Text strong style={{ fontSize: 11, letterSpacing: 0.3, flex: 1 }}>{child.title}</Text>
                      <Text strong style={{ fontSize: 12 }}>{child.count}</Text>
                    </div>
                    <div style={{ marginLeft: 22, display: 'flex', gap: 10 }}>
                      <Space size={3}>
                        <ClockCircleOutlined style={{ fontSize: 10, color: '#faad14' }} />
                        <Text style={{ fontSize: 11 }}>{child.pending}</Text>
                      </Space>
                      <Space size={3}>
                        <CheckCircleOutlined style={{ fontSize: 10, color: '#52c41a' }} />
                        <Text style={{ fontSize: 11 }}>{child.approved}</Text>
                      </Space>
                      <Space size={3}>
                        <ThunderboltOutlined style={{ fontSize: 10, color: '#1677ff' }} />
                        <Text style={{ fontSize: 11, color: '#1677ff', fontWeight: 600 }}>{child.confidence}%</Text>
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── REVIEW TABLE VIEW (shown ONLY when "Review Rows →" is clicked) ───────────
function ReviewTableView({ category, onBack }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [tableSearch,  setTableSearch]  = useState('');

  const ALL_COL_KEYS = ['id','name','ticker','cusip','isin','country','errorType','confidence','severity','status','actions'];
  const [visibleCols, setVisibleCols] = useState(
    ALL_COL_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {})
  );

  useEffect(() => setSelectedKeys([]), [filterStatus]);

  const data = useMemo(() => {
    let rows = MOCK_RECORDS;
    if (filterStatus !== 'All') rows = rows.filter(r => r.status.toLowerCase() === filterStatus.toLowerCase());
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      rows = rows.filter(r =>
        r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) ||
        r.ticker.toLowerCase().includes(q) || r.errorType.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [filterStatus, tableSearch]);

  const colDefs = [
    { key:'id',        label:'Record ID',     title:'RECORD ID',     dataIndex:'id',        width:90,  render: v => <Text code style={{ fontSize:11 }}>{v}</Text> },
    { key:'name',      label:'Security Name', title:'SECURITY NAME', dataIndex:'name',      width:170, render: v => <Text strong style={{ fontSize:12 }}>{v}</Text> },
    { key:'ticker',    label:'Ticker',        title:'TICKER',        dataIndex:'ticker',    width:80,  render:(v,r) => <AiFixCell value={v} fix={r.aiFixes?.find(f=>f.field==='ticker')}    status={r.status}/> },
    { key:'cusip',     label:'CUSIP',         title:'CUSIP',         dataIndex:'cusip',     width:110, render:(v,r) => <AiFixCell value={v} fix={r.aiFixes?.find(f=>f.field==='cusip')}     status={r.status}/> },
    { key:'isin',      label:'ISIN',          title:'ISIN',          dataIndex:'isin',      width:145, render:(v,r) => <AiFixCell value={v} fix={r.aiFixes?.find(f=>f.field==='isin')}      status={r.status}/> },
    { key:'country',   label:'Country',       title:'COUNTRY',       dataIndex:'country',   width:80,  render:(v,r) => <AiFixCell value={v} fix={r.aiFixes?.find(f=>f.field==='country')}   status={r.status}/> },
    { key:'errorType', label:'Error Type',    title:'ERROR TYPE',    dataIndex:'errorType', width:130, render: v => <Text style={{ fontSize:11 }}>{v}</Text> },
    {
      key:'confidence', label:'Confidence', dataIndex:'confidence', width:95,
      title: () => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize:10, fontWeight:700, color:'#1677ff' }}>CONFIDENCE</Text>
          <Space size={2}><ThunderboltOutlined style={{ fontSize:9,color:'#1677ff' }}/><Text style={{ fontSize:9,fontWeight:700,color:'#1677ff' }}>AI</Text></Space>
        </Space>
      ),
      render: v => <Text strong style={{ color:'#1677ff', fontSize:13 }}>{v}</Text>,
    },
    {
      key:'severity', label:'Severity', title:'SEVERITY', dataIndex:'severity', width:90,
      filters:[{text:'HIGH',value:'HIGH'},{text:'MEDIUM',value:'MEDIUM'}],
      onFilter:(val,r) => r.severity===val,
      render: v => <SeverityTag severity={v}/>,
    },
    {
      key:'status', label:'Status', title:'STATUS', dataIndex:'status', width:100,
      filters:[{text:'Pending',value:'pending'},{text:'Accepted',value:'accepted'},{text:'Corrected',value:'corrected'},{text:'Escalated',value:'escalated'}],
      onFilter:(val,r) => r.status===val,
      render: v => <StatusTag status={v}/>,
    },
    {
      key:'actions', label:'Actions', title:'ACTIONS', width:155,
      render:(_, r) => (
        <Space size={4}>
          <Button size="small" icon={<CheckOutlined/>}
            style={{ background:r.status==='accepted'?'#52c41a':'#f6ffed', color:r.status==='accepted'?'#fff':'#389e0d', borderColor:r.status==='accepted'?'#52c41a':'#b7eb8f', fontSize:11, fontWeight:700 }}>
            Accept
          </Button>
          <Button size="small" icon={<EditOutlined/>}
            style={{ background:r.status==='corrected'?'#faad14':'#fffbe6', color:r.status==='corrected'?'#fff':'#d48806', borderColor:r.status==='corrected'?'#faad14':'#ffe58f', fontSize:11, fontWeight:700 }}>
            Edit
          </Button>
          <Tooltip title="Escalate">
            <Button size="small" icon={<ArrowUpOutlined/>}
              style={{ background:r.status==='escalated'?'#722ed1':'#f9f0ff', color:r.status==='escalated'?'#fff':'#722ed1', borderColor:r.status==='escalated'?'#722ed1':'#d3adf7' }}/>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const columns = colDefs.filter(c => visibleCols[c.key]);

  const expandedRowRender = (row) => (
    <Row gutter={24} style={{ padding:'16px 12px', background:'#fafafa', borderTop:'2px solid #f0f0f0' }}>
      {[
        { bg:'#ff4d4f', label:'ERROR DESCRIPTION', icon:'!',  color:'#ff4d4f', text:row.errorDescription },
        { bg:'#1677ff', label:'AI ANALYSIS',        icon:'AI', color:'#1677ff', text:row.aiAnalysis },
        { bg:'#52c41a', label:'AI SOLUTION',        icon:'✓',  color:'#52c41a', text:row.aiSolution, editable:true },
      ].map(s => (
        <Col span={8} key={s.label}>
          <Space align="center" style={{ marginBottom:8 }}>
            <div style={{ background:s.bg, color:'#fff', width:16, height:16, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900 }}>{s.icon}</div>
            <Text style={{ fontWeight:800, color:s.color, fontSize:11, letterSpacing:0.5 }}>{s.label}</Text>
            {s.editable && <Tag color="blue" style={{ fontSize:9, borderRadius:4, fontWeight:800, padding:'0 4px' }}>EDITABLE</Tag>}
          </Space>
          <Paragraph type={s.color!=='#ff4d4f'?'secondary':undefined} style={{ fontSize:12, lineHeight:1.6, marginBottom:0 }}>{s.text}</Paragraph>
        </Col>
      ))}
    </Row>
  );

  const TABS = ['All','Pending','Accepted','Corrected','Escalated'];

  const colVisContent = (
    <div style={{ minWidth:190 }}>
      <Text strong style={{ fontSize:12, display:'block', marginBottom:8 }}>Show / Hide Columns</Text>
      {colDefs.map(col => (
        <div key={col.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0', borderBottom:'1px solid #f5f5f5' }}>
          <Text style={{ fontSize:12 }}>{col.label}</Text>
          <Switch size="small" checked={visibleCols[col.key]} onChange={v => setVisibleCols(p=>({...p,[col.key]:v}))}/>
        </div>
      ))}
      <Button size="small" type="link"
        onClick={() => setVisibleCols(ALL_COL_KEYS.reduce((a,k)=>({...a,[k]:true}),{}))}
        style={{ padding:0, marginTop:8, fontSize:11 }}>
        Reset to default
      </Button>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, background:'#fff', borderRadius:12, border:'1px solid #f0f0f0', padding:24 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
        <div>
          <Breadcrumb items={[
            { title:<Text style={{ color:'#8c8c8c', fontSize:12 }}>Security Master Errors</Text> },
            { title:<Text strong style={{ color:'#1677ff', fontSize:12 }}>{category?.title}</Text> },
          ]}/>
          <Text type="secondary" style={{ fontSize:12, marginTop:2, display:'block' }}>
            {category?.total || MOCK_RECORDS.length} total records &bull; {category?.pending || 0} pending review
          </Text>
        </div>
        <Space>
          <Button icon={<CheckOutlined/>}
            style={{ background:'#52c41a', color:'#fff', borderColor:'#52c41a', fontWeight:700, borderRadius:8 }}>
            Approve All
          </Button>
          <Button icon={<CloseCircleOutlined/>} danger type="primary" style={{ fontWeight:700, borderRadius:8 }}>
            Reject All
          </Button>
          <Button icon={<ArrowLeftOutlined/>} onClick={onBack} style={{ fontWeight:600, borderRadius:8 }}>Back</Button>
        </Space>
      </div>

      {/* Metric Cards */}
      <MetricCards error={category}/>

      {/* Label */}
      <div style={{ marginBottom:10 }}>
        <Title level={5} style={{ margin:0 }}>Subcategories Overview</Title>
        <Text type="secondary" style={{ fontSize:11, letterSpacing:0.5, fontWeight:600 }}>
          ERROR CATEGORIES — AI ROOT CAUSE ANALYSIS
        </Text>
      </div>

      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined style={{ color:'#bfbfbf' }}/>}
            placeholder="Search records..."
            size="small" value={tableSearch}
            onChange={e => setTableSearch(e.target.value)}
            allowClear style={{ width:220, borderRadius:8 }}
          />
          <div style={{ background:'#f5f5f5', padding:'3px 4px', borderRadius:20, display:'flex', gap:2 }}>
            {TABS.map(tab => (
              <Button key={tab} type={filterStatus===tab?'primary':'text'} size="small"
                onClick={() => setFilterStatus(tab)}
                style={{ borderRadius:16, fontWeight:600, fontSize:12, height:26, padding:'0 12px' }}>
                {tab}
              </Button>
            ))}
          </div>
          {selectedKeys.length > 0 && (
            <Space>
              <Divider type="vertical"/>
              <Text strong style={{ color:'#1677ff', fontSize:12 }}>{selectedKeys.length} selected</Text>
              <Button size="small" icon={<CheckOutlined/>} style={{ background:'#52c41a', color:'#fff', borderColor:'#52c41a', fontWeight:700, fontSize:11, borderRadius:6 }}>Accept</Button>
              <Button size="small" icon={<EditOutlined/>}  style={{ background:'#faad14', color:'#fff', borderColor:'#faad14', fontWeight:700, fontSize:11, borderRadius:6 }}>Correct</Button>
            </Space>
          )}
        </Space>
        <Space>
          <Text type="secondary" style={{ fontSize:11, fontWeight:600 }}>{data.length} of {MOCK_RECORDS.length} records</Text>
          <Popover content={colVisContent} trigger="click" placement="bottomRight">
            <Button size="small" icon={<AppstoreOutlined/>} style={{ borderRadius:8, fontWeight:600, fontSize:12 }}>Columns</Button>
          </Popover>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns} dataSource={data} size="small" scroll={{ x:1200 }}
        rowSelection={{ selectedRowKeys:selectedKeys, onChange:setSelectedKeys }}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize:10, showSizeChanger:true, showTotal:t=>`Total ${t} items` }}
        style={{ flex:1 }}
      />
    </div>
  );
}

// ─── ACCORDION PANEL BODY ─────────────────────────────────────────────────────
function AccordionBody({ error, onReviewRows }) {
  return (
    <div style={{ background:'#fafafa', borderTop:'1px solid #f5f5f5' }}>

      {/* BULK ACTIONS row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', borderBottom:'1px solid #f0f0f0' }}>
        <Text type="secondary" style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, marginRight:4 }}>BULK ACTION</Text>
        <Button size="small"
          style={{ background:'#52c41a', color:'#fff', borderColor:'#52c41a', fontWeight:700, fontSize:12, borderRadius:6 }}>
          ✓ Accept All ({error.pending})
        </Button>
        <Button size="small"
          style={{ background:'#faad14', color:'#fff', borderColor:'#faad14', fontWeight:700, fontSize:12, borderRadius:6 }}>
          ✎ Correct All ({error.pending})
        </Button>
        <Button size="small"
          style={{ background:'#722ed1', color:'#fff', borderColor:'#722ed1', fontWeight:700, fontSize:12, borderRadius:6 }}>
          ↑ Escalate All ({error.pending})
        </Button>
        <Button size="small"
          style={{ fontWeight:700, fontSize:12, borderRadius:6, borderColor:'#d9d9d9', color:'#595959', background:'#fff' }}
          onClick={() => onReviewRows(error)}>
          — Review Rows
        </Button>
      </div>

      {/* AI RECOMMENDATION block */}
      <div style={{ padding:'16px 20px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <Space>
            <ThunderboltOutlined style={{ color:'#1677ff', fontSize:13 }}/>
            <Text style={{ fontWeight:800, color:'#1677ff', fontSize:12, letterSpacing:0.5 }}>✦ AI RECOMMENDATION</Text>
          </Space>
          <Space align="center">
            <div style={{
              width:38, height:38, borderRadius:'50%',
              border:`3px solid #52c41a`,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Text style={{ fontSize:10, fontWeight:800, color:'#52c41a', lineHeight:1 }}>{error.confidence}%</Text>
            </div>
            <Text style={{ color:'#52c41a', fontWeight:700, fontSize:13 }}>{error.confidenceLabel}</Text>
          </Space>
        </div>

        <Text style={{ fontSize:13, display:'block', marginBottom:10, color:'#1d1d1d' }}>
          {error.aiRecommendation}
        </Text>

        <Text type="secondary" style={{ fontSize:10, fontWeight:800, letterSpacing:0.5, display:'block', marginBottom:4 }}>
          ANALYSIS SUMMARY
        </Text>
        <Paragraph type="secondary" style={{ fontSize:12, lineHeight:1.7, marginBottom:14 }}>
          {error.analysisSummary}
        </Paragraph>
      </div>

      {/* Mini stats row */}
      <div style={{ padding:'0 20px 12px', display:'flex', alignItems:'center', gap:20 }}>
        <Space size={4}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#d9d9d9', display:'inline-block' }}/>
          <Text type="secondary" style={{ fontSize:12 }}>○ {error.pending} pending</Text>
        </Space>
        <Space size={4}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#52c41a', display:'inline-block' }}/>
          <Text type="secondary" style={{ fontSize:12 }}>✓ {error.accepted} accepted</Text>
        </Space>
        <Space size={4}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#faad14', display:'inline-block' }}/>
          <Text type="secondary" style={{ fontSize:12 }}>↗ {error.corrected} corrected</Text>
        </Space>
        <Space size={4}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#722ed1', display:'inline-block' }}/>
          <Text type="secondary" style={{ fontSize:12 }}>↑ {error.escalated} escalated</Text>
        </Space>
        <Text type="secondary" style={{ fontSize:12 }}>/ {error.total} total</Text>

        <div style={{ marginLeft:'auto' }}>
          <Button
            size="small"
            style={{ fontWeight:700, fontSize:12, borderRadius:8, borderColor:'#d9d9d9', color:'#595959', background:'#fff' }}
            onClick={() => onReviewRows(error)}
          >
            Review Rows →
          </Button>
        </div>
      </div>

      <Divider style={{ margin:'0 20px', width:'calc(100% - 40px)', minWidth:'unset' }}/>

      {/* Feedback row */}
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px 12px' }}>
        <Text type="secondary" style={{ fontSize:11, fontWeight:700, letterSpacing:0.5 }}>AI ANALYSIS FEEDBACK</Text>
        <Button size="small" icon={<LikeOutlined/>}    style={{ borderRadius:6, fontSize:16, border:'none', background:'transparent', color:'#faad14' }}/>
        <Button size="small" icon={<DislikeOutlined/>} style={{ borderRadius:6, fontSize:16, border:'none', background:'transparent', color:'#f5222d' }}/>
      </div>
    </div>
  );
}

// ─── CATEGORY ACCORDION ────────────────────────────────────────────────────────
function CategoryAccordion({ highlightedId, onReviewRows }) {
  const [openIds,     setOpenIds]     = useState([1]); // first item open
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() =>
    ERRORS.filter(e =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const toggle = (id) =>
    setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <Text type="secondary" style={{ fontSize:11, fontWeight:700, letterSpacing:0.5 }}>
          ERROR CATEGORIES — AI ROOT CAUSE ANALYSIS
        </Text>
        <Input
          prefix={<SearchOutlined style={{ color:'#bfbfbf' }}/>}
          placeholder="Search categories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width:260, borderRadius:8 }} size="small"
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:40, color:'#bfbfbf' }}>
          <SearchOutlined style={{ fontSize:36, marginBottom:8 }}/>
          <Paragraph type="secondary">No categories matching "{searchQuery}"</Paragraph>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(error => {
            const isOpen = openIds.includes(error.id);
            // highlight if this is the category the sidebar highlighted
            const isHighlighted = highlightedId === error.id;
            return (
              <div
                key={error.id}
                style={{
                  background:'#fff',
                  border: isHighlighted ? '1.5px solid #1677ff' : '1px solid #f0f0f0',
                  borderRadius:10, overflow:'hidden',
                  boxShadow: isHighlighted ? '0 0 0 2px #bae0ff' : 'none',
                  transition:'all 0.2s',
                }}
              >
                {/* ── HEADER ROW ── */}
                <div
                  onClick={() => toggle(error.id)}
                  style={{
                    display:'flex', alignItems:'center', padding:'12px 20px',
                    cursor:'pointer', gap:10,
                    background: isOpen ? '#fff' : '#fff',
                    borderBottom: isOpen ? '1px solid #f5f5f5' : 'none',
                  }}
                >
                  {/* dot + title */}
                  <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:210 }}>
                    <span style={{
                      width:10, height:10, borderRadius:'50%', flexShrink:0,
                      background: error.severity === 'HIGH' ? '#ff4d4f' : '#faad14',
                    }}/>
                    <Text strong style={{ fontSize:14 }}>{error.title}</Text>
                  </div>

                  {/* severity + code */}
                  <Space size={6} style={{ marginRight:4 }}>
                    <SeverityTag severity={error.severity}/>
                    <Tag color="blue" style={{ fontSize:10, fontWeight:700, borderRadius:4 }}>{error.code}</Tag>
                  </Space>

                  {/* inline stats — pushed right */}
                  <Space size={16} style={{ marginLeft:'auto', marginRight:8 }}>
                    <Space size={3}>
                      <span style={{ fontSize:12, color:'#8c8c8c' }}>○</span>
                      <Text style={{ fontSize:12, fontWeight:600 }}>{error.pending}</Text>
                      <Text type="secondary" style={{ fontSize:12 }}>pending</Text>
                    </Space>
                    <Space size={3}>
                      <CheckOutlined style={{ color:'#52c41a', fontSize:12 }}/>
                      <Text style={{ fontSize:12, fontWeight:600 }}>{error.accepted}</Text>
                      <Text type="secondary" style={{ fontSize:12 }}>accepted</Text>
                    </Space>
                    <Space size={3}>
                      <EditOutlined style={{ color:'#faad14', fontSize:12 }}/>
                      <Text style={{ fontSize:12, fontWeight:600 }}>{error.corrected}</Text>
                      <Text type="secondary" style={{ fontSize:12 }}>corrected</Text>
                    </Space>
                    <Space size={3}>
                      <ArrowUpOutlined style={{ color:'#722ed1', fontSize:12 }}/>
                      <Text style={{ fontSize:12, fontWeight:600 }}>{error.escalated}</Text>
                      <Text type="secondary" style={{ fontSize:12 }}>escalated</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize:12 }}>/ {error.total} total</Text>
                  </Space>

                  {/* expand chevron */}
                  <span style={{ color:'#bfbfbf', transition:'transform 0.2s', transform:isOpen?'rotate(180deg)':'rotate(0deg)', display:'inline-block' }}>
                    <DownOutlined style={{ fontSize:13 }}/>
                  </span>
                </div>

                {/* ── BODY (collapsible) ── */}
                {isOpen && (
                  <AccordionBody error={error} onReviewRows={onReviewRows}/>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function DashboardApp() {
  // null  → show accordion
  // error → show ReviewTableView for that error
  const [tableCategory,    setTableCategory]    = useState(null);
  // which accordion item the sidebar highlights (no navigation)
  const [highlightedErrId, setHighlightedErrId] = useState(null);

  const kpis = [
    { title:'PENDING REVIEW', icon:<ClockCircleOutlined/>, value:19, suffix:'awaiting decision',    color:'#595959' },
    { title:'ACCEPTED',       icon:<CheckOutlined/>,       value:10, suffix:'AI suggestion applied', color:'#52c41a' },
    { title:'CORRECTED',      icon:<EditOutlined/>,        value:6,  suffix:'reviewer value applied',color:'#faad14' },
    { title:'ESCALATED',      icon:<ArrowUpOutlined/>,     value:1,  suffix:'flagged for specialist', color:'#722ed1' },
  ];

  return (
    <ConfigProvider theme={{ token:{ colorPrimary:'#1677ff', borderRadius:8, fontFamily:'"DM Sans","Segoe UI",sans-serif' } }}>
      <Layout style={{ height:'100vh', background:'#f8f9fb' }}>

        {/* ── SIDEBAR ── */}
        <Sider width={272} style={{ background:'#fff', borderRight:'1px solid #f0f0f0', overflow:'hidden' }}>
          <CategoryTree
            activeCategoryId={highlightedErrId}
            onHighlight={setHighlightedErrId}
          />
        </Sider>

        {/* ── MAIN CONTENT ── */}
        <Layout style={{ background:'#f8f9fb', overflow:'hidden' }}>
          <Content style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Global KPI bar */}
            <div style={{ padding:'20px 32px 0' }}>
              <Card bodyStyle={{ padding:0 }} style={{ borderRadius:12, border:'1px solid #f0f0f0', boxShadow:'none', marginBottom:12 }}>
                <Row>
                  {kpis.map((kpi, i) => (
                    <React.Fragment key={kpi.title}>
                      <Col flex={1} style={{ padding:'16px 20px' }}>
                        <Space size={5} style={{ marginBottom:3 }}>
                          <span style={{ color:kpi.color, fontSize:12 }}>{kpi.icon}</span>
                          <Text style={{ fontSize:10, fontWeight:700, color:kpi.color, letterSpacing:0.5 }}>{kpi.title}</Text>
                        </Space>
                        <Title level={2} style={{ margin:0, color:kpi.color, lineHeight:1, fontWeight:800 }}>{kpi.value}</Title>
                        <Text type="secondary" style={{ fontSize:11 }}>{kpi.suffix}</Text>
                      </Col>
                      {i < kpis.length - 1 && <Divider type="vertical" style={{ height:'auto', margin:0 }}/>}
                    </React.Fragment>
                  ))}
                </Row>
              </Card>

              {/* Progress bar */}
              <Card bodyStyle={{ padding:'14px 20px' }} style={{ borderRadius:12, border:'1px solid #f0f0f0', boxShadow:'none', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <Text strong style={{ fontSize:14 }}>Review Progress</Text>
                  <Text strong style={{ fontSize:14 }}>47% complete</Text>
                </div>
                <div style={{ display:'flex', height:12, borderRadius:6, overflow:'hidden', background:'#f0f0f0', marginBottom:8 }}>
                  <div style={{ width:'28%', background:'#52c41a' }}/>
                  <div style={{ width:'17%', background:'#faad14' }}/>
                  <div style={{ width:'2%',  background:'#722ed1' }}/>
                </div>
                <Space size={16}>
                  {[
                    { color:'#52c41a', label:'Accepted'  },
                    { color:'#faad14', label:'Corrected' },
                    { color:'#722ed1', label:'Escalated' },
                    { color:'#d9d9d9', label:'Pending'   },
                  ].map(l => (
                    <Space size={5} key={l.label}>
                      <span style={{ width:10, height:10, borderRadius:2, background:l.color, display:'inline-block' }}/>
                      <Text type="secondary" style={{ fontSize:12 }}>{l.label}</Text>
                    </Space>
                  ))}
                </Space>
              </Card>
            </div>

            {/* Body — accordion OR table */}
            <div style={{ flex:1, overflowY:'auto', padding:'0 32px 32px' }}>
              {tableCategory ? (
                <ReviewTableView
                  category={tableCategory}
                  onBack={() => setTableCategory(null)}
                />
              ) : (
                <CategoryAccordion
                  highlightedId={highlightedErrId}
                  onReviewRows={(err) => setTableCategory(err)}
                />
              )}
            </div>

          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
