import { useState, useRef, useCallback, useEffect } from "react";

// ─── Color tokens (light theme) ───────────────────────────────────────────────
// BG:    #FFFFFF page  |  #F8F9FB panels  |  #F1F3F7 table stripes
// Text:  #111827 primary  |  #374151 secondary  |  #6B7280 muted  |  #9CA3AF placeholder
// Brand: #6C3AED purple  |  #5B21B6 dark purple
// Border: #E5E7EB default  |  #D1D5DB strong

const C = {
  bg:       "#FFFFFF",
  bgPanel:  "#F8F9FB",
  bgStripe: "#F9FAFB",
  bgHover:  "#F3F4F6",
  bgActive: "#F5F3FF",
  nav:      "#1E0A3C",
  navText:  "#FFFFFF",
  brand:    "#6C3AED",
  brandDark:"#5B21B6",
  brandLight:"#EDE9FE",
  border:   "#E5E7EB",
  borderStrong: "#D1D5DB",
  text:     "#111827",
  textSec:  "#374151",
  textMuted:"#6B7280",
  textDim:  "#9CA3AF",
  green:    "#059669",
  greenBg:  "#ECFDF5",
  greenText:"#065F46",
  red:      "#DC2626",
  redBg:    "#FEF2F2",
  redText:  "#991B1B",
  amber:    "#D97706",
  amberBg:  "#FFFBEB",
  amberText:"#92400E",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const FUNDS = [
  { id:"f1", name:"Wayne Enterprises Capital Partners VII", short:"WECP VII", manager:"Wayne Capital Management", vintage:2020, strategy:"Buyout", size:"$2.4B", currency:"USD", status:"Active", reportDate:"Q2 2020", assetsCount:7, nav:"$3.1B", irr:"18.4%", tvpi:"1.62x" },
  { id:"f2", name:"Apollo Growth Fund IV", short:"AGF IV", manager:"Apollo Capital", vintage:2019, strategy:"Growth Equity", size:"$1.8B", currency:"USD", status:"Active", reportDate:"Q3 2024", assetsCount:4, nav:"$2.4B", irr:"21.2%", tvpi:"1.88x" },
  { id:"f3", name:"KKR Infrastructure III", short:"KKR Infra III", manager:"KKR & Co.", vintage:2018, strategy:"Infrastructure", size:"$3.2B", currency:"USD", status:"Harvesting", reportDate:"Q4 2023", assetsCount:3, nav:"$4.0B", irr:"21.1%", tvpi:"1.95x" },
  { id:"f4", name:"Blackstone Real Assets II", short:"BRA II", manager:"Blackstone Group", vintage:2021, strategy:"Real Assets", size:"$5.1B", currency:"USD", status:"Deploying", reportDate:"Q1 2024", assetsCount:5, nav:"$5.3B", irr:"12.8%", tvpi:"1.24x" },
];

const ASSETS_BY_FUND = {
  f1:["Local Standing & Move","Great Sea Smoothing","Watchmen International","Expert Crew","Winter Capital III","IPA Cold Transfer","DoubleFace Skin Wealth"],
  f2:["TechCorp Holdings","MedLife Sciences","RetailMax Group","Cosmos Products"],
  f3:["Pacific Port Authority","Nordic Power Grid","Iberian Toll Roads"],
  f4:["Logistics Hub Alpha","Energy Transition Co","Metro Office REIT","Harbor Freight Trust","Sunbelt Industrial"],
};

const TAB_DESCRIPTIONS = {
  "ASSET INVESTMENT": "Deal-level investment data extracted from the report — entry dates, capital deployed, distributions received, and return multiples per portfolio company.",
  "ASSET PERFORMANCE": "Operational & financial KPIs for each portfolio company — revenue, EBITDA, margins and growth rates sourced from portfolio monitoring sections.",
  "FUND": "Fund-level ownership and attribution metrics — % ownership, cost basis and total value attributable to this fund (vs. co-investors).",
  "STATIC": "Firmographic & profile data for each portfolio company — sector, geography, leadership, headcount. Rarely changes between reports.",
  "STATIC (FREE METRICS)": "User-defined custom fields that are not part of Accelex's standard extraction schema. Add any bespoke metrics your team tracks.",
};

const METRICS_BY_TYPE = {
  "ASSET INVESTMENT":      ["Entry date","Total capital invested","Total distributions","Residual value (FMV)","Total value","Multiple on invested capital (MOIC)","Asset IRR"],
  "ASSET PERFORMANCE":     ["Revenue (LTM)","EBITDA (LTM)","EBITDA Margin","Net Revenue Growth YoY","Net Debt / EBITDA","EV / EBITDA","Gross Margin %"],
  "FUND":                  ["Fund Ownership %","Cost (fund share)","Realized Proceeds","Unrealized Value","Total Value (fund)","Multiple of Cost","Gross IRR"],
  "STATIC":                ["Country","Sector","CEO","Founded Year","Employees","HQ City","Website"],
  "STATIC (FREE METRICS)": ["ESG Score","Board Seats Held","Co-investors","Deal Type","Hold Period (yrs)"],
};

const ASSET_DATA = {
  "Local Standing & Move": {
    "ASSET INVESTMENT":      { "Entry date":"2012/12/31","Total capital invested":"77,500,000","Total distributions":"236,400,000","Residual value (FMV)":"0","Total value":"236,400,000","Multiple on invested capital (MOIC)":"3.1","Asset IRR":"51.5%" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"142,000,000","EBITDA (LTM)":"48,200,000","EBITDA Margin":"33.9%","Net Revenue Growth YoY":"","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":"" },
    "FUND":                  { "Fund Ownership %":"87.8%","Cost (fund share)":"77.5","Realized Proceeds":"236.4","Unrealized Value":"—","Total Value (fund)":"236.4","Multiple of Cost":"3.1x","Gross IRR":"51.5%" },
    "STATIC":                { "Country":"USA","Sector":"Finance","CEO":"Marcus Dane","Founded Year":"2001","Employees":"1,240","HQ City":"New York, NY","Website":"localstanding.com" },
    "STATIC (FREE METRICS)": { "ESG Score":"B+","Board Seats Held":"2","Co-investors":"Warburg Pincus","Deal Type":"Control Buyout","Hold Period (yrs)":"8.1" },
  },
  "Great Sea Smoothing": {
    "ASSET INVESTMENT":      { "Entry date":"2014/05/31","Total capital invested":"62,200,000","Total distributions":"171,900,000","Residual value (FMV)":"2,300,000","Total value":"174,200,000","Multiple on invested capital (MOIC)":"2.8","Asset IRR":"48.6%" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"98,400,000","EBITDA (LTM)":"29,100,000","EBITDA Margin":"29.6%","Net Revenue Growth YoY":"+12%","Net Debt / EBITDA":"1.2x","EV / EBITDA":"8.4x","Gross Margin %":"54%" },
    "FUND":                  { "Fund Ownership %":"70.2%","Cost (fund share)":"62.2","Realized Proceeds":"171.9","Unrealized Value":"2.3","Total Value (fund)":"174.2","Multiple of Cost":"2.8x","Gross IRR":"48.6%" },
    "STATIC":                { "Country":"UK","Sector":"Consumer","CEO":"Rachel Obi","Founded Year":"2008","Employees":"890","HQ City":"London, UK","Website":"greatseagroup.co.uk" },
    "STATIC (FREE METRICS)": { "ESG Score":"A-","Board Seats Held":"1","Co-investors":"EQT","Deal Type":"Growth Buyout","Hold Period (yrs)":"6.1" },
  },
  "Watchmen International": {
    "ASSET INVESTMENT":      { "Entry date":"2014/10/31","Total capital invested":"85,100,000","Total distributions":"259,400,000","Residual value (FMV)":"0","Total value":"259,400,000","Multiple on invested capital (MOIC)":"3.0","Asset IRR":"78.5%" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"310,000,000","EBITDA (LTM)":"92,000,000","EBITDA Margin":"29.7%","Net Revenue Growth YoY":"+19%","Net Debt / EBITDA":"0.8x","EV / EBITDA":"9.1x","Gross Margin %":"61%" },
    "FUND":                  { "Fund Ownership %":"61.5%","Cost (fund share)":"85.1","Realized Proceeds":"259.4","Unrealized Value":"—","Total Value (fund)":"259.4","Multiple of Cost":"3.0x","Gross IRR":"78.5%" },
    "STATIC":                { "Country":"USA","Sector":"Security","CEO":"Bruce W.","Founded Year":"1999","Employees":"4,200","HQ City":"Gotham, NJ","Website":"watchmen-intl.com" },
    "STATIC (FREE METRICS)": { "ESG Score":"A","Board Seats Held":"3","Co-investors":"Vista Equity","Deal Type":"Carve-out","Hold Period (yrs)":"5.7" },
  },
  "Expert Crew": {
    "ASSET INVESTMENT":      { "Entry date":"2015/08/31","Total capital invested":"163,100,000","Total distributions":"518,500,000","Residual value (FMV)":"0","Total value":"518,500,000","Multiple on invested capital (MOIC)":"3.2","Asset IRR":"156.7%" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"580,000,000","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"+28%","Net Debt / EBITDA":"","EV / EBITDA":"11.2x","Gross Margin %":"" },
    "FUND":                  { "Fund Ownership %":"56.3%","Cost (fund share)":"163.1","Realized Proceeds":"518.5","Unrealized Value":"—","Total Value (fund)":"518.5","Multiple of Cost":"3.2x","Gross IRR":"156.7%" },
    "STATIC":                { "Country":"Germany","Sector":"Services","CEO":"Hans Richter","Founded Year":"2005","Employees":"12,800","HQ City":"Munich, DE","Website":"expertcrew.de" },
    "STATIC (FREE METRICS)": { "ESG Score":"B","Board Seats Held":"2","Co-investors":"Apax Partners","Deal Type":"Secondary Buyout","Hold Period (yrs)":"4.9" },
  },
  "Winter Capital III": {
    "ASSET INVESTMENT":      { "Entry date":"2016/03/18","Total capital invested":"61,600,000","Total distributions":"","Residual value (FMV)":"","Total value":"119,500,000","Multiple on invested capital (MOIC)":"1.9","Asset IRR":"104.6%" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"210,000,000","EBITDA (LTM)":"71,000,000","EBITDA Margin":"33.8%","Net Revenue Growth YoY":"+7%","Net Debt / EBITDA":"2.1x","EV / EBITDA":"","Gross Margin %":"" },
    "FUND":                  { "Fund Ownership %":"","Cost (fund share)":"","Realized Proceeds":"","Unrealized Value":"119.5","Total Value (fund)":"119.5","Multiple of Cost":"1.9x","Gross IRR":"104.6%" },
    "STATIC":                { "Country":"France","Sector":"Finance","CEO":"Claire Moreau","Founded Year":"2010","Employees":"620","HQ City":"Paris, FR","Website":"wintercap3.fr" },
    "STATIC (FREE METRICS)": { "ESG Score":"","Board Seats Held":"1","Co-investors":"","Deal Type":"Platform Build","Hold Period (yrs)":"4.3" },
  },
  "IPA Cold Transfer": {
    "ASSET INVESTMENT":      { "Entry date":"2012/01/01","Total capital invested":"140,500,000","Total distributions":"68,600,000","Residual value (FMV)":"","Total value":"68,600,000","Multiple on invested capital (MOIC)":"0.5","Asset IRR":"(46.1%)" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"-8%","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":"" },
    "FUND":                  { "Fund Ownership %":"82.0%","Cost (fund share)":"140.5","Realized Proceeds":"68.6","Unrealized Value":"—","Total Value (fund)":"68.6","Multiple of Cost":"0.5x","Gross IRR":"(46.1%)" },
    "STATIC":                { "Country":"USA","Sector":"Tech","CEO":"Sandra Lee","Founded Year":"2007","Employees":"340","HQ City":"Austin, TX","Website":"ipacold.com" },
    "STATIC (FREE METRICS)": { "ESG Score":"C","Board Seats Held":"2","Co-investors":"None","Deal Type":"Control Buyout","Hold Period (yrs)":"8.5" },
  },
  "DoubleFace Skin Wealth": {
    "ASSET INVESTMENT":      { "Entry date":"2015/11/01","Total capital invested":"66,800,000","Total distributions":"","Residual value (FMV)":"","Total value":"","Multiple on invested capital (MOIC)":"0.0","Asset IRR":"NM" },
    "ASSET PERFORMANCE":     { "Revenue (LTM)":"","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":"" },
    "FUND":                  { "Fund Ownership %":"83.7%","Cost (fund share)":"66.8","Realized Proceeds":"","Unrealized Value":"","Total Value (fund)":"","Multiple of Cost":"0.0x","Gross IRR":"NM" },
    "STATIC":                { "Country":"Japan","Sector":"Beauty","CEO":"Yuki Tanaka","Founded Year":"2013","Employees":"180","HQ City":"Tokyo, JP","Website":"doublefaceskin.jp" },
    "STATIC (FREE METRICS)": { "ESG Score":"","Board Seats Held":"1","Co-investors":"","Deal Type":"Minority Growth","Hold Period (yrs)":"4.6" },
  },
};

const ASSET_META = {
  "Local Standing & Move":   { icon:"🏦", color:"#6366F1", sector:"Finance",    country:"USA",      status:"Realized" },
  "Great Sea Smoothing":     { icon:"🌊", color:"#059669", sector:"Consumer",   country:"UK",       status:"Realized" },
  "Watchmen International":  { icon:"🔐", color:"#D97706", sector:"Security",   country:"USA",      status:"Realized" },
  "Expert Crew":             { icon:"⚙️", color:"#DB2777", sector:"Services",   country:"Germany",  status:"Realized" },
  "Winter Capital III":      { icon:"❄️", color:"#2563EB", sector:"Finance",    country:"France",   status:"Unrealized" },
  "IPA Cold Transfer":       { icon:"💊", color:"#DC2626", sector:"Tech",       country:"USA",      status:"Unrealized" },
  "DoubleFace Skin Wealth":  { icon:"✨", color:"#7C3AED", sector:"Beauty",     country:"Japan",    status:"Unrealized" },
  "TechCorp Holdings":       { icon:"💻", color:"#0891B2", sector:"Tech",       country:"USA",      status:"Active" },
  "MedLife Sciences":        { icon:"🧬", color:"#059669", sector:"Healthcare", country:"Germany",  status:"Active" },
  "RetailMax Group":         { icon:"🛒", color:"#EA580C", sector:"Consumer",   country:"UK",       status:"Active" },
  "Cosmos Products":         { icon:"🚀", color:"#7C3AED", sector:"Tech",       country:"USA",      status:"Active" },
  "Pacific Port Authority":  { icon:"⚓", color:"#0284C7", sector:"Transport",  country:"Australia",status:"Active" },
  "Nordic Power Grid":       { icon:"⚡", color:"#CA8A04", sector:"Utilities",  country:"Sweden",   status:"Active" },
  "Iberian Toll Roads":      { icon:"🛣️", color:"#16A34A", sector:"Transport",  country:"Spain",    status:"Active" },
};

// ─── Resizable hook ───────────────────────────────────────────────────────────
function useResizable(initial = 46, min = 26, max = 74) {
  const [pct, setPct] = useState(initial);
  const dragging = useRef(false);
  const containerRef = useRef(null);
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setPct(Math.min(max, Math.max(min, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [min, max]);
  return { pct, containerRef, onMouseDown };
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selectedFund, setSelectedFund] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [metricType, setMetricType]     = useState("ASSET INVESTMENT");
  const [filter, setFilter]             = useState("all");
  const [highlightMode, setHighlightMode] = useState("single");
  const [activeCell, setActiveCell]     = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [expandedAssets, setExpandedAssets] = useState(new Set());
  const [pdfPage, setPdfPage]           = useState(4);
  const [zoom, setZoom]                 = useState(100);
  const [searchQ, setSearchQ]           = useState("");
  const [showTabInfo, setShowTabInfo]   = useState(false);
  const { pct, containerRef, onMouseDown } = useResizable(46, 26, 74);

  function handleSelectFund(fund) {
    setLoading(true);
    setTimeout(() => {
      setSelectedFund(fund);
      setLoading(false);
      setMetricType("ASSET INVESTMENT");
      setFilter("all");
      setActiveCell(null);
      setEditedValues({});
      setExpandedAssets(new Set());
      setPdfPage(4);
    }, 800);
  }

  function getValue(asset, metric) {
    const key = `${asset}__${metric}`;
    if (key in editedValues) return editedValues[key];
    return (ASSET_DATA[asset]?.[metricType]?.[metric]) ?? "";
  }
  function setValue(asset, metric, val) {
    setEditedValues(prev => ({ ...prev, [`${asset}__${metric}`]: val }));
    if (val.trim()) setActiveCell({ asset, metric });
  }
  function isModified(asset, metric) {
    const key = `${asset}__${metric}`;
    if (!(key in editedValues)) return false;
    return editedValues[key] !== ((ASSET_DATA[asset]?.[metricType]?.[metric]) ?? "");
  }

  const assets  = ASSETS_BY_FUND[selectedFund?.id] || [];
  const metrics = METRICS_BY_TYPE[metricType] || [];

  const allRows = assets.flatMap(asset =>
    metrics.map(metric => {
      const val = getValue(asset, metric);
      return { id:`${asset}__${metric}`, asset, metric, value:val, status: val?.trim() ? "found" : "not_found", modified: isModified(asset, metric) };
    })
  );
  const foundRows   = allRows.filter(r => r.status === "found");
  const missingRows = allRows.filter(r => r.status === "not_found");
  let filtered = filter === "found" ? foundRows : filter === "not_found" ? missingRows : allRows;
  if (searchQ) filtered = filtered.filter(r => r.asset.toLowerCase().includes(searchQ.toLowerCase()) || r.metric.toLowerCase().includes(searchQ.toLowerCase()));

  function assetProgress(asset) {
    const vals = metrics.map(m => getValue(asset, m));
    const filled = vals.filter(v => v?.trim()).length;
    return { filled, total: metrics.length, pct: metrics.length ? Math.round(filled / metrics.length * 100) : 0 };
  }

  const highlightedValues = (() => {
    if (highlightMode === "none") return [];
    if (highlightMode === "single" && activeCell) return [getValue(activeCell.asset, activeCell.metric)].filter(Boolean);
    if (highlightMode === "current_filter") return filtered.filter(r => r.value).map(r => r.value);
    if (highlightMode === "all") return allRows.filter(r => r.value).map(r => r.value);
    return [];
  })();

  const TABS = Object.keys(METRICS_BY_TYPE);

  if (loading)       return <LoadingScreen />;
  if (!selectedFund) return <FundSelectionScreen onSelect={handleSelectFund} />;

  // ─── MAIN DASHBOARD ──────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'IBM Plex Sans','Helvetica Neue',sans-serif", background:C.bg, minHeight:"100vh", display:"flex", flexDirection:"column", fontSize:13, color:C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#F3F4F6;}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px;}
        ::-webkit-scrollbar-thumb:hover{background:#9CA3AF;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseHL{0%,100%{box-shadow:0 0 0 0 rgba(217,119,6,.4)}60%{box-shadow:0 0 0 5px rgba(217,119,6,0)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
        .tab-btn:hover{color:${C.brand}!important;background:${C.brandLight}!important;}
        .asset-hdr:hover{background:#F3F4F6!important;}
        .row-hover:hover .rc{background:#F0EEFF!important;}
        .chip:hover{border-color:${C.brand}!important;color:${C.brand}!important;}
        .dh:hover .dl{background:${C.brand}!important;}
        .dh:hover .dg{color:${C.brand}!important;border-color:${C.brand}!important;}
        .nav-link:hover{color:#C4B5FD!important;}
        .fund-card:hover{border-color:${C.brand}!important;box-shadow:0 4px 20px rgba(108,58,237,.12)!important;transform:translateY(-2px);}
        .fund-card{transition:all .2s ease;}
        .val-input{background:transparent;border:none;outline:none;width:100%;color:${C.text};font-family:'IBM Plex Mono',monospace;font-size:11px;font-weight:500;cursor:text;padding:1px 3px;border-radius:3px;}
        .val-input:focus{background:#F5F3FF;outline:1.5px solid ${C.brand};color:${C.text};}
        .val-input.empty{color:${C.textDim};font-style:italic;font-weight:400;}
        .val-input.empty::placeholder{color:#C4CBDA;}
        .val-input.filled{color:${C.text};}
        .val-input.modified{color:${C.amber}!important;background:${C.amberBg}!important;outline:1.5px solid #FCD34D!important;}
        input[type=checkbox]{accent-color:${C.brand};cursor:pointer;}
      `}</style>

      {/* ── TOP NAV ── */}
      <div style={{ background:C.nav, display:"flex", alignItems:"center", padding:"0 20px", height:50, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:28, cursor:"pointer" }} onClick={()=>setSelectedFund(null)}>
          <div style={{ width:28,height:28,background:"linear-gradient(135deg,#7C3AED,#A855F7)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff" }}>A</div>
          <span style={{ color:"#fff",fontWeight:700,fontSize:14,letterSpacing:"-0.3px" }}>accelex</span>
        </div>
        {["DASHBOARD","DOCUMENTS","TRACKER","AUDIT","FILTERS","REFERENCE"].map(n=>(
          <button key={n} className="nav-link" style={{ background:"none",border:"none",color:n==="DOCUMENTS"?"#E9D5FF":"rgba(255,255,255,.45)",fontFamily:"inherit",fontSize:10.5,fontWeight:700,letterSpacing:"0.7px",padding:"0 12px",height:"100%",cursor:"pointer",borderBottom:n==="DOCUMENTS"?"2px solid #A855F7":"2px solid transparent",transition:"color .15s" }}>{n}</button>
        ))}
        <div style={{ flex:1 }}/>
        <button onClick={()=>setSelectedFund(null)} style={{ background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:6,padding:"4px 11px",fontSize:11,color:"rgba(255,255,255,.7)",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5,marginRight:10 }}>
          <span>‹</span> All Funds
        </button>
        <div style={{ background:"rgba(167,139,250,.2)",border:"1px solid rgba(167,139,250,.35)",borderRadius:6,padding:"4px 11px",fontSize:11,color:"#DDD6FE",fontWeight:600 }}>📁 {selectedFund.short}</div>
        <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",marginLeft:10 }}>BL</div>
      </div>

      {/* ── STEPS + BREADCRUMB ── */}
      <div style={{ background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 20px",height:40,flexShrink:0 }}>
        {[{n:1,l:"CONFIRM NETWORK"},{n:2,l:"VALIDATE METRICS"}].map(({n,l})=>(
          <div key={n} style={{ display:"flex",alignItems:"center",gap:7,padding:"0 14px 0 0",height:"100%",borderBottom:n===2?`2px solid ${C.brand}`:"2px solid transparent" }}>
            <div style={{ width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,background:n===2?C.brand:"#10B981",color:"#fff",flexShrink:0 }}>{n===1?"✓":n}</div>
            <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.7px",color:n===2?C.brand:C.textMuted }}>{l}</span>
          </div>
        ))}
        <div style={{ width:1,height:18,background:C.border,margin:"0 14px 0 4px" }}/>
        <span style={{ fontSize:11,color:C.textMuted }}>{selectedFund.name}</span>
        <span style={{ fontSize:11,color:C.textDim,margin:"0 5px" }}>›</span>
        <span style={{ fontSize:11,color:C.textMuted }}>{selectedFund.reportDate} Fund Report</span>
        <div style={{ flex:1 }}/>
        {[["Total",allRows.length,C.textSec],["Found",foundRows.length,C.green],["Missing",missingRows.length,C.red]].map(([l,v,col])=>(
          <div key={l} style={{ display:"flex",alignItems:"center",gap:4,marginLeft:16 }}>
            <span style={{ fontSize:9,color:C.textDim,fontWeight:600 }}>{l}</span>
            <span style={{ fontSize:12,fontWeight:700,color:col,fontFamily:"'IBM Plex Mono',monospace" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* ── METRIC TYPE TABS ── */}
      <div style={{ background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"stretch",padding:"0 20px",flexShrink:0,gap:1 }}>
        {TABS.map(tab=>(
          <button key={tab} className="tab-btn" onClick={()=>{setMetricType(tab);setActiveCell(null);}} style={{ background:metricType===tab?C.brandLight:"transparent",border:"none",borderBottom:metricType===tab?`2px solid ${C.brand}`:"2px solid transparent",marginBottom:"-1px",padding:"9px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.3px",color:metricType===tab?C.brand:C.textMuted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",borderRadius:"4px 4px 0 0",whiteSpace:"nowrap" }}>{tab}</button>
        ))}
        <button onClick={()=>setShowTabInfo(p=>!p)} style={{ background:"none",border:"none",color:showTabInfo?C.brand:C.textDim,cursor:"pointer",fontSize:14,padding:"0 8px",display:"flex",alignItems:"center",transition:"color .15s" }} title="What does this tab show?">ⓘ</button>
      </div>

      {/* TAB INFO */}
      {showTabInfo && (
        <div style={{ background:C.brandLight,border:`1px solid #DDD6FE`,borderRadius:8,padding:"10px 16px",margin:"8px 20px",fontSize:12,color:C.brand,lineHeight:1.6,flexShrink:0,animation:"fadeUp .15s ease" }}>
          <strong>{metricType}:</strong> {TAB_DESCRIPTIONS[metricType]}
          <button onClick={()=>setShowTabInfo(false)} style={{ float:"right",background:"none",border:"none",color:C.brand,cursor:"pointer",fontSize:14,marginLeft:8,fontWeight:700 }}>✕</button>
        </div>
      )}

      {/* ── FILTER BAR ── */}
      <div style={{ background:C.bgPanel,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:6,padding:"8px 20px",flexShrink:0 }}>
        {[{k:"all",l:"All",c:allRows.length},{k:"not_found",l:"Missing",c:missingRows.length,col:C.red},{k:"found",l:"Found",c:foundRows.length,col:C.green}].map(({k,l,c,col})=>(
          <button key={k} className="chip" onClick={()=>setFilter(k)} style={{ background:filter===k?(col?`${col}12`:C.brandLight):C.bg,border:`1.5px solid ${filter===k?(col||C.brand):C.border}`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",color:filter===k?(col||C.brand):C.textMuted,transition:"all .15s",display:"flex",alignItems:"center",gap:4 }}>
            {col&&filter===k&&<span style={{ width:5,height:5,borderRadius:"50%",background:col,display:"inline-block" }}/>}
            {l} <strong>{c}</strong>
          </button>
        ))}
        <div style={{ flex:1 }}/>
        <div style={{ display:"flex",alignItems:"center",gap:6,background:C.bg,border:`1px solid ${C.border}`,borderRadius:7,padding:"5px 10px" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Search assets or metrics…" style={{ background:"none",border:"none",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none",width:160 }}/>
          {searchQ&&<button onClick={()=>setSearchQ("")} style={{ background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:12,padding:0 }}>✕</button>}
        </div>
        <button style={{ background:C.brand,border:"none",borderRadius:7,padding:"5px 13px",fontSize:11,color:"#fff",fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>+ Add manually</button>
      </div>

      {/* ── MAIN SPLIT ── */}
      <div ref={containerRef} style={{ flex:1,display:"flex",overflow:"hidden",minHeight:0 }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width:`${pct}%`,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden",flexShrink:0 }}>

          {/* Column headers */}
          <div style={{ display:"grid",gridTemplateColumns:"30px 140px 1fr 1fr 34px",background:C.bgPanel,borderBottom:`1px solid ${C.border}`,flexShrink:0,userSelect:"none" }}>
            {[{l:""},{l:"ASSET"},{l:"METRIC"},{l:"VALUE  (editable)"},{l:"PG"}].map((h,i)=>(
              <div key={i} style={{ padding:"7px 8px",fontSize:9,fontWeight:700,color:C.textDim,letterSpacing:"0.7px",borderRight:i<4?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center" }}>
                {i===0?<input type="checkbox" style={{ width:12,height:12 }}/>:h.l}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex:1,overflowY:"auto" }}>
            {assets.map(asset => {
              const meta = ASSET_META[asset] || { icon:"🏢",color:C.brand,sector:"—",country:"—",status:"—" };
              const prog = assetProgress(asset);
              const expanded = expandedAssets.has(asset);

              const displayRows = metrics.map(metric => ({
                id:`${asset}__${metric}`, asset, metric,
                value: getValue(asset,metric),
                status: getValue(asset,metric)?.trim() ? "found" : "not_found",
                modified: isModified(asset,metric)
              })).filter(r => filter === "found" ? r.status==="found" : filter === "not_found" ? r.status==="not_found" : true)
                .filter(r => !searchQ || r.metric.toLowerCase().includes(searchQ.toLowerCase()) || r.asset.toLowerCase().includes(searchQ.toLowerCase()));

              if (searchQ && displayRows.length === 0) return null;
              if (filter !== "all" && displayRows.length === 0) return null;

              const statusCol = meta.status==="Realized"?C.green : meta.status==="Unrealized"?C.brand : C.amber;
              const statusBg  = meta.status==="Realized"?C.greenBg : meta.status==="Unrealized"?C.brandLight : C.amberBg;

              return (
                <div key={asset} style={{ borderBottom:`1px solid ${C.border}`,animation:"fadeUp .2s ease" }}>
                  {/* Asset header */}
                  <div className="asset-hdr" onClick={()=>setExpandedAssets(p=>{const n=new Set(p);n.has(asset)?n.delete(asset):n.add(asset);return n;})}
                    style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",cursor:"pointer",background:expanded?C.bgPanel:C.bg,transition:"background .12s",borderLeft:`3px solid ${expanded?meta.color:"transparent"}` }}>
                    <span style={{ fontSize:11,color:expanded?C.brand:C.textDim,flexShrink:0,width:12,transition:"color .15s" }}>{expanded?"▾":"▸"}</span>
                    <div style={{ width:26,height:26,borderRadius:7,background:`${meta.color}18`,border:`1px solid ${meta.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>{meta.icon}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:12,fontWeight:600,color:expanded?C.text:C.textSec,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{asset}</div>
                      <div style={{ display:"flex",gap:5,marginTop:2,alignItems:"center" }}>
                        <span style={{ fontSize:9,color:C.textDim }}>{meta.sector}</span>
                        <span style={{ fontSize:9,color:C.border }}>·</span>
                        <span style={{ fontSize:9,color:C.textDim }}>{meta.country}</span>
                        <span style={{ fontSize:9,padding:"1px 5px",borderRadius:3,background:statusBg,color:statusCol,fontWeight:600,marginLeft:1 }}>{meta.status}</span>
                      </div>
                    </div>
                    {/* Progress */}
                    <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                        <span style={{ fontSize:10,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:prog.pct===100?C.green:prog.pct>50?C.amber:C.red }}>{prog.pct}%</span>
                        <span style={{ fontSize:9,color:C.textDim }}>{prog.filled}/{prog.total}</span>
                      </div>
                      <div style={{ width:52,height:3,background:C.border,borderRadius:2 }}>
                        <div style={{ width:`${prog.pct}%`,height:"100%",borderRadius:2,background:prog.pct===100?C.green:prog.pct>50?C.amber:C.red,transition:"width .4s" }}/>
                      </div>
                    </div>
                  </div>

                  {/* Metric rows */}
                  {(expanded||!!searchQ) && displayRows.map((row,idx)=>{
                    const isActive = activeCell?.asset===asset && activeCell?.metric===row.metric;
                    return (
                      <div key={row.id} className="row-hover" onClick={()=>setActiveCell({asset,metric:row.metric})}
                        style={{ display:"grid",gridTemplateColumns:"30px 140px 1fr 1fr 34px",borderBottom:`1px solid #F3F4F6`,borderLeft:isActive?`3px solid ${C.brand}`:"3px solid transparent",background:isActive?C.bgActive:idx%2===0?C.bg:C.bgStripe,cursor:"pointer",transition:"border-left .1s" }}>
                        <div className="rc" onClick={e=>e.stopPropagation()} style={{ padding:"6px 8px",display:"flex",alignItems:"center",borderRight:`1px solid ${C.border}` }}>
                          <input type="checkbox" style={{ width:11,height:11 }}/>
                        </div>
                        <div className="rc" style={{ padding:"6px 8px",fontSize:10,color:C.textDim,borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",overflow:"hidden" }}>
                          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:9.5 }}>— {row.metric.length > 20 ? row.metric.slice(0,18)+"…" : ""}</span>
                        </div>
                        <div className="rc" style={{ padding:"6px 8px",fontSize:11,color:C.textSec,borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",overflow:"hidden" }}>
                          <span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{row.metric}</span>
                        </div>
                        {/* Editable value cell */}
                        <div className="rc" onClick={e=>e.stopPropagation()} style={{ padding:"4px 8px",borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:5 }}>
                          {row.status==="found"&&!row.modified && <span style={{ width:5,height:5,borderRadius:"50%",background:C.green,display:"inline-block",flexShrink:0 }}/>}
                          {row.modified && <span style={{ width:5,height:5,borderRadius:"50%",background:C.amber,display:"inline-block",flexShrink:0 }} title="Modified"/>}
                          {row.status==="not_found"&&!row.modified && <span style={{ width:5,height:5,borderRadius:"50%",background:C.border,display:"inline-block",flexShrink:0 }}/>}
                          <input
                            className={`val-input ${row.modified?"modified":row.status==="found"?"filled":"empty"}`}
                            value={row.value}
                            placeholder="not found — type to add"
                            onChange={e=>setValue(asset,row.metric,e.target.value)}
                            onClick={e=>{e.stopPropagation();setActiveCell({asset,metric:row.metric});}}
                          />
                        </div>
                        <div className="rc" style={{ padding:"6px 5px",fontSize:10,color:C.brand,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'IBM Plex Mono',monospace",fontWeight:600 }}>
                          {row.status==="found"||row.modified?"4":"—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Left footer */}
          <div style={{ padding:"7px 14px",borderTop:`1px solid ${C.border}`,background:C.bgPanel,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
            <span style={{ fontSize:10,color:C.textDim,fontFamily:"'IBM Plex Mono',monospace" }}>
              {allRows.length} rows · {foundRows.length} found · {missingRows.length} missing
            </span>
            {Object.keys(editedValues).length > 0 && (
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <span style={{ fontSize:10,color:C.amber,fontWeight:600 }}>⚡ {Object.keys(editedValues).length} edited</span>
                <button onClick={()=>setEditedValues({})} style={{ background:"none",border:"none",fontSize:10,color:C.textDim,cursor:"pointer",fontFamily:"inherit",textDecoration:"underline" }}>Reset</button>
              </div>
            )}
          </div>
        </div>

        {/* ── DRAG DIVIDER ── */}
        <div className="dh" onMouseDown={onMouseDown} style={{ width:8,background:"transparent",cursor:"col-resize",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:10,position:"relative" }}>
          <div className="dl" style={{ width:2,height:"100%",background:C.border,transition:"background .15s",position:"absolute" }}/>
          <div className="dg" style={{ background:C.bg,border:`1px solid ${C.borderStrong}`,borderRadius:4,padding:"5px 2px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:C.textDim,fontSize:5,zIndex:1,transition:"color .15s,border-color .15s",lineHeight:1 }}>
            {["●","●","●"].map((d,i)=><span key={i}>{d}</span>)}
          </div>
        </div>

        {/* ══ RIGHT PANEL: PDF ══ */}
        <div style={{ flex:1,display:"flex",flexDirection:"column",background:"#ECECF0",overflow:"hidden",minWidth:0 }}>
          {/* PDF breadcrumb */}
          <div style={{ background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            <div style={{ flex:1,overflow:"hidden",display:"flex",alignItems:"center",gap:5 }}>
              <span style={{ fontSize:11,color:C.brand,fontWeight:600,flexShrink:0 }}>{selectedFund.name}</span>
              <span style={{ color:C.textDim,flexShrink:0 }}>›</span>
              <span style={{ fontSize:11,color:C.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{selectedFund.short} - {selectedFund.reportDate} Fund Report.pdf · Performance Report · To Do</span>
            </div>
            <button style={{ background:C.bgPanel,border:`1px solid ${C.border}`,color:C.textMuted,padding:"4px 12px",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>BACK</button>
            <button style={{ background:C.brand,border:"none",color:"#fff",padding:"4px 14px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0 }}>FINISH</button>
          </div>

          {/* PDF toolbar */}
          <div style={{ background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"6px 16px",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap" }}>
            <span style={{ fontSize:9.5,color:C.textDim,fontWeight:700,letterSpacing:"0.5px" }}>SEARCH</span>
            <div style={{ display:"flex",alignItems:"center",gap:5,background:C.bgPanel,border:`1px solid ${C.border}`,borderRadius:5,padding:"3px 9px" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Find in document..." style={{ background:"none",border:"none",color:C.text,fontSize:11,fontFamily:"inherit",outline:"none",width:130 }}/>
            </div>
            <div style={{ width:1,height:16,background:C.border }}/>
            <span style={{ fontSize:9.5,color:C.textDim,fontWeight:700,letterSpacing:"0.5px" }}>VIEW</span>
            <div style={{ display:"flex",alignItems:"center",gap:1,background:C.bgPanel,border:`1px solid ${C.border}`,borderRadius:5,padding:"1px 2px" }}>
              <button onClick={()=>setZoom(z=>Math.max(50,z-10))} style={{ background:"none",border:"none",color:C.textMuted,cursor:"pointer",padding:"2px 7px",fontSize:14,fontFamily:"inherit" }}>−</button>
              <span style={{ fontSize:11,color:C.textSec,minWidth:38,textAlign:"center",fontFamily:"'IBM Plex Mono',monospace" }}>{zoom}%</span>
              <button onClick={()=>setZoom(z=>Math.min(200,z+10))} style={{ background:"none",border:"none",color:C.textMuted,cursor:"pointer",padding:"2px 7px",fontSize:14,fontFamily:"inherit" }}>+</button>
            </div>
            <div style={{ width:1,height:16,background:C.border }}/>
            <span style={{ fontSize:9.5,color:C.textDim,fontWeight:700,letterSpacing:"0.5px" }}>PAGE</span>
            <div style={{ display:"flex",alignItems:"center",gap:3 }}>
              {[["⇤",()=>setPdfPage(1),pdfPage<=1],["‹",()=>setPdfPage(p=>Math.max(1,p-1)),pdfPage<=1]].map(([ic,fn,dis],i)=>(
                <button key={i} onClick={fn} disabled={dis} style={{ background:C.bgPanel,border:`1px solid ${C.border}`,color:dis?C.textDim:C.textSec,borderRadius:4,width:22,height:22,cursor:dis?"default":"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center" }}>{ic}</button>
              ))}
              <input value={pdfPage} onChange={e=>{const v=parseInt(e.target.value);if(v>=1&&v<=8)setPdfPage(v);}} style={{ width:30,background:C.bgPanel,border:`1px solid ${C.border}`,borderRadius:4,color:C.text,textAlign:"center",fontSize:11,fontFamily:"'IBM Plex Mono',monospace",padding:"2px 0",outline:"none" }}/>
              <span style={{ fontSize:11,color:C.textDim }}>of 8</span>
              {[["›",()=>setPdfPage(p=>Math.min(8,p+1)),pdfPage>=8],["⇥",()=>setPdfPage(8),pdfPage>=8]].map(([ic,fn,dis],i)=>(
                <button key={i} onClick={fn} disabled={dis} style={{ background:C.bgPanel,border:`1px solid ${C.border}`,color:dis?C.textDim:C.textSec,borderRadius:4,width:22,height:22,cursor:dis?"default":"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center" }}>{ic}</button>
              ))}
            </div>
          </div>

          {/* PDF canvas */}
          <div style={{ flex:1,overflowY:"auto",padding:"28px 24px",display:"flex",justifyContent:"center",alignItems:"flex-start" }}>
            <PDFPage page={pdfPage} fund={selectedFund} zoom={zoom} highlightedValues={highlightedValues} activeCell={activeCell}/>
          </div>

          {/* Highlight bar */}
          <div style={{ background:C.bg,borderTop:`1px solid ${C.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:16,flexShrink:0 }}>
            <span style={{ fontSize:9.5,color:C.textDim,fontWeight:700,letterSpacing:"0.8px",flexShrink:0 }}>HIGHLIGHT</span>
            {[{k:"current_filter",l:"Current filter"},{k:"single",l:"Single metric"},{k:"all",l:"All metrics"},{k:"none",l:"None"}].map(({k,l})=>(
              <label key={k} style={{ display:"flex",alignItems:"center",gap:5,cursor:"pointer" }} onClick={()=>setHighlightMode(k)}>
                <div style={{ width:13,height:13,borderRadius:"50%",border:`2px solid ${highlightMode===k?C.brand:C.borderStrong}`,background:highlightMode===k?C.brand:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0 }}>
                  {highlightMode===k&&<div style={{ width:4,height:4,borderRadius:"50%",background:"#fff" }}/>}
                </div>
                <span style={{ fontSize:11,color:highlightMode===k?C.brand:C.textMuted,fontWeight:highlightMode===k?600:400,whiteSpace:"nowrap" }}>{l}</span>
              </label>
            ))}
            {activeCell && highlightMode==="single" && (
              <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:C.amberBg,border:`1px solid #FDE68A`,borderRadius:6,padding:"3px 10px",flexShrink:0,animation:"fadeUp .2s ease" }}>
                <span style={{ width:5,height:5,borderRadius:"50%",background:C.amber,display:"inline-block" }}/>
                <span style={{ fontSize:11,color:C.amberText,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{activeCell.asset} · {activeCell.metric}</span>
                <button onClick={()=>setActiveCell(null)} style={{ background:"none",border:"none",color:C.amber,cursor:"pointer",fontSize:11,padding:0,marginLeft:2,fontWeight:700 }}>✕</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fund Selection Screen ────────────────────────────────────────────────────
function FundSelectionScreen({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [search, setSearch]   = useState("");

  const filtered = FUNDS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.strategy.toLowerCase().includes(search.toLowerCase()) ||
    f.manager.toLowerCase().includes(search.toLowerCase())
  );

  const strategyColor = { "Buyout":"#6C3AED","Growth Equity":"#059669","Infrastructure":"#2563EB","Real Assets":"#D97706" };
  const statusColor   = { "Active":"#059669","Harvesting":"#D97706","Deploying":"#2563EB" };
  const statusBg      = { "Active":"#ECFDF5","Harvesting":"#FFFBEB","Deploying":"#EFF6FF" };

  return (
    <div style={{ fontFamily:"'IBM Plex Sans','Helvetica Neue',sans-serif", background:"#F8F9FB", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fund-card:hover{border-color:#6C3AED!important;box-shadow:0 6px 24px rgba(108,58,237,.12)!important;transform:translateY(-2px);}
        .fund-card{transition:all .2s ease;}
      `}</style>

      {/* Nav */}
      <div style={{ background:"#1E0A3C",display:"flex",alignItems:"center",padding:"0 24px",height:52,flexShrink:0 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:30,height:30,background:"linear-gradient(135deg,#7C3AED,#A855F7)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff" }}>A</div>
          <span style={{ color:"#fff",fontWeight:700,fontSize:15,letterSpacing:"-0.4px" }}>accelex</span>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#7C3AED,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff" }}>BL</div>
      </div>

      <div style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"52px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign:"center",marginBottom:40,animation:"fadeUp .35s ease" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"#EDE9FE",border:"1px solid #DDD6FE",borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700,color:"#6C3AED",letterSpacing:"0.5px",marginBottom:16 }}>
            STEP 2 OF 2 · VALIDATE METRICS
          </div>
          <h1 style={{ fontSize:34,fontWeight:700,color:"#111827",letterSpacing:"-0.8px",lineHeight:1.2,marginBottom:12 }}>Select a Fund to Validate</h1>
          <p style={{ fontSize:14,color:"#6B7280",maxWidth:500,lineHeight:1.7,margin:"0 auto" }}>
            Choose a fund to load its quarterly report. You'll review extracted metrics, correct any errors, and approve the data before it enters your system.
          </p>
        </div>

        {/* Search */}
        <div style={{ display:"flex",alignItems:"center",gap:8,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:10,padding:"10px 16px",width:"100%",maxWidth:520,marginBottom:36,boxShadow:"0 1px 4px rgba(0,0,0,.06)",animation:"fadeUp .45s ease" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by fund name, strategy or manager…" style={{ background:"none",border:"none",color:"#111827",fontSize:13,fontFamily:"inherit",outline:"none",flex:1 }}/>
        </div>

        {/* Fund grid */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16,width:"100%",maxWidth:1080 }}>
          {filtered.map((fund,i)=>{
            const sc  = strategyColor[fund.strategy]||"#6C3AED";
            const stc = statusColor[fund.status]||"#059669";
            const stb = statusBg[fund.status]||"#ECFDF5";
            return (
              <div key={fund.id} className="fund-card" onClick={()=>onSelect(fund)} onMouseEnter={()=>setHovered(fund.id)} onMouseLeave={()=>setHovered(null)}
                style={{ background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:14,padding:"20px 22px",cursor:"pointer",animation:`fadeUp ${.3+i*.07}s ease`,position:"relative",overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
                {/* Top color bar */}
                <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:sc,borderRadius:"14px 14px 0 0" }}/>
                {/* Header */}
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",gap:6,marginBottom:8,flexWrap:"wrap" }}>
                      <span style={{ fontSize:10,fontWeight:700,background:`${sc}12`,color:sc,border:`1px solid ${sc}25`,borderRadius:5,padding:"2px 8px" }}>{fund.strategy}</span>
                      <span style={{ fontSize:10,fontWeight:600,background:stb,color:stc,borderRadius:5,padding:"2px 8px" }}>● {fund.status}</span>
                    </div>
                    <div style={{ fontSize:15,fontWeight:700,color:"#111827",lineHeight:1.3,marginBottom:3 }}>{fund.name}</div>
                    <div style={{ fontSize:11,color:"#6B7280" }}>{fund.manager}</div>
                  </div>
                  <div style={{ width:40,height:40,borderRadius:10,background:`${sc}10`,border:`1px solid ${sc}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,marginLeft:14 }}>📁</div>
                </div>
                {/* KPIs */}
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14 }}>
                  {[["Fund Size",fund.size],["NAV",fund.nav],["Net IRR",fund.irr],["TVPI",fund.tvpi],["Vintage",fund.vintage.toString()],["Assets",fund.assetsCount+" cos"]].map(([l,v])=>(
                    <div key={l} style={{ background:"#F9FAFB",borderRadius:7,padding:"8px 10px",border:"1px solid #F3F4F6" }}>
                      <div style={{ fontSize:8.5,color:"#9CA3AF",fontWeight:600,letterSpacing:"0.4px",marginBottom:3,textTransform:"uppercase" }}>{l}</div>
                      <div style={{ fontSize:13,fontWeight:700,color:"#111827",fontFamily:"'IBM Plex Mono',monospace" }}>{v}</div>
                    </div>
                  ))}
                </div>
                {/* Report row */}
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:"#F9FAFB",borderRadius:8,border:"1px solid #F3F4F6" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ fontSize:15 }}>📄</span>
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:"#374151" }}>{fund.short} - {fund.reportDate} Quarterly Report</div>
                      <div style={{ fontSize:10,color:"#9CA3AF",marginTop:1 }}>Performance Report · Ready to validate</div>
                    </div>
                  </div>
                  <div style={{ background:hovered===fund.id?"#6C3AED":"#EDE9FE",border:`1px solid ${hovered===fund.id?"#6C3AED":"#DDD6FE"}`,borderRadius:7,padding:"5px 13px",fontSize:11,color:hovered===fund.id?"#fff":"#6C3AED",fontWeight:600,transition:"all .2s",flexShrink:0 }}>
                    Open →
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length===0&&(
          <div style={{ textAlign:"center",color:"#9CA3AF",padding:"48px 0" }}>
            <div style={{ fontSize:36,marginBottom:10 }}>🔍</div>
            <div style={{ fontSize:14,color:"#6B7280" }}>No funds match "<strong>{search}</strong>"</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{ fontFamily:"'IBM Plex Sans',sans-serif",background:"#F8F9FB",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes shimmer{0%,100%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      <div style={{ width:48,height:48,background:"linear-gradient(135deg,#7C3AED,#A855F7)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",animation:"spin 1.5s linear infinite",boxShadow:"0 4px 20px rgba(124,58,237,.3)" }}>A</div>
      <div style={{ fontSize:14,color:"#6B7280",fontFamily:"'IBM Plex Sans',sans-serif" }}>Loading fund report…</div>
      <div style={{ width:200,height:4,background:"#E5E7EB",borderRadius:2,overflow:"hidden",position:"relative" }}>
        <div style={{ position:"absolute",left:0,top:0,height:"100%",width:"60%",background:"linear-gradient(90deg,#7C3AED,#A855F7)",borderRadius:2,animation:"shimmer 1s ease infinite" }}/>
      </div>
    </div>
  );
}

// ─── PDF Page ─────────────────────────────────────────────────────────────────
function PDFPage({ page, fund, zoom, highlightedValues, activeCell }) {
  const s = zoom / 100;

  function HL({ text }) {
    if (!text||!highlightedValues.length) return <>{text}</>;
    let parts=[text];
    highlightedValues.filter(Boolean).forEach(hv=>{
      parts=parts.flatMap(p=>{
        if (typeof p!=="string") return [p];
        const i=p.indexOf(hv); if(i===-1) return [p];
        return [p.slice(0,i),<mark key={hv+i} style={{ background:"rgba(251,191,36,.35)",outline:"2px solid #F59E0B",outlineOffset:1,borderRadius:2,padding:"0 1px",fontWeight:700,color:"inherit",animation:"pulseHL 2s infinite" }}>{hv}</mark>,p.slice(i+hv.length)];
      });
    });
    return <>{parts}</>;
  }

  const base = { width:`${750*s}px`,minHeight:`${1060*s}px`,background:"#fff",borderRadius:3,boxShadow:"0 4px 30px rgba(0,0,0,.15)",overflow:"hidden",flexShrink:0,fontFamily:"'IBM Plex Sans','Helvetica Neue',sans-serif",color:"#1A202C",fontSize:`${11.5*s}px`,transition:"width .2s" };

  const Header = () => (
    <div>
      <div style={{ background:"#1E0A3C",padding:`${13*s}px ${24*s}px`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:`${10*s}px` }}>
          <div style={{ width:40*s,height:40*s,background:"#fff",borderRadius:5*s,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18*s,color:"#1E0A3C",fontFamily:"serif" }}>W</div>
          <div>
            <div style={{ fontSize:`${13*s}px`,fontWeight:700,color:"#fff" }}>{fund.name}</div>
            <div style={{ fontSize:`${9*s}px`,color:"rgba(255,255,255,.45)",marginTop:2*s }}>{fund.reportDate} Fund Quarterly Report · Performance Report</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:`${9*s}px`,color:"rgba(255,255,255,.3)",letterSpacing:"0.5px",marginBottom:2*s }}>PAGE</div>
          <div style={{ fontSize:`${18*s}px`,fontWeight:700,color:"rgba(255,255,255,.7)",fontFamily:"'IBM Plex Mono',monospace" }}>{page}</div>
        </div>
      </div>
      <div style={{ height:3*s,background:"linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#7C3AED)" }}/>
    </div>
  );

  if (page === 4) {
    const T = [
      {name:"Local Standing & Move",  date:"Dec-12",wecp:"87.8%",cap:"77.5", real:"236.4",unreal:"—",  tot:"236.4",moic:"3.1x",irr:"51.5%", s:"realized"},
      {name:"Great Sea Smoothing",    date:"May-14",wecp:"70.2%",cap:"62.2", real:"171.9",unreal:"2.3",tot:"174.2",moic:"2.8x",irr:"48.6%", s:"realized"},
      {name:"Watchmen International", date:"Oct-14",wecp:"61.5%",cap:"85.1", real:"259.4",unreal:"—",  tot:"259.4",moic:"3.0x",irr:"78.5%", s:"realized"},
      {name:"Expert Crew",            date:"Aug-15",wecp:"56.3%",cap:"163.1",real:"518.5",unreal:"—",  tot:"518.5",moic:"3.2x",irr:"156.7%",s:"realized"},
      {name:"Winter Capital III",     date:"Mar-16",wecp:"—",    cap:"61.6", real:"119.5",unreal:"—",  tot:"119.5",moic:"1.9x",irr:"104.6%",s:"unrealized"},
      {name:"IPA Cold Transfer",      date:"Jan-12",wecp:"82.0%",cap:"140.5",real:"68.6", unreal:"—",  tot:"68.6", moic:"0.5x",irr:"(46.1%)",s:"unrealized"},
      {name:"DoubleFace Skin Wealth", date:"Nov-15",wecp:"83.7%",cap:"66.8", real:"—",    unreal:"—",  tot:"—",    moic:"0.0x",irr:"NM",     s:"unrealized"},
    ];
    const isHL=(v)=>highlightedValues.some(h=>h&&v&&v.toString().includes(h));
    const vals=(r)=>[r.date,r.wecp,r.cap,r.real,r.unreal,r.tot,r.moic,r.irr];
    const ths=["($ in millions)","Entry Date",`${fund.short} Ownership`,"Capital Invested","Realized Proceeds","Unrealized Value","Total Value","Multiple of Cost","Gross IRR"];
    const SubRow=({label,data,bg,textCol="#fff"})=>(
      <tr style={{background:bg}}>
        <td colSpan={3} style={{padding:`${5*s}px ${6*s}px`,color:textCol,fontSize:`${9.5*s}px`,fontWeight:700}}>{label}</td>
        {data.map((v,i)=><td key={i} style={{padding:`${5*s}px ${6*s}px`,color:textCol,fontSize:`${10*s}px`,fontWeight:700,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}</td>)}
      </tr>
    );
    return (
      <div style={base}>
        <Header/>
        <div style={{padding:`${16*s}px ${24*s}px`}}>
          <p style={{fontSize:`${11*s}px`,color:"#4B5563",marginBottom:`${14*s}px`,lineHeight:1.6}}>
            The table below summarizes Fund VII's investment performance as of June 30, 2020<sup>(a)</sup>.
          </p>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:`${10*s}px`}}>
            <thead>
              <tr style={{background:"#1E0A3C"}}>
                {ths.map((h,i)=><th key={i} style={{padding:`${5*s}px ${6*s}px`,color:"#fff",fontWeight:600,fontSize:`${8.5*s}px`,textAlign:i===0?"left":"right",borderRight:i<8?"1px solid rgba(255,255,255,.1)":"none",whiteSpace:"nowrap"}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr style={{background:"#EDE9FE"}}><td colSpan={9} style={{padding:`${4*s}px ${6*s}px`,fontSize:`${9*s}px`,fontWeight:700,color:"#5B21B6"}}>Realized Investments</td></tr>
              {T.filter(r=>r.s==="realized").map((r,i)=>{
                const ra=activeCell?.asset===r.name;
                return (
                  <tr key={i} style={{background:ra?"#F5F3FF":i%2===0?"#fff":"#FAFAFA",borderBottom:"1px solid #F1F5F9",borderLeft:ra?"3px solid #6C3AED":"3px solid transparent"}}>
                    <td style={{padding:`${5*s}px ${6*s}px`,fontWeight:600,color:ra?"#6C3AED":"#1E293B",whiteSpace:"nowrap"}}><HL text={r.name}/></td>
                    {vals(r).map((v,vi)=>{const hi=isHL(v);return <td key={vi} style={{padding:`${5*s}px ${6*s}px`,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",background:hi?"rgba(251,191,36,.2)":"transparent",outline:hi?"2px solid #F59E0B":"none",outlineOffset:-1,fontWeight:hi?700:400,color:hi?"#78350F":"#374151",transition:"all .15s"}}><HL text={v}/></td>;})}
                  </tr>
                );
              })}
              <SubRow label="Realized Investments(b)" data={["$658.8","$1,374.3","$2.3","$1,376.6","2.1x","40.8%"]} bg="#6C3AED"/>
              <tr style={{background:"#ECFDF5"}}><td colSpan={9} style={{padding:`${4*s}px ${6*s}px`,fontSize:`${9*s}px`,fontWeight:700,color:"#065F46"}}>Unrealized Investments</td></tr>
              {T.filter(r=>r.s==="unrealized").map((r,i)=>{
                const ra=activeCell?.asset===r.name;
                return (
                  <tr key={i} style={{background:ra?"#F5F3FF":i%2===0?"#fff":"#FAFAFA",borderBottom:"1px solid #F1F5F9",borderLeft:ra?"3px solid #6C3AED":"3px solid transparent"}}>
                    <td style={{padding:`${5*s}px ${6*s}px`,fontWeight:600,color:ra?"#6C3AED":"#1E293B",whiteSpace:"nowrap"}}><HL text={r.name}/></td>
                    {vals(r).map((v,vi)=>{const hi=isHL(v);return <td key={vi} style={{padding:`${5*s}px ${6*s}px`,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace",background:hi?"rgba(251,191,36,.2)":"transparent",outline:hi?"2px solid #F59E0B":"none",outlineOffset:-1,fontWeight:hi?700:400,color:hi?"#78350F":"#374151"}}><HL text={v}/></td>;})}
                  </tr>
                );
              })}
              <SubRow label="Unrealized Investments" data={["$499.8","$254.3","$594.3","$848.6","1.7x","14.4%"]} bg="#059669"/>
              <tr style={{background:"#1E0A3C"}}>
                <td colSpan={3} style={{padding:`${6*s}px ${6*s}px`,color:"#fff",fontSize:`${11*s}px`,fontWeight:800}}>Total Investments</td>
                {["$1,158.7","$1,628.6","$596.6","$2,225.2","1.9x","26.1%"].map((v,i)=>(
                  <td key={i} style={{padding:`${6*s}px ${6*s}px`,color:"#fff",fontSize:`${11*s}px`,fontWeight:800,textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{marginTop:14*s,paddingTop:10*s,borderTop:"1px solid #E5E7EB"}}>
            {["(a) Past performance of WECP or any other investments described herein are provided for illustrative purposes only.",
              "(b) Capital invested represents aggregate capital invested by WECP, as applicable, in each portfolio company.",
              "(c) Realized Proceeds represents the sum of all net proceeds generated from dispositions.",
              "(d) Realized investments reflect all investments that have been exited or substantially exited as of June 30, 2020."
            ].map((fn,i)=><p key={i} style={{fontSize:`${8*s}px`,color:"#9CA3AF",lineHeight:1.5,marginBottom:3*s}}>{fn}</p>)}
          </div>
        </div>
      </div>
    );
  }

  const gMap={1:{t:"Cover Page",i:"📋",d:`${fund.name} · ${fund.reportDate}`},2:{t:"Table of Contents",i:"📑",d:"Document navigation index"},3:{t:"Executive Summary",i:"📊",d:"Key performance highlights and fund status"},5:{t:"Asset Detail — Local Standing & Move",i:"🏦",d:"Portfolio company deep dive"},6:{t:"Asset Detail — Great Sea Smoothing",i:"🌊",d:"Portfolio company deep dive"},7:{t:"Asset Detail — Watchmen International",i:"🔐",d:"Portfolio company deep dive"},8:{t:"Asset Detail — Expert Crew",i:"⚙️",d:"Portfolio company deep dive"}};
  const g=gMap[page]||{t:`Page ${page}`,i:"📄",d:""};
  return (
    <div style={base}>
      <Header/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:500*s,gap:12*s,padding:40*s}}>
        <div style={{fontSize:40*s}}>{g.i}</div>
        <div style={{fontSize:18*s,fontWeight:700,color:"#111827",textAlign:"center"}}>{g.t}</div>
        <div style={{fontSize:12*s,color:"#6B7280"}}>{g.d}</div>
        <div style={{marginTop:8*s,padding:`${10*s}px ${16*s}px`,background:"#EDE9FE",border:"1px solid #DDD6FE",borderRadius:8*s,fontSize:11*s,color:"#6C3AED",textAlign:"center"}}>Navigate to <strong>page 4</strong> to see the performance table with interactive highlighting</div>
      </div>
    </div>
  );
}
