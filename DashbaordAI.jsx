import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Grid, Paper, Chip, Button, IconButton, Divider, Tooltip,
  Checkbox, TextField, Stack, LinearProgress, Select, MenuItem, InputAdornment, Collapse,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, CircularProgress
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

import {
  AutoAwesome, CheckCircleOutline, CancelOutlined, RemoveRedEye, 
  Search, KeyboardArrowDown, KeyboardArrowRight, FilterAltOutlined,
  Storage, WarningAmber, AccessTime, CrisisAlert, PublicOutlined,
  ThumbUpAltOutlined, ThumbDownAltOutlined, InfoOutlined,
  ShowChart, AccountBalance, CategoryOutlined, InsertDriveFileOutlined,
  AnalyticsOutlined, ErrorOutline, CloudDoneOutlined, TaskAltOutlined,
  RefreshOutlined, FileDownloadOutlined, AssignmentLateOutlined
} from '@mui/icons-material';

// --- MOCK DATA ---
const FILE_INFO = {
  fileName: 'sampleErrorData.xlsx',
  uploadedBy: 'System API Ingest',
  uploadedAt: 'Today, 09:15 AM EST',
  status: 'AI Analysis Complete',
  totalRecords: 15000,
  errorRecords: 604,
  resolvedRecords: 170,
  resolutionRate: 28.1,
  readyForAutoApprove: 271,
  aiConfidence: 94,
};

const SIDEBAR_DATA = [
  {
    id: 'err-cat-1', name: 'Identifier Issues', pending: 67, level: 'high', icon: <Storage fontSize="small" sx={{ color: '#475569' }} />,
    stats: { total: 105, pending: 67, approved: 29, critical: 15, conf: 96 },
    analysis: 'ESL rules execution failed across multiple instruments. Database lookups returned expired valid_to dates or missing identifiers.',
    recommendation: 'Review AI web search extractions indicating corporate actions (e.g., acquisitions, delistings) and update Security Master records accordingly.',
    sources: ['db', 'web'],
    subCategories: [
      { id: 'inv-type-1-1', name: 'COMMON Stock', total: 45, pending: 27, approved: 9, critical: 15, conf: 94, analysis: 'Ticker ABCDEF matched in SecMaster but valid_to_dt expired on 12/25/2025. Web search confirms test corp was acquired by SAP and delisted after August 2025.', recommendation: 'Mark Ticker ABCDEF as INACTIVE. Map exposure to acquiring entity (SAP) if required for historical reporting.', sources: ['db', 'web'] },
      { id: 'inv-type-1-2', name: 'Preferred Stock', total: 60, pending: 40, approved: 20, critical: 0, conf: 98, analysis: 'Missing ISIN and CUSIP combinations for newly issued series.', recommendation: 'Extract identifiers from Bloomberg API using issuer name and dividend rate.', sources: ['db'] }
    ]
  },
  {
    id: 'err-cat-2', name: 'Pricing Anomalies', pending: 124, level: 'critical', icon: <ShowChart fontSize="small" sx={{ color: '#475569' }} />,
    stats: { total: 150, pending: 124, approved: 26, critical: 45, conf: 92 },
    analysis: 'Systematic pricing discrepancies identified. Root cause isolated to a latency in the primary internal pricing feed.',
    recommendation: 'Failover all affected instruments to the secondary Bloomberg/TRACE feeds immediately.',
    sources: ['db'],
    subCategories: [
      { id: 'inv-type-2-1', name: 'Fixed Income', total: 150, pending: 124, approved: 26, critical: 45, conf: 92, analysis: 'Stale pricing detected for corporate bonds. Pricing feed has not updated in 48 hours.', recommendation: 'Fallback to TRACE reported last-trade prices.', sources: ['db'] },
      { id: 'inv-type-2-2', name: 'Derivatives', total: 80, pending: 65, approved: 15, critical: 20, conf: 94, analysis: 'Options pricing feed latency detected > 15 minutes.', recommendation: 'Recalculate greeks using secondary OPRA feed.', sources: ['db'] }
    ]
  },
  { 
    id: 'err-cat-3', name: 'Corporate Action Mismatch', pending: 88, level: 'medium', icon: <AccountBalance fontSize="small" sx={{ color: '#475569' }} />, 
    stats: { total: 110, pending: 88, approved: 22, critical: 12, conf: 86 }, 
    analysis: 'Dividend ex-date mismatches found between internal accrual engine and official DTCC announcements.',
    recommendation: 'Override internal database dates with the official DTCC ex-dates to prevent incorrect dividend accruals.',
    sources: ['db', 'web'],
    subCategories: [
      { id: 'inv-type-3-1', name: 'Equities', total: 110, pending: 88, approved: 22, critical: 12, conf: 86, analysis: 'Dividend ex-date mismatch identified between internal database and DTCC announcements.', recommendation: 'Override internal database dates with the official DTCC ex-dates to prevent incorrect dividend accruals.', sources: ['db', 'web'] }
    ] 
  }
];

const TABLE_DATA = [
  { id: 'EQ-US-ABCDEF', name: 'test corp Common stock', category: 'Identifier Issues', type: 'COMMON Stock', error: 'ESL rules execution failed, failed to find instrument', status: 'pending', level: 'high', conf: 94, analysis: 'Ticker ABCDEF matched in SecMaster but valid_to_dt expired on 12/25/2025. Web search confirms test corp was acquired by SAP and delisted after August 2025.', recommendation: 'Mark Ticker ABCDEF as INACTIVE. Map exposure to acquiring entity (SAP) if required for historical reporting.', sources: ['db', 'web'] },
  { id: 'EQ-EU-SAP', name: 'SAP SE', category: 'Identifier Issues', type: 'COMMON Stock', error: 'Missing SEDOL code', status: 'approved', level: 'medium', conf: 95, analysis: 'Identified valid ISIN. Cross-referenced European Exchange data to locate corresponding SEDOL.', recommendation: 'Populate missing SEDOL field with BNNYY98.', sources: ['db'] },
  { id: 'FI-CORP-IBM', name: 'IBM 4.0% 2030', category: 'Pricing Anomalies', type: 'Fixed Income', error: 'Stale pricing > 48 hours', status: 'rejected', level: 'critical', conf: 89, analysis: 'Primary evaluated pricing feed has not updated. TRACE shows 5 trades executed today at average price of 98.45.', recommendation: 'Update price to 98.45 based on TRACE volume-weighted average.', sources: ['db'] },
];

// --- HELPER COMPONENTS ---
function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} size={70} thickness={4} sx={{ color: '#2563eb', strokeLinecap: 'round' }} />
      <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <Typography variant="subtitle1" fontWeight="800" color="#1e3a8a">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const AISourcesDisplay = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
      <Typography variant="caption" fontWeight="700" color="#1e40af" sx={{ mr: 0.5 }}>SOURCES:</Typography>
      {sources.includes('db') && (
        <Chip icon={<Storage fontSize="small" />} label="Database" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', color: '#1e40af', fontWeight: 600, border: '1px solid #bfdbfe' }} />
      )}
      {sources.includes('web') && (
        <Chip icon={<PublicOutlined fontSize="small" />} label="Web Search" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.6)', color: '#1e40af', fontWeight: 600, border: '1px solid #bfdbfe' }} />
      )}
    </Stack>
  );
};

const AISecurityDashboard = () => {
  const [expandedCats, setExpandedCats] = useState(['err-cat-1']);
  const [selectedNode, setSelectedNode] = useState({ type: 'category', data: SIDEBAR_DATA[0] });
  const [leftSidebarSearchQuery, setLeftSidebarSearchQuery] = useState('');
  const [rightSubcatSearchQuery, setRightSubcatSearchQuery] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const filteredSidebarData = useMemo(() => {
    if (!leftSidebarSearchQuery.trim()) return SIDEBAR_DATA;
    const lowerQuery = leftSidebarSearchQuery.toLowerCase();
    return SIDEBAR_DATA.map(cat => {
      const isCatMatch = cat.name.toLowerCase().includes(lowerQuery);
      const matchedSubs = cat.subCategories.filter(sub => sub.name.toLowerCase().includes(lowerQuery));
      if (isCatMatch || matchedSubs.length > 0) return { ...cat, subCategories: isCatMatch ? cat.subCategories : matchedSubs };
      return null;
    }).filter(Boolean);
  }, [leftSidebarSearchQuery]);

  const effectiveExpandedCats = useMemo(() => {
    if (!leftSidebarSearchQuery.trim()) return expandedCats; 
    return filteredSidebarData.map(cat => cat.id); 
  }, [leftSidebarSearchQuery, expandedCats, filteredSidebarData]);

  const toggleCategory = (catId) => {
    if (leftSidebarSearchQuery.trim()) return; 
    setExpandedCats(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
  };

  const handleCategoryClick = (cat) => { 
    setRightSubcatSearchQuery(''); 
    setSelectedNode({ type: 'category', data: cat }); 
    if (!effectiveExpandedCats.includes(cat.id)) toggleCategory(cat.id); 
  };
  
  const handleSubcategoryClick = (cat, sub) => setSelectedNode({ type: 'subcategory', data: sub, parent: cat });
  const handleOpenRowModal = (rowData) => { setSelectedRowData(rowData); setIsModalOpen(true); };
  const handleCloseRowModal = () => { setIsModalOpen(false); setSelectedRowData(null); };
  const handleRowAction = (actionType) => { console.log(`${actionType} action taken on:`, selectedRowData?.id); handleCloseRowModal(); };

  const columns = useMemo(() => [
    { accessorKey: 'id', header: 'SECURITY ID', size: 140 },
    { accessorKey: 'name', header: 'SECURITY NAME', size: 180, Cell: ({ cell }) => <Typography variant="body2" fontWeight="600">{cell.getValue()}</Typography> },
    { accessorKey: 'type', header: 'INV. TYPE', size: 120, Cell: ({ cell }) => <Chip label={cell.getValue()} size="small" variant="outlined" sx={{ borderRadius: 1 }} /> },
    { accessorKey: 'error', header: 'ERROR DESCRIPTION', size: 300, Cell: ({ cell }) => <Typography variant="body2" color="text.secondary">{cell.getValue()}</Typography> },
    { 
      accessorKey: 'status', 
      header: 'STATUS', 
      size: 90, 
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      Cell: ({ cell }) => {
        const val = cell.getValue();
        if (val === 'approved') return <Tooltip title="Approved" arrow placement="top"><CheckCircleOutline sx={{ color: '#16a34a' }} /></Tooltip>;
        if (val === 'rejected') return <Tooltip title="Rejected" arrow placement="top"><CancelOutlined sx={{ color: '#dc2626' }} /></Tooltip>;
        return <Tooltip title="Pending Review" arrow placement="top"><AccessTime sx={{ color: '#ca8a04' }} /></Tooltip>;
      } 
    },
    { accessorKey: 'level', header: 'LEVEL', size: 110, Cell: ({ cell }) => (<Chip icon={<WarningAmber style={{ fontSize: 16, color: cell.getValue() === 'high' ? '#ea580c' : cell.getValue() === 'critical' ? '#dc2626' : '#ca8a04' }} />} label={cell.getValue()} size="small" sx={{ bgcolor: cell.getValue() === 'high' ? '#ffedd5' : cell.getValue() === 'critical' ? '#fecaca' : '#fef9c3', color: cell.getValue() === 'high' ? '#ea580c' : cell.getValue() === 'critical' ? '#dc2626' : '#ca8a04', border: '1px solid', borderColor: cell.getValue() === 'high' ? '#fed7aa' : cell.getValue() === 'critical' ? '#f87171' : '#fef08a', textTransform: 'capitalize', fontWeight: 600 }} />) },
    { accessorKey: 'conf', header: 'AI CONF.', size: 100, Cell: ({ cell }) => (<Stack direction="row" alignItems="center" spacing={0.5}><AutoAwesome sx={{ fontSize: 16, color: '#2563eb' }} /><Typography variant="body2" fontWeight="700" color="#1e3a8a">{cell.getValue()}%</Typography></Stack>) },
  ], []);

  const tableDataFiltered = useMemo(() => {
    if (selectedNode.type === 'category') return TABLE_DATA.filter(row => row.category === selectedNode.data.name);
    return TABLE_DATA.filter(row => row.category === selectedNode.parent.name && row.type === selectedNode.data.name);
  }, [selectedNode]);

  const table = useMaterialReactTable({
    columns, data: tableDataFiltered, enableRowSelection: true, enableColumnActions: false, 
    enablePagination: true, enableBottomToolbar: true, enableTopToolbar: false,
    initialState: { pagination: { pageSize: 5, pageIndex: 0 } },
    muiTableContainerProps: { sx: { maxHeight: '350px', minHeight: '300px', overflowY: 'auto' } },
    muiTablePaperProps: { elevation: 0 }, muiTableHeadCellProps: { sx: { color: '#64748b', fontSize: '12px', fontWeight: 700, bgcolor: '#f8fafc' } },
    renderRowActions: ({ row }) => (
      row.original.status === 'pending' ? (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View Details" arrow>
            <IconButton size="small" onClick={() => handleOpenRowModal(row.original)} sx={{ bgcolor: '#3b82f6', color: 'white', '&:hover': { bgcolor: '#2563eb' }, width: 28, height: 28, borderRadius: 1 }}><RemoveRedEye sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Approve Recommendation" arrow>
            <IconButton size="small" onClick={() => console.log('Approved', row.original.id)} sx={{ bgcolor: '#22c55e', color: 'white', '&:hover': { bgcolor: '#16a34a' }, width: 28, height: 28, borderRadius: 1 }}><ThumbUpAltOutlined sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Reject Recommendation" arrow>
            <IconButton size="small" onClick={() => console.log('Rejected', row.original.id)} sx={{ bgcolor: '#ef4444', color: 'white', '&:hover': { bgcolor: '#dc2626' }, width: 28, height: 28, borderRadius: 1 }}><ThumbDownAltOutlined sx={{ fontSize: 16 }} /></IconButton>
          </Tooltip>
        </Stack>
      ) : null
    ),
    enableRowActions: true, positionActionsColumn: 'last', displayColumnDefOptions: { 'mrt-row-actions': { header: 'ACTIONS', size: 120 } },
  });

  const renderCategoryDashboard = () => {
    const cat = selectedNode.data;
    const displayedSubCategories = cat.subCategories.filter(sub => sub.name.toLowerCase().includes(rightSubcatSearchQuery.toLowerCase()));

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{React.cloneElement(cat.icon, { sx: { color: '#3b82f6', fontSize: 32 } })}</Box>
              <Box>
                <Typography variant="h5" fontWeight="800" color="#0f172a">{cat.name}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ mt: 0.5 }}>{cat.subCategories.length} subcategories • {cat.stats.total} total errors</Typography>
              </Box>
            </Stack>
            <Chip label={`${cat.level.toUpperCase()} PRIORITY`} sx={{ bgcolor: cat.level === 'critical' ? '#fecaca' : '#ffedd5', color: cat.level === 'critical' ? '#991b1b' : '#c2410c', fontWeight: 800, borderRadius: 2, px: 1 }} />
          </Box>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fefce8', borderColor: '#fef08a' }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><AccessTime sx={{ color: '#ca8a04', fontSize: 20 }} /><Typography variant="body2" fontWeight="700" color="#ca8a04">Pending</Typography></Stack><Typography variant="h3" fontWeight="800" color="#ca8a04">{cat.stats.pending}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#f0fdf4', borderColor: '#bbf7d0' }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><CheckCircleOutline sx={{ color: '#16a34a', fontSize: 20 }} /><Typography variant="body2" fontWeight="700" color="#16a34a">Approved</Typography></Stack><Typography variant="h3" fontWeight="800" color="#16a34a">{cat.stats.approved}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#fef2f2', borderColor: '#fecaca' }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><CrisisAlert sx={{ color: '#dc2626', fontSize: 20 }} /><Typography variant="body2" fontWeight="700" color="#dc2626">Critical/High</Typography></Stack><Typography variant="h3" fontWeight="800" color="#dc2626">{cat.stats.critical}</Typography></Paper></Grid>
            <Grid item xs={12} sm={6} md={3}><Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: '#faf5ff', borderColor: '#e9d5ff' }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><AutoAwesome sx={{ color: '#9333ea', fontSize: 20 }} /><Typography variant="body2" fontWeight="700" color="#9333ea">Avg Confidence</Typography></Stack><Typography variant="h3" fontWeight="800" color="#9333ea">{cat.stats.conf}%</Typography></Paper></Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%' }}>
            <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><AutoAwesome sx={{ color: '#1e40af', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#1e40af">Category AI Summary</Typography></Stack>
              <Typography variant="body2" color="#1e3a8a" sx={{ lineHeight: 1.6, flexGrow: 1 }}>{cat.analysis}</Typography>
              <AISourcesDisplay sources={cat.sources} />
            </Paper>
            <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><CheckCircleOutline sx={{ color: '#166534', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#166534">Global Recommendation</Typography></Stack>
              <Typography variant="body2" color="#14532d" sx={{ lineHeight: 1.6, mb: 2, flexGrow: 1 }}>{cat.recommendation}</Typography>
              <Stack direction="row" alignItems="center" spacing={2}><LinearProgress variant="determinate" value={cat.stats.conf} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: '#bbf7d0', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} /><Typography variant="caption" fontWeight="700" color="#166534">{cat.stats.conf}% confidence</Typography></Stack>
            </Paper>
          </Box>
        </Paper>

        <Box sx={{ mt: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}><CategoryOutlined sx={{ color: '#3b82f6' }} /><Typography variant="h6" fontWeight="800" color="#0f172a">Subcategories Overview</Typography></Stack>
            <TextField size="small" placeholder="Filter subcategories..." value={rightSubcatSearchQuery} onChange={(e) => setRightSubcatSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ width: 300, bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
          <Stack spacing={2}>
            {displayedSubCategories.length === 0 ? <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No subcategories match your filter.</Typography> : displayedSubCategories.map(sub => (
              <Paper key={sub.id} elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2.5 }}>
                  <Box>
                    <Typography variant="h6" fontWeight="800" color="#0f172a">{sub.name}</Typography>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }} alignItems="center">
                      <Typography variant="body2" fontWeight="600" color="text.secondary">{sub.total} total errors</Typography>
                      
                      <Tooltip title="Pending Review" arrow placement="top">
                        <Chip label={sub.pending} size="small" icon={<AccessTime sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#fefce8', color: '#ca8a04', fontWeight: 600, border: '1px solid #fef08a' }} />
                      </Tooltip>
                      {sub.critical > 0 && (
                        <Tooltip title="Critical Errors" arrow placement="top">
                          <Chip label={sub.critical} size="small" icon={<CrisisAlert sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, border: '1px solid #fecaca' }} /> 
                        </Tooltip>
                      )}
                      <Tooltip title="AI Confidence Score" arrow placement="top">
                        <Chip label={`${sub.conf}%`} size="small" icon={<AutoAwesome sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, border: '1px solid #bfdbfe' }} />
                      </Tooltip>
                    </Stack>
                  </Box>
                  <Button variant="contained" onClick={() => handleSubcategoryClick(cat, sub)} startIcon={<RemoveRedEye />} sx={{ bgcolor: '#3b82f6', textTransform: 'none', fontWeight: 600, boxShadow: 'none', borderRadius: 1.5 }}>View Details</Button>
                </Stack>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%' }}>
                  <Paper elevation={0} sx={{ flex: 1, p: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><AutoAwesome sx={{ color: '#1e40af', fontSize: 18 }} /><Typography variant="subtitle2" fontWeight="700" color="#1e40af">AI Analysis</Typography></Stack>
                    <Typography variant="body2" color="#1e3a8a" sx={{ lineHeight: 1.5, flexGrow: 1 }}>{sub.analysis}</Typography>
                    <AISourcesDisplay sources={sub.sources} />
                  </Paper>
                  <Paper elevation={0} sx={{ flex: 1, p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><CheckCircleOutline sx={{ color: '#166534', fontSize: 18 }} /><Typography variant="subtitle2" fontWeight="700" color="#166534">Recommended Action</Typography></Stack>
                    <Typography variant="body2" color="#14532d" sx={{ lineHeight: 1.5 }}>{sub.recommendation}</Typography>
                  </Paper>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Box>
    );
  };

  const renderSubcategoryDashboard = () => {
    const sub = selectedNode.data;
    const parent = selectedNode.parent;
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}><Typography variant="h5" fontWeight="800" color="#0f172a">{sub.name}</Typography><Typography variant="body1" color="text.secondary" fontWeight="500">{parent.name}</Typography></Stack>
            <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} alignItems="center">
              <Typography variant="body2" fontWeight="600" color="text.secondary">{sub.total} total errors</Typography>
              <Tooltip title="Pending Review" arrow placement="top">
                <Chip label={sub.pending} size="small" icon={<AccessTime sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#fefce8', color: '#ca8a04', fontWeight: 600, border: '1px solid #fef08a' }} />
              </Tooltip>
              {sub.critical > 0 && (
                <Tooltip title="Critical Errors" arrow placement="top">
                  <Chip label={sub.critical} size="small" icon={<CrisisAlert sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 600, border: '1px solid #fecaca' }} />
                </Tooltip>
              )}
              <Tooltip title="AI Confidence Score" arrow placement="top">
                <Chip label={`${sub.conf}%`} size="small" icon={<AutoAwesome sx={{ fontSize: '14px !important' }}/>} sx={{ bgcolor: '#eff6ff', color: '#2563eb', fontWeight: 600, border: '1px solid #bfdbfe' }} />
              </Tooltip>
            </Stack>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" startIcon={<ThumbUpAltOutlined />} sx={{ bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none', borderRadius: 2 }}>Approve All ({sub.pending})</Button>
            <Button variant="contained" startIcon={<ThumbDownAltOutlined />} sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: 'none', borderRadius: 2 }}>Reject All</Button>
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%', mb: 1 }}>
          <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><AutoAwesome sx={{ color: '#1e40af', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#1e40af">AI Analysis Summary</Typography></Stack>
            <Typography variant="body2" color="#1e3a8a" sx={{ lineHeight: 1.6, mb: 2, flexGrow: 1 }}>{sub.analysis}</Typography>
            <AISourcesDisplay sources={sub.sources} />
          </Paper>

          <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><CheckCircleOutline sx={{ color: '#166534', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#166534">Recommended Action</Typography></Stack>
            <Typography variant="body2" color="#14532d" sx={{ lineHeight: 1.6, mb: 3, flexGrow: 1 }}>{sub.recommendation}</Typography>
            <Stack direction="row" alignItems="center" spacing={2}><LinearProgress variant="determinate" value={sub.conf} sx={{ flexGrow: 1, height: 8, borderRadius: 4, bgcolor: '#bbf7d0', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} /><Typography variant="caption" fontWeight="700" color="#166534">{sub.conf}% confidence</Typography></Stack>
          </Paper>
        </Box>

        <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 2, bgcolor: '#ffffff' }}>
            <TextField size="small" placeholder={`Search ${sub.name.toLowerCase()} securities...`} sx={{ width: 320 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
            <Select size="small" value="All Status" sx={{ width: 140, color: 'text.secondary', fontSize: '14px' }}><MenuItem value="All Status">All Status</MenuItem></Select>
            <Select size="small" value="All Levels" sx={{ width: 140, color: 'text.secondary', fontSize: '14px' }}><MenuItem value="All Levels">All Levels</MenuItem></Select>
          </Box>
          <MaterialReactTable table={table} />
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: 3, fontFamily: 'system-ui' }}>
      
      {/* 1. UNIFIED TOP DASHBOARD CONTAINER */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, mb: 4, borderRadius: 3, 
          bgcolor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderTop: '4px solid #2563eb',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar variant="rounded" sx={{ bgcolor: '#eff6ff', color: '#2563eb', width: 48, height: 48 }}>
              <InsertDriveFileOutlined />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="800" color="#0f172a">{FILE_INFO.fileName}</Typography>
              <Typography variant="body2" color="text.secondary">Uploaded by <b>{FILE_INFO.uploadedBy}</b> • {FILE_INFO.uploadedAt}</Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Chip icon={<CloudDoneOutlined />} label={FILE_INFO.status} color="success" size="small" sx={{ fontWeight: 700, mb: 0.5 }} />
              <Typography variant="body2" color="text.secondary" fontWeight="600">Total Analyzed Records: {FILE_INFO.totalRecords.toLocaleString()}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ height: 40, borderColor: '#e2e8f0' }} />
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data" arrow>
                <IconButton size="small" sx={{ border: '1px solid #e2e8f0', borderRadius: 2, color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}>
                  <RefreshOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Report" arrow>
                <IconButton size="small" sx={{ border: '1px solid #e2e8f0', borderRadius: 2, color: '#475569', '&:hover': { bgcolor: '#f1f5f9' } }}>
                  <FileDownloadOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />

        {/* 5-CARD METRICS ROW */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%' }}>
          
          <Box sx={{ flex: 1, minWidth: 0, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1.5 }}>WORKFLOW STATUS</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 18, color: '#d97706' }}/> Pending
                </Typography>
                <Typography variant="subtitle2" fontWeight="800" color="#0f172a">{FILE_INFO.errorRecords}</Typography>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TaskAltOutlined sx={{ fontSize: 18, color: '#16a34a' }}/> AI Approved
                </Typography>
                <Typography variant="subtitle2" fontWeight="800" color="success.main">170</Typography>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CancelOutlined sx={{ fontSize: 18, color: '#dc2626' }}/> Rejected
                </Typography>
                <Typography variant="subtitle2" fontWeight="800" color="error.main">0</Typography>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" fontWeight="800" color="text.secondary" sx={{ mb: 1.5 }}>ERROR SEVERITY</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ErrorOutline sx={{ fontSize: 16, color: '#dc2626' }}/> Critical</Typography>
                <Typography variant="subtitle2" fontWeight="800" color="#dc2626">162</Typography>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarningAmber sx={{ fontSize: 16, color: '#ea580c' }}/> High</Typography>
                <Typography variant="subtitle2" fontWeight="800" color="#ea580c">254</Typography>
              </Stack>
              <Divider sx={{ borderStyle: 'dashed', my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><InfoOutlined sx={{ fontSize: 16, color: '#d97706' }}/> Medium</Typography>
                <Typography variant="subtitle2" fontWeight="800" color="#d97706">188</Typography>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, p: 2, borderRadius: 2, bgcolor: '#fffbeb', border: '1px solid #fef08a', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AssignmentLateOutlined sx={{ color: '#d97706', fontSize: 18 }} />
              <Typography variant="caption" fontWeight="800" color="#d97706">NEEDS REVIEW</Typography>
            </Stack>
            <Box sx={{ mt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="800" color="#b45309">367</Typography>
                <Typography variant="caption" color="#d97706" fontWeight="700" sx={{ mt: 0.5 }}>
                   <span style={{color: '#dc2626'}}>162 critical</span> • 254 high priority
                </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, p: 2.5, borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="caption" fontWeight="800" color="#1e40af">RESOLUTION RATE</Typography>
            <Box sx={{ mt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="800" color="#1e3a8a">{FILE_INFO.resolutionRate}%</Typography>
                <Typography variant="body2" color="#3b82f6" fontWeight="700" sx={{ mt: 0.5 }}>{FILE_INFO.resolvedRecords} of {FILE_INFO.errorRecords} resolved</Typography>
                <LinearProgress variant="determinate" value={FILE_INFO.resolutionRate} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#dbeafe', '& .MuiLinearProgress-bar': { bgcolor: '#2563eb' } }} />
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, p: 2.5, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesome sx={{ color: '#166534', fontSize: 18 }} />
              <Typography variant="caption" fontWeight="800" color="#166534">AI CONFIDENCE</Typography>
            </Stack>
            <Box sx={{ mt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h3" fontWeight="800" color="#14532d">{FILE_INFO.aiConfidence}%</Typography>
                <Typography variant="body2" color="#16a34a" fontWeight="700" sx={{ mt: 0.5 }}>{FILE_INFO.readyForAutoApprove} ready for auto-approve</Typography>
                <LinearProgress variant="determinate" value={FILE_INFO.aiConfidence} sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#dcfce7', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }} />
            </Box>
          </Box>

        </Box>
      </Paper>

      {/* 2. DASHBOARD BODY */}
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <Paper elevation={0} variant="outlined" sx={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 160px)', borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <FilterAltOutlined fontSize="small" sx={{ color: '#475569' }} />
              <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Categories & Inv. Types</Typography>
            </Stack>
            <TextField fullWidth size="small" placeholder="Filter 500+ categories..." value={leftSidebarSearchQuery} onChange={(e) => setLeftSidebarSearchQuery(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#ffffff' } }} />
          </Box>

          <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 2, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' } }}>
            {filteredSidebarData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>No results match your filter.</Typography>
            ) : (
              filteredSidebarData.map((cat) => {
                const isExpanded = effectiveExpandedCats.includes(cat.id);
                const isCatSelected = selectedNode.type === 'category' && selectedNode.data.id === cat.id;

                return (
                  <Box key={cat.id} sx={{ mb: 2 }}>
                    <Box 
                      onClick={() => handleCategoryClick(cat)} 
                      sx={{ 
                        display: 'flex', alignItems: 'flex-start', p: 1.5, borderRadius: 2, cursor: 'pointer', 
                        border: isCatSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                        bgcolor: isCatSelected ? '#eff6ff' : '#f1f5f9', 
                        '&:hover': { borderColor: isCatSelected ? '#3b82f6' : '#cbd5e1' } 
                      }}
                    >
                      <Checkbox size="small" sx={{ p: 0, mt: 0.5, mr: 0.5 }} onClick={(e) => e.stopPropagation()} />
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleCategory(cat.id); }} sx={{ p: 0, mt: 0.5, mr: 1, color: '#64748b' }}>{isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}</IconButton>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, bgcolor: '#e2e8f0', borderRadius: 2, mr: 1.5, mt: 0.2 }}>{cat.icon}</Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" fontWeight="700" color="#0f172a">{cat.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}><Typography variant="caption" color="text.secondary">{cat.subCategories.length} types</Typography><Box sx={{ bgcolor: '#fef08a', color: '#854d0e', px: 1, py: 0.2, borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>{cat.pending} pending</Box></Stack>
                      </Box>
                      <Box sx={{ bgcolor: cat.level === 'high' ? '#ffedd5' : cat.level === 'critical' ? '#fecaca' : '#fef3c7', color: cat.level === 'high' ? '#c2410c' : cat.level === 'critical' ? '#991b1b' : '#b45309', px: 1.5, py: 0.3, borderRadius: '12px', fontSize: '11px', fontWeight: 700, mt: 0.5 }}>{cat.level}</Box>
                    </Box>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 1, ml: 4 }}>
                        {cat.subCategories.map((sub) => {
                          const isSubSelected = selectedNode.type === 'subcategory' && selectedNode.data.id === sub.id;
                          return (
                            <Box key={sub.id} onClick={() => handleSubcategoryClick(cat, sub)} sx={{ display: 'flex', alignItems: 'flex-start', p: 1.5, mb: 1, borderRadius: 2, cursor: 'pointer', border: isSubSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', bgcolor: isSubSelected ? '#eff6ff' : 'white', '&:hover': { borderColor: isSubSelected ? '#3b82f6' : '#cbd5e1' } }}>
                              <Checkbox size="small" sx={{ p: 0, mr: 1.5, mt: 0.2 }} onClick={(e) => e.stopPropagation()} />
                              <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="body2" fontWeight="700" color="#0f172a">{sub.name}</Typography>
                                  <Box sx={{ bgcolor: '#f1f5f9', color: '#475569', px: 1, py: 0.2, borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>{sub.total}</Box>
                                </Stack>
                                
                                {/* ------------------------------------------------------------- */}
                                {/* LEFT SIDEBAR SUBCATEGORY STATUS: ICONS + TOOLTIPS ONLY        */}
                                {/* ------------------------------------------------------------- */}
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Tooltip title="Pending Review" arrow placement="top">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#d97706', fontWeight: 600 }}>
                                      <AccessTime sx={{ fontSize: 14 }} /> {sub.pending}
                                    </Typography>
                                  </Tooltip>
                                  <Tooltip title="AI Approved" arrow placement="top">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#16a34a', fontWeight: 600 }}>
                                      <CheckCircleOutline sx={{ fontSize: 14 }} /> {sub.approved}
                                    </Typography>
                                  </Tooltip>
                                  {sub.critical > 0 && (
                                    <Tooltip title="Critical Errors" arrow placement="top">
                                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#dc2626', fontWeight: 600 }}>
                                        <CrisisAlert sx={{ fontSize: 14 }} /> {sub.critical}
                                      </Typography>
                                    </Tooltip>
                                  )}
                                  <Tooltip title="AI Confidence Score" arrow placement="top">
                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2563eb', fontWeight: 600 }}>
                                      <AutoAwesome sx={{ fontSize: 14 }} /> {sub.conf}%
                                    </Typography>
                                  </Tooltip>
                                </Stack>

                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })
            )}
          </Box>
        </Paper>

        {/* RIGHT SIDE ACTION CANVAS */}
        <Paper elevation={0} variant="outlined" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 160px)', borderRadius: 3, borderColor: '#e2e8f0', bgcolor: '#ffffff', overflow: 'hidden' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AnalyticsOutlined fontSize="small" sx={{ color: '#475569' }} />
              <Typography variant="subtitle1" fontWeight="800" color="#0f172a">Resolution Canvas</Typography>
            </Stack>
          </Box>
          <Box sx={{ overflowY: 'auto', flexGrow: 1, p: 3, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: '4px' } }}>
             {selectedNode.type === 'category' ? renderCategoryDashboard() : renderSubcategoryDashboard()}
          </Box>
        </Paper>
      </Box>

      {/* ROW ACTION MODAL */}
      <Dialog open={isModalOpen} onClose={handleCloseRowModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        {selectedRowData && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight="800" color="#0f172a">Review Action: {selectedRowData.name}</Typography>
              <Typography variant="body2" color="text.secondary">Security ID: {selectedRowData.id} • Type: {selectedRowData.type}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3} sx={{ py: 1 }}>
                
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`Priority: ${selectedRowData.level.toUpperCase()}`} size="small" sx={{ bgcolor: selectedRowData.level === 'critical' ? '#fecaca' : '#ffedd5', color: selectedRowData.level === 'critical' ? '#991b1b' : '#c2410c', fontWeight: 700 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1 }}>
                     {selectedRowData.status === 'approved' ? <CheckCircleOutline fontSize="small" sx={{ color: '#16a34a' }} /> : selectedRowData.status === 'rejected' ? <CancelOutlined fontSize="small" sx={{ color: '#dc2626' }} /> : <AccessTime fontSize="small" sx={{ color: '#ca8a04' }} />}
                     <Typography variant="caption" fontWeight="700" color="#475569" sx={{ textTransform: 'uppercase' }}>{selectedRowData.status}</Typography>
                  </Box>
                </Stack>
                
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#0f172a" gutterBottom>System Error Encountered</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0' }}><Typography variant="body2" color="#334155" fontFamily="monospace">{selectedRowData.error}</Typography></Paper>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', width: '100%' }}>
                  <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><AutoAwesome sx={{ color: '#1e40af', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#1e40af">AI Root Cause Analysis</Typography></Stack>
                    <Typography variant="body2" color="#1e3a8a" sx={{ lineHeight: 1.6, flexGrow: 1 }}>{selectedRowData.analysis}</Typography>
                    <AISourcesDisplay sources={selectedRowData.sources} />
                  </Paper>
                  <Paper elevation={0} sx={{ flex: 1, p: 2.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '4px solid #22c55e', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><CheckCircleOutline sx={{ color: '#166534', fontSize: 20 }} /><Typography variant="subtitle2" fontWeight="700" color="#166534">AI Solution</Typography></Stack>
                    <Typography variant="body2" color="#14532d" sx={{ lineHeight: 1.6, flexGrow: 1, mb: 2 }}>{selectedRowData.recommendation}</Typography>
                    <Stack direction="row" alignItems="center" spacing={2}><LinearProgress variant="determinate" value={selectedRowData.conf} sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#bbf7d0', '& .MuiLinearProgress-bar': { bgcolor: '#22c55e' } }} /><Typography variant="caption" fontWeight="700" color="#166534">{selectedRowData.conf}% conf.</Typography></Stack>
                  </Paper>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" color="#0f172a" gutterBottom>Human-in-the-Loop Feedback (Optional)</Typography>
                  <TextField fullWidth multiline rows={2} placeholder="Add operational notes or reasons for rejecting the AI's logic to help train the model..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Button onClick={handleCloseRowModal} sx={{ color: '#64748b', fontWeight: 600 }}>Cancel</Button>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" color="error" startIcon={<ThumbDownAltOutlined />} onClick={() => handleRowAction('Rejected')} sx={{ borderRadius: 2, fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>Reject AI Solution</Button>
                <Button variant="contained" color="success" startIcon={<ThumbUpAltOutlined />} onClick={() => handleRowAction('Approved')} sx={{ borderRadius: 2, fontWeight: 600, bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' }, boxShadow: 'none' }}>Approve Solution</Button>
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AISecurityDashboard;
