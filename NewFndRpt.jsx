import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DATA MODEL
// Each tab has SEMANTICALLY DIFFERENT metrics:
//   ASSET INVESTMENT  → deal-level entry metrics (cost, date, distributions)
//   ASSET PERFORMANCE → operational KPIs (revenue, EBITDA, growth)
//   FUND              → fund-level ownership & returns per asset
//   STATIC            → company profile / firmographic data
//   STATIC (FREE)     → user-defined custom fields
//
// Progress bar = (metrics with a value / total metrics) per asset per tab
// ─────────────────────────────────────────────────────────────────────────────

const FUNDS = [
    { id: "f1", name: "Wayne Enterprises Capital Partners VII", short: "WECP VII", manager: "Wayne Capital Management", vintage: 2020, strategy: "Buyout", size: "$2.4B", currency: "USD", status: "Active", reportDate: "Q2 2020", assetsCount: 7, nav: "$3.1B", irr: "18.4%", tvpi: "1.62x" },
    { id: "f2", name: "Apollo Growth Fund IV", short: "AGF IV", manager: "Apollo Capital", vintage: 2019, strategy: "Growth Equity", size: "$1.8B", currency: "USD", status: "Active", reportDate: "Q3 2024", assetsCount: 4, nav: "$2.4B", irr: "21.2%", tvpi: "1.88x" },
    { id: "f3", name: "KKR Infrastructure III", short: "KKR Infra III", manager: "KKR & Co.", vintage: 2018, strategy: "Infrastructure", size: "$3.2B", currency: "USD", status: "Harvesting", reportDate: "Q4 2023", assetsCount: 3, nav: "$4.0B", irr: "21.1%", tvpi: "1.95x" },
    { id: "f4", name: "Blackstone Real Assets II", short: "BRA II", manager: "Blackstone Group", vintage: 2021, strategy: "Real Assets", size: "$5.1B", currency: "USD", status: "Deploying", reportDate: "Q1 2024", assetsCount: 5, nav: "$5.3B", irr: "12.8%", tvpi: "1.24x" },
];

const ASSETS_BY_FUND = {
    f1: ["Local Standing & Move", "Great Sea Smoothing", "Watchmen International", "Expert Crew", "Winter Capital III", "IPA Cold Transfer", "DoubleFace Skin Wealth"],
    f2: ["TechCorp Holdings", "MedLife Sciences", "RetailMax Group", "Cosmos Products"],
    f3: ["Pacific Port Authority", "Nordic Power Grid", "Iberian Toll Roads"],
    f4: ["Logistics Hub Alpha", "Energy Transition Co", "Metro Office REIT", "Harbor Freight Trust", "Sunbelt Industrial"],
};

// ── Tab descriptions (shown to user) ─────────────────────────────────────────
const TAB_DESCRIPTIONS = {
    "ASSET INVESTMENT": "Deal-level investment data extracted from the report — entry dates, capital deployed, distributions received, and return multiples per portfolio company.",
    "ASSET PERFORMANCE": "Operational & financial KPIs for each portfolio company — revenue, EBITDA, margins and growth rates sourced from portfolio monitoring sections.",
    "FUND": "Fund-level ownership and attribution metrics — % ownership, cost basis and total value attributable to this fund (vs. co-investors).",
    "STATIC": "Firmographic & profile data for each portfolio company — sector, geography, leadership, headcount. Rarely changes between reports.",
    "STATIC (FREE METRICS)": "User-defined custom fields that are not part of Accelex's standard extraction schema. Add any bespoke metrics your team tracks.",
};

// ── Metrics per tab — each tab has DISTINCT metric types ─────────────────────
const METRICS_BY_TYPE = {
    "ASSET INVESTMENT": ["Entry date", "Total capital invested", "Total distributions", "Residual value (FMV)", "Total value", "Multiple on invested capital (MOIC)", "Asset IRR"],
    "ASSET PERFORMANCE": ["Revenue (LTM)", "EBITDA (LTM)", "EBITDA Margin", "Net Revenue Growth YoY", "Net Debt / EBITDA", "EV / EBITDA", "Gross Margin %"],
    "FUND": ["Fund Ownership %", "Cost (fund share)", "Realized Proceeds", "Unrealized Value", "Total Value (fund)", "Multiple of Cost", "Gross IRR"],
    "STATIC": ["Country", "Sector", "CEO", "Founded Year", "Employees", "HQ City", "Website"],
    "STATIC (FREE METRICS)": ["ESG Score", "Board Seats Held", "Co-investors", "Deal Type", "Hold Period (yrs)"],
};

// ── Full data per asset, per tab ──────────────────────────────────────────────
const ASSET_DATA = {
    "Local Standing & Move": {
        "ASSET INVESTMENT": { "Entry date": "2012/12/31", "Total capital invested": "77,500,000", "Total distributions": "236,400,000", "Residual value (FMV)": "0", "Total value": "236,400,000", "Multiple on invested capital (MOIC)": "3.1", "Asset IRR": "51.5%" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "142,000,000", "EBITDA (LTM)": "48,200,000", "EBITDA Margin": "33.9%", "Net Revenue Growth YoY": "", "Net Debt / EBITDA": "", "EV / EBITDA": "", "Gross Margin %": "" },
        "FUND": { "Fund Ownership %": "87.8%", "Cost (fund share)": "77.5", "Realized Proceeds": "236.4", "Unrealized Value": "—", "Total Value (fund)": "236.4", "Multiple of Cost": "3.1x", "Gross IRR": "51.5%" },
        "STATIC": { "Country": "USA", "Sector": "Finance", "CEO": "Marcus Dane", "Founded Year": "2001", "Employees": "1,240", "HQ City": "New York, NY", "Website": "localstanding.com" },
        "STATIC (FREE METRICS)": { "ESG Score": "B+", "Board Seats Held": "2", "Co-investors": "Warburg Pincus", "Deal Type": "Control Buyout", "Hold Period (yrs)": "8.1" },
    },
    "Great Sea Smoothing": {
        "ASSET INVESTMENT": { "Entry date": "2014/05/31", "Total capital invested": "62,200,000", "Total distributions": "171,900,000", "Residual value (FMV)": "2,300,000", "Total value": "174,200,000", "Multiple on invested capital (MOIC)": "2.8", "Asset IRR": "48.6%" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "98,400,000", "EBITDA (LTM)": "29,100,000", "EBITDA Margin": "29.6%", "Net Revenue Growth YoY": "+12%", "Net Debt / EBITDA": "1.2x", "EV / EBITDA": "8.4x", "Gross Margin %": "54%" },
        "FUND": { "Fund Ownership %": "70.2%", "Cost (fund share)": "62.2", "Realized Proceeds": "171.9", "Unrealized Value": "2.3", "Total Value (fund)": "174.2", "Multiple of Cost": "2.8x", "Gross IRR": "48.6%" },
        "STATIC": { "Country": "UK", "Sector": "Consumer", "CEO": "Rachel Obi", "Founded Year": "2008", "Employees": "890", "HQ City": "London, UK", "Website": "greatseagroup.co.uk" },
        "STATIC (FREE METRICS)": { "ESG Score": "A-", "Board Seats Held": "1", "Co-investors": "EQT", "Deal Type": "Growth Buyout", "Hold Period (yrs)": "6.1" },
    },
    "Watchmen International": {
        "ASSET INVESTMENT": { "Entry date": "2014/10/31", "Total capital invested": "85,100,000", "Total distributions": "259,400,000", "Residual value (FMV)": "0", "Total value": "259,400,000", "Multiple on invested capital (MOIC)": "3.0", "Asset IRR": "78.5%" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "310,000,000", "EBITDA (LTM)": "92,000,000", "EBITDA Margin": "29.7%", "Net Revenue Growth YoY": "+19%", "Net Debt / EBITDA": "0.8x", "EV / EBITDA": "9.1x", "Gross Margin %": "61%" },
        "FUND": { "Fund Ownership %": "61.5%", "Cost (fund share)": "85.1", "Realized Proceeds": "259.4", "Unrealized Value": "—", "Total Value (fund)": "259.4", "Multiple of Cost": "3.0x", "Gross IRR": "78.5%" },
        "STATIC": { "Country": "USA", "Sector": "Security", "CEO": "Bruce W.", "Founded Year": "1999", "Employees": "4,200", "HQ City": "Gotham, NJ", "Website": "watchmen-intl.com" },
        "STATIC (FREE METRICS)": { "ESG Score": "A", "Board Seats Held": "3", "Co-investors": "Vista Equity", "Deal Type": "Carve-out", "Hold Period (yrs)": "5.7" },
    },
    "Expert Crew": {
        "ASSET INVESTMENT": { "Entry date": "2015/08/31", "Total capital invested": "163,100,000", "Total distributions": "518,500,000", "Residual value (FMV)": "0", "Total value": "518,500,000", "Multiple on invested capital (MOIC)": "3.2", "Asset IRR": "156.7%" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "580,000,000", "EBITDA (LTM)": "", "EBITDA Margin": "", "Net Revenue Growth YoY": "+28%", "Net Debt / EBITDA": "", "EV / EBITDA": "11.2x", "Gross Margin %": "" },
        "FUND": { "Fund Ownership %": "56.3%", "Cost (fund share)": "163.1", "Realized Proceeds": "518.5", "Unrealized Value": "—", "Total Value (fund)": "518.5", "Multiple of Cost": "3.2x", "Gross IRR": "156.7%" },
        "STATIC": { "Country": "Germany", "Sector": "Services", "CEO": "Hans Richter", "Founded Year": "2005", "Employees": "12,800", "HQ City": "Munich, DE", "Website": "expertcrew.de" },
        "STATIC (FREE METRICS)": { "ESG Score": "B", "Board Seats Held": "2", "Co-investors": "Apax Partners", "Deal Type": "Secondary Buyout", "Hold Period (yrs)": "4.9" },
    },
    "Winter Capital III": {
        "ASSET INVESTMENT": { "Entry date": "2016/03/18", "Total capital invested": "61,600,000", "Total distributions": "", "Residual value (FMV)": "", "Total value": "119,500,000", "Multiple on invested capital (MOIC)": "1.9", "Asset IRR": "104.6%" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "210,000,000", "EBITDA (LTM)": "71,000,000", "EBITDA Margin": "33.8%", "Net Revenue Growth YoY": "+7%", "Net Debt / EBITDA": "2.1x", "EV / EBITDA": "", "Gross Margin %": "" },
        "FUND": { "Fund Ownership %": "", "Cost (fund share)": "", "Realized Proceeds": "", "Unrealized Value": "119.5", "Total Value (fund)": "119.5", "Multiple of Cost": "1.9x", "Gross IRR": "104.6%" },
        "STATIC": { "Country": "France", "Sector": "Finance", "CEO": "Claire Moreau", "Founded Year": "2010", "Employees": "620", "HQ City": "Paris, FR", "Website": "wintercap3.fr" },
        "STATIC (FREE METRICS)": { "ESG Score": "", "Board Seats Held": "1", "Co-investors": "", "Deal Type": "Platform Build", "Hold Period (yrs)": "4.3" },
    },
    "IPA Cold Transfer": {
        "ASSET INVESTMENT": { "Entry date": "2012/01/01", "Total capital invested": "140,500,000", "Total distributions": "68,600,000", "Residual value (FMV)": "", "Total value": "68,600,000", "Multiple on invested capital (MOIC)": "0.5", "Asset IRR": "(46.1%)" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "", "EBITDA (LTM)": "", "EBITDA Margin": "", "Net Revenue Growth YoY": "-8%", "Net Debt / EBITDA": "", "EV / EBITDA": "", "Gross Margin %": "" },
        "FUND": { "Fund Ownership %": "82.0%", "Cost (fund share)": "140.5", "Realized Proceeds": "68.6", "Unrealized Value": "—", "Total Value (fund)": "68.6", "Multiple of Cost": "0.5x", "Gross IRR": "(46.1%)" },
        "STATIC": { "Country": "USA", "Sector": "Tech", "CEO": "Sandra Lee", "Founded Year": "2007", "Employees": "340", "HQ City": "Austin, TX", "Website": "ipacold.com" },
        "STATIC (FREE METRICS)": { "ESG Score": "C", "Board Seats Held": "2", "Co-investors": "None", "Deal Type": "Control Buyout", "Hold Period (yrs)": "8.5" },
    },
    "DoubleFace Skin Wealth": {
        "ASSET INVESTMENT": { "Entry date": "2015/11/01", "Total capital invested": "66,800,000", "Total distributions": "", "Residual value (FMV)": "", "Total value": "", "Multiple on invested capital (MOIC)": "0.0", "Asset IRR": "NM" },
        "ASSET PERFORMANCE": { "Revenue (LTM)": "", "EBITDA (LTM)": "", "EBITDA Margin": "", "Net Revenue Growth YoY": "", "Net Debt / EBITDA": "", "EV / EBITDA": "", "Gross Margin %": "" },
        "FUND": { "Fund Ownership %": "83.7%", "Cost (fund share)": "66.8", "Realized Proceeds": "", "Unrealized Value": "", "Total Value (fund)": "", "Multiple of Cost": "0.0x", "Gross IRR": "NM" },
        "STATIC": { "Country": "Japan", "Sector": "Beauty", "CEO": "Yuki Tanaka", "Founded Year": "2013", "Employees": "180", "HQ City": "Tokyo, JP", "Website": "doublefaceskin.jp" },
        "STATIC (FREE METRICS)": { "ESG Score": "", "Board Seats Held": "1", "Co-investors": "", "Deal Type": "Minority Growth", "Hold Period (yrs)": "4.6" },
    },
};

const ASSET_META = {
    "Local Standing & Move": { icon: "🏦", color: "#6366F1", sector: "Finance", country: "USA", status: "Realized" },
    "Great Sea Smoothing": { icon: "🌊", color: "#10B981", sector: "Consumer", country: "UK", status: "Realized" },
    "Watchmen International": { icon: "🔐", color: "#F59E0B", sector: "Security", country: "USA", status: "Realized" },
    "Expert Crew": { icon: "⚙️", color: "#EC4899", sector: "Services", country: "Germany", status: "Realized" },
    "Winter Capital III": { icon: "❄️", color: "#3B82F6", sector: "Finance", country: "France", status: "Unrealized" },
    "IPA Cold Transfer": { icon: "💊", color: "#EF4444", sector: "Tech", country: "USA", status: "Unrealized" },
    "DoubleFace Skin Wealth": { icon: "✨", color: "#A78BFA", sector: "Beauty", country: "Japan", status: "Unrealized" },
    "TechCorp Holdings": { icon: "💻", color: "#06B6D4", sector: "Tech", country: "USA", status: "Active" },
    "MedLife Sciences": { icon: "🧬", color: "#10B981", sector: "Healthcare", country: "Germany", status: "Active" },
    "RetailMax Group": { icon: "🛒", color: "#F97316", sector: "Consumer", country: "UK", status: "Active" },
    "Cosmos Products": { icon: "🚀", color: "#8B5CF6", sector: "Tech", country: "USA", status: "Active" },
    "Pacific Port Authority": { icon: "⚓", color: "#0EA5E9", sector: "Transport", country: "Australia", status: "Active" },
    "Nordic Power Grid": { icon: "⚡", color: "#FBBF24", sector: "Utilities", country: "Sweden", status: "Active" },
    "Iberian Toll Roads": { icon: "🛣️", color: "#22C55E", sector: "Transport", country: "Spain", status: "Active" },
};

// ─── Resizable hook ───────────────────────────────────────────────────────────
function useResizable(initial = 46, min = 26, max = 74) {
    const [pct, setPct] = useState(initial);
    const dragging = useRef(false);
    const containerRef = useRef(null);
    const onMouseDown = useCallback((e) => {
        e.preventDefault(); dragging.current = true;
        document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none";
    }, []);
    useEffect(() => {
        const onMove = (e) => {
            if (!dragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setPct(Math.min(max, Math.max(min, ((e.clientX - rect.left) / rect.width) * 100)));
        };
        const onUp = () => { dragging.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }, [min, max]);
    return { pct, containerRef, onMouseDown };
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function NewReport() {
    const [selectedFund, setSelectedFund] = useState(null); // null = fund selection screen
    const [loading, setLoading] = useState(false);
    const [metricType, setMetricType] = useState("ASSET INVESTMENT");
    const [filter, setFilter] = useState("all");
    const [highlightMode, setHighlightMode] = useState("single");
    const [activeCell, setActiveCell] = useState(null); // { asset, metric }
    const [editedValues, setEditedValues] = useState({}); // { "asset__metric": newVal }
    const [expandedAssets, setExpandedAssets] = useState(new Set());
    const [pdfPage, setPdfPage] = useState(4);
    const [zoom, setZoom] = useState(100);
    const [searchQ, setSearchQ] = useState("");
    const [showTabInfo, setShowTabInfo] = useState(false);
    const { pct, containerRef, onMouseDown } = useResizable(46, 26, 74);

    // ── Fund selection handler ──
    function handleSelectFund(fund) {
        setLoading(true);
        setSelectedFund(null);
        setTimeout(() => {
            setSelectedFund(fund);
            setLoading(false);
            setMetricType("ASSET INVESTMENT");
            setFilter("all");
            setActiveCell(null);
            setEditedValues({});
            setExpandedAssets(new Set());
            setPdfPage(4);
        }, 900);
    }

    // ── Value helpers ──
    function getValue(asset, metric) {
        const key = `${asset}__${metric}`;
        if (key in editedValues) return editedValues[key];
        return (ASSET_DATA[asset]?.[metricType]?.[metric]) ?? "";
    }
    function setValue(asset, metric, val) {
        const key = `${asset}__${metric}`;
        const orig = (ASSET_DATA[asset]?.[metricType]?.[metric]) ?? "";
        setEditedValues(prev => ({ ...prev, [key]: val }));
        // If value non-empty, auto-set active
        if (val.trim()) setActiveCell({ asset, metric });
    }
    function isModified(asset, metric) {
        const key = `${asset}__${metric}`;
        if (!(key in editedValues)) return false;
        const orig = (ASSET_DATA[asset]?.[metricType]?.[metric]) ?? "";
        return editedValues[key] !== orig;
    }

    // ── Build rows for current view ──
    const assets = ASSETS_BY_FUND[selectedFund?.id] || [];
    const metrics = METRICS_BY_TYPE[metricType] || [];

    const allRows = assets.flatMap(asset =>
        metrics.map(metric => {
            const val = getValue(asset, metric);
            return { id: `${asset}__${metric}`, asset, metric, value: val, status: val?.trim() ? "found" : "not_found", modified: isModified(asset, metric) };
        })
    );

    const foundRows = allRows.filter(r => r.status === "found");
    const missingRows = allRows.filter(r => r.status === "not_found");
    let filtered = filter === "found" ? foundRows : filter === "not_found" ? missingRows : allRows;
    if (searchQ) filtered = filtered.filter(r => r.asset.toLowerCase().includes(searchQ.toLowerCase()) || r.metric.toLowerCase().includes(searchQ.toLowerCase()));

    // ── Progress per asset (for current tab) ──
    function assetProgress(asset) {
        const vals = metrics.map(m => getValue(asset, m));
        const filled = vals.filter(v => v?.trim());
        return { filled: filled.length, total: metrics.length, pct: metrics.length ? Math.round(filled.length / metrics.length * 100) : 0 };
    }

    // ── Highlight values ──
    const highlightedValues = (() => {
        if (highlightMode === "none") return [];
        if (highlightMode === "single" && activeCell) return [getValue(activeCell.asset, activeCell.metric)].filter(Boolean);
        if (highlightMode === "current_filter") return filtered.filter(r => r.value).map(r => r.value);
        if (highlightMode === "all") return allRows.filter(r => r.value).map(r => r.value);
        return [];
    })();

    const TABS = Object.keys(METRICS_BY_TYPE);

    // ─── LOADING SCREEN ───────────────────────────────────────────────────────
    if (loading) return <LoadingScreen />;

    // ─── FUND SELECTION SCREEN ────────────────────────────────────────────────
    if (!selectedFund) return <FundSelectionScreen onSelect={handleSelectFund} />;

    // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
    return (
        <div style={{ fontFamily: "'IBM Plex Sans','Helvetica Neue',sans-serif", background: "#06040F", minHeight: "100vh", display: "flex", flexDirection: "column", fontSize: 13, color: "#E2E8F0" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03);}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.13);border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseHL{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5)}60%{box-shadow:0 0 0 5px rgba(251,191,36,0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .tab-pill:hover{color:#A78BFA!important;background:rgba(124,58,237,.12)!important;}
        .asset-hdr:hover{background:rgba(255,255,255,.03)!important;}
        .row-hover:hover .rc{background:rgba(124,58,237,.06)!important;}
        .chip:hover{border-color:#7C3AED!important;}
        .dh:hover .dl{background:#7C3AED!important;}
        .dh:hover .dg{color:#A78BFA!important;}
        .val-input{background:transparent;border:none;outline:none;width:100%;color:inherit;font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:600;cursor:text;padding:0;}
        .val-input:focus{background:rgba(124,58,237,.08);border-radius:3px;outline:1px solid rgba(124,58,237,.4);}
        .val-input::placeholder{color:rgba(255,255,255,.15);font-style:italic;font-weight:400;}
        .val-input.missing{color:rgba(255,255,255,.2);}
        .val-input.found{color:rgba(255,255,255,.8);}
        .val-input.modified{color:#FCD34D!important;outline:1px solid rgba(252,211,77,.3)!important;background:rgba(252,211,77,.05)!important;border-radius:3px;}
        input[type=checkbox]{accent-color:#7C3AED;cursor:pointer;}
      `}</style>

            {/* TOP NAV */}
            <div style={{ background: "#0A0818", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", padding: "0 18px", height: 48, flexShrink: 0, gap: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 24, cursor: "pointer" }} onClick={() => setSelectedFund(null)}>
                    <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", boxShadow: "0 0 12px rgba(124,58,237,.4)" }}>A</div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "-0.4px" }}>accelex</span>
                </div>
                {["DASHBOARD", "DOCUMENTS", "TRACKER", "AUDIT", "FILTERS", "REFERENCE"].map(n => (
                    <button key={n} style={{ background: "none", border: "none", color: n === "DOCUMENTS" ? "#E2D9FF" : "rgba(255,255,255,.35)", fontFamily: "inherit", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.7px", padding: "0 12px", height: "100%", cursor: "pointer", borderBottom: n === "DOCUMENTS" ? "2px solid #A855F7" : "2px solid transparent" }}>{n}</button>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "#34D399", fontWeight: 600 }}>● LIVE</div>
                    {/* Back to fund list */}
                    <button onClick={() => setSelectedFund(null)} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "rgba(255,255,255,.5)", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 12 }}>‹</span> All Funds
                    </button>
                    <div style={{ background: "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "#A78BFA", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📁 {selectedFund.short}</div>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>BL</div>
                </div>
            </div>

            {/* STEPS */}
            <div style={{ background: "#0D0B1E", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", padding: "0 18px", height: 40, flexShrink: 0 }}>
                {[{ n: 1, l: "CONFIRM NETWORK" }, { n: 2, l: "VALIDATE METRICS" }].map(({ n, l }) => (
                    <div key={n} style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 14px 0 0", height: "100%", borderBottom: n === 2 ? "2px solid #7C3AED" : "2px solid transparent" }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: n === 2 ? "#7C3AED" : "#10B981", color: "#fff", flexShrink: 0 }}>{n === 1 ? "✓" : n}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.7px", color: n === 2 ? "#A78BFA" : "rgba(255,255,255,.35)" }}>{l}</span>
                    </div>
                ))}
                <div style={{ width: 1, height: 20, background: "rgba(255,255,255,.08)", margin: "0 14px 0 4px" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{selectedFund.name}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.15)", margin: "0 6px" }}>›</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{selectedFund.reportDate} Fund Report</span>
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {[["Total", allRows.length, "rgba(255,255,255,.5)"], ["Found", foundRows.length, "#10B981"], ["Missing", missingRows.length, "#F87171"]].map(([l, v, c]) => (
                        <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 9, color: "rgba(255,255,255,.25)", fontWeight: 600 }}>{l}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: c, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* TABS */}
            <div style={{ background: "#0D0B1E", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "stretch", padding: "0 18px", flexShrink: 0, gap: 2 }}>
                {TABS.map(tab => (
                    <button key={tab} className="tab-pill" onClick={() => { setMetricType(tab); setActiveCell(null); }} style={{ background: metricType === tab ? "rgba(124,58,237,.18)" : "none", border: "none", borderBottom: metricType === tab ? "2px solid #7C3AED" : "2px solid transparent", marginBottom: "-1px", padding: "8px 13px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.4px", color: metricType === tab ? "#A78BFA" : "rgba(255,255,255,.35)", cursor: "pointer", fontFamily: "inherit", transition: "all .15s", borderRadius: "4px 4px 0 0", whiteSpace: "nowrap" }}>
                        {tab}
                    </button>
                ))}
                <button onClick={() => setShowTabInfo(p => !p)} style={{ background: "none", border: "none", marginLeft: 4, color: "rgba(255,255,255,.25)", cursor: "pointer", fontSize: 13, padding: "0 6px", display: "flex", alignItems: "center" }} title="What does this tab show?">ⓘ</button>
            </div>

            {/* TAB INFO TOOLTIP */}
            {showTabInfo && (
                <div style={{ background: "rgba(20,16,40,.98)", border: "1px solid rgba(124,58,237,.25)", borderRadius: 8, padding: "10px 16px", margin: "6px 18px", fontSize: 11.5, color: "rgba(255,255,255,.6)", lineHeight: 1.6, flexShrink: 0, animation: "fadeUp .15s ease" }}>
                    <span style={{ color: "#A78BFA", fontWeight: 700 }}>{metricType}:</span> {TAB_DESCRIPTIONS[metricType]}
                    <button onClick={() => setShowTabInfo(false)} style={{ float: "right", background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: "pointer", fontSize: 13, marginLeft: 8 }}>✕</button>
                </div>
            )}

            {/* FILTER BAR */}
            <div style={{ background: "#0D0B1E", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", alignItems: "center", gap: 5, padding: "7px 18px", flexShrink: 0 }}>
                {[{ k: "all", l: "All", c: allRows.length }, { k: "not_found", l: "Missing", c: missingRows.length, col: "#EF4444" }, { k: "found", l: "Found", c: foundRows.length, col: "#10B981" }].map(({ k, l, c, col }) => (
                    <button key={k} className="chip" onClick={() => setFilter(k)} style={{ background: filter === k ? (col ? `${col}15` : "rgba(124,58,237,.18)") : "rgba(255,255,255,.04)", border: `1px solid ${filter === k ? (col || "#7C3AED") : "rgba(255,255,255,.1)"}`, borderRadius: 20, padding: "3px 11px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: filter === k ? (col || "#A78BFA") : "rgba(255,255,255,.35)", transition: "all .15s", display: "flex", alignItems: "center", gap: 4 }}>
                        {col && filter === k && <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, display: "inline-block" }} />}
                        {l} <strong>{c}</strong>
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "4px 10px" }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search…" style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: 11, fontFamily: "inherit", outline: "none", width: 120 }} />
                </div>
                <button style={{ background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#A78BFA", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add manually</button>
            </div>

            {/* MAIN RESIZABLE SPLIT */}
            <div ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

                {/* ══ LEFT PANEL ══ */}
                <div style={{ width: `${pct}%`, display: "flex", flexDirection: "column", background: "#0D0B1E", overflow: "hidden", flexShrink: 0 }}>

                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "30px 150px 1fr 1fr 36px", background: "rgba(255,255,255,.025)", borderBottom: "1px solid rgba(255,255,255,.06)", flexShrink: 0, userSelect: "none" }}>
                        {[{ l: "" }, { l: "ASSET" }, { l: "METRIC" }, { l: "VALUE  (click to edit)" }, { l: "PG" }].map((h, i) => (
                            <div key={i} style={{ padding: "7px 8px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.28)", letterSpacing: "0.6px", borderRight: i < 4 ? "1px solid rgba(255,255,255,.04)" : "none", display: "flex", alignItems: "center", gap: 3 }}>
                                {i === 0 ? <input type="checkbox" style={{ width: 11, height: 11 }} /> : h.l}
                            </div>
                        ))}
                    </div>

                    {/* ASSET GROUPS */}
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {assets.map(asset => {
                            const meta = ASSET_META[asset] || { icon: "🏢", color: "#7C3AED", sector: "—", country: "—", status: "—" };
                            const prog = assetProgress(asset);
                            const expanded = expandedAssets.has(asset);
                            const assetFilteredRows = filtered.filter(r => r.asset === asset);
                            if (searchQ && assetFilteredRows.length === 0) return null;

                            const displayRows = searchQ ? assetFilteredRows : metrics.map(metric => ({
                                id: `${asset}__${metric}`, asset, metric,
                                value: getValue(asset, metric),
                                status: getValue(asset, metric)?.trim() ? "found" : "not_found",
                                modified: isModified(asset, metric)
                            })).filter(r => filter === "found" ? r.status === "found" : filter === "not_found" ? r.status === "not_found" : true);

                            if (displayRows.length === 0 && filter !== "all") return null;

                            return (
                                <div key={asset} style={{ borderBottom: "1px solid rgba(255,255,255,.05)", animation: "fadeUp .2s ease" }}>
                                    {/* Asset header row */}
                                    <div className="asset-hdr" onClick={() => setExpandedAssets(p => { const n = new Set(p); n.has(asset) ? n.delete(asset) : n.add(asset); return n; })} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer", background: expandedAssets.has(asset) ? "rgba(255,255,255,.02)" : "transparent", transition: "background .12s", borderLeft: `3px solid ${expandedAssets.has(asset) ? meta.color : "transparent"}` }}>
                                        <span style={{ fontSize: 11, color: expanded ? "#A78BFA" : "rgba(255,255,255,.3)", flexShrink: 0, width: 12 }}>{expanded ? "▾" : "▸"}</span>
                                        {/* Icon */}
                                        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${meta.color}20`, border: `1px solid ${meta.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{meta.icon}</div>
                                        {/* Name + tags */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: expanded ? "#E2E8F0" : "rgba(255,255,255,.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset}</div>
                                            <div style={{ display: "flex", gap: 5, marginTop: 2, alignItems: "center" }}>
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,.28)" }}>{meta.sector}</span>
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,.15)" }}>·</span>
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,.28)" }}>{meta.country}</span>
                                                <span style={{ fontSize: 9, padding: "0px 4px", borderRadius: 3, background: meta.status === "Realized" ? "rgba(16,185,129,.12)" : meta.status === "Unrealized" ? "rgba(99,102,241,.12)" : "rgba(245,158,11,.12)", color: meta.status === "Realized" ? "#6EE7B7" : meta.status === "Unrealized" ? "#A5B4FC" : "#FCD34D", fontWeight: 600, marginLeft: 2 }}>{meta.status}</span>
                                            </div>
                                        </div>
                                        {/* Progress for THIS tab */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", color: prog.pct === 100 ? "#10B981" : prog.pct > 50 ? "#FBBF24" : "#F87171" }}>{prog.pct}%</span>
                                                <span style={{ fontSize: 9, color: "rgba(255,255,255,.2)" }}>{prog.filled}/{prog.total}</span>
                                            </div>
                                            <div style={{ width: 52, height: 3, background: "rgba(255,255,255,.07)", borderRadius: 2 }}>
                                                <div style={{ width: `${prog.pct}%`, height: "100%", borderRadius: 2, background: prog.pct === 100 ? "#10B981" : prog.pct > 50 ? "#FBBF24" : "#EF4444", transition: "width .4s" }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric rows — shown when expanded OR if searching */}
                                    {(expanded || !!searchQ) && displayRows.map((row, idx) => {
                                        const isActive = activeCell?.asset === asset && activeCell?.metric === row.metric;
                                        return (
                                            <div key={row.id} className="row-hover" onClick={() => setActiveCell({ asset, metric: row.metric })} style={{ display: "grid", gridTemplateColumns: "30px 150px 1fr 1fr 36px", borderBottom: "1px solid rgba(255,255,255,.03)", borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent", background: isActive ? "rgba(124,58,237,.06)" : "transparent", cursor: "pointer", transition: "border-left .1s" }}>
                                                {/* Checkbox */}
                                                <div className="rc" style={{ padding: "6px 8px", display: "flex", alignItems: "center", borderRight: "1px solid rgba(255,255,255,.04)" }} onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" style={{ width: 11, height: 11 }} />
                                                </div>
                                                {/* Asset (in this grouped view, we show blank for cleanliness) */}
                                                <div className="rc" style={{ padding: "6px 8px", fontSize: 10, color: "rgba(255,255,255,.2)", borderRight: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", overflow: "hidden" }}>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 9.5 }}>— {row.metric.length > 22 ? row.metric.slice(0, 20) + "…" : ""}</span>
                                                </div>
                                                {/* Metric name */}
                                                <div className="rc" style={{ padding: "6px 8px", fontSize: 11, color: "rgba(255,255,255,.55)", borderRight: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", overflow: "hidden" }}>
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.metric}</span>
                                                </div>
                                                {/* Editable value */}
                                                <div className="rc" style={{ padding: "4px 8px", borderRight: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 5 }} onClick={e => e.stopPropagation()}>
                                                    {row.status === "found" && !row.modified && (
                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", display: "inline-block", flexShrink: 0, boxShadow: "0 0 4px rgba(16,185,129,.5)" }} />
                                                    )}
                                                    {row.modified && (
                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FCD34D", display: "inline-block", flexShrink: 0 }} title="Modified" />
                                                    )}
                                                    {row.status === "not_found" && !row.modified && (
                                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.15)", display: "inline-block", flexShrink: 0 }} />
                                                    )}
                                                    <input
                                                        className={`val-input ${row.modified ? "modified" : row.status === "found" ? "found" : "missing"}`}
                                                        value={row.value}
                                                        placeholder="not found — enter value"
                                                        onChange={e => setValue(asset, row.metric, e.target.value)}
                                                        onClick={e => { e.stopPropagation(); setActiveCell({ asset, metric: row.metric }); }}
                                                    />
                                                </div>
                                                {/* Page */}
                                                <div className="rc" style={{ padding: "6px 5px", fontSize: 10, color: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>
                                                    {row.status === "found" || row.modified ? "4" : "—"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* LEFT FOOTER */}
                    <div style={{ padding: "7px 14px", borderTop: "1px solid rgba(255,255,255,.06)", background: "rgba(0,0,0,.2)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)", fontFamily: "'IBM Plex Mono',monospace" }}>{allRows.length} rows · {foundRows.length} found · {missingRows.length} missing</span>
                        {Object.keys(editedValues).length > 0 && (
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                <span style={{ fontSize: 10, color: "#FCD34D" }}>⚡ {Object.keys(editedValues).length} edited</span>
                                <button onClick={() => setEditedValues({})} style={{ background: "none", border: "none", fontSize: 10, color: "rgba(255,255,255,.25)", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* DRAG DIVIDER */}
                <div className="dh" onMouseDown={onMouseDown} style={{ width: 8, background: "transparent", cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 10, position: "relative" }}>
                    <div className="dl" style={{ width: 2, height: "100%", background: "rgba(255,255,255,.06)", transition: "background .15s", position: "absolute" }} />
                    <div className="dg" style={{ background: "#0D0B1E", border: "1px solid rgba(255,255,255,.12)", borderRadius: 4, padding: "5px 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: "rgba(255,255,255,.2)", fontSize: 5, zIndex: 1, transition: "color .15s", lineHeight: 1 }}>
                        {["●", "●", "●"].map((d, i) => <span key={i}>{d}</span>)}
                    </div>
                </div>

                {/* ══ RIGHT PANEL: PDF ══ */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#06040F", overflow: "hidden", minWidth: 0 }}>
                    {/* PDF breadcrumb */}
                    <div style={{ background: "#0A0818", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 11, color: "#A78BFA", fontWeight: 600, flexShrink: 0 }}>{selectedFund.name}</span>
                            <span style={{ color: "rgba(255,255,255,.2)", flexShrink: 0 }}>›</span>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,.38)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFund.short} - {selectedFund.reportDate} Fund Report.pdf · Performance Report · To Do</span>
                        </div>
                        <button style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.5)", padding: "4px 12px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>BACK</button>
                        <button style={{ background: "#7C3AED", border: "none", color: "#fff", padding: "4px 14px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, boxShadow: "0 0 10px rgba(124,58,237,.4)" }}>FINISH</button>
                    </div>

                    {/* PDF toolbar */}
                    <div style={{ background: "#0D0B1E", borderBottom: "1px solid rgba(255,255,255,.06)", padding: "5px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", fontWeight: 700, letterSpacing: "0.5px" }}>SEARCH</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 4, padding: "3px 9px" }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                            <input placeholder="Find in document..." style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", fontSize: 11, fontFamily: "inherit", outline: "none", width: 130 }} />
                        </div>
                        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.08)" }} />
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", fontWeight: 700, letterSpacing: "0.5px" }}>VIEW</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 4, padding: "2px" }}>
                            <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", padding: "2px 6px", fontSize: 14, fontFamily: "inherit" }}>−</button>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,.6)", minWidth: 38, textAlign: "center", fontFamily: "'IBM Plex Mono',monospace" }}>{zoom}%</span>
                            <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", padding: "2px 6px", fontSize: 14, fontFamily: "inherit" }}>+</button>
                        </div>
                        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.08)" }} />
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", fontWeight: 700, letterSpacing: "0.5px" }}>PAGE</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            {[["⇤", () => setPdfPage(1), pdfPage <= 1], ["‹", () => setPdfPage(p => Math.max(1, p - 1)), pdfPage <= 1]].map(([ic, fn, dis], i) => (
                                <button key={i} onClick={fn} disabled={dis} style={{ background: "rgba(255,255,255,.06)", border: "none", color: dis ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.55)", borderRadius: 3, width: 20, height: 20, cursor: dis ? "default" : "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                            ))}
                            <input value={pdfPage} onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= 8) setPdfPage(v); }} style={{ width: 28, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 3, color: "rgba(255,255,255,.7)", textAlign: "center", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", padding: "2px 0", outline: "none" }} />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,.2)" }}>of 8</span>
                            {[["›", () => setPdfPage(p => Math.min(8, p + 1)), pdfPage >= 8], ["⇥", () => setPdfPage(8), pdfPage >= 8]].map(([ic, fn, dis], i) => (
                                <button key={i} onClick={fn} disabled={dis} style={{ background: "rgba(255,255,255,.06)", border: "none", color: dis ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.55)", borderRadius: 3, width: 20, height: 20, cursor: dis ? "default" : "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                            ))}
                        </div>
                    </div>

                    {/* PDF canvas */}
                    <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", justifyContent: "center", alignItems: "flex-start", background: "radial-gradient(ellipse at 50% 0%,rgba(124,58,237,.05) 0%,transparent 60%),#06040F" }}>
                        <PDFPage page={pdfPage} fund={selectedFund} zoom={zoom} highlightedValues={highlightedValues} activeCell={activeCell} />
                    </div>

                    {/* Highlight bar */}
                    <div style={{ background: "#0A0818", borderTop: "1px solid rgba(255,255,255,.06)", padding: "7px 16px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                        <span style={{ fontSize: 9.5, color: "rgba(255,255,255,.28)", fontWeight: 700, letterSpacing: "0.8px", flexShrink: 0 }}>HIGHLIGHT</span>
                        {[{ k: "current_filter", l: "Current filter" }, { k: "single", l: "Single metric" }, { k: "all", l: "All metrics" }, { k: "none", l: "None" }].map(({ k, l }) => (
                            <label key={k} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }} onClick={() => setHighlightMode(k)}>
                                <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${highlightMode === k ? "#7C3AED" : "rgba(255,255,255,.18)"}`, background: highlightMode === k ? "#7C3AED" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", flexShrink: 0 }}>
                                    {highlightMode === k && <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#fff" }} />}
                                </div>
                                <span style={{ fontSize: 11, color: highlightMode === k ? "#DDD6FE" : "rgba(255,255,255,.3)", fontWeight: highlightMode === k ? 600 : 400, whiteSpace: "nowrap" }}>{l}</span>
                            </label>
                        ))}
                        {activeCell && highlightMode === "single" && (
                            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.2)", borderRadius: 6, padding: "3px 10px", flexShrink: 0 }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FBBF24", display: "inline-block" }} />
                                <span style={{ fontSize: 11, color: "#FDE68A", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCell.asset} · {activeCell.metric}</span>
                                <button onClick={() => setActiveCell(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,.25)", cursor: "pointer", fontSize: 11, padding: 0, marginLeft: 2 }}>✕</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Fund Selection Landing Screen ────────────────────────────────────────────
function FundSelectionScreen({ onSelect }) {
    const [hovered, setHovered] = useState(null);
    const [search, setSearch] = useState("");

    const filtered = FUNDS.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.strategy.toLowerCase().includes(search.toLowerCase()) ||
        f.manager.toLowerCase().includes(search.toLowerCase())
    );

    const strategyColors = { "Buyout": "#7C3AED", "Growth Equity": "#10B981", "Infrastructure": "#3B82F6", "Real Assets": "#F59E0B" };
    const statusColors = { "Active": "#10B981", "Harvesting": "#F59E0B", "Deploying": "#3B82F6" };

    return (
        <div style={{ fontFamily: "'IBM Plex Sans','Helvetica Neue',sans-serif", background: "#06040F", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}
        .fund-card:hover{border-color:rgba(124,58,237,.5)!important;background:rgba(124,58,237,.07)!important;transform:translateY(-2px);}
        .fund-card{transition:all .2s ease;}
      `}</style>

            {/* Nav */}
            <div style={{ background: "#0A0818", borderBottom: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", padding: "0 24px", height: 52, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", boxShadow: "0 0 14px rgba(124,58,237,.5)" }}>A</div>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.4px" }}>accelex</span>
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>BL</div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px" }}>
                {/* Hero */}
                <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp .4s ease" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: "#7C3AED", marginBottom: 10, textTransform: "uppercase" }}>Step 2 of 2 · Validate Metrics</div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1.2, marginBottom: 10 }}>Select a Fund to Validate</h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", maxWidth: 480, lineHeight: 1.6 }}>
                        Choose a fund to load its quarterly report. You'll validate extracted metrics against the PDF, correct any errors, and approve the data.
                    </p>
                </div>

                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "10px 16px", width: "100%", maxWidth: 520, marginBottom: 32, animation: "fadeUp .5s ease" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by fund name, strategy or manager…" style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 13, fontFamily: "inherit", outline: "none", flex: 1 }} />
                </div>

                {/* Fund cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16, width: "100%", maxWidth: 1100 }}>
                    {filtered.map((fund, i) => {
                        const sc = strategyColors[fund.strategy] || "#7C3AED";
                        const stc = statusColors[fund.status] || "#10B981";
                        return (
                            <div key={fund.id} className="fund-card" onClick={() => onSelect(fund)} onMouseEnter={() => setHovered(fund.id)} onMouseLeave={() => setHovered(null)}
                                style={{ background: "rgba(255,255,255,.03)", border: `1px solid rgba(255,255,255,.08)`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", animation: `fadeUp ${.3 + i * .07}s ease`, position: "relative", overflow: "hidden" }}>
                                {/* Top accent line */}
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${sc},${sc}88)`, borderRadius: "14px 14px 0 0" }} />
                                {/* Header */}
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: 9.5, fontWeight: 700, background: `${sc}20`, color: sc, border: `1px solid ${sc}30`, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.3px" }}>{fund.strategy}</span>
                                            <span style={{ fontSize: 9.5, fontWeight: 600, background: `${stc}15`, color: stc, borderRadius: 4, padding: "2px 7px" }}>● {fund.status}</span>
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.3, marginBottom: 3 }}>{fund.name}</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{fund.manager}</div>
                                    </div>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${sc}18`, border: `1px solid ${sc}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, marginLeft: 12 }}>📁</div>
                                </div>
                                {/* KPIs */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                                    {[["Fund Size", fund.size], ["NAV", fund.nav], ["Net IRR", fund.irr], ["TVPI", fund.tvpi], ["Vintage", fund.vintage.toString()], ["Assets", fund.assetsCount + " cos"]].map(([l, v]) => (
                                        <div key={l} style={{ background: "rgba(255,255,255,.03)", borderRadius: 7, padding: "8px 10px" }}>
                                            <div style={{ fontSize: 8.5, color: "rgba(255,255,255,.3)", fontWeight: 600, letterSpacing: "0.4px", marginBottom: 3 }}>{l}</div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", fontFamily: "'IBM Plex Mono',monospace" }}>{v}</div>
                                        </div>
                                    ))}
                                </div>
                                {/* Report info */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "rgba(255,255,255,.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,.05)" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 13 }}>📄</span>
                                        <div>
                                            <div style={{ fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,.55)" }}>{fund.short} - {fund.reportDate} Quarterly Report</div>
                                            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,.25)", marginTop: 1 }}>Performance Report · Ready to validate</div>
                                        </div>
                                    </div>
                                    <div style={{ background: hovered === fund.id ? "#7C3AED" : "rgba(124,58,237,.2)", border: "1px solid rgba(124,58,237,.4)", borderRadius: 6, padding: "5px 12px", fontSize: 11, color: hovered === fund.id ? "#fff" : "#A78BFA", fontWeight: 600, transition: "all .2s", flexShrink: 0 }}>
                                        Open →
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,.25)", padding: "40px 0" }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
                        <div style={{ fontSize: 14 }}>No funds match "{search}"</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
    return (
        <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", background: "#06040F", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", boxShadow: "0 0 20px rgba(124,58,237,.5)", animation: "spin 1.5s linear infinite" }}>A</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.5)", letterSpacing: "0.3px" }}>Loading fund report…</div>
            <div style={{ width: 200, height: 3, background: "rgba(255,255,255,.06)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#7C3AED,#A855F7)", borderRadius: 2, animation: "shimmer 0.9s ease infinite", width: "60%" }} />
            </div>
        </div>
    );
}

// ─── PDF Page Renderer ────────────────────────────────────────────────────────
function PDFPage({ page, fund, zoom, highlightedValues, activeCell }) {
    const s = zoom / 100;

    function HL({ text }) {
        if (!text || !highlightedValues.length) return <>{text}</>;
        let parts = [text];
        highlightedValues.filter(Boolean).forEach(hv => {
            parts = parts.flatMap(p => {
                if (typeof p !== "string") return [p];
                const i = p.indexOf(hv);
                if (i === -1) return [p];
                return [p.slice(0, i), <mark key={hv + i} style={{ background: "rgba(251,191,36,.35)", outline: "2px solid #FBBF24", outlineOffset: 1, borderRadius: 2, padding: "0 1px", fontWeight: 700, color: "inherit", animation: "pulseHL 2s infinite" }}>{hv}</mark>, p.slice(i + hv.length)];
            });
        });
        return <>{parts}</>;
    }

    const base = { width: `${750 * s}px`, minHeight: `${1060 * s}px`, background: "#fff", borderRadius: 2, boxShadow: "0 8px 50px rgba(0,0,0,.7)", overflow: "hidden", flexShrink: 0, fontFamily: "'IBM Plex Sans','Helvetica Neue',sans-serif", color: "#1A202C", fontSize: `${11.5 * s}px`, transition: "width .2s" };

    const Header = () => (
        <div>
            <div style={{ background: "#1E0A3C", padding: `${13 * s}px ${24 * s}px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: `${10 * s}px` }}>
                    <div style={{ width: 40 * s, height: 40 * s, background: "#fff", borderRadius: 5 * s, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18 * s, color: "#1E0A3C", fontFamily: "serif" }}>W</div>
                    <div>
                        <div style={{ fontSize: `${13 * s}px`, fontWeight: 700, color: "#fff" }}>{fund.name}</div>
                        <div style={{ fontSize: `${9 * s}px`, color: "rgba(255,255,255,.4)", marginTop: 2 * s }}>{fund.reportDate} Fund Quarterly Report · Performance Report</div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: `${9 * s}px`, color: "rgba(255,255,255,.3)", letterSpacing: "0.5px", marginBottom: 2 * s }}>PAGE</div>
                    <div style={{ fontSize: `${18 * s}px`, fontWeight: 700, color: "rgba(255,255,255,.7)", fontFamily: "'IBM Plex Mono',monospace" }}>{page}</div>
                </div>
            </div>
            <div style={{ height: 3 * s, background: "linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#7C3AED)" }} />
        </div>
    );

    if (page === 4) {
        const T = [
            { name: "Local Standing & Move", date: "Dec-12", wecp: "87.8%", cap: "77.5", real: "236.4", unreal: "—", tot: "236.4", moic: "3.1x", irr: "51.5%", s: "realized" },
            { name: "Great Sea Smoothing", date: "May-14", wecp: "70.2%", cap: "62.2", real: "171.9", unreal: "2.3", tot: "174.2", moic: "2.8x", irr: "48.6%", s: "realized" },
            { name: "Watchmen International", date: "Oct-14", wecp: "61.5%", cap: "85.1", real: "259.4", unreal: "—", tot: "259.4", moic: "3.0x", irr: "78.5%", s: "realized" },
            { name: "Expert Crew", date: "Aug-15", wecp: "56.3%", cap: "163.1", real: "518.5", unreal: "—", tot: "518.5", moic: "3.2x", irr: "156.7%", s: "realized" },
            { name: "Winter Capital III", date: "Mar-16", wecp: "—", cap: "61.6", real: "119.5", unreal: "—", tot: "119.5", moic: "1.9x", irr: "104.6%", s: "unrealized" },
            { name: "IPA Cold Transfer", date: "Jan-12", wecp: "82.0%", cap: "140.5", real: "68.6", unreal: "—", tot: "68.6", moic: "0.5x", irr: "(46.1%)", s: "unrealized" },
            { name: "DoubleFace Skin Wealth", date: "Nov-15", wecp: "83.7%", cap: "66.8", real: "—", unreal: "—", tot: "—", moic: "0.0x", irr: "NM", s: "unrealized" },
        ];
        const isHL = (v) => highlightedValues.some(h => h && v && v.toString().includes(h));
        const vals = (r) => [r.date, r.wecp, r.cap, r.real, r.unreal, r.tot, r.moic, r.irr];
        const ths = ["($ in millions)", "Entry Date", `${fund.short} Ownership`, "Capital Invested", "Realized Proceeds", "Unrealized Value", "Total Value", "Multiple of Cost", "Gross IRR"];
        const SubRow = ({ label, data, bg }) => (
            <tr style={{ background: bg }}>
                <td colSpan={3} style={{ padding: `${5 * s}px ${6 * s}px`, color: "#fff", fontSize: `${9.5 * s}px`, fontWeight: 700 }}>{label}</td>
                {data.map((v, i) => <td key={i} style={{ padding: `${5 * s}px ${6 * s}px`, color: "#fff", fontSize: `${10 * s}px`, fontWeight: 700, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{v}</td>)}
            </tr>
        );
        return (
            <div style={base}>
                <Header />
                <div style={{ padding: `${16 * s}px ${24 * s}px` }}>
                    <p style={{ fontSize: `${11 * s}px`, color: "#4B5563", marginBottom: `${12 * s}px`, lineHeight: 1.6 }}>
                        The table below summarizes Fund VII's investment performance as of June 30, 2020<sup>(a)</sup>.
                    </p>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: `${10 * s}px` }}>
                        <thead>
                            <tr style={{ background: "#1E0A3C" }}>
                                {ths.map((h, i) => <th key={i} style={{ padding: `${5 * s}px ${6 * s}px`, color: "#fff", fontWeight: 600, fontSize: `${8.5 * s}px`, textAlign: i === 0 ? "left" : "right", borderRight: i < 8 ? "1px solid rgba(255,255,255,.08)" : "none", whiteSpace: "nowrap" }}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ background: "#EDE9FE" }}><td colSpan={9} style={{ padding: `${4 * s}px ${6 * s}px`, fontSize: `${9 * s}px`, fontWeight: 700, color: "#6B21A8" }}>Realized Investments</td></tr>
                            {T.filter(r => r.s === "realized").map((r, i) => {
                                const ra = activeCell?.asset === r.name;
                                return (
                                    <tr key={i} style={{ background: ra ? "#F5F3FF" : i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid #F1F5F9`, borderLeft: ra ? `3px solid #7C3AED` : "3px solid transparent" }}>
                                        <td style={{ padding: `${5 * s}px ${6 * s}px`, fontWeight: 600, color: ra ? "#7C3AED" : "#1E293B", whiteSpace: "nowrap" }}><HL text={r.name} /></td>
                                        {vals(r).map((v, vi) => { const hi = isHL(v); return <td key={vi} style={{ padding: `${5 * s}px ${6 * s}px`, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace", background: hi ? "rgba(251,191,36,.25)" : "transparent", outline: hi ? `2px solid #FBBF24` : "none", outlineOffset: -1, fontWeight: hi ? 700 : 400, color: hi ? "#78350F" : "#374151", transition: "all .15s" }}><HL text={v} /></td>; })}
                                    </tr>
                                );
                            })}
                            <SubRow label="Realized Investments(b)" data={["$658.8", "$1,374.3", "$2.3", "$1,376.6", "2.1x", "40.8%"]} bg="#7C3AED" />
                            <tr style={{ background: "#ECFDF5" }}><td colSpan={9} style={{ padding: `${4 * s}px ${6 * s}px`, fontSize: `${9 * s}px`, fontWeight: 700, color: "#065F46" }}>Unrealized Investments</td></tr>
                            {T.filter(r => r.s === "unrealized").map((r, i) => {
                                const ra = activeCell?.asset === r.name;
                                return (
                                    <tr key={i} style={{ background: ra ? "#F5F3FF" : i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: `1px solid #F1F5F9`, borderLeft: ra ? `3px solid #7C3AED` : "3px solid transparent" }}>
                                        <td style={{ padding: `${5 * s}px ${6 * s}px`, fontWeight: 600, color: ra ? "#7C3AED" : "#1E293B", whiteSpace: "nowrap" }}><HL text={r.name} /></td>
                                        {vals(r).map((v, vi) => { const hi = isHL(v); return <td key={vi} style={{ padding: `${5 * s}px ${6 * s}px`, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace", background: hi ? "rgba(251,191,36,.25)" : "transparent", outline: hi ? `2px solid #FBBF24` : "none", outlineOffset: -1, fontWeight: hi ? 700 : 400, color: hi ? "#78350F" : "#374151" }}><HL text={v} /></td>; })}
                                    </tr>
                                );
                            })}
                            <SubRow label="Unrealized Investments" data={["$499.8", "$254.3", "$594.3", "$848.6", "1.7x", "14.4%"]} bg="#059669" />
                            <tr style={{ background: "#1E0A3C" }}>
                                <td colSpan={3} style={{ padding: `${6 * s}px ${6 * s}px`, color: "#fff", fontSize: `${10.5 * s}px`, fontWeight: 800 }}>Total Investments</td>
                                {["$1,158.7", "$1,628.6", "$596.6", "$2,225.2", "1.9x", "26.1%"].map((v, i) => (
                                    <td key={i} style={{ padding: `${6 * s}px ${6 * s}px`, color: "#fff", fontSize: `${10.5 * s}px`, fontWeight: 800, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{v}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                    <div style={{ marginTop: 14 * s, paddingTop: 10 * s, borderTop: `1px solid #E2E8F0` }}>
                        {["(a) Past performance of WECP or any other investments described herein are provided for illustrative purposes only.",
                            "(b) Capital invested represents aggregate capital invested by WECP, as applicable, in each portfolio company.",
                            "(c) Realized Proceeds represents the sum of all net proceeds generated from dispositions.",
                            "(d) Realized investments reflect all investments that have been exited or substantially exited as of June 30, 2020."
                        ].map((fn, i) => <p key={i} style={{ fontSize: `${8 * s}px`, color: "#9CA3AF", lineHeight: 1.5, marginBottom: 3 * s }}>{fn}</p>)}
                    </div>
                </div>
            </div>
        );
    }

    const gMap = { 1: { t: "Cover Page", i: "📋", d: `${fund.name} · ${fund.reportDate}` }, 2: { t: "Table of Contents", i: "📑", d: "Document navigation index" }, 3: { t: "Executive Summary", i: "📊", d: "Key performance highlights and fund status" }, 5: { t: "Asset Detail — Local Standing & Move", i: "🏦", d: "Portfolio company deep dive" }, 6: { t: "Asset Detail — Great Sea Smoothing", i: "🌊", d: "Portfolio company deep dive" }, 7: { t: "Asset Detail — Watchmen International", i: "🔐", d: "Portfolio company deep dive" }, 8: { t: "Asset Detail — Expert Crew", i: "⚙️", d: "Portfolio company deep dive" } };
    const g = gMap[page] || { t: `Page ${page}`, i: "📄", d: "" };
    return (
        <div style={base}>
            <Header />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500 * s, gap: 12 * s, padding: 40 * s }}>
                <div style={{ fontSize: 40 * s }}>{g.i}</div>
                <div style={{ fontSize: 18 * s, fontWeight: 700, color: "#1E293B", textAlign: "center" }}>{g.t}</div>
                <div style={{ fontSize: 12 * s, color: "#64748B" }}>{g.d}</div>
                <div style={{ marginTop: 8 * s, padding: `${10 * s}px ${16 * s}px`, background: "#F8F5FF", border: `1px solid #DDD6FE`, borderRadius: 8 * s, fontSize: 11 * s, color: "#7C3AED", textAlign: "center" }}>Navigate to <strong>page 4</strong> to see the performance table with interactive highlighting</div>
            </div>
        </div>
    );
}
