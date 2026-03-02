import { useState, useMemo, useRef, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// ─── THEME ─────────────────────────────────────────────────────────────────────
const muiTheme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#1e40af" },
        secondary: { main: "#6366f1" },
        background: { default: "#f0f4f8", paper: "#ffffff" },
    },
    typography: { fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" },
    shape: { borderRadius: 8 },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600 } } },
        MuiTableCell: { styleOverrides: { root: { borderColor: "#e8edf2" } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
        MuiDrawer: { styleOverrides: { paper: { borderRight: "1px solid #e8edf2" } } },
        MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,0.07)" } } },
    },
});

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 1, name: "Asset Delisted / Acquired", records: 342, severity: "Critical" },
    { id: 2, name: "Price Feed Failure", records: 218, severity: "High" },
    { id: 3, name: "Corporate Action Missing", records: 189, severity: "High" },
    { id: 4, name: "FX Rate Mismatch", records: 156, severity: "Medium" },
    { id: 5, name: "Duplicate Entry", records: 134, severity: "Medium" },
    { id: 6, name: "Valuation Model Error", records: 98, severity: "Critical" },
    { id: 7, name: "Stale NAV Data", records: 87, severity: "Low" },
    { id: 8, name: "Benchmark Deviation", records: 63, severity: "Low" },
];

const ROW_FIELD_VARIANTS = ["ISIN", "SEDOL", "TICKER", "CUSIP", "CURRENCY", "MIC", "LEI"];

const ERROR_TYPES = [
    "All",
    "Asset Delisted / Acquired",
    "Price Feed Failure",
    "Corporate Action Missing",
    "FX Rate Mismatch",
    "Duplicate Entry",
    "Valuation Model Error",
];

const SEV = {
    Critical: { color: "#9b1c1c", bg: "#fde8e8", border: "#f8b4b4", dot: "#ef4444" },
    High: { color: "#92400e", bg: "#fef3c7", border: "#fcd34d", dot: "#f59e0b" },
    Medium: { color: "#78350f", bg: "#fffbeb", border: "#fde68a", dot: "#d97706" },
    Low: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", dot: "#10b981" },
};

const STAT_CLR = {
    Pending: { color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
    Approved: { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
    Rejected: { color: "#9b1c1c", bg: "#fde8e8", border: "#f8b4b4" },
};

const FIELD_COLORS = {
    ISIN: "#1d4ed8", SEDOL: "#7c3aed", TICKER: "#b45309",
    CUSIP: "#047857", CURRENCY: "#c2410c", MIC: "#9d174d", LEI: "#4b5563",
};

// ─── SAMPLE DATA ───────────────────────────────────────────────────────────────
const ERR_DESC = [
    "Security identifier ISIN mismatch detected between source feed and master record. Asset delisted from primary exchange with no active trading since 2023-11-15.",
    "Corporate action event (stock split 2:1) recorded in Bloomberg but absent from internal reference data. Position valuation impacted across 3 portfolios.",
    "Duplicate position entry for CUSIP 037833100. Entry timestamp delta 00:00:03 — suggests a race condition in the ingestion pipeline.",
    "Price feed timeout exceeded threshold (>30s) from primary vendor. Fallback vendor not triggered due to misconfigured circuit breaker.",
    "NAV calculation uses T-1 FX rate instead of T-0 due to late settlement data from custodian. Impacts EUR-denominated asset reporting.",
];
const AI_ANAL = [
    "Pattern matches 94% similarity to 'Exchange Migration' cluster. Historical data suggests permanent delisting. 3 similar cases resolved via manual override in past 6 months.",
    "Missing CA classified as high-impact (dividend yield calculation). AI detects gap in automated CA scraper for secondary exchanges. Confidence: 87%.",
    "Temporal clustering: 12 similar duplicates in same 5-minute window. Likely caused by upstream retry storm. Confidence: 91%.",
    "Anomaly score 8.4/10. Root cause traced to vendor API deprecation on 2024-01-08. New endpoint requires auth token rotation not yet implemented.",
    "Time-series deviation +2.3σ from expected settlement pattern. Late FX data is a known recurring issue on the last business day of each month.",
];
const RECS = [
    "1. Flag asset as DELISTED in security master.\n2. Notify portfolio managers for position review.\n3. Apply manual price override using last valid close.\n4. Archive for regulatory reporting.",
    "1. Trigger CA backfill from Bloomberg DCAL feed.\n2. Update CA scraper config to include secondary exchanges.\n3. Re-run affected portfolio valuations.\n4. Escalate to data ops team.",
    "1. Remove duplicate entry.\n2. Implement idempotency key in ingestion service.\n3. Add deduplication check within 10-second window.\n4. Review retry policy configuration.",
    "1. Rotate API auth token for primary vendor endpoint.\n2. Re-trigger price feed with new credentials.\n3. Update circuit breaker fallback to 15s.\n4. Monitor for 24h post-fix.",
    "1. Request T-0 FX rate from custodian via SWIFT.\n2. Apply correction to all impacted NAV calculations.\n3. Set up automated alert for late settlement files after 4PM EST.",
];
const SAMPLE_VALUES = {
    ISIN: ["US0378331005", "US5949181045", "US88160R1014", "US0231351067", "US02079K3059"],
    SEDOL: ["2046251", "2588173", "B616566", "B58WM62", "BVDXSX0"],
    TICKER: ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"],
    CUSIP: ["037833100", "594918104", "88160R101", "023135106", "02079K305"],
    CURRENCY: ["USD", "EUR", "GBP", "JPY", "CHF"],
    MIC: ["XNAS", "XNYS", "XLON", "XPAR", "XFRA"],
    LEI: ["HWUPKR0MPOU8FGXBT394", "HLRHMR6Y8XMJDNQDFXMK", "5493001KJTIIGC8Y1R12"],
};

function generateRows(catId) {
    const cat = CATEGORIES.find(c => c.id === catId);
    const assets = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL", "META", "NVDA", "BRK.B", "JPM", "V"];
    const statuses = ["Pending", "Approved", "Rejected"];
    return Array.from({ length: 40 }, (_, i) => {
        const ft = ROW_FIELD_VARIANTS[(i * 3 + catId) % ROW_FIELD_VARIANTS.length];
        return {
            id: `ERR-${String(catId * 100 + i).padStart(5, "0")}`,
            asset: assets[i % assets.length],
            errorType: cat.name,
            severity: cat.severity,
            status: statuses[i % 3],
            confidence: Math.round(60 + ((i * 17 + catId * 7) % 38)),
            date: `2024-0${(i % 3) + 1}-${String((i % 28) + 1).padStart(2, "0")}`,
            value: `$${((i + 1) * 12345.67).toFixed(2)}`,
            analyst: ["K. Patel", "S. Chen", "M. Rodriguez", "A. Kim"][i % 4],
            correctionField: ft,
            correctionValue: SAMPLE_VALUES[ft][i % SAMPLE_VALUES[ft].length],
            errorDescription: ERR_DESC[i % ERR_DESC.length],
            aiAnalysis: AI_ANAL[i % AI_ANAL.length],
            recommendation: RECS[i % RECS.length],
        };
    });
}

// ─── SHARED SMALL COMPONENTS ───────────────────────────────────────────────────
function SeverityChip({ severity }) {
    const s = SEV[severity] || SEV.Low;
    return (
        <Chip label={severity} size="small"
            sx={{
                height: 20, fontSize: 10, fontWeight: 700, bgcolor: s.bg, color: s.color,
                border: `1px solid ${s.border}`, "& .MuiChip-label": { px: "7px" }
            }} />
    );
}

function StatusChip({ status }) {
    const s = STAT_CLR[status] || STAT_CLR.Pending;
    return (
        <Chip label={status} size="small"
            sx={{
                height: 20, fontSize: 10, fontWeight: 700, bgcolor: s.bg, color: s.color,
                border: `1px solid ${s.border}`, "& .MuiChip-label": { px: "7px" }
            }} />
    );
}

// ─── STAT MINI CARD ─────────────────────────────────────────────────────────────
function StatMini({ label, value, total, color, bg, border, icon }) {
    const pct = total > 0 ? Math.round(value / total * 100) : 0;
    return (
        <Box sx={{
            bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2, p: "10px 12px",
            transition: "box-shadow .2s, transform .2s",
            "&:hover": { boxShadow: `0 6px 20px ${color}22`, transform: "translateY(-1px)" }
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                <Typography sx={{ fontSize: 9, color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</Typography>
                <Typography sx={{ fontSize: 15, color, opacity: 0.5, lineHeight: 1 }}>{icon}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1, mb: "6px" }}>{value}</Typography>
            <LinearProgress variant="determinate" value={pct}
                sx={{
                    height: 3, borderRadius: 2, bgcolor: `${color}18`,
                    "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 2 }
                }} />
        </Box>
    );
}

// ─── MINI PROGRESS BAR ─────────────────────────────────────────────────────────
function MiniBar({ label, value, total, color }) {
    const pct = total > 0 ? Math.round(value / total * 100) : 0;
    return (
        <Box mb={1.4}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography sx={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{label}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>
                    {value}
                    <Typography component="span" sx={{ color: "#9ca3af", fontWeight: 400, fontSize: 11 }}> ({pct}%)</Typography>
                </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={pct}
                sx={{
                    height: 6, borderRadius: 3, bgcolor: "#f0f4f8",
                    "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 }
                }} />
        </Box>
    );
}

// ─── CONFIDENCE BAR ────────────────────────────────────────────────────────────
function ConfBar({ range, count, maxCount, color }) {
    const h = Math.max(8, Math.round(count / maxCount * 64));
    return (
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" gap={0.5}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>{count}</Typography>
            <Box sx={{
                width: "100%", height: h, bgcolor: `${color}1a`, border: `1px solid ${color}44`,
                borderRadius: "4px 4px 0 0", position: "relative"
            }}>
                <Box sx={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
                    bgcolor: color, borderRadius: "0 0 3px 3px"
                }} />
            </Box>
            <Typography sx={{
                fontSize: 9, color: "#9ca3af", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.06em"
            }}>{range}</Typography>
        </Box>
    );
}

// ─── INLINE CORRECTION CELL ────────────────────────────────────────────────────
function CorrectionCell({ row, onSave }) {
    const [editing, setEditing] = useState(false);
    const [draftVal, setDraftVal] = useState(row.correctionValue);
    const [draftField, setDraftField] = useState(row.correctionField);
    const inputRef = useRef(null);

    useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

    const fc = FIELD_COLORS[draftField] || "#1d4ed8";
    const commit = () => { onSave(row.id, draftField, draftVal); setEditing(false); };
    const cancel = () => { setDraftVal(row.correctionValue); setDraftField(row.correctionField); setEditing(false); };

    if (editing) {
        return (
            <Stack direction="row" alignItems="center" gap={0.5} onClick={e => e.stopPropagation()}>
                <Select value={draftField} onChange={e => setDraftField(e.target.value)} size="small"
                    sx={{
                        fontSize: 11, fontWeight: 700, color: fc, height: 28, minWidth: 90,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: `${fc}88` },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: fc }
                    }}>
                    {ROW_FIELD_VARIANTS.map(f =>
                        <MenuItem key={f} value={f} sx={{ fontSize: 11, fontWeight: 700 }}>{f}</MenuItem>
                    )}
                </Select>
                <TextField inputRef={inputRef} value={draftVal} onChange={e => setDraftVal(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
                    size="small"
                    sx={{
                        width: 118,
                        "& .MuiInputBase-input": { fontSize: 12, py: "4px" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: `${fc}66` }
                    }} />
                <Button size="small" onClick={commit}
                    sx={{
                        minWidth: 30, height: 26, bgcolor: "#ecfdf5", color: "#065f46",
                        border: "1px solid #6ee7b7", fontWeight: 800, "&:hover": { bgcolor: "#d1fae5" }
                    }}>✓</Button>
                <Button size="small" onClick={cancel}
                    sx={{
                        minWidth: 30, height: 26, bgcolor: "#fef2f2", color: "#9b1c1c",
                        border: "1px solid #f8b4b4", fontWeight: 800, "&:hover": { bgcolor: "#fde8e8" }
                    }}>✕</Button>
            </Stack>
        );
    }

    return (
        <Stack direction="row" alignItems="center" gap={0.75}
            onClick={e => { e.stopPropagation(); if (row.status !== "Approved") setEditing(true); }}
            sx={{
                cursor: row.status === "Approved" ? "default" : "text",
                px: 0.75, py: 0.25, borderRadius: 1, border: "1px solid transparent", transition: "all .15s",
                "&:hover": row.status !== "Approved" ? { bgcolor: "#eef2ff", borderColor: "#c7d2fe" } : {}
            }}>
            <Chip label={draftField} size="small"
                sx={{
                    height: 18, fontSize: 10, fontWeight: 700, bgcolor: `${fc}12`, color: fc,
                    border: `1px solid ${fc}28`, "& .MuiChip-label": { px: "5px" }
                }} />
            <Typography sx={{
                fontSize: 12, fontFamily: "monospace", fontWeight: 500,
                color: row.status === "Approved" ? "#9ca3af" : "#111827"
            }}>
                {row.correctionValue}
            </Typography>
            {row.status !== "Approved" &&
                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>✎</Typography>}
        </Stack>
    );
}

// ─── ACTION BUTTONS ────────────────────────────────────────────────────────────
function ActionButtons({ row, onUpdate }) {
    return (
        <Stack direction="row" spacing={0.75}>
            <Button size="small" disabled={row.status === "Approved"} onClick={() => onUpdate(row.id, "Approved")}
                sx={{
                    fontSize: 11, fontWeight: 700, height: 26, minWidth: 0, px: 1,
                    bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7",
                    "&:hover": { bgcolor: "#d1fae5" }, "&.Mui-disabled": { opacity: 0.4 }
                }}>
                ✓ Approve
            </Button>
            <Button size="small" disabled={row.status === "Rejected"} onClick={() => onUpdate(row.id, "Rejected")}
                sx={{
                    fontSize: 11, fontWeight: 700, height: 26, minWidth: 0, px: 1,
                    bgcolor: "#fef2f2", color: "#9b1c1c", border: "1px solid #f8b4b4",
                    "&:hover": { bgcolor: "#fde8e8" }, "&.Mui-disabled": { opacity: 0.4 }
                }}>
                ✗ Reject
            </Button>
        </Stack>
    );
}

// ─── TRUNCATED CELL with Tooltip ──────────────────────────────────────────────
// Shows ellipsis at maxWidth=250px, full text on hover via MUI Tooltip
function TruncatedCell({ value, color = "#374151", fontWeight = 400, mono = false }) {
    if (!value) return null;
    return (
        <Tooltip
            title={
                <Typography sx={{ fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-wrap", maxWidth: 360 }}>
                    {value}
                </Typography>
            }
            placement="top-start"
            arrow
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: "#1e293b",
                        color: "#f8fafc",
                        border: "1px solid #334155",
                        borderRadius: 1.5,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        p: "8px 12px",
                        maxWidth: 380,
                    },
                },
                arrow: { sx: { color: "#1e293b" } },
            }}
        >
            <Typography
                sx={{
                    fontSize: 12,
                    color,
                    fontWeight,
                    fontFamily: mono ? "monospace" : "inherit",
                    maxWidth: 250,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "default",
                    display: "block",
                }}
            >
                {value}
            </Typography>
        </Tooltip>
    );
}

// ─── READ MORE CELL ────────────────────────────────────────────────────────────
// For longer descriptive text: truncates at 250px with "Read more" expand toggle
function ReadMoreCell({ value, color = "#374151" }) {
    const [expanded, setExpanded] = useState(false);
    if (!value) return null;

    if (expanded) {
        return (
            <Box sx={{ maxWidth: 340 }}>
                <Typography sx={{ fontSize: 12, color, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                    {value}
                </Typography>
                <Typography
                    component="span"
                    onClick={e => { e.stopPropagation(); setExpanded(false); }}
                    sx={{
                        fontSize: 11, color: "#1e40af", fontWeight: 600, cursor: "pointer",
                        display: "inline-block", mt: 0.5,
                        "&:hover": { textDecoration: "underline" }
                    }}>
                    ↑ Show less
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 250, display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
                sx={{
                    fontSize: 12, color, overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap", flex: 1, minWidth: 0
                }}>
                {value}
            </Typography>
            <Typography
                component="span"
                onClick={e => { e.stopPropagation(); setExpanded(true); }}
                sx={{
                    fontSize: 11, color: "#1e40af", fontWeight: 600, cursor: "pointer",
                    flexShrink: 0, whiteSpace: "nowrap",
                    "&:hover": { textDecoration: "underline" }
                }}>
                Read more
            </Typography>
        </Box>
    );
}

// ─── EXPANDED ROW DETAIL ───────────────────────────────────────────────────────
function ExpandedRowDetail({ row }) {
    const panels = [
        { title: "Error Description", color: "#9b1c1c", border: "#fca5a5", topAccent: false, icon: "⬤", content: row.errorDescription, pre: false },
        { title: "AI Analysis", color: "#1e40af", border: "#93c5fd", topAccent: true, icon: "◈", content: row.aiAnalysis, pre: false },
        { title: "Recommendation", color: "#065f46", border: "#6ee7b7", topAccent: false, icon: "▶", content: row.recommendation, pre: true },
    ];
    return (
        <Box sx={{ bgcolor: "#f0f4f8", px: 3, py: 2, borderBottom: "1px solid #e8edf2" }}>
            <Grid container spacing={1.5}>
                {panels.map((p, i) => (
                    <Grid item xs={4} key={i}>
                        <Card elevation={0}
                            sx={{
                                border: `1px solid ${p.border}`, borderRadius: 2,
                                borderTopWidth: p.topAccent ? 3 : 1,
                                borderTopColor: p.topAccent ? "#3b82f6" : p.border
                            }}>
                            <CardHeader
                                sx={{
                                    pb: 0, pt: 1.25, px: 2,
                                    "& .MuiCardHeader-title": {
                                        fontSize: 10, fontWeight: 800,
                                        textTransform: "uppercase", letterSpacing: "0.1em", color: p.color
                                    }
                                }}
                                title={
                                    <Stack direction="row" alignItems="center" gap={0.75}>
                                        <span style={{ fontSize: 9 }}>{p.icon}</span>{p.title}
                                    </Stack>
                                }
                            />
                            <CardContent sx={{ pt: 0.75, px: 2, pb: "12px !important" }}>
                                <ReadMoreCell value={p.content} color="#374151" />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

// ─── SIDEBAR CATEGORY ITEM ─────────────────────────────────────────────────────
function CategoryItem({ cat, isActive, checked, onToggleCheck, onSelect, rowOverrides }) {
    const counts = useMemo(() => {
        const rows = generateRows(cat.id);
        return {
            approved: rows.filter(r => (rowOverrides[r.id]?.status || r.status) === "Approved").length,
            rejected: rows.filter(r => (rowOverrides[r.id]?.status || r.status) === "Rejected").length,
        };
    }, [cat.id, rowOverrides]);

    const s = SEV[cat.severity];
    return (
        <Box onClick={onSelect}
            sx={{
                display: "flex", alignItems: "flex-start", gap: 1, px: 1.75, py: 1.1,
                borderLeft: `3px solid ${isActive ? "#1e40af" : "transparent"}`,
                bgcolor: isActive ? "#eff6ff" : "transparent",
                cursor: "pointer", transition: "all .15s",
                "&:hover": { bgcolor: isActive ? "#eff6ff" : "#f8fafc" }
            }}>
            <Checkbox size="small" checked={checked}
                onClick={e => e.stopPropagation()} onChange={onToggleCheck}
                sx={{ p: 0, mt: "2px", color: "#cbd5e1", "&.Mui-checked": { color: "#1e40af" } }} />
            <Box flex={1} minWidth={0}>
                <Typography sx={{
                    fontSize: 12, fontWeight: isActive ? 600 : 500,
                    color: isActive ? "#1e40af" : "#1f2937",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "18px"
                }}>
                    {cat.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.35} flexWrap="wrap">
                    <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>{cat.records}</Typography>
                    <Chip label={cat.severity} size="small"
                        sx={{
                            height: 14, fontSize: 9, fontWeight: 700, bgcolor: s.bg, color: s.color,
                            border: `1px solid ${s.border}`, "& .MuiChip-label": { px: "4px" }
                        }} />
                    {counts.approved > 0 &&
                        <Typography sx={{ fontSize: 10, color: "#065f46", fontWeight: 700 }}>✓{counts.approved}</Typography>}
                    {counts.rejected > 0 &&
                        <Typography sx={{ fontSize: 10, color: "#9b1c1c", fontWeight: 700 }}>✗{counts.rejected}</Typography>}
                </Stack>
            </Box>
        </Box>
    );
}

// ─── DASHBOARD ─────────────────────────────────────────────────────────────────
const DRAWER_W = 268;

export default function NewCldReport() {
    // Navigation state
    const [selectedCat, setSelectedCat] = useState(1);
    const [activeFilter, setActiveFilter] = useState("All");
    const [checkedCats, setCheckedCats] = useState(new Set([1]));
    const [sidebarSearch, setSidebarSearch] = useState("");

    // Data state
    const [rowOverrides, setRowOverrides] = useState({});
    const [rowSelection, setRowSelection] = useState({});   // MRT built-in selection state

    // UI state
    const [refreshing, setRefreshing] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [snack, setSnack] = useState(null);

    // ── Derived data ─────────────────────────────────────────────────────────────
    const catData = CATEGORIES.find(c => c.id === selectedCat);
    const baseRows = useMemo(() => generateRows(selectedCat), [selectedCat]);

    const allRows = useMemo(
        () => baseRows.map(r => ({ ...r, ...(rowOverrides[r.id] || {}) })),
        [baseRows, rowOverrides]
    );

    // Apply the error-type tab filter (MRT handles global search internally)
    const tableData = useMemo(() =>
        activeFilter === "All" ? allRows : allRows.filter(r => r.errorType === activeFilter),
        [allRows, activeFilter]);

    const stats = useMemo(() => {
        const total = allRows.length;
        const pending = allRows.filter(r => r.status === "Pending").length;
        const approved = allRows.filter(r => r.status === "Approved").length;
        const rejected = allRows.filter(r => r.status === "Rejected").length;
        return { total, pending, approved, rejected };
    }, [allRows]);

    const severityDist = useMemo(() => {
        const d = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        allRows.forEach(r => d[r.severity]++);
        return d;
    }, [allRows]);

    const totalAll = CATEGORIES.reduce((a, b) => a + b.records, 0);
    const topCauses = CATEGORIES.slice(0, 5).map(c => ({
        name: c.name, count: c.records, pct: Math.round(c.records / totalAll * 100),
    }));
    const confBuckets = [
        { range: "90-100%", count: 58, color: "#059669" },
        { range: "75-89%", count: 89, color: "#65a30d" },
        { range: "60-74%", count: 112, color: "#d97706" },
        { range: "< 60%", count: 43, color: "#dc2626" },
    ];
    const maxConf = Math.max(...confBuckets.map(c => c.count));

    // Sidebar category search filter
    const filteredCategories = useMemo(() =>
        sidebarSearch.trim()
            ? CATEGORIES.filter(c => c.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
            : CATEGORIES,
        [sidebarSearch]);

    // ── Handlers ──────────────────────────────────────────────────────────────────
    const updateRow = (id, status) => setRowOverrides(p => ({ ...p, [id]: { ...(p[id] || {}), status } }));
    const updateCorrection = (id, field, val) => setRowOverrides(p => ({ ...p, [id]: { ...(p[id] || {}), correctionField: field, correctionValue: val } }));

    const selectedIds = useMemo(() => Object.keys(rowSelection).filter(k => rowSelection[k]), [rowSelection]);

    const handleBulkAction = action => {
        const ids = selectedIds.length > 0 ? selectedIds : allRows.map(r => r.id);
        setConfirmDialog({ action, count: ids.length, ids });
    };

    const confirmBulk = () => {
        const ns = confirmDialog.action === "approve" ? "Approved" : "Rejected";
        setRowOverrides(p => {
            const n = { ...p };
            confirmDialog.ids.forEach(id => { n[id] = { ...(n[id] || {}), status: ns }; });
            return n;
        });
        setSnack({ msg: `${confirmDialog.count} records ${ns.toLowerCase()}`, severity: "success" });
        setConfirmDialog(null);
        setRowSelection({});
    };

    const handleExport = () => {
        const hdrs = ["Error ID", "Asset", "Error Type", "Severity", "Status", "Confidence", "Date", "Value", "Analyst", "CorrField", "CorrValue"];
        const csv = [hdrs.join(","), ...tableData.map(r =>
            [r.id, r.asset, r.errorType, r.severity, r.status, r.confidence + "%", r.date, r.value, r.analyst, r.correctionField, r.correctionValue]
                .map(v => `"${v}"`).join(",")
        )].join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = "root_cause_export.csv"; a.click();
        setSnack({ msg: "CSV exported", severity: "success" });
    };

    // ── MRT column definitions ────────────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            accessorKey: "id",
            header: "Error ID",
            size: 130,
            Cell: ({ cell }) => (
                <Typography sx={{ color: "#1e40af", fontWeight: 700, fontFamily: "monospace", fontSize: 12 }}>
                    {cell.getValue()}
                </Typography>
            ),
        },
        {
            accessorKey: "asset",
            header: "Asset",
            size: 80,
            Cell: ({ cell }) => (
                <Typography sx={{ fontWeight: 700, fontSize: 12 }}>{cell.getValue()}</Typography>
            ),
        },
        {
            accessorKey: "errorType",
            header: "Error Type",
            size: 190,
            Cell: ({ cell }) => <TruncatedCell value={cell.getValue()} />,
        },
        {
            accessorKey: "severity",
            header: "Severity",
            size: 105,
            filterVariant: "select",
            filterSelectOptions: ["Critical", "High", "Medium", "Low"],
            Cell: ({ cell }) => <SeverityChip severity={cell.getValue()} />,
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 110,
            filterVariant: "select",
            filterSelectOptions: ["Pending", "Approved", "Rejected"],
            Cell: ({ cell }) => <StatusChip status={cell.getValue()} />,
        },
        {
            accessorKey: "confidence",
            header: "Confidence",
            size: 110,
            Cell: ({ cell }) => {
                const v = cell.getValue();
                const c = v >= 80 ? "#059669" : v >= 65 ? "#d97706" : "#dc2626";
                return <Typography sx={{ fontWeight: 700, fontSize: 12, color: c }}>{v}%</Typography>;
            },
        },
        {
            accessorKey: "date",
            header: "Date",
            size: 100,
            Cell: ({ cell }) => <TruncatedCell value={cell.getValue()} color="#4b5563" />,
        },
        {
            accessorKey: "value",
            header: "Value",
            size: 115,
            Cell: ({ cell }) => <TruncatedCell value={cell.getValue()} color="#4b5563" />,
        },
        {
            accessorKey: "analyst",
            header: "Analyst",
            size: 115,
            Cell: ({ cell }) => <TruncatedCell value={cell.getValue()} color="#4b5563" />,
        },
        {
            accessorKey: "errorDescription",
            header: "Error Description",
            size: 250,
            enableSorting: false,
            Cell: ({ cell }) => <ReadMoreCell value={cell.getValue()} />,
        },
        {
            accessorKey: "aiAnalysis",
            header: "AI Analysis",
            size: 250,
            enableSorting: false,
            Cell: ({ cell }) => <ReadMoreCell value={cell.getValue()} color="#1e40af" />,
        },
        {
            accessorKey: "recommendation",
            header: "Recommendation",
            size: 250,
            enableSorting: false,
            Cell: ({ cell }) => <ReadMoreCell value={cell.getValue()} color="#065f46" />,
        },
        {
            id: "correction",
            header: "Correction",
            size: 250,
            enableSorting: false,
            enableColumnFilter: false,
            Cell: ({ row }) => (
                <CorrectionCell row={row.original} onSave={updateCorrection} />
            ),
        },
        {
            id: "actions",
            header: "Actions",
            size: 175,
            enableSorting: false,
            enableColumnFilter: false,
            Cell: ({ row }) => (
                <ActionButtons row={row.original} onUpdate={updateRow} />
            ),
        },
    ], [rowOverrides]);   // re-create when overrides change so cells re-render

    // ── MRT table instance ────────────────────────────────────────────────────────
    const table = useMaterialReactTable({
        columns,
        data: tableData,
        getRowId: row => row.id,

        // ── Selection ──────────────────────────────────────────────────────────────
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: { rowSelection },

        // ── Expand ────────────────────────────────────────────────────────────────
        enableExpanding: true,
        renderDetailPanel: ({ row }) => <ExpandedRowDetail row={row.original} />,

        // ── Search / filter ───────────────────────────────────────────────────────
        enableGlobalFilter: true,
        enableColumnFilters: true,
        enableFacetedValues: true,
        positionGlobalFilter: "left",

        // ── Sorting ───────────────────────────────────────────────────────────────
        enableSorting: true,
        enableMultiSort: false,

        // ── Column features ───────────────────────────────────────────────────────
        enableColumnResizing: true,
        enableColumnOrdering: true,
        enableHiding: true,
        columnResizeMode: "onChange",
        enableDensityToggle: true,
        enableFullScreenToggle: true,

        // ── Pagination ────────────────────────────────────────────────────────────
        enablePagination: true,
        paginationDisplayMode: "pages",
        muiPaginationProps: {
            rowsPerPageOptions: [10, 20, 50],
            showRowsPerPage: true,
            shape: "rounded",
        },

        // ── Initial state ─────────────────────────────────────────────────────────
        initialState: {
            showGlobalFilter: true,
            pagination: { pageSize: 20, pageIndex: 0 },
            density: "compact",
            columnVisibility: {
                errorDescription: false,
                aiAnalysis: false,
                recommendation: false,
            },
        },

        // ── Sticky header ─────────────────────────────────────────────────────────
        enableStickyHeader: true,
        muiTableContainerProps: { sx: { maxHeight: "380px" } },

        // ── Styling ───────────────────────────────────────────────────────────────
        muiTableProps: { sx: { tableLayout: "auto" } },

        muiTableHeadCellProps: {
            sx: {
                bgcolor: "#f8fafc",
                fontSize: 10,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                borderBottom: "2px solid #e8edf2",
                py: "10px",
            },
        },

        muiTableBodyCellProps: {
            sx: { fontSize: 12, py: "7px", color: "#374151", borderBottom: "1px solid #f3f4f6" },
        },

        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                bgcolor: row.getIsSelected() ? "#eff6ff" : "inherit",
                "&:hover td": { bgcolor: "#f0f9ff !important" },
                cursor: "pointer",
            },
            onClick: () => row.toggleExpanded(),
        }),

        // Top toolbar background
        muiTopToolbarProps: {
            sx: {
                bgcolor: "#fff",
                borderBottom: "1px solid #e8edf2",
                px: 2,
                pt: 1,
                pb: 0.5,
                flexWrap: "wrap",
                gap: 0.5,
                alignItems: "flex-start",
            },
        },
        muiBottomToolbarProps: { sx: { bgcolor: "#fff", borderTop: "1px solid #e8edf2" } },

        muiSearchTextFieldProps: {
            size: "small",
            placeholder: "Search all columns…",
            InputProps: {
                startAdornment: (
                    <InputAdornment position="start">
                        <Typography sx={{ fontSize: 14, color: "#9ca3af" }}>🔍</Typography>
                    </InputAdornment>
                ),
            },
            sx: {
                minWidth: 220,
                "& .MuiInputBase-input": { fontSize: 12 },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#d1d5db" },
            },
        },

        // ── Custom toolbar actions (left side) ─────────────────────────────────────
        renderTopToolbarCustomActions: () => (
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ py: 0.5, flex: 1, minWidth: 0 }}>

                {/* Error-type filter chips */}
                <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                    <Typography sx={{
                        fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                        letterSpacing: "0.12em", color: "#9ca3af", mr: 0.25
                    }}>
                        Filter
                    </Typography>
                    {ERROR_TYPES.map(t => (
                        <Chip key={t} label={t} size="small" clickable onClick={() => setActiveFilter(t)}
                            sx={{
                                height: 22, fontSize: 10,
                                fontWeight: activeFilter === t ? 700 : 500,
                                bgcolor: activeFilter === t ? "#1e40af" : "#fff",
                                color: activeFilter === t ? "#fff" : "#6b7280",
                                border: `1px solid ${activeFilter === t ? "#1e40af" : "#e5e7eb"}`,
                                "&:hover": { bgcolor: activeFilter === t ? "#1d4ed8" : "#f0f9ff", borderColor: "#93c5fd" },
                                "& .MuiChip-label": { px: "8px" },
                            }} />
                    ))}
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

                {/* Status summary */}
                <Typography sx={{ fontSize: 11, color: "#6b7280", whiteSpace: "nowrap" }}>
                    <Typography component="span" sx={{ color: "#065f46", fontWeight: 700 }}>{stats.approved} approved</Typography>
                    {" · "}
                    <Typography component="span" sx={{ color: "#9b1c1c", fontWeight: 700 }}>{stats.rejected} rejected</Typography>
                    {" · "}
                    <Typography component="span" sx={{ color: "#b45309", fontWeight: 700 }}>{stats.pending} pending</Typography>
                </Typography>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

                {/* Bulk action buttons */}
                <Typography sx={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                    {selectedIds.length > 0 ? `${selectedIds.length} selected:` : `All ${allRows.length}:`}
                </Typography>
                <Button size="small" onClick={() => handleBulkAction("approve")}
                    sx={{
                        fontSize: 11, fontWeight: 700, height: 26, whiteSpace: "nowrap",
                        bgcolor: "#ecfdf5", color: "#065f46", border: "1px solid #6ee7b7",
                        "&:hover": { bgcolor: "#d1fae5" }
                    }}>
                    ✓ Approve {selectedIds.length > 0 ? "Selected" : "All"}
                </Button>
                <Button size="small" onClick={() => handleBulkAction("reject")}
                    sx={{
                        fontSize: 11, fontWeight: 700, height: 26, whiteSpace: "nowrap",
                        bgcolor: "#fef2f2", color: "#9b1c1c", border: "1px solid #f8b4b4",
                        "&:hover": { bgcolor: "#fde8e8" }
                    }}>
                    ✗ Reject {selectedIds.length > 0 ? "Selected" : "All"}
                </Button>
            </Stack>
        ),
    });

    // ─── RENDER ───────────────────────────────────────────────────────────────────
    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width:5px; height:5px }
        ::-webkit-scrollbar-track { background:#f0f4f8 }
        ::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:4px }
        ::-webkit-scrollbar-thumb:hover { background:#9ca3af }
      `}</style>

            <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", bgcolor: "#f0f4f8" }}>

                {/* ═══════════════════════ SIDEBAR ═══════════════════════ */}
                <Drawer variant="permanent" sx={{
                    width: DRAWER_W, flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: DRAWER_W, bgcolor: "#fff",
                        border: "none", borderRight: "1px solid #e8edf2",
                        display: "flex", flexDirection: "column", overflow: "hidden",
                    },
                }}>

                    {/* Sidebar header + category search */}
                    <Box sx={{
                        px: 2, pt: 1.75, pb: 1.5, bgcolor: "#fafbfc",
                        borderBottom: "1px solid #e8edf2", flexShrink: 0
                    }}>
                        {/* Title row */}
                        <Stack direction="row" alignItems="center" gap={1} mb={1.25}>
                            <Box sx={{
                                width: 7, height: 7, borderRadius: "50%",
                                bgcolor: "#1e40af", boxShadow: "0 0 0 3px #dbeafe"
                            }} />
                            <Typography sx={{
                                fontSize: 10, fontWeight: 800, letterSpacing: "0.15em",
                                textTransform: "uppercase", color: "#9ca3af"
                            }}>
                                Error Categories
                            </Typography>
                            <Chip label={CATEGORIES.length} size="small"
                                sx={{
                                    height: 16, fontSize: 9, fontWeight: 700, ml: "auto",
                                    bgcolor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe",
                                    "& .MuiChip-label": { px: "6px" }
                                }} />
                        </Stack>

                        {/* ── CATEGORY SEARCH BAR ── */}
                        <TextField
                            fullWidth size="small"
                            placeholder="Search categories…"
                            value={sidebarSearch}
                            onChange={e => setSidebarSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography sx={{ fontSize: 13, color: "#9ca3af", lineHeight: 1 }}>🔍</Typography>
                                    </InputAdornment>
                                ),
                                endAdornment: sidebarSearch ? (
                                    <InputAdornment position="end">
                                        <Typography
                                            onClick={() => setSidebarSearch("")}
                                            sx={{
                                                fontSize: 13, color: "#9ca3af", cursor: "pointer", lineHeight: 1,
                                                "&:hover": { color: "#6b7280" }
                                            }}>✕</Typography>
                                    </InputAdornment>
                                ) : null,
                            }}
                            sx={{
                                "& .MuiInputBase-root": { borderRadius: 1.5 },
                                "& .MuiInputBase-input": { fontSize: 12, py: "6px" },
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
                                "& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c7d2fe" },
                                "& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1e40af" },
                            }}
                        />

                        {/* Filtered count hint */}
                        {sidebarSearch && (
                            <Typography sx={{ fontSize: 10, color: "#9ca3af", mt: 0.75 }}>
                                {filteredCategories.length} of {CATEGORIES.length} categories
                            </Typography>
                        )}
                    </Box>

                    {/* Category list */}
                    <Box sx={{ overflowY: "auto", flex: 1, py: 0.5 }}>
                        {filteredCategories.length === 0 ? (
                            <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
                                <Typography sx={{ fontSize: 13, color: "#d1d5db", mb: 0.5 }}>No categories found</Typography>
                                <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Try a different search term</Typography>
                            </Box>
                        ) : (
                            filteredCategories.map(cat => (
                                <CategoryItem
                                    key={cat.id}
                                    cat={cat}
                                    isActive={selectedCat === cat.id}
                                    checked={checkedCats.has(cat.id)}
                                    rowOverrides={rowOverrides}
                                    onToggleCheck={e => setCheckedCats(prev => {
                                        const n = new Set(prev);
                                        e.target.checked ? n.add(cat.id) : n.delete(cat.id);
                                        return n;
                                    })}
                                    onSelect={() => {
                                        setSelectedCat(cat.id);
                                        setActiveFilter("All");
                                        setRowSelection({});
                                    }}
                                />
                            ))
                        )}
                    </Box>
                </Drawer>

                {/* ═══════════════════════ MAIN PANEL ═══════════════════════ */}
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

                    {/* App Bar */}
                    <AppBar position="static" elevation={0}
                        sx={{
                            bgcolor: "#fff", color: "#1f2937",
                            borderBottom: "1px solid #e8edf2", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                        }}>
                        <Toolbar variant="dense" sx={{ minHeight: 52, px: 2.5, gap: 1.5 }}>
                            <Stack direction="row" alignItems="center" gap={1} mr={1.5}>
                                <Box sx={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    bgcolor: "#1e40af", boxShadow: "0 0 0 3px #dbeafe"
                                }} />
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                                    security_master_errors_Q1_2024.csv
                                </Typography>
                            </Stack>
                            <Stack direction="row" gap={0.75} flexWrap="wrap">
                                {[
                                    { l: "Categories", v: CATEGORIES.length },
                                    { l: "Records", v: totalAll.toLocaleString() },
                                    { l: "Updated", v: "Mar 01, 2024" },
                                    { l: "Period", v: "Q1 2024" },
                                ].map(m => (
                                    <Chip key={m.l} size="small"
                                        label={<><span style={{ color: "#9ca3af", fontSize: 10 }}>{m.l}:</span> <strong style={{ fontSize: 11 }}>{m.v}</strong></>}
                                        sx={{ bgcolor: "#f3f4f6", border: "1px solid #e5e7eb", height: 22, "& .MuiChip-label": { px: "8px" } }} />
                                ))}
                            </Stack>
                            <Box flex={1} />
                            <Button size="small" variant="outlined" onClick={() => {
                                setRefreshing(true);
                                setTimeout(() => { setRefreshing(false); setSnack({ msg: "Data refreshed", severity: "info" }); }, 1200);
                            }} disabled={refreshing}
                                sx={{ fontSize: 12, color: "#6b7280", borderColor: "#e5e7eb", "&:hover": { bgcolor: "#f9fafb" } }}>
                                {refreshing ? "↻ Refreshing…" : "↻ Refresh"}
                            </Button>
                            <Button size="small" variant="contained" disableElevation onClick={handleExport}
                                sx={{ fontSize: 12, bgcolor: "#1e40af", "&:hover": { bgcolor: "#1d4ed8" } }}>
                                ↓ Export CSV
                            </Button>
                        </Toolbar>
                    </AppBar>

                    {/* Scrollable body */}
                    <Box sx={{
                        flex: 1, overflowY: "auto", p: "14px 18px",
                        display: "flex", flexDirection: "column", gap: 1.75
                    }}>

                        {/* ── CHARTS ROW ── */}
                        <Grid container spacing={1.5} alignItems="stretch">

                            {/* 2×2 Summary */}
                            <Grid item xs="auto">
                                <Card elevation={0}
                                    sx={{
                                        border: "1px solid #e8edf2", borderRadius: 2.5, height: "100%",
                                        minWidth: 236, position: "relative", overflow: "hidden"
                                    }}>
                                    <Box sx={{
                                        position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                        background: "linear-gradient(90deg,#1e40af,#6366f1)"
                                    }} />
                                    <CardHeader
                                        sx={{
                                            pt: 1.75, pb: 0, px: 2,
                                            "& .MuiCardHeader-title": {
                                                fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                                                letterSpacing: "0.1em", color: "#9ca3af", overflow: "hidden",
                                                textOverflow: "ellipsis", whiteSpace: "nowrap"
                                            }
                                        }}
                                        title={catData.name}
                                    />
                                    <CardContent sx={{ pt: 1.25, pb: "12px !important", px: 2 }}>
                                        <Grid container spacing={1}>
                                            {[
                                                { label: "Total", value: stats.total, color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", icon: "⊞" },
                                                { label: "Pending", value: stats.pending, color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: "◷" },
                                                { label: "Approved", value: stats.approved, color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", icon: "✓" },
                                                { label: "Rejected", value: stats.rejected, color: "#9b1c1c", bg: "#fef2f2", border: "#f8b4b4", icon: "✗" },
                                            ].map(s => (
                                                <Grid item xs={6} key={s.label}>
                                                    <StatMini {...s} total={stats.total} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Severity */}
                            <Grid item xs>
                                <Card elevation={0} sx={{ border: "1px solid #e8edf2", borderRadius: 2.5, height: "100%" }}>
                                    <CardHeader title="Error Severity"
                                        sx={{
                                            pt: 1.75, pb: 0, px: 2, "& .MuiCardHeader-title": {
                                                fontSize: 10, fontWeight: 800,
                                                textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af"
                                            }
                                        }} />
                                    <CardContent sx={{ pt: 1.25, pb: "12px !important", px: 2 }}>
                                        {Object.entries(severityDist).map(([sev, count]) => (
                                            <MiniBar key={sev} label={sev} value={count} total={stats.total} color={SEV[sev].dot} />
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Top Root Causes */}
                            <Grid item sx={{ flex: "1.3 1 0" }}>
                                <Card elevation={0} sx={{ border: "1px solid #e8edf2", borderRadius: 2.5, height: "100%" }}>
                                    <CardHeader title="Top Root Causes"
                                        sx={{
                                            pt: 1.75, pb: 0, px: 2, "& .MuiCardHeader-title": {
                                                fontSize: 10, fontWeight: 800,
                                                textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af"
                                            }
                                        }} />
                                    <CardContent sx={{ pt: 1.25, pb: "12px !important", px: 2 }}>
                                        {topCauses.map((c, i) => (
                                            <Box key={i} mb={1.1}>
                                                <Stack direction="row" justifyContent="space-between" mb={0.4}>
                                                    <Stack direction="row" alignItems="center" gap={0.75}>
                                                        <Typography sx={{ fontSize: 10, color: "#d1d5db", fontWeight: 800, width: 14, textAlign: "right" }}>{i + 1}</Typography>
                                                        <Tooltip title={c.name} placement="top">
                                                            <Typography sx={{ fontSize: 11, maxWidth: 155, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {c.name}
                                                            </Typography>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography sx={{ fontSize: 11, fontWeight: 700, ml: 1, flexShrink: 0 }}>
                                                        {c.count}
                                                        <Typography component="span" sx={{ color: "#9ca3af", fontWeight: 400, fontSize: 11 }}> · {c.pct}%</Typography>
                                                    </Typography>
                                                </Stack>
                                                <LinearProgress variant="determinate" value={c.pct}
                                                    sx={{
                                                        height: 5, borderRadius: 3, bgcolor: "#f0f4f8",
                                                        "& .MuiLinearProgress-bar": { bgcolor: `hsl(${215 - i * 20},68%,46%)`, borderRadius: 3 }
                                                    }} />
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Confidence Distribution */}
                            <Grid item sx={{ flex: "1.1 1 0" }}>
                                <Card elevation={0} sx={{ border: "1px solid #e8edf2", borderRadius: 2.5, height: "100%" }}>
                                    <CardHeader title="Confidence Distribution"
                                        sx={{
                                            pt: 1.75, pb: 0, px: 2, "& .MuiCardHeader-title": {
                                                fontSize: 10, fontWeight: 800,
                                                textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af"
                                            }
                                        }} />
                                    <CardContent sx={{ pt: 1.25, pb: "12px !important", px: 2 }}>
                                        <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ height: 92, mb: 0.5 }}>
                                            {confBuckets.map(b => <ConfBar key={b.range} {...b} maxCount={maxConf} />)}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* ── MATERIAL REACT TABLE ── */}
                        <Card elevation={0} sx={{ border: "1px solid #e8edf2", borderRadius: 2.5, overflow: "hidden" }}>
                            <MaterialReactTable table={table} />
                        </Card>

                    </Box>
                </Box>
            </Box>

            {/* ── CONFIRM DIALOG ── */}
            <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)}
                maxWidth="xs" fullWidth PaperProps={{ elevation: 8, sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{
                    fontSize: 15, fontWeight: 800, pb: 0.5,
                    display: "flex", alignItems: "center", gap: 1.25
                }}>
                    <Box sx={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                        bgcolor: confirmDialog?.action === "approve" ? "#ecfdf5" : "#fef2f2",
                        color: confirmDialog?.action === "approve" ? "#065f46" : "#9b1c1c",
                        border: `1px solid ${confirmDialog?.action === "approve" ? "#6ee7b7" : "#f8b4b4"}`
                    }}>
                        {confirmDialog?.action === "approve" ? "✓" : "✗"}
                    </Box>
                    {confirmDialog?.action === "approve" ? "Approve" : "Reject"} Records
                </DialogTitle>
                <DialogContent sx={{ pt: "12px !important" }}>
                    <DialogContentText sx={{ fontSize: 13, color: "#4b5563", lineHeight: 1.75 }}>
                        This will{" "}
                        <strong style={{ color: confirmDialog?.action === "approve" ? "#065f46" : "#9b1c1c" }}>
                            {confirmDialog?.action} {confirmDialog?.count} records
                        </strong>{" "}
                        in <strong style={{ color: "#111827" }}>{catData?.name}</strong>.
                        Individual rows can be changed afterwards.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setConfirmDialog(null)} variant="outlined"
                        sx={{ fontSize: 12, color: "#6b7280", borderColor: "#e5e7eb" }}>Cancel</Button>
                    <Button onClick={confirmBulk} variant="contained" disableElevation
                        sx={{
                            fontSize: 12, fontWeight: 700,
                            bgcolor: confirmDialog?.action === "approve" ? "#065f46" : "#9b1c1c",
                            "&:hover": { bgcolor: confirmDialog?.action === "approve" ? "#047857" : "#7f1d1d" }
                        }}>
                        {confirmDialog?.action === "approve" ? "✓ Approve All" : "✗ Reject All"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── SNACKBAR ── */}
            <Snackbar open={!!snack} autoHideDuration={2800}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                <Alert severity={snack?.severity || "success"} variant="filled"
                    onClose={() => setSnack(null)}
                    sx={{
                        fontSize: 13, fontWeight: 600, borderRadius: 2,
                        bgcolor: snack?.severity === "success" ? "#065f46" : "#1e40af"
                    }}>
                    {snack?.msg}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
