import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    ThemeProvider, createTheme, CssBaseline, Box, Typography, Button,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, TextField, Checkbox, IconButton, Chip, Paper, Grid, Tooltip, InputAdornment
} from '@mui/material';
import {
    KeyboardArrowDown, KeyboardArrowRight, ZoomIn, ZoomOut,
    ChevronLeft, ChevronRight, CheckCircle, Assessment, Description,
    TrackChanges, Business, InfoOutlined, Edit, Search, Folder
} from '@mui/icons-material';
import { Document, Page, pdfjs } from 'react-pdf';

// 1. Initialize PDF.js Web Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// 2. Accelex Exact Theme
const theme = createTheme({
    palette: {
        primary: { main: '#6C3AED', light: '#EDE9FE', dark: '#1E0A3C' },
        success: { main: '#059669', light: '#ECFDF5' },
        warning: { main: '#D97706', light: '#FFFBEB' },
        info: { main: '#2563EB', light: '#EFF6FF' },
        error: { main: '#DC2626', light: '#FEF2F2' },
        background: { default: '#F8F9FB', paper: '#FFFFFF' },
        text: { primary: '#111827', secondary: '#374151', disabled: '#9CA3AF' }
    },
    typography: {
        fontFamily: '"IBM Plex Sans", "Helvetica Neue", sans-serif',
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: '1px solid #E5E7EB', padding: '8px 16px', height: '44px' },
                head: { fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.5px', color: '#6B7280', backgroundColor: '#F9FAFB' }
            }
        },
        MuiTab: { styleOverrides: { root: { fontWeight: 700, minHeight: 48, fontSize: '0.75rem' } } }
    }
});

// 3. Mock Data
const FUNDS = [
    { id: "f1", name: "Wayne Enterprises Capital Partners VII", short: "WECP VII", manager: "Wayne Capital Management", vintage: "2020", strategy: "Buyout", size: "$2.4B", status: "Active", reportDate: "Q2 2020", assetsCount: 7, nav: "$3.1B", irr: "18.4%", tvpi: "1.62x", dpi: "1.42x", committed: "$2.1B", called: "$1.9B", distributed: "$0.9B", fee: "1.75%", carry: "20%", gp: "Wayne Capital Mgmt LLC", jurisdiction: "Delaware, USA", inceptionDate: "Jan 2020", nextClose: "Dec 2025" },
    { id: "f2", name: "Apollo Growth Fund IV", short: "AGF IV", manager: "Apollo Capital", vintage: "2019", strategy: "Growth Equity", size: "$1.8B", status: "Active", reportDate: "Q3 2024", assetsCount: 4, nav: "$2.4B", irr: "21.2%", tvpi: "1.88x", dpi: "0.88x", committed: "$1.6B", called: "$1.4B", distributed: "$0.5B", fee: "2.0%", carry: "20%", gp: "Apollo Capital Partners", jurisdiction: "Cayman Islands", inceptionDate: "Mar 2019", nextClose: "Jun 2025" },
    { id: "f3", name: "KKR Infrastructure III", short: "KKR Infra", manager: "KKR & Co.", vintage: "2018", strategy: "Infrastructure", size: "$3.2B", status: "Harvesting", reportDate: "Q4 2023", assetsCount: 3, nav: "$4.0B", irr: "21.1%", tvpi: "1.95x", dpi: "1.71x", committed: "$3.0B", called: "$2.8B", distributed: "$1.8B", fee: "1.5%", carry: "20%", gp: "KKR Infrastructure LLC", jurisdiction: "Delaware, USA", inceptionDate: "Sep 2018", nextClose: "—" },
    { id: "f4", name: "Blackstone Real Assets II", short: "BRA II", manager: "Blackstone Group", vintage: "2021", strategy: "Real Assets", size: "$5.1B", status: "Deploying", reportDate: "Q1 2024", assetsCount: 5, nav: "$5.3B", irr: "12.8%", tvpi: "1.24x", dpi: "0.21x", committed: "$4.8B", called: "$2.9B", distributed: "$0.4B", fee: "1.75%", carry: "20%", gp: "Blackstone Real Assets Mgmt", jurisdiction: "Delaware, USA", inceptionDate: "Jun 2021", nextClose: "Mar 2025" }
];

const ASSET_DATA = {
    "Local Standing & Move": { tags: { sector: "Finance", country: "USA", status: "Realized" }, inv: { entry: "2012/12/31", invested: "77,500,000", dist: "236,400,000", fmv: "0", moic: "3.1", irr: "51.5%" }, metrics: { "Entry date": "2012/12/31", "Total capital invested": "77,500,000", "Total distributions": "236,400,000", "Residual value (FMV)": "0", "Total value": "236,400,000", "Multiple on invested capital (MOIC)": "3.1", "Asset IRR": "51.5%" } },
    "Great Sea Smoothing": { tags: { sector: "Consumer", country: "UK", status: "Realized" }, inv: { entry: "2014/05/31", invested: "62,200,000", dist: "171,900,000", fmv: "2,300,000", moic: "2.8", irr: "48.6%" }, metrics: { "Entry date": "2014/05/31", "Total capital invested": "62,200,000", "Total distributions": "171,900,000", "Multiple on invested capital (MOIC)": "2.8" } },
    "Watchmen International": { tags: { sector: "Security", country: "USA", status: "Realized" }, inv: { entry: "2014/10/31", invested: "85,100,000", dist: "259,400,000", fmv: "0", moic: "3.0", irr: "78.5%" }, metrics: { "Entry date": "2014/10/31", "Total capital invested": "85,100,000", "Total distributions": "259,400,000", "Multiple on invested capital (MOIC)": "3.0" } }
};

const METRICS = ["Entry date", "Total capital invested", "Total distributions", "Residual value (FMV)", "Total value", "Multiple on invested capital (MOIC)", "Asset IRR"];
const assetsList = Object.keys(ASSET_DATA);
const allMetricIds = assetsList.flatMap(asset => METRICS.map(metric => `${asset}__${metric}`));

// --- HOOKS ---
function useResizable(initial = 50, min = 30, max = 70) {
    const [pct, setPct] = useState(initial);
    const dragging = useRef(false);
    const containerRef = useRef(null);

    const onMouseDown = useCallback((e) => {
        e.preventDefault(); dragging.current = true; document.body.style.cursor = "col-resize";
    }, []);

    useEffect(() => {
        const mv = e => {
            if (!dragging.current || !containerRef.current) return;
            const r = containerRef.current.getBoundingClientRect();
            setPct(Math.min(max, Math.max(min, ((e.clientX - r.left) / r.width) * 100)));
        };
        const up = () => { dragging.current = false; document.body.style.cursor = ""; };
        window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
        return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    }, [min, max]);

    return { pct, containerRef, onMouseDown };
}

// ==========================================
// COMPONENT 1: FUND LIST SCREEN
// ==========================================
function FundListScreen({ onSelectFund }) {
    const [search, setSearch] = useState("");

    const filteredFunds = FUNDS.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.strategy.toLowerCase().includes(search.toLowerCase()) ||
        f.manager.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#F8F9FB' }}>
            {/* Top Navbar */}
            <Box sx={{ bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', px: 3, height: 52 }}>
                <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, mr: 1 }}>A</Box>
                <Typography color="white" fontWeight={700} sx={{ mr: 4 }}>accelex</Typography>
                <Button sx={{ color: 'white', opacity: 0.5, px: 2 }}>DASHBOARD</Button>
                <Button sx={{ color: 'primary.light', borderBottom: '2px solid', borderColor: 'primary.light', px: 2, borderRadius: 0 }}>DOCUMENTS</Button>
            </Box>

            {/* Page Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', p: 4 }}>
                <Grid container spacing={4} alignItems="flex-end">
                    <Grid item xs={12} md={6}>
                        <Typography variant="overline" color="primary" fontWeight={700} letterSpacing={1}>VALIDATE METRICS · STEP 2 OF 2</Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 1 }}>Fund Portfolio</Typography>
                        <Typography variant="body2" color="text.secondary">Select a fund to open its validation workspace and review extracted metrics against the quarterly report.</Typography>
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {[{ l: "Total Funds", v: "4", s: "under management" }, { l: "Active / Deploying", v: "3", s: "currently active" }, { l: "Total NAV", v: "$14.8B", s: "aggregate value" }].map(stat => (
                            <Paper key={stat.l} variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3, minWidth: 140, bgcolor: '#F9FAFB' }}>
                                <Typography variant="caption" fontWeight={700} color="text.disabled">{stat.l}</Typography>
                                <Typography variant="h5" fontWeight={800} color="primary.main" fontFamily="monospace" sx={{ my: 0.5 }}>{stat.v}</Typography>
                                <Typography variant="caption" color="text.secondary">{stat.s}</Typography>
                            </Paper>
                        ))}
                    </Grid>
                </Grid>

                <TextField
                    size="small"
                    placeholder="Search by fund name, strategy or manager..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                    sx={{ mt: 3, width: 400, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
            </Box>

            {/* Funds Table */}
            <Box sx={{ flex: 1, p: 4, overflow: 'auto' }}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>FUND NAME</TableCell>
                                <TableCell>STRATEGY</TableCell>
                                <TableCell>VINTAGE</TableCell>
                                <TableCell>SIZE</TableCell>
                                <TableCell>NAV</TableCell>
                                <TableCell>NET IRR</TableCell>
                                <TableCell>TVPI</TableCell>
                                <TableCell>DPI</TableCell>
                                <TableCell>ASSETS</TableCell>
                                <TableCell>STATUS</TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredFunds.map((fund) => (
                                <TableRow key={fund.id} hover sx={{ cursor: 'pointer', '&:hover .open-btn': { bgcolor: 'primary.main', color: 'white' } }} onClick={() => onSelectFund(fund)}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Folder fontSize="small" /></Box>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color="text.primary">{fund.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{fund.manager}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="small" label={fund.strategy} sx={{ bgcolor: fund.strategy === 'Buyout' ? 'primary.light' : (fund.strategy === 'Growth Equity' ? 'success.light' : 'warning.light'), color: fund.strategy === 'Buyout' ? 'primary.main' : (fund.strategy === 'Growth Equity' ? 'success.main' : 'warning.main'), fontWeight: 600, borderRadius: 1 }} />
                                    </TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={600}>{fund.vintage}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={700}>{fund.size}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={700}>{fund.nav}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" color="success.main" fontWeight={700}>{fund.irr}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" color={parseFloat(fund.tvpi) >= 1.5 ? 'success.main' : 'warning.main'} fontWeight={700}>{fund.tvpi}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" color={parseFloat(fund.dpi) >= 1.0 ? 'success.main' : 'warning.main'} fontWeight={700}>{fund.dpi}</Typography></TableCell>
                                    <TableCell><Typography variant="body2" fontFamily="monospace" fontWeight={700}>{fund.assetsCount} <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>cos</span></Typography></TableCell>
                                    <TableCell>
                                        <Chip size="small" label={`● ${fund.status}`} sx={{ bgcolor: fund.status === 'Active' ? 'success.light' : (fund.status === 'Harvesting' ? 'warning.light' : 'info.light'), color: fund.status === 'Active' ? 'success.main' : (fund.status === 'Harvesting' ? 'warning.main' : 'info.main'), fontWeight: 600, borderRadius: 1 }} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button className="open-btn" variant="contained" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', boxShadow: 'none', transition: 'all 0.2s' }}>Open →</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

// ==========================================
// COMPONENT 2: FUND DASHBOARD TAB
// ==========================================
function FundDashboardTab({ fund }) {
    const kpiGroups = [
        { title: "PERFORMANCE METRICS", color: "primary", icon: "📈", data: [{ l: "NET IRR", v: fund.irr, h: "Annualised net internal rate of return" }, { l: "TVPI", v: fund.tvpi, h: "Total value to paid-in capital" }, { l: "DPI", v: fund.dpi, h: "Distributions to paid-in capital" }, { l: "NAV", v: fund.nav, h: "Net asset value as of last report" }] },
        { title: "CAPITAL ACCOUNT", color: "success", icon: "💰", data: [{ l: "FUND SIZE", v: fund.size, h: "Total committed capital" }, { l: "COMMITTED", v: fund.committed, h: "Capital formally committed by LPs" }, { l: "CALLED", v: fund.called, h: "Capital drawn down to date" }, { l: "DISTRIBUTED", v: fund.distributed, h: "Capital returned to LPs to date" }] },
        { title: "FUND STRUCTURE", color: "info", icon: "🏛️", data: [{ l: "VINTAGE", v: fund.vintage, h: "Year fund was established" }, { l: "STRATEGY", v: fund.strategy, h: "Primary investment strategy" }, { l: "MGMT FEE", v: fund.fee, h: "Annual management fee rate" }, { l: "CARRY", v: fund.carry, h: "Performance fee (carry) rate" }] },
        { title: "LEGAL & ADMIN", color: "warning", icon: "⚖️", data: [{ l: "GP ENTITY", v: fund.gp, h: "General partner legal entity" }, { l: "JURISDICTION", v: fund.jurisdiction, h: "Fund domicile and legal jurisdiction" }, { l: "INCEPTION", v: fund.inceptionDate, h: "Fund inception / first close date" }, { l: "NEXT CLOSE", v: fund.nextClose, h: "Upcoming LP close date (if any)" }] }
    ];

    return (
        <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#F8F9FB' }}>
            <Box sx={{ bgcolor: 'primary.dark', p: 3, color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ width: 48, height: 48, bgcolor: 'primary.main', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800 }}>W</Box>
                        <Box>
                            <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                                <Chip size="small" label={fund.strategy} sx={{ bgcolor: 'rgba(108, 58, 237, 0.4)', color: 'white', height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                                <Chip size="small" label={`● ${fund.status}`} sx={{ bgcolor: 'rgba(5, 150, 105, 0.3)', color: '#6EE7B7', height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                            </Box>
                            <Typography variant="h5" fontWeight={700}>{fund.name}</Typography>
                            <Typography variant="caption" color="rgba(255,255,255,0.7)">{fund.manager} - {fund.reportDate} - {fund.assetsCount} portfolio companies</Typography>
                        </Box>
                    </Box>
                    <Button variant="contained" sx={{ bgcolor: 'primary.main', '&:hover': { bgcolor: '#5B21B6' } }}>💾 Save Changes</Button>
                </Box>
            </Box>

            <Box sx={{ bgcolor: 'warning.light', borderBottom: '1px solid #FDE68A', p: 1.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="warning.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Edit fontSize="small" /> All fields below are <b>editable</b> — click any value to update it.</Typography>
                <Typography variant="caption" color="warning.main" fontWeight={700}>🏦 FUND-LEVEL DASHBOARD</Typography>
            </Box>

            <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {kpiGroups.map((group, i) => (
                        <Grid item xs={12} md={6} key={i}>
                            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', borderColor: '#E5E7EB' }}>
                                <Box sx={{ p: 1.5, px: 2, bgcolor: `${group.color}.light`, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography fontSize="1.1rem">{group.icon}</Typography>
                                    <Typography variant="caption" fontWeight={800} color={`${group.color}.main`}>{group.title}</Typography>
                                </Box>
                                <Grid container>
                                    {group.data.map((item, j) => (
                                        <Grid item xs={6} key={j} sx={{ p: 2.5, borderRight: j % 2 === 0 ? '1px solid #E5E7EB' : 'none', borderBottom: j < 2 ? '1px solid #E5E7EB' : 'none' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                                                <Typography variant="caption" color="text.disabled" fontWeight={700}>{item.l}</Typography>
                                                <Tooltip title={item.h} placement="top"><InfoOutlined sx={{ fontSize: 14, color: 'text.disabled', cursor: 'pointer' }} /></Tooltip>
                                            </Box>
                                            <TextField fullWidth variant="standard" defaultValue={item.v || ''} InputProps={{ disableUnderline: true, sx: { fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: `${group.color}.main` } }} />
                                            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>{item.h}</Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

                <Paper variant="outlined" sx={{ borderRadius: 3, mt: 4, overflow: 'hidden' }}>
                    <Box sx={{ p: 1.5, px: 2, bgcolor: 'primary.light', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontSize="1.1rem">📊</Typography>
                            <Typography variant="caption" fontWeight={800} color="primary.main">PORTFOLIO COMPANIES</Typography>
                            <Chip size="small" label={`${fund.assetsCount} assets`} sx={{ bgcolor: 'primary.main', color: 'white', height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                        </Box>
                        <Typography variant="caption" color="text.disabled">Data from ASSET INVESTMENT tab</Typography>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>PORTFOLIO COMPANY</TableCell>
                                    <TableCell>ENTRY</TableCell>
                                    <TableCell>INVESTED</TableCell>
                                    <TableCell>DISTRIBUTIONS</TableCell>
                                    <TableCell>FMV</TableCell>
                                    <TableCell>MOIC</TableCell>
                                    <TableCell>IRR</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assetsList.map((asset) => {
                                    const data = ASSET_DATA[asset];
                                    return (
                                        <TableRow key={asset} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                    <Box sx={{ width: 28, height: 28, bgcolor: '#F3F4F6', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏦</Box>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={700}>{asset}</Typography>
                                                        <Typography variant="caption" color="success.main" fontWeight={600}>{data.tags.status}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.entry}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.invested}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.dist}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.fmv || '—'}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.moic}</Typography></TableCell>
                                            <TableCell><Typography variant="body2" fontFamily="monospace">{data.inv.irr || '—'}</Typography></TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow sx={{ bgcolor: 'primary.dark' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, borderBottom: 'none' }}>FUND TOTALS</TableCell>
                                    <TableCell sx={{ borderBottom: 'none' }}></TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', borderBottom: 'none' }}>$1,158.7M</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', borderBottom: 'none' }}>$1,628.6M</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', borderBottom: 'none' }}>$596.6M</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', borderBottom: 'none' }}>1.9x</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 700, fontFamily: 'monospace', borderBottom: 'none' }}>26.1%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Box>
    );
}

// ==========================================
// COMPONENT 3: WORKSPACE SPLIT-PANE UI
// ==========================================
function WorkspaceScreen({ fund, onBack }) {
    const [tabValue, setTabValue] = useState(0);
    const [viewMode, setViewMode] = useState('group');
    const [expandedRows, setExpandedRows] = useState({ "Local Standing & Move": true, "Great Sea Smoothing": true });

    const [selected, setSelected] = useState([]);
    const [activeCell, setActiveCell] = useState(null);

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(4);
    const { pct, containerRef, onMouseDown } = useResizable(45);

    const handleSelectAllClick = (event) => {
        if (event.target.checked) setSelected(allMetricIds);
        else setSelected([]);
    };

    const handleGroupCheckboxClick = (asset, event) => {
        event.stopPropagation();
        const assetMetricIds = METRICS.map(metric => `${asset}__${metric}`);
        const allSelected = assetMetricIds.every(id => selected.includes(id));

        if (allSelected) setSelected(prev => prev.filter(id => !assetMetricIds.includes(id)));
        else setSelected(prev => [...new Set([...prev, ...assetMetricIds])]);
    };

    const handleRowCheckboxClick = (id, event) => {
        event.stopPropagation();
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleMetricClick = (asset, metric, isFound) => {
        if (isFound) setActiveCell({ asset, metric, highlightRect: { top: 48, left: 81, width: 6, height: 2.5 } });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

            {/* Workspace Navbar */}
            <Box sx={{ bgcolor: 'primary.dark', display: 'flex', alignItems: 'center', px: 3, height: 52 }}>
                <Box sx={{ width: 28, height: 28, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, mr: 1 }}>A</Box>
                <Typography color="white" fontWeight={700} sx={{ mr: 4 }}>accelex</Typography>
                <Box sx={{ flex: 1 }} />
                {/* Added Back Button */}
                <Button size="small" variant="outlined" onClick={onBack} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white' } }}>← All Funds</Button>
            </Box>

            {/* Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 3, height: 48, borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
                <CheckCircle color="success" sx={{ fontSize: 18, mr: 1 }} />
                <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ mr: 2 }}>CONFIRM NETWORK</Typography>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, mr: 1 }}>2</Box>
                <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mr: 2 }}>VALIDATE METRICS</Typography>
                <Typography variant="caption" color="text.disabled">{fund.name} › {fund.short} - {fund.reportDate} Fund Report.pdf</Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white', px: 2 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="ASSET INVESTMENT" icon={<Assessment fontSize="small" />} iconPosition="start" />
                    <Tab label="ASSET PERFORMANCE" icon={<TrackChanges fontSize="small" />} iconPosition="start" />
                    <Tab label="FUND" icon={<Business fontSize="small" />} iconPosition="start" />
                    <Tab label="STATIC" icon={<Description fontSize="small" />} iconPosition="start" />
                </Tabs>
            </Box>

            {/* Dynamic Routing (Fund Dashboard vs Split Pane) */}
            {tabValue === 2 ? (
                <FundDashboardTab fund={fund} />
            ) : (
                <Box ref={containerRef} sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                    {/* LEFT PANE */}
                    <Box sx={{ width: `${pct}%`, display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
                        <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB', bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={`All ${allMetricIds.length}`} size="small" sx={{ bgcolor: 'transparent', border: '1px solid #6C3AED', color: 'primary.main', fontWeight: 600, borderRadius: 5 }} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', bgcolor: '#F3F4F6', borderRadius: 1, p: 0.5 }}>
                                    <Button size="small" sx={{ minWidth: 60, bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent', color: viewMode === 'list' ? 'white' : 'text.secondary', borderRadius: 1 }} onClick={() => setViewMode('list')}>List</Button>
                                    <Button size="small" sx={{ minWidth: 60, bgcolor: viewMode === 'group' ? 'primary.main' : 'transparent', color: viewMode === 'group' ? 'white' : 'text.secondary', borderRadius: 1 }} onClick={() => setViewMode('group')}>Group</Button>
                                </Box>
                                <Button variant="contained" size="small" sx={{ boxShadow: 'none' }}>+ Add manually</Button>
                            </Box>
                        </Box>

                        <TableContainer sx={{ flex: 1 }}>
                            <Table size="small" stickyHeader sx={{ tableLayout: 'fixed', minWidth: 600 }}>
                                <colgroup>
                                    <col style={{ width: '48px' }} />
                                    {viewMode === 'list' && <col style={{ width: '30%' }} />}
                                    <col style={{ width: viewMode === 'list' ? '30%' : '45%' }} />
                                    <col style={{ width: 'auto' }} />
                                    <col style={{ width: '50px' }} />
                                </colgroup>

                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox size="small" indeterminate={selected.length > 0 && selected.length < allMetricIds.length} checked={allMetricIds.length > 0 && selected.length === allMetricIds.length} onChange={handleSelectAllClick} />
                                        </TableCell>
                                        {viewMode === 'list' && <TableCell>ASSET NAME</TableCell>}
                                        <TableCell>METRIC NAME</TableCell>
                                        <TableCell>VALUE (editable)</TableCell>
                                        <TableCell align="center">PG</TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {assetsList.map((asset) => {
                                        const assetMetricIds = METRICS.map(m => `${asset}__${m}`);
                                        const isGroupSelected = assetMetricIds.every(id => selected.includes(id));
                                        const isGroupIndeterminate = assetMetricIds.some(id => selected.includes(id)) && !isGroupSelected;

                                        return (
                                            <React.Fragment key={asset}>
                                                {viewMode === 'group' && (
                                                    <TableRow hover sx={{ bgcolor: expandedRows[asset] ? '#F9FAFB' : 'inherit', cursor: 'pointer' }} onClick={() => setExpandedRows(p => ({ ...p, [asset]: !p[asset] }))}>
                                                        <TableCell padding="checkbox">
                                                            {/* Asset-Level Checkbox */}
                                                            <Checkbox size="small" checked={isGroupSelected} indeterminate={isGroupIndeterminate} onClick={(e) => handleGroupCheckboxClick(asset, e)} />
                                                        </TableCell>
                                                        <TableCell colSpan={3} sx={{ py: 1.5 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <IconButton size="small" sx={{ mr: 1 }}>{expandedRows[asset] ? <KeyboardArrowDown /> : <KeyboardArrowRight />}</IconButton>
                                                                <Typography variant="body2" fontWeight={700} color="primary.main">{asset}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                )}

                                                {(viewMode === 'list' || expandedRows[asset]) && METRICS.map(metric => {
                                                    const rowId = `${asset}__${metric}`;
                                                    const isSelected = selected.includes(rowId);
                                                    const val = ASSET_DATA[asset]?.metrics?.[metric];
                                                    const isFound = !!val;
                                                    const isActive = activeCell?.asset === asset && activeCell?.metric === metric;

                                                    return (
                                                        <TableRow key={rowId} hover onClick={() => handleMetricClick(asset, metric, isFound)} sx={{ bgcolor: isActive ? '#F5F3FF' : (isSelected ? 'rgba(108, 58, 237, 0.04)' : 'inherit'), cursor: isFound ? 'pointer' : 'default' }}>
                                                            <TableCell padding="checkbox">
                                                                {/* Conditional Metric-Level Checkbox */}
                                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                                    {viewMode === 'list' && <Checkbox size="small" checked={isSelected} onClick={(e) => handleRowCheckboxClick(rowId, e)} />}
                                                                </Box>
                                                            </TableCell>
                                                            {viewMode === 'list' && <TableCell><Typography variant="body2" fontWeight={600}>{asset}</Typography></TableCell>}
                                                            <TableCell sx={{ pl: viewMode === 'group' ? 8 : 2 }}><Typography variant="body2" color={isActive ? 'primary' : 'text.primary'}>{metric}</Typography></TableCell>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isFound ? 'success.main' : 'grey.300', flexShrink: 0 }} />
                                                                    {isActive ? (
                                                                        <TextField size="small" defaultValue={val || ''} variant="standard" InputProps={{ disableUnderline: true, sx: { fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: 700, bgcolor: 'white', '& fieldset': { borderColor: 'primary.main', borderWidth: 2 } } }} />
                                                                    ) : (
                                                                        <Typography variant="body2" fontFamily="monospace" fontWeight={isFound ? 700 : 400} color={isFound ? 'text.primary' : 'text.disabled'} sx={{ fontStyle: isFound ? 'normal' : 'italic' }}>{val || 'not found'}</Typography>
                                                                    )}
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center"><Typography variant="caption" color="primary.main" fontWeight={700}>{isFound ? '4' : '—'}</Typography></TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box onMouseDown={onMouseDown} sx={{ width: 6, bgcolor: '#F3F4F6', cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'primary.light' } }}>
                        <Box sx={{ width: 2, height: 20, bgcolor: 'text.disabled', borderRadius: 1 }} />
                    </Box>

                    {/* RIGHT PANE */}
                    <Box sx={{ width: `${100 - pct}%`, display: 'flex', flexDirection: 'column', bgcolor: '#ECECF0' }}>
                        <Box sx={{ flex: 1, overflow: 'auto', p: 4, display: 'flex', justifyContent: 'center' }}>
                            <Box sx={{ position: 'relative', display: 'inline-block', boxShadow: 3 }}>
                                <Document file="https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf" onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                    <Page pageNumber={pageNumber} width={750} renderTextLayer={false} renderAnnotationLayer={false} />
                                </Document>
                                {activeCell?.highlightRect && (
                                    <Box sx={{ position: 'absolute', top: `${activeCell.highlightRect.top}%`, left: `${activeCell.highlightRect.left}%`, width: `${activeCell.highlightRect.width}%`, height: `${activeCell.highlightRect.height}%`, border: '2px solid #D97706', bgcolor: 'rgba(245, 158, 11, 0.25)', zIndex: 10, pointerEvents: 'none' }} />
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

// ==========================================
// COMPONENT 4: MAIN APP ROOT
// ==========================================
export default function TestFund() {
    const [activeFund, setActiveFund] = useState(null);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {!activeFund ? (
                <FundListScreen onSelectFund={setActiveFund} />
            ) : (
                <WorkspaceScreen fund={activeFund} onBack={() => setActiveFund(null)} />
            )}
        </ThemeProvider>
    );
}
