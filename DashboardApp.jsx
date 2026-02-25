import React, { useState, useMemo, useEffect } from 'react';
import {
    ThemeProvider, createTheme, CssBaseline, Box, Typography,
    List, ListItem, ListItemButton, ListItemText, Collapse,
    Paper, Divider, Chip, Accordion, AccordionSummary, AccordionDetails,
    Button, IconButton, TextField, InputAdornment
} from '@mui/material';
import {
    KeyboardArrowDown, KeyboardArrowRight, Check, CallMade, ArrowUpward,
    RadioButtonUnchecked, AutoAwesome, ThumbUpAltOutlined, ThumbDownAltOutlined,
    KeyboardBackspace, Edit
} from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';

// --- 1. THEME DEFINITION ---
const theme = createTheme({
    palette: {
        primary: { main: '#3B82F6', dark: '#1D4ED8', light: '#EFF6FF' },
        background: { default: '#F8F9FB', paper: '#FFFFFF' },
        text: { primary: '#111827', secondary: '#4B5563', disabled: '#9CA3AF' },
        success: { main: '#10B981', light: '#ECFDF5', dark: '#047857' },
        warning: { main: '#F59E0B', light: '#FFFBEB', dark: '#B45309' },
        error: { main: '#EF4444', light: '#FEF2F2' },
        info: { main: '#3B82F6', light: '#EFF6FF', dark: '#2563EB' },
        custom: { purple: '#8B5CF6', purpleLight: '#F5F3FF', teal: '#06B6D4' }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        subtitle2: { fontWeight: 700 },
        overline: { fontWeight: 700, letterSpacing: '0.5px' }
    },
    components: {
        MuiAccordion: {
            styleOverrides: {
                root: {
                    boxShadow: 'none', border: '1px solid #E5E7EB', borderRadius: '8px !important',
                    marginBottom: '8px', '&:before': { display: 'none' }, '&.Mui-expanded': { margin: '0 0 8px 0' }
                }
            }
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: { '&.Mui-expanded': { minHeight: 48, borderBottom: '1px solid #F3F4F6' } },
                content: { '&.Mui-expanded': { margin: '12px 0' } }
            }
        }
    }
});

// --- 2. MOCK DATA ---
const ERRORS = [
    {
        id: 1, title: 'Identifier Issue', count: 5, severity: 'HIGH', code: 'SOP-DQ-014', pending: 2, accepted: 1, corrected: 1, escalated: 1, total: 5,
        aiRecommendation: "Cast all AMOUNT fields to DECIMAL(18,2) before loading. Ensure source system exports numeric fields without currency symbols.",
        analysisSummary: "SOP-DQ-014 pattern matching detected currency prefixes ($, £, €) in 1,243 AMOUNT-family columns. All instances follow identical transformation: strip symbol → parse float → round to 2dp. No ambiguous cases found - transformation is fully deterministic.",
        confidence: 94, confidenceLabel: "Very High"
    },
    {
        id: 2, title: 'Missing Maturity Date', count: 4, severity: 'HIGH', code: 'SOP-DQ-007', pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4,
        aiRecommendation: "Impute missing maturity dates using standard 10-year generic bond offset from issuance date.",
        analysisSummary: "Dates are null in the source feed. Historical analysis shows 98% of these specific bond types default to a 10-year term.",
        confidence: 88, confidenceLabel: "High"
    },
    { id: 3, title: 'Incorrect Asset Class', count: 4, severity: 'MEDIUM', code: 'SOP-DQ-019', pending: 2, accepted: 1, corrected: 1, escalated: 0, total: 4 },
    { id: 4, title: 'Pricing Source Mismatch', count: 3, severity: 'HIGH', code: 'SOP-DQ-031', pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3 },
    { id: 5, title: 'Duplicate Security', count: 3, severity: 'MEDIUM', code: 'SOP-DQ-003', pending: 2, accepted: 1, corrected: 0, escalated: 0, total: 3 },
];

const MOCK_RECORDS = [
    {
        id: 'SM-001', name: 'Acme Corp 5.5% 2028', ticker: 'ACME', cusip: '00123456', isin: '—', country: 'US',
        aiFixes: [{ field: 'isin', value: 'US0012345678' }],
        confidence: '94%', severity: 'HIGH', status: 'pending', errorType: 'Missing ISIN',
        errorDescription: 'ISIN field is blank for this fixed income security. Downstream pricing and settlement systems require a valid ISIN.',
        aiAnalysis: 'CUSIP 00123456 is present and valid. Applying ISO 6166 derivation: prefix US + CUSIP + computed check digit = US0012345678.',
        aiSolution: 'Generated standard ISIN.'
    },
    {
        id: 'SM-002', name: 'Banque Paribas SA', ticker: 'BNP', cusip: '—', isin: '—', country: 'FR',
        aiFixes: [{ field: 'isin', value: 'FR0000131104' }, { field: 'cusip', value: '131104999' }],
        confidence: '87%', severity: 'HIGH', status: 'accepted', errorType: 'Missing Identifiers',
        errorDescription: 'Missing primary identifiers for European equity instrument.',
        aiAnalysis: 'Security name and ticker map directly to BNP Paribas on Euronext Paris. Retrieved standard ISIN from verified European master data.',
        aiSolution: 'Applied ISIN FR0000131104 and CUSIP 131104999.'
    },
    {
        id: 'SM-003', name: 'Tokyo Metro Bond', ticker: 'TKYB', cusip: 'N/A', isin: '—', country: 'JP',
        aiFixes: [{ field: 'isin', value: 'JP3633400099', originalValue: 'JP3633400991' }],
        confidence: '91%', severity: 'MEDIUM', status: 'corrected', errorType: 'Missing ISIN',
        errorDescription: 'Japanese municipal bond has no ISIN populated.',
        aiAnalysis: 'Non-US security - CUSIP not applicable. ISIN derivable from SEDOL + country prefix JP.',
        aiSolution: 'Applied ISIN JP3633400099.'
    },
    {
        id: 'SM-004', name: 'GreenEnergy ETF', ticker: 'GRNE', cusip: '345678AB', isin: '—', country: 'US',
        aiFixes: [{ field: 'isin', value: 'US3456780012' }],
        confidence: '96%', severity: 'MEDIUM', status: 'pending', errorType: 'ISIN not populated',
        errorDescription: 'ETF missing ISIN despite valid CUSIP present.',
        aiAnalysis: 'Standard ISIN generation rules apply for US ETFs.',
        aiSolution: 'Generated US3456780012 from base CUSIP.'
    },
    {
        id: 'SM-005', name: 'HDFC Bank Ltd ADR', ticker: 'HDB', cusip: '40415F101', isin: '—', country: 'IN',
        aiFixes: [{ field: 'country', value: 'US', originalValue: 'IN' }],
        confidence: '89%', severity: 'HIGH', status: 'escalated', errorType: 'Mismatching Wrapper',
        errorDescription: 'ADR mismatch. Underlying asset is IN domicile but wrapper is US.',
        aiAnalysis: 'Conflict between depository receipt ISIN and underlying equity ISIN.',
        aiSolution: 'Changed country domicile to US for ADR wrapper.'
    }
];

// --- 3. REUSABLE SUB-COMPONENTS ---
const StatusDot = ({ color, size = 10 }) => <Box sx={{ width: size, height: size, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />;

const SeverityChip = ({ severity }) => {
    const isHigh = severity === 'HIGH';
    return (
        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: 0.5, color: isHigh ? 'error.main' : 'warning.main', bgcolor: isHigh ? 'error.light' : 'warning.light', px: 1, py: 0.25, borderRadius: 1 }}>
            {severity}
        </Typography>
    );
};

const StatusChip = ({ status }) => {
    const config = {
        pending: { color: 'text.secondary', dot: '#9CA3AF', bg: '#F3F4F6' },
        accepted: { color: 'success.dark', dot: 'success.main', bg: 'success.light' },
        corrected: { color: 'warning.dark', dot: 'warning.main', bg: 'warning.light' },
        escalated: { color: 'custom.purple', dot: 'custom.purple', bg: 'custom.purpleLight' }
    };
    const c = config[status.toLowerCase()] || config.pending;
    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, bgcolor: c.bg, px: 1.25, py: 0.25, borderRadius: 4 }}>
            <StatusDot color={c.dot} size={6} />
            <Typography variant="caption" sx={{ color: c.color, fontWeight: 700, fontSize: '0.65rem', textTransform: 'lowercase' }}>{status}</Typography>
        </Box>
    );
};

const MetricStat = ({ icon, count, label, iconColor }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 85 }}>
        <Box sx={{ color: iconColor, display: 'flex', alignItems: 'center' }}>{icon}</Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{count}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
);

// --- 4. DETAILED TABLE COMPONENT (MRT) ---
function ReviewTableView({ category, onBack }) {
    const [filterTab, setFilterTab] = useState('All');
    const [rowSelection, setRowSelection] = useState({});

    useEffect(() => { setRowSelection({}); }, [filterTab]);

    const data = useMemo(() => {
        if (filterTab === 'All') return MOCK_RECORDS;
        return MOCK_RECORDS.filter(r => r.status.toLowerCase() === filterTab.toLowerCase());
    }, [filterTab]);

    const renderDynamicCell = ({ cell, column, row }) => {
        const fieldId = column.id;
        const fix = row.original.aiFixes?.find(f => f.field === fieldId);

        if (fix) {
            const isCorrected = row.original.status === 'corrected';
            const isAccepted = row.original.status === 'accepted';

            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {fix.originalValue && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', textDecoration: 'line-through', fontSize: '0.65rem', mb: 0.25 }}>
                            {fix.originalValue}
                        </Typography>
                    )}
                    <TextField
                        size="small"
                        defaultValue={fix.value}
                        InputProps={{
                            endAdornment: (!isCorrected && !isAccepted) ? (
                                <InputAdornment position="end">
                                    <AutoAwesome sx={{ fontSize: 14, color: 'info.dark' }} />
                                </InputAdornment>
                            ) : null,
                        }}
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                height: 28, fontSize: '0.75rem', fontFamily: 'monospace', color: 'text.primary',
                                bgcolor: isCorrected ? 'warning.light' : (isAccepted ? 'success.light' : 'info.light'),
                                borderRadius: 1.5,
                                '& fieldset': { borderColor: isCorrected ? 'warning.main' : (isAccepted ? 'success.main' : 'info.main'), borderWidth: 1 },
                                '&:hover fieldset': { borderColor: 'primary.main' },
                                '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                            }
                        }}
                    />
                </Box>
            );
        }
        return <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{cell.getValue()}</Typography>;
    };

    const columns = useMemo(() => [
        { accessorKey: 'id', header: 'RECORD ID', size: 90 },
        { accessorKey: 'name', header: 'SECURITY NAME', size: 160, Cell: ({ cell }) => <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600 }}>{cell.getValue()}</Typography> },
        { accessorKey: 'ticker', header: 'TICKER', size: 80, Cell: renderDynamicCell },
        { accessorKey: 'cusip', header: 'CUSIP', size: 120, Cell: renderDynamicCell },
        { accessorKey: 'isin', header: 'ISIN', size: 140, Cell: renderDynamicCell },
        { accessorKey: 'country', header: 'COUNTRY', size: 80, Cell: renderDynamicCell },
        { accessorKey: 'errorType', header: 'ERROR TYPE', size: 120 },
        {
            accessorKey: 'confidence',
            header: 'CONFIDENCE',
            size: 90,
            Header: () => (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.65rem' }}>CONFIDENCE</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', opacity: 0.7, mt: -0.5 }}>
                        <AutoAwesome sx={{ fontSize: 10 }} />
                        <Typography sx={{ fontSize: '0.55rem', fontWeight: 700 }}>AI</Typography>
                    </Box>
                </Box>
            ),
            Cell: ({ cell }) => <Typography variant="body2" color="primary.main" fontWeight={700} fontSize="0.8rem">{cell.getValue()}</Typography>
        },
        { accessorKey: 'severity', header: 'SEVERITY', size: 90, Cell: ({ cell }) => <SeverityChip severity={cell.getValue()} /> },
        { accessorKey: 'status', header: 'STATUS', size: 100, Cell: ({ cell }) => <StatusChip status={cell.getValue()} /> },
        {
            id: 'actions',
            header: 'ACTIONS',
            size: 150,
            Cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" startIcon={<Check sx={{ fontSize: 14 }} />}
                            sx={{
                                bgcolor: status === 'accepted' ? 'success.main' : 'success.light', color: status === 'accepted' ? 'white' : 'success.dark',
                                textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', px: 1, minWidth: 0, borderRadius: 1.5,
                                '&:hover': { bgcolor: status === 'accepted' ? 'success.dark' : '#A7F3D0' }
                            }}>Accept</Button>
                        <Button size="small" startIcon={<Edit sx={{ fontSize: 14 }} />}
                            sx={{
                                bgcolor: status === 'corrected' ? 'warning.main' : 'warning.light', color: status === 'corrected' ? 'white' : 'warning.dark',
                                textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', px: 1, minWidth: 0, borderRadius: 1.5,
                                '&:hover': { bgcolor: status === 'corrected' ? 'warning.dark' : '#FDE68A' }
                            }}>Edit</Button>
                        <IconButton size="small"
                            sx={{ bgcolor: status === 'escalated' ? 'custom.purple' : 'custom.purpleLight', color: status === 'escalated' ? 'white' : 'custom.purple', borderRadius: 1.5, p: 0.5, '&:hover': { bgcolor: status === 'escalated' ? '#7C3AED' : '#EDE9FE' } }}>
                            <ArrowUpward sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Box>
                );
            }
        },
    ], []);

    const table = useMaterialReactTable({
        columns,
        data,
        getRowId: (row) => row.id,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },

        enableExpanding: true,
        positionExpandColumn: 'first',
        enableColumnActions: true,
        enableColumnFilters: true,
        enableTopToolbar: true,
        enableHiding: true,
        enablePagination: true,
        enableBottomToolbar: true,
        enableColumnBorders: false,
        enableSorting: true,

        displayColumnDefOptions: {
            'mrt-row-select': {
                size: 40, grow: false,
                muiTableHeadCellProps: { align: 'center', sx: { p: '12px 0' } },
                muiTableBodyCellProps: { align: 'center', sx: { p: '12px 0' } }
            },
            'mrt-row-expand': {
                size: 40, grow: false,
                muiTableHeadCellProps: { align: 'center', sx: { p: '12px 0' } },
                muiTableBodyCellProps: { align: 'center', sx: { p: '12px 0' } }
            }
        },

        muiSelectCheckboxProps: { size: 'small', color: 'primary' },
        muiSelectAllCheckboxProps: { size: 'small', color: 'primary' },
        muiTablePaperProps: { elevation: 0, sx: { background: 'transparent', border: 'none' } },

        muiTopToolbarProps: {
            sx: {
                backgroundColor: 'transparent', borderBottom: '1px solid #E5E7EB', boxShadow: 'none',
                minHeight: '40px', px: 0, '& .MuiToolbar-root': { p: 0, minHeight: '40px' }
            }
        },
        muiBottomToolbarProps: { sx: { borderTop: '1px solid #E5E7EB', boxShadow: 'none' } },
        muiTableProps: { sx: { tableLayout: 'fixed' } },

        muiTableHeadCellProps: {
            sx: {
                fontSize: '0.65rem', color: 'text.disabled', fontWeight: 800, bgcolor: 'transparent',
                textTransform: 'uppercase', borderBottom: '2px solid #E5E7EB', padding: '12px 8px', verticalAlign: 'bottom',
                '& .Mui-TableHeadCell-Content': { justifyContent: 'flex-start' }
            }
        },

        muiTableHeadCellFilterTextFieldProps: {
            size: 'small', variant: 'outlined',
            sx: { mt: 1, '& .MuiOutlinedInput-root': { height: '26px', fontSize: '0.75rem', backgroundColor: '#F9FAFB' } }
        },

        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                '&:hover td': { bgcolor: '#F9FAFB' },
                ...(row.getIsExpanded() && { '& td': { borderBottom: 'none' } }),
                ...(row.getIsSelected() && { '& td': { bgcolor: '#EFF6FF' } })
            },
        }),

        muiTableBodyCellProps: { sx: { borderBottom: '1px solid #F3F4F6', padding: '12px 8px', color: 'text.secondary', fontSize: '0.75rem', verticalAlign: 'middle' } },

        // --- 3 COLUMN EXPANDED DETAIL PANEL ---
        renderDetailPanel: ({ row }) => (
            <Box sx={{ display: 'flex', gap: 4, p: 3, mx: 2, mb: 2, mt: -1, bgcolor: '#FAFAFA', borderRadius: 2, borderTop: '2px solid #E5E7EB', border: '1px solid #F3F4F6' }}>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ bgcolor: 'error.main', color: 'white', width: 16, height: 16, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900 }}>!</Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main', letterSpacing: 0.5 }}>ERROR DESCRIPTION</Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>{row.original.errorDescription}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ bgcolor: 'primary.main', color: 'white', width: 16, height: 16, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 900 }}>AI</Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>AI ANALYSIS</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>{row.original.aiAnalysis}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Box sx={{ bgcolor: 'success.main', color: 'white', width: 16, height: 16, borderRadius: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>✓</Box>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', letterSpacing: 0.5 }}>AI SOLUTION</Typography>
                        <Chip label="EDITABLE" size="small" sx={{ height: 18, fontSize: '0.6rem', color: 'info.main', bgcolor: 'info.light', fontWeight: 800, borderRadius: 1 }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8rem' }}>{row.original.aiSolution}</Typography>
                </Box>
            </Box>
        )
    });

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, bgcolor: 'white', borderRadius: 3, border: '1px solid #E5E7EB', p: 4, animation: 'fadeUp 0.2s ease' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">Security Master Errors</Typography>
                    <KeyboardArrowRight sx={{ color: 'text.disabled', fontSize: 20 }} />
                    <Typography variant="h6" fontWeight={800} color="primary.main">{category?.title || 'Category'}</Typography>
                </Box>
                <Button
                    startIcon={<KeyboardBackspace fontSize="small" />} onClick={onBack} variant="outlined" size="small"
                    sx={{ color: 'text.secondary', borderColor: '#E5E7EB', textTransform: 'none', fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: '#F9FAFB' } }}
                >
                    Back to Categories
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, bgcolor: 'background.default', p: 0.5, borderRadius: 5 }}>
                        {['All', 'Pending', 'Accepted', 'Corrected', 'Escalated'].map(tab => (
                            <Chip
                                key={tab} label={tab} onClick={() => setFilterTab(tab)}
                                sx={{
                                    bgcolor: filterTab === tab ? 'primary.main' : 'transparent', color: filterTab === tab ? 'white' : 'text.secondary',
                                    fontWeight: 600, fontSize: '0.75rem', borderRadius: 4, cursor: 'pointer', height: 26, border: 'none',
                                    '&:hover': { bgcolor: filterTab === tab ? 'primary.main' : '#E5E7EB' }
                                }}
                            />
                        ))}
                    </Box>

                    {selectedCount > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, ml: 2, alignItems: 'center', animation: 'fadeUp 0.2s ease' }}>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mr: 0.5 }}>{selectedCount} selected</Typography>
                            <Button size="small" variant="contained" disableElevation
                                sx={{ bgcolor: 'success.main', color: 'white', textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5, '&:hover': { bgcolor: 'success.dark' } }}
                                startIcon={<Check fontSize="small" />}>
                                Accept
                            </Button>
                            <Button size="small" variant="contained" disableElevation
                                sx={{ bgcolor: 'warning.main', color: 'white', textTransform: 'none', fontWeight: 700, fontSize: '0.7rem', borderRadius: 1.5, '&:hover': { bgcolor: 'warning.dark' } }}
                                startIcon={<Edit fontSize="small" />}>
                                Correct
                            </Button>
                        </Box>
                    )}
                </Box>
                <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    {data.length} of {MOCK_RECORDS.length} records
                </Typography>
            </Box>

            <Box sx={{ flex: 1, overflowX: 'auto', mt: 1 }}>
                <MaterialReactTable table={table} />
            </Box>
        </Box>
    );
}

// --- 5. MAIN DASHBOARD COMPONENT ---
export default function DashboardApp() {
    // activeCategory controls which view is shown. null = Dashboard View (Accordion list). Object = Table View.
    const [activeCategory, setActiveCategory] = useState(null);
    const [expandedAccordionId, setExpandedAccordionId] = useState(1); // Controls which dashboard accordion is open

    const Sidebar = () => (
        <Box sx={{ width: 260, bgcolor: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #3B82F6' }} /> RCA Intelligence
                </Typography>
                <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ ml: 3 }}>AI Root Cause Analysis</Typography>
            </Box>

            <Box sx={{ px: 2, flex: 1, overflow: 'auto' }}>
                <Typography variant="overline" color="text.disabled" sx={{ px: 2, fontSize: '0.65rem' }}>ERROR CATEGORIES</Typography>
                <List disablePadding sx={{ mt: 1 }}>
                    <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <ListItemButton sx={{ borderRadius: 1 }}>
                            <StatusDot color="error.main" size={8} />
                            <ListItemText primary="SECURITY MASTER ERRORS" primaryTypographyProps={{ variant: 'caption', fontWeight: 800, ml: 1, color: 'text.primary' }} />
                            <KeyboardArrowDown fontSize="small" color="action" />
                        </ListItemButton>
                        <Collapse in={true} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {ERRORS.map((item) => {
                                    const isActive = activeCategory && activeCategory.title === item.title;
                                    return (
                                        <ListItemButton
                                            key={item.title}
                                            onClick={() => setActiveCategory(item)}
                                            sx={{ pl: 4, py: 0.5, borderRadius: 1, bgcolor: isActive ? 'primary.light' : 'transparent' }}
                                        >
                                            <ListItemText primary={item.title} primaryTypographyProps={{ variant: 'caption', color: isActive ? 'primary.main' : 'text.secondary', fontWeight: isActive ? 700 : 500 }} />
                                            <Box sx={{ bgcolor: isActive ? 'primary.main' : '#F3F4F6', px: 1, py: 0.25, borderRadius: 4 }}>
                                                <Typography variant="caption" color={isActive ? 'white' : 'text.disabled'} fontSize="0.65rem" fontWeight={700}>{item.count}</Typography>
                                            </Box>
                                        </ListItemButton>
                                    );
                                })}
                            </List>
                        </Collapse>
                    </ListItem>
                </List>
            </Box>
        </Box>
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
                <Sidebar />
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    <Box sx={{ p: 4, px: 6, pb: 0 }}>
                        {/* Top KPIs */}
                        <Paper sx={{ display: 'flex', borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 3 }}>
                            {[
                                { title: 'PENDING REVIEW', count: 19, subtext: 'awaiting decision', color: 'text.disabled' },
                                { title: 'ACCEPTED', count: 10, subtext: 'AI suggestion applied', color: 'success.main' },
                                { title: 'CORRECTED', count: 6, subtext: 'reviewer value applied', color: 'warning.main' },
                                { title: 'ESCALATED', count: 1, subtext: 'flagged for specialist', color: 'custom.purple' },
                            ].map((kpi, i) => (
                                <React.Fragment key={kpi.title}>
                                    <Box sx={{ flex: 1, p: 2.5 }}>
                                        <Typography variant="caption" fontWeight={700} color={kpi.color} letterSpacing={0.5} display="block" mb={0.5}>{kpi.title}</Typography>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: kpi.title === 'PENDING REVIEW' ? 'text.primary' : kpi.color, lineHeight: 1 }}>{kpi.count}</Typography>
                                        <Typography variant="caption" color="text.disabled" fontWeight={500}>{kpi.subtext}</Typography>
                                    </Box>
                                    {i < 3 && <Divider orientation="vertical" flexItem />}
                                </React.Fragment>
                            ))}
                        </Paper>

                        {/* Progress Bar */}
                        <Paper sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', boxShadow: 'none', mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="text.primary">Review Progress</Typography>
                                <Typography variant="subtitle2" color="text.primary">47% complete</Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: 12, bgcolor: '#E5E7EB', borderRadius: 6, display: 'flex', overflow: 'hidden' }}>
                                <Box sx={{ width: '28%', bgcolor: 'success.main' }} />
                                <Box sx={{ width: '17%', bgcolor: 'warning.main' }} />
                                <Box sx={{ width: '2%', bgcolor: 'custom.purple' }} />
                            </Box>
                        </Paper>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: 'auto', px: 6, pb: 6 }}>
                        {activeCategory ? (

                            /* VIEW 1: DETAILED TABLE (Shown when a category is clicked) */
                            <ReviewTableView category={activeCategory} onBack={() => setActiveCategory(null)} />

                        ) : (

                            /* VIEW 2: ACCORDION DASHBOARD (Shown by default) */
                            <Box sx={{ animation: 'fadeUp 0.2s ease' }}>
                                <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ mb: 2, display: 'block', letterSpacing: 0.5 }}>
                                    ERROR CATEGORIES — AI ROOT CAUSE ANALYSIS
                                </Typography>
                                {ERRORS.map((error) => {
                                    const isExpanded = expandedAccordionId === error.id;
                                    return (
                                        <Accordion key={error.id} disableGutters expanded={isExpanded} onChange={() => setExpandedAccordionId(isExpanded ? null : error.id)}>
                                            <AccordionSummary expandIcon={<KeyboardArrowDown />} sx={{ px: 3, py: 0.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', width: 220, gap: 1.5 }}>
                                                        <StatusDot color={error.id > 6 ? 'warning.main' : 'error.main'} size={8} />
                                                        <Typography variant="body2" fontWeight={800} color="text.primary">{error.title}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                        <SeverityChip severity={error.severity || 'HIGH'} />
                                                        <Chip label={error.code || 'SOP-DQ'} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, borderRadius: 1, bgcolor: 'info.light', color: 'info.main' }} />
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
                                                        <MetricStat icon={<RadioButtonUnchecked sx={{ fontSize: 10 }} />} count={error.pending || 0} label="pending" iconColor="text.disabled" />
                                                        <MetricStat icon={<Check sx={{ fontSize: 14 }} />} count={error.accepted || 0} label="accepted" iconColor="success.main" />
                                                        <MetricStat icon={<CallMade sx={{ fontSize: 14 }} />} count={error.corrected || 0} label="corrected" iconColor="warning.main" />
                                                        <MetricStat icon={<ArrowUpward sx={{ fontSize: 14 }} />} count={error.escalated || 0} label="escalated" iconColor="custom.purple" />
                                                        <Typography variant="caption" color="text.disabled" sx={{ ml: 1, width: 50 }}>/ {error.total || error.count} total</Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ px: 3, pb: 2, pt: 1, bgcolor: '#FAFAFA', borderTop: '1px solid #F3F4F6', borderRadius: '0 0 8px 8px' }}>

                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 3, mt: 1 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', letterSpacing: 0.5, mr: 1 }}>BULK ACTION</Typography>
                                                    <Button size="small" variant="contained" disableElevation sx={{ bgcolor: 'success.main', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>Accept All ({error.pending || 0})</Button>
                                                    <Button size="small" variant="contained" disableElevation sx={{ bgcolor: 'warning.main', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>Correct All ({error.pending || 0})</Button>
                                                    <Button size="small" variant="contained" disableElevation sx={{ bgcolor: 'custom.purple', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5 }}>Escalate All ({error.pending || 0})</Button>
                                                </Box>

                                                <Box sx={{ mb: 1 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}><AutoAwesome fontSize="small" /> AI RECOMMENDATION</Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', border: '2px solid', borderColor: 'success.main', color: 'success.main', fontSize: '0.65rem', fontWeight: 800 }}>{error.confidence || 90}%</Box>
                                                            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800 }}>{error.confidenceLabel || 'High'}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, mb: 2 }}>{error.aiRecommendation || 'No general recommendation available.'}</Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>ANALYSIS SUMMARY</Typography>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>{error.analysisSummary || 'Requires manual review.'}</Typography>
                                                </Box>

                                                <Divider sx={{ mb: 2 }} />

                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', mr: 1 }}>AI ANALYSIS FEEDBACK</Typography>
                                                        <IconButton size="small" sx={{ bgcolor: 'warning.light', color: 'warning.main', borderRadius: 1.5, p: 0.5 }}><ThumbUpAltOutlined fontSize="small" /></IconButton>
                                                        <IconButton size="small" sx={{ bgcolor: 'warning.light', color: 'warning.main', borderRadius: 1.5, p: 0.5 }}><ThumbDownAltOutlined fontSize="small" /></IconButton>
                                                    </Box>
                                                    <Button onClick={() => setActiveCategory(error)} size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: '#E5E7EB', bgcolor: 'white', textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5, px: 2 }}>
                                                        Review Rows →
                                                    </Button>
                                                </Box>

                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
