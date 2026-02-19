import { useState, useRef, useCallback, useEffect } from "react";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'IBM Plex Sans','Helvetica Neue',sans-serif;background:#FFFFFF;color:#111827;}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:#F3F4F6}
  ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:3px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
  @keyframes barslide{0%{left:-60%}100%{left:110%}}
  @keyframes pulseHL{0%,100%{outline-color:#F59E0B}50%{outline-color:#FCD34D}}
  .row-hover:hover{background:#F5F3FF !important}
  .val-input{background:transparent;border:none;outline:none;width:100%;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:text;}
  .val-input.filled{color:#111827;font-weight:500;}
  .val-input.empty{color:#C9D0DC;font-style:italic;}
  .val-input.modified{color:#D97706;font-weight:600;background:#FFFBEB;border-radius:3px;padding:1px 3px;}
  .val-input:focus{outline:1.5px solid #6C3AED;border-radius:3px;background:#F5F3FF;}
  .chip:hover{border-color:#6C3AED !important;color:#6C3AED !important;}
  .dh:hover .dl{background:#6C3AED !important}
  .dh:hover .dg{border-color:#6C3AED !important;color:#6C3AED !important}
  .fund-row{cursor:pointer;transition:background .12s;}
  .fund-row:hover{background:#F5F3FF !important;}
  .fund-row:hover .fund-open-btn{background:#6C3AED !important;color:#fff !important;border-color:#6C3AED !important;}
  .kpi-card:hover{border-color:#6C3AED !important;box-shadow:0 4px 16px rgba(108,58,237,.12) !important;}
  .metric-input-cell{background:transparent;border:none;border-bottom:1.5px solid #E5E7EB;outline:none;width:100%;font-size:15px;font-weight:700;font-family:'IBM Plex Mono',monospace;padding:4px 2px;transition:border-color .15s,background .15s;}
  .metric-input-cell:focus{border-bottom-color:#6C3AED;background:#F5F3FF;border-radius:3px 3px 0 0;}
  .metric-input-cell.modified{border-bottom-color:#D97706;color:#D97706 !important;background:#FFFBEB;border-radius:3px 3px 0 0;}
  .metric-input-cell::placeholder{color:#C9D0DC;font-style:italic;font-size:12px;font-weight:400;}
  .tab-btn:hover{color:#6C3AED !important;background:#F5F3FF !important;}
  .view-btn:hover{background:#EDE9FE !important;}
`;

const C = {
  bg:"#FFFFFF", bgPanel:"#F8F9FB", bgStripe:"#FAFAFA", bgActive:"#F5F3FF",
  nav:"#1E0A3C", brand:"#6C3AED", brandLight:"#EDE9FE",
  border:"#E5E7EB", borderStrong:"#D1D5DB",
  text:"#111827", textSec:"#374151", textMuted:"#6B7280", textDim:"#9CA3AF",
  green:"#059669", greenBg:"#ECFDF5",
  red:"#DC2626", redBg:"#FEF2F2",
  amber:"#D97706", amberBg:"#FFFBEB",
  blue:"#2563EB", blueBg:"#EFF6FF",
};

const safeTrim = (v) => v == null ? "" : String(v).trim();

const FUNDS = [
  { id:"f1", name:"Wayne Enterprises Capital Partners VII", short:"WECP VII",  manager:"Wayne Capital Management",  vintage:"2020", strategy:"Buyout",        size:"$2.4B", status:"Active",     reportDate:"Q2 2020", assetsCount:7,  nav:"$3.1B", dpi:"1.42x", irr:"18.4%", tvpi:"1.62x", committed:"$2.1B", called:"$1.9B", distributed:"$0.9B", fee:"1.75%", carry:"20%", gp:"Wayne Capital Mgmt LLC",       jurisdiction:"Delaware, USA",   inceptionDate:"Jan 2020", nextClose:"Dec 2025" },
  { id:"f2", name:"Apollo Growth Fund IV",                  short:"AGF IV",    manager:"Apollo Capital",            vintage:"2019", strategy:"Growth Equity",  size:"$1.8B", status:"Active",     reportDate:"Q3 2024", assetsCount:4,  nav:"$2.4B", dpi:"0.88x", irr:"21.2%", tvpi:"1.88x", committed:"$1.6B", called:"$1.4B", distributed:"$0.5B", fee:"2.00%", carry:"20%", gp:"Apollo Capital Partners",      jurisdiction:"Cayman Islands",  inceptionDate:"Mar 2019", nextClose:"Jun 2025" },
  { id:"f3", name:"KKR Infrastructure III",                 short:"KKR Infra", manager:"KKR & Co.",                 vintage:"2018", strategy:"Infrastructure", size:"$3.2B", status:"Harvesting", reportDate:"Q4 2023", assetsCount:3,  nav:"$4.0B", dpi:"1.71x", irr:"21.1%", tvpi:"1.95x", committed:"$3.0B", called:"$2.8B", distributed:"$1.8B", fee:"1.50%", carry:"20%", gp:"KKR Infrastructure LLC",       jurisdiction:"Delaware, USA",   inceptionDate:"Sep 2018", nextClose:"—" },
  { id:"f4", name:"Blackstone Real Assets II",              short:"BRA II",    manager:"Blackstone Group",          vintage:"2021", strategy:"Real Assets",    size:"$5.1B", status:"Deploying",  reportDate:"Q1 2024", assetsCount:5,  nav:"$5.3B", dpi:"0.21x", irr:"12.8%", tvpi:"1.24x", committed:"$4.8B", called:"$2.9B", distributed:"$0.4B", fee:"1.75%", carry:"20%", gp:"Blackstone Real Assets Mgmt", jurisdiction:"Delaware, USA",   inceptionDate:"Jun 2021", nextClose:"Mar 2025" },
];

const ASSETS_BY_FUND = {
  f1:["Local Standing & Move","Great Sea Smoothing","Watchmen International","Expert Crew","Winter Capital III","IPA Cold Transfer","DoubleFace Skin Wealth"],
  f2:["TechCorp Holdings","MedLife Sciences","RetailMax Group","Cosmos Products"],
  f3:["Pacific Port Authority","Nordic Power Grid","Iberian Toll Roads"],
  f4:["Logistics Hub Alpha","Energy Transition Co","Metro Office REIT","Harbor Freight Trust","Sunbelt Industrial"],
};

const METRICS_BY_TYPE = {
  "ASSET INVESTMENT":      ["Entry date","Total capital invested","Total distributions","Residual value (FMV)","Total value","Multiple on invested capital (MOIC)","Asset IRR"],
  "ASSET PERFORMANCE":     ["Revenue (LTM)","EBITDA (LTM)","EBITDA Margin","Net Revenue Growth YoY","Net Debt / EBITDA","EV / EBITDA","Gross Margin %"],
  "FUND":                  ["Fund Ownership %","Cost (fund share)","Realized Proceeds","Unrealized Value","Total Value (fund)","Multiple of Cost","Gross IRR"],
  "STATIC":                ["Country","Sector","CEO","Founded Year","Employees","HQ City","Website"],
  "STATIC (FREE METRICS)": ["ESG Score","Board Seats Held","Co-investors","Deal Type","Hold Period (yrs)"],
};

const TAB_META = {
  "ASSET INVESTMENT":      { icon:"💰", color:"#6C3AED", desc:"Deal-level entry data — when the investment was made, how much capital was deployed, distributions received, and return metrics (MOIC, IRR) per portfolio company." },
  "ASSET PERFORMANCE":     { icon:"📈", color:"#059669", desc:"Operational KPIs sourced from portfolio monitoring — revenue, EBITDA, margins, growth rates." },
  "FUND":                  { icon:"🏦", color:"#2563EB", desc:"Fund-level dashboard — performance metrics, capital account, fund structure, and portfolio summary. All fields are editable." },
  "STATIC":                { icon:"🏢", color:"#D97706", desc:"Firmographic data — country, sector, CEO, headcount, HQ. Rarely changes between quarterly reports." },
  "STATIC (FREE METRICS)": { icon:"✏️", color:"#DB2777", desc:"User-defined custom fields outside the standard schema. Add bespoke metrics your team tracks." },
};

const ASSET_META = {
  "Local Standing & Move":  {icon:"🏦",color:"#6366F1",sector:"Finance",    country:"USA",       invStatus:"Realized"},
  "Great Sea Smoothing":    {icon:"🌊",color:"#059669",sector:"Consumer",   country:"UK",        invStatus:"Realized"},
  "Watchmen International": {icon:"🔐",color:"#D97706",sector:"Security",   country:"USA",       invStatus:"Realized"},
  "Expert Crew":            {icon:"⚙️",color:"#DB2777",sector:"Services",   country:"Germany",   invStatus:"Realized"},
  "Winter Capital III":     {icon:"❄️",color:"#2563EB",sector:"Finance",    country:"France",    invStatus:"Unrealized"},
  "IPA Cold Transfer":      {icon:"💊",color:"#DC2626",sector:"Tech",       country:"USA",       invStatus:"Unrealized"},
  "DoubleFace Skin Wealth": {icon:"✨",color:"#7C3AED",sector:"Beauty",     country:"Japan",     invStatus:"Unrealized"},
  "TechCorp Holdings":      {icon:"💻",color:"#0891B2",sector:"Tech",       country:"USA",       invStatus:"Active"},
  "MedLife Sciences":       {icon:"🧬",color:"#059669",sector:"Healthcare", country:"Germany",   invStatus:"Active"},
  "RetailMax Group":        {icon:"🛒",color:"#EA580C",sector:"Consumer",   country:"UK",        invStatus:"Active"},
  "Cosmos Products":        {icon:"🚀",color:"#7C3AED",sector:"Tech",       country:"USA",       invStatus:"Active"},
  "Pacific Port Authority":  {icon:"⚓",color:"#0284C7",sector:"Transport",  country:"Australia", invStatus:"Active"},
  "Nordic Power Grid":       {icon:"⚡",color:"#CA8A04",sector:"Utilities",  country:"Sweden",    invStatus:"Active"},
  "Iberian Toll Roads":      {icon:"🛣️",color:"#16A34A",sector:"Transport",  country:"Spain",     invStatus:"Active"},
  "Logistics Hub Alpha":     {icon:"📦",color:"#7C3AED",sector:"Logistics",  country:"USA",       invStatus:"Active"},
  "Energy Transition Co":    {icon:"🌱",color:"#059669",sector:"Energy",     country:"USA",       invStatus:"Active"},
  "Metro Office REIT":       {icon:"🏙️",color:"#2563EB",sector:"Real Estate",country:"USA",      invStatus:"Active"},
  "Harbor Freight Trust":    {icon:"🚢",color:"#0284C7",sector:"Logistics",  country:"USA",       invStatus:"Active"},
  "Sunbelt Industrial":      {icon:"🏗️",color:"#D97706",sector:"Industrials",country:"USA",      invStatus:"Active"},
};

const ASSET_DATA = {
  "Local Standing & Move":  {"ASSET INVESTMENT":{"Entry date":"2012/12/31","Total capital invested":"77,500,000","Total distributions":"236,400,000","Residual value (FMV)":"0","Total value":"236,400,000","Multiple on invested capital (MOIC)":"3.1","Asset IRR":"51.5%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"142,000,000","EBITDA (LTM)":"48,200,000","EBITDA Margin":"33.9%","Net Revenue Growth YoY":"","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":""},"FUND":{"Fund Ownership %":"87.8%","Cost (fund share)":"77.5","Realized Proceeds":"236.4","Unrealized Value":"—","Total Value (fund)":"236.4","Multiple of Cost":"3.1x","Gross IRR":"51.5%"},"STATIC":{"Country":"USA","Sector":"Finance","CEO":"Marcus Dane","Founded Year":"2001","Employees":"1,240","HQ City":"New York, NY","Website":"localstanding.com"},"STATIC (FREE METRICS)":{"ESG Score":"B+","Board Seats Held":"2","Co-investors":"Warburg Pincus","Deal Type":"Control Buyout","Hold Period (yrs)":"8.1"}},
  "Great Sea Smoothing":    {"ASSET INVESTMENT":{"Entry date":"2014/05/31","Total capital invested":"62,200,000","Total distributions":"171,900,000","Residual value (FMV)":"2,300,000","Total value":"174,200,000","Multiple on invested capital (MOIC)":"2.8","Asset IRR":"48.6%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"98,400,000","EBITDA (LTM)":"29,100,000","EBITDA Margin":"29.6%","Net Revenue Growth YoY":"+12%","Net Debt / EBITDA":"1.2x","EV / EBITDA":"8.4x","Gross Margin %":"54%"},"FUND":{"Fund Ownership %":"70.2%","Cost (fund share)":"62.2","Realized Proceeds":"171.9","Unrealized Value":"2.3","Total Value (fund)":"174.2","Multiple of Cost":"2.8x","Gross IRR":"48.6%"},"STATIC":{"Country":"UK","Sector":"Consumer","CEO":"Rachel Obi","Founded Year":"2008","Employees":"890","HQ City":"London, UK","Website":"greatseagroup.co.uk"},"STATIC (FREE METRICS)":{"ESG Score":"A-","Board Seats Held":"1","Co-investors":"EQT","Deal Type":"Growth Buyout","Hold Period (yrs)":"6.1"}},
  "Watchmen International": {"ASSET INVESTMENT":{"Entry date":"2014/10/31","Total capital invested":"85,100,000","Total distributions":"259,400,000","Residual value (FMV)":"0","Total value":"259,400,000","Multiple on invested capital (MOIC)":"3.0","Asset IRR":"78.5%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"310,000,000","EBITDA (LTM)":"92,000,000","EBITDA Margin":"29.7%","Net Revenue Growth YoY":"+19%","Net Debt / EBITDA":"0.8x","EV / EBITDA":"9.1x","Gross Margin %":"61%"},"FUND":{"Fund Ownership %":"61.5%","Cost (fund share)":"85.1","Realized Proceeds":"259.4","Unrealized Value":"—","Total Value (fund)":"259.4","Multiple of Cost":"3.0x","Gross IRR":"78.5%"},"STATIC":{"Country":"USA","Sector":"Security","CEO":"Bruce W.","Founded Year":"1999","Employees":"4,200","HQ City":"Gotham, NJ","Website":"watchmen-intl.com"},"STATIC (FREE METRICS)":{"ESG Score":"A","Board Seats Held":"3","Co-investors":"Vista Equity","Deal Type":"Carve-out","Hold Period (yrs)":"5.7"}},
  "Expert Crew":            {"ASSET INVESTMENT":{"Entry date":"2015/08/31","Total capital invested":"163,100,000","Total distributions":"518,500,000","Residual value (FMV)":"0","Total value":"518,500,000","Multiple on invested capital (MOIC)":"3.2","Asset IRR":"156.7%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"580,000,000","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"+28%","Net Debt / EBITDA":"","EV / EBITDA":"11.2x","Gross Margin %":""},"FUND":{"Fund Ownership %":"56.3%","Cost (fund share)":"163.1","Realized Proceeds":"518.5","Unrealized Value":"—","Total Value (fund)":"518.5","Multiple of Cost":"3.2x","Gross IRR":"156.7%"},"STATIC":{"Country":"Germany","Sector":"Services","CEO":"Hans Richter","Founded Year":"2005","Employees":"12,800","HQ City":"Munich, DE","Website":"expertcrew.de"},"STATIC (FREE METRICS)":{"ESG Score":"B","Board Seats Held":"2","Co-investors":"Apax Partners","Deal Type":"Secondary Buyout","Hold Period (yrs)":"4.9"}},
  "Winter Capital III":     {"ASSET INVESTMENT":{"Entry date":"2016/03/18","Total capital invested":"61,600,000","Total distributions":"","Residual value (FMV)":"","Total value":"119,500,000","Multiple on invested capital (MOIC)":"1.9","Asset IRR":"104.6%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"210,000,000","EBITDA (LTM)":"71,000,000","EBITDA Margin":"33.8%","Net Revenue Growth YoY":"+7%","Net Debt / EBITDA":"2.1x","EV / EBITDA":"","Gross Margin %":""},"FUND":{"Fund Ownership %":"","Cost (fund share)":"","Realized Proceeds":"","Unrealized Value":"119.5","Total Value (fund)":"119.5","Multiple of Cost":"1.9x","Gross IRR":"104.6%"},"STATIC":{"Country":"France","Sector":"Finance","CEO":"Claire Moreau","Founded Year":"2010","Employees":"620","HQ City":"Paris, FR","Website":"wintercap3.fr"},"STATIC (FREE METRICS)":{"ESG Score":"","Board Seats Held":"1","Co-investors":"","Deal Type":"Platform Build","Hold Period (yrs)":"4.3"}},
  "IPA Cold Transfer":      {"ASSET INVESTMENT":{"Entry date":"2012/01/01","Total capital invested":"140,500,000","Total distributions":"68,600,000","Residual value (FMV)":"","Total value":"68,600,000","Multiple on invested capital (MOIC)":"0.5","Asset IRR":"(46.1%)"},"ASSET PERFORMANCE":{"Revenue (LTM)":"","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"-8%","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":""},"FUND":{"Fund Ownership %":"82.0%","Cost (fund share)":"140.5","Realized Proceeds":"68.6","Unrealized Value":"—","Total Value (fund)":"68.6","Multiple of Cost":"0.5x","Gross IRR":"(46.1%)"},"STATIC":{"Country":"USA","Sector":"Tech","CEO":"Sandra Lee","Founded Year":"2007","Employees":"340","HQ City":"Austin, TX","Website":"ipacold.com"},"STATIC (FREE METRICS)":{"ESG Score":"C","Board Seats Held":"2","Co-investors":"None","Deal Type":"Control Buyout","Hold Period (yrs)":"8.5"}},
  "DoubleFace Skin Wealth": {"ASSET INVESTMENT":{"Entry date":"2015/11/01","Total capital invested":"66,800,000","Total distributions":"","Residual value (FMV)":"","Total value":"","Multiple on invested capital (MOIC)":"0.0","Asset IRR":"NM"},"ASSET PERFORMANCE":{"Revenue (LTM)":"","EBITDA (LTM)":"","EBITDA Margin":"","Net Revenue Growth YoY":"","Net Debt / EBITDA":"","EV / EBITDA":"","Gross Margin %":""},"FUND":{"Fund Ownership %":"83.7%","Cost (fund share)":"66.8","Realized Proceeds":"","Unrealized Value":"","Total Value (fund)":"","Multiple of Cost":"0.0x","Gross IRR":"NM"},"STATIC":{"Country":"Japan","Sector":"Beauty","CEO":"Yuki Tanaka","Founded Year":"2013","Employees":"180","HQ City":"Tokyo, JP","Website":"doublefaceskin.jp"},"STATIC (FREE METRICS)":{"ESG Score":"","Board Seats Held":"1","Co-investors":"","Deal Type":"Minority Growth","Hold Period (yrs)":"4.6"}},
  "TechCorp Holdings":      {"ASSET INVESTMENT":{"Entry date":"2019/06/01","Total capital invested":"210,000,000","Total distributions":"","Residual value (FMV)":"380,000,000","Total value":"380,000,000","Multiple on invested capital (MOIC)":"1.81","Asset IRR":"22.3%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"540,000,000","EBITDA (LTM)":"162,000,000","EBITDA Margin":"30.0%","Net Revenue Growth YoY":"+31%","Net Debt / EBITDA":"1.5x","EV / EBITDA":"12.8x","Gross Margin %":"68%"},"FUND":{"Fund Ownership %":"45.0%","Cost (fund share)":"210.0","Realized Proceeds":"—","Unrealized Value":"380.0","Total Value (fund)":"380.0","Multiple of Cost":"1.8x","Gross IRR":"22.3%"},"STATIC":{"Country":"USA","Sector":"Tech","CEO":"James Park","Founded Year":"2013","Employees":"3,200","HQ City":"San Francisco, CA","Website":"techcorp.io"},"STATIC (FREE METRICS)":{"ESG Score":"A","Board Seats Held":"2","Co-investors":"Sequoia","Deal Type":"Growth Equity","Hold Period (yrs)":"4.5"}},
  "MedLife Sciences":       {"ASSET INVESTMENT":{"Entry date":"2020/03/15","Total capital invested":"185,000,000","Total distributions":"","Residual value (FMV)":"290,000,000","Total value":"290,000,000","Multiple on invested capital (MOIC)":"1.57","Asset IRR":"17.8%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"320,000,000","EBITDA (LTM)":"96,000,000","EBITDA Margin":"30.0%","Net Revenue Growth YoY":"+22%","Net Debt / EBITDA":"0.9x","EV / EBITDA":"10.2x","Gross Margin %":"72%"},"FUND":{"Fund Ownership %":"38.5%","Cost (fund share)":"185.0","Realized Proceeds":"—","Unrealized Value":"290.0","Total Value (fund)":"290.0","Multiple of Cost":"1.6x","Gross IRR":"17.8%"},"STATIC":{"Country":"Germany","Sector":"Healthcare","CEO":"Lena Fischer","Founded Year":"2011","Employees":"2,100","HQ City":"Berlin, DE","Website":"medlifesciences.de"},"STATIC (FREE METRICS)":{"ESG Score":"A+","Board Seats Held":"2","Co-investors":"HarbourVest","Deal Type":"Growth Equity","Hold Period (yrs)":"3.8"}},
  "RetailMax Group":        {"ASSET INVESTMENT":{"Entry date":"2021/01/20","Total capital invested":"145,000,000","Total distributions":"","Residual value (FMV)":"195,000,000","Total value":"195,000,000","Multiple on invested capital (MOIC)":"1.34","Asset IRR":"12.1%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"890,000,000","EBITDA (LTM)":"89,000,000","EBITDA Margin":"10.0%","Net Revenue Growth YoY":"+8%","Net Debt / EBITDA":"3.2x","EV / EBITDA":"6.4x","Gross Margin %":"38%"},"FUND":{"Fund Ownership %":"32.0%","Cost (fund share)":"145.0","Realized Proceeds":"—","Unrealized Value":"195.0","Total Value (fund)":"195.0","Multiple of Cost":"1.3x","Gross IRR":"12.1%"},"STATIC":{"Country":"UK","Sector":"Consumer","CEO":"Tom Bridges","Founded Year":"2005","Employees":"8,400","HQ City":"London, UK","Website":"retailmax.co.uk"},"STATIC (FREE METRICS)":{"ESG Score":"B+","Board Seats Held":"1","Co-investors":"None","Deal Type":"Buyout","Hold Period (yrs)":"2.9"}},
  "Cosmos Products":        {"ASSET INVESTMENT":{"Entry date":"2022/07/01","Total capital invested":"260,000,000","Total distributions":"","Residual value (FMV)":"335,000,000","Total value":"335,000,000","Multiple on invested capital (MOIC)":"1.29","Asset IRR":"16.4%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"1,200,000,000","EBITDA (LTM)":"216,000,000","EBITDA Margin":"18.0%","Net Revenue Growth YoY":"+14%","Net Debt / EBITDA":"2.1x","EV / EBITDA":"9.2x","Gross Margin %":"55%"},"FUND":{"Fund Ownership %":"41.5%","Cost (fund share)":"260.0","Realized Proceeds":"—","Unrealized Value":"335.0","Total Value (fund)":"335.0","Multiple of Cost":"1.3x","Gross IRR":"16.4%"},"STATIC":{"Country":"USA","Sector":"Tech","CEO":"Maria Santos","Founded Year":"2017","Employees":"5,600","HQ City":"Austin, TX","Website":"cosmosproducts.com"},"STATIC (FREE METRICS)":{"ESG Score":"A-","Board Seats Held":"2","Co-investors":"Tiger Global","Deal Type":"Growth Equity","Hold Period (yrs)":"1.6"}},
  "Pacific Port Authority":  {"ASSET INVESTMENT":{"Entry date":"2018/11/01","Total capital invested":"850,000,000","Total distributions":"520,000,000","Residual value (FMV)":"940,000,000","Total value":"1,460,000,000","Multiple on invested capital (MOIC)":"1.72","Asset IRR":"19.4%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"1,800,000,000","EBITDA (LTM)":"720,000,000","EBITDA Margin":"40.0%","Net Revenue Growth YoY":"+6%","Net Debt / EBITDA":"3.8x","EV / EBITDA":"11.2x","Gross Margin %":"62%"},"FUND":{"Fund Ownership %":"55.0%","Cost (fund share)":"850.0","Realized Proceeds":"520.0","Unrealized Value":"940.0","Total Value (fund)":"1,460.0","Multiple of Cost":"1.7x","Gross IRR":"19.4%"},"STATIC":{"Country":"Australia","Sector":"Transport","CEO":"Craig Walker","Founded Year":"1998","Employees":"6,200","HQ City":"Sydney, AU","Website":"pacport.au"},"STATIC (FREE METRICS)":{"ESG Score":"B","Board Seats Held":"2","Co-investors":"Macquarie","Deal Type":"Infrastructure Buyout","Hold Period (yrs)":"5.1"}},
  "Nordic Power Grid":       {"ASSET INVESTMENT":{"Entry date":"2019/04/01","Total capital invested":"1,200,000,000","Total distributions":"800,000,000","Residual value (FMV)":"1,600,000,000","Total value":"2,400,000,000","Multiple on invested capital (MOIC)":"2.0","Asset IRR":"22.8%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"2,100,000,000","EBITDA (LTM)":"1,050,000,000","EBITDA Margin":"50.0%","Net Revenue Growth YoY":"+4%","Net Debt / EBITDA":"4.5x","EV / EBITDA":"14.8x","Gross Margin %":"70%"},"FUND":{"Fund Ownership %":"62.5%","Cost (fund share)":"1,200.0","Realized Proceeds":"800.0","Unrealized Value":"1,600.0","Total Value (fund)":"2,400.0","Multiple of Cost":"2.0x","Gross IRR":"22.8%"},"STATIC":{"Country":"Sweden","Sector":"Utilities","CEO":"Lars Eriksson","Founded Year":"1990","Employees":"4,800","HQ City":"Stockholm, SE","Website":"nordicpowergrid.se"},"STATIC (FREE METRICS)":{"ESG Score":"A+","Board Seats Held":"3","Co-investors":"Stonepeak","Deal Type":"Infrastructure Buyout","Hold Period (yrs)":"4.8"}},
  "Iberian Toll Roads":      {"ASSET INVESTMENT":{"Entry date":"2020/09/01","Total capital invested":"750,000,000","Total distributions":"480,000,000","Residual value (FMV)":"820,000,000","Total value":"1,300,000,000","Multiple on invested capital (MOIC)":"1.73","Asset IRR":"20.2%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"1,100,000,000","EBITDA (LTM)":"660,000,000","EBITDA Margin":"60.0%","Net Revenue Growth YoY":"+9%","Net Debt / EBITDA":"5.2x","EV / EBITDA":"13.5x","Gross Margin %":"75%"},"FUND":{"Fund Ownership %":"70.0%","Cost (fund share)":"750.0","Realized Proceeds":"480.0","Unrealized Value":"820.0","Total Value (fund)":"1,300.0","Multiple of Cost":"1.7x","Gross IRR":"20.2%"},"STATIC":{"Country":"Spain","Sector":"Transport","CEO":"Carlos Mendez","Founded Year":"2002","Employees":"3,400","HQ City":"Madrid, ES","Website":"iberiantolls.es"},"STATIC (FREE METRICS)":{"ESG Score":"B+","Board Seats Held":"2","Co-investors":"DIF Capital","Deal Type":"Infrastructure Buyout","Hold Period (yrs)":"3.2"}},
  "Logistics Hub Alpha":     {"ASSET INVESTMENT":{"Entry date":"2021/08/01","Total capital invested":"680,000,000","Total distributions":"120,000,000","Residual value (FMV)":"820,000,000","Total value":"940,000,000","Multiple on invested capital (MOIC)":"1.38","Asset IRR":"14.2%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"950,000,000","EBITDA (LTM)":"190,000,000","EBITDA Margin":"20.0%","Net Revenue Growth YoY":"+11%","Net Debt / EBITDA":"3.5x","EV / EBITDA":"8.9x","Gross Margin %":"45%"},"FUND":{"Fund Ownership %":"65.0%","Cost (fund share)":"680.0","Realized Proceeds":"120.0","Unrealized Value":"820.0","Total Value (fund)":"940.0","Multiple of Cost":"1.4x","Gross IRR":"14.2%"},"STATIC":{"Country":"USA","Sector":"Logistics","CEO":"Derek Shaw","Founded Year":"2015","Employees":"7,800","HQ City":"Dallas, TX","Website":"logisticshub.com"},"STATIC (FREE METRICS)":{"ESG Score":"B","Board Seats Held":"2","Co-investors":"None","Deal Type":"Buyout","Hold Period (yrs)":"2.5"}},
  "Energy Transition Co":    {"ASSET INVESTMENT":{"Entry date":"2022/01/15","Total capital invested":"920,000,000","Total distributions":"80,000,000","Residual value (FMV)":"1,050,000,000","Total value":"1,130,000,000","Multiple on invested capital (MOIC)":"1.23","Asset IRR":"11.8%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"1,400,000,000","EBITDA (LTM)":"420,000,000","EBITDA Margin":"30.0%","Net Revenue Growth YoY":"+18%","Net Debt / EBITDA":"4.2x","EV / EBITDA":"10.8x","Gross Margin %":"52%"},"FUND":{"Fund Ownership %":"58.0%","Cost (fund share)":"920.0","Realized Proceeds":"80.0","Unrealized Value":"1,050.0","Total Value (fund)":"1,130.0","Multiple of Cost":"1.2x","Gross IRR":"11.8%"},"STATIC":{"Country":"USA","Sector":"Energy","CEO":"Patricia Green","Founded Year":"2019","Employees":"4,200","HQ City":"Houston, TX","Website":"energytransitionco.com"},"STATIC (FREE METRICS)":{"ESG Score":"A","Board Seats Held":"3","Co-investors":"GIP","Deal Type":"Platform Build","Hold Period (yrs)":"2.0"}},
  "Metro Office REIT":       {"ASSET INVESTMENT":{"Entry date":"2021/11/01","Total capital invested":"1,200,000,000","Total distributions":"50,000,000","Residual value (FMV)":"1,180,000,000","Total value":"1,230,000,000","Multiple on invested capital (MOIC)":"1.02","Asset IRR":"2.4%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"480,000,000","EBITDA (LTM)":"336,000,000","EBITDA Margin":"70.0%","Net Revenue Growth YoY":"-3%","Net Debt / EBITDA":"6.8x","EV / EBITDA":"12.1x","Gross Margin %":"80%"},"FUND":{"Fund Ownership %":"80.0%","Cost (fund share)":"1,200.0","Realized Proceeds":"50.0","Unrealized Value":"1,180.0","Total Value (fund)":"1,230.0","Multiple of Cost":"1.0x","Gross IRR":"2.4%"},"STATIC":{"Country":"USA","Sector":"Real Estate","CEO":"Howard Chen","Founded Year":"2008","Employees":"890","HQ City":"New York, NY","Website":"metroofficereit.com"},"STATIC (FREE METRICS)":{"ESG Score":"B-","Board Seats Held":"1","Co-investors":"None","Deal Type":"Platform REIT","Hold Period (yrs)":"2.2"}},
  "Harbor Freight Trust":    {"ASSET INVESTMENT":{"Entry date":"2022/05/01","Total capital invested":"580,000,000","Total distributions":"30,000,000","Residual value (FMV)":"680,000,000","Total value":"710,000,000","Multiple on invested capital (MOIC)":"1.22","Asset IRR":"12.4%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"720,000,000","EBITDA (LTM)":"252,000,000","EBITDA Margin":"35.0%","Net Revenue Growth YoY":"+7%","Net Debt / EBITDA":"4.0x","EV / EBITDA":"9.8x","Gross Margin %":"60%"},"FUND":{"Fund Ownership %":"72.0%","Cost (fund share)":"580.0","Realized Proceeds":"30.0","Unrealized Value":"680.0","Total Value (fund)":"710.0","Multiple of Cost":"1.2x","Gross IRR":"12.4%"},"STATIC":{"Country":"USA","Sector":"Logistics","CEO":"Susan Park","Founded Year":"2012","Employees":"5,100","HQ City":"Long Beach, CA","Website":"harborfreighttrust.com"},"STATIC (FREE METRICS)":{"ESG Score":"B","Board Seats Held":"2","Co-investors":"Ares Capital","Deal Type":"Buyout","Hold Period (yrs)":"1.8"}},
  "Sunbelt Industrial":      {"ASSET INVESTMENT":{"Entry date":"2023/02/01","Total capital invested":"420,000,000","Total distributions":"10,000,000","Residual value (FMV)":"460,000,000","Total value":"470,000,000","Multiple on invested capital (MOIC)":"1.12","Asset IRR":"9.8%"},"ASSET PERFORMANCE":{"Revenue (LTM)":"680,000,000","EBITDA (LTM)":"170,000,000","EBITDA Margin":"25.0%","Net Revenue Growth YoY":"+13%","Net Debt / EBITDA":"2.9x","EV / EBITDA":"8.2x","Gross Margin %":"42%"},"FUND":{"Fund Ownership %":"88.0%","Cost (fund share)":"420.0","Realized Proceeds":"10.0","Unrealized Value":"460.0","Total Value (fund)":"470.0","Multiple of Cost":"1.1x","Gross IRR":"9.8%"},"STATIC":{"Country":"USA","Sector":"Industrials","CEO":"Mike Torres","Founded Year":"2020","Employees":"2,900","HQ City":"Atlanta, GA","Website":"sunbeltindustrial.com"},"STATIC (FREE METRICS)":{"ESG Score":"C+","Board Seats Held":"2","Co-investors":"None","Deal Type":"Buyout","Hold Period (yrs)":"0.8"}},
};

// ── Top-level helper components (no inner component definitions) ──────────────

function SortIcon({ col, sortBy, sortDir }) {
  const active = sortBy === col;
  return (
    <span style={{ fontSize: 9, color: active ? C.brand : C.textDim, marginLeft: 2 }}>
      {active ? (sortDir === 1 ? "▲" : "▼") : "⇅"}
    </span>
  );
}

function HighlightText({ text, highlightedValues }) {
  if (!text || !highlightedValues || !highlightedValues.length) return <>{text}</>;
  let parts = [text];
  highlightedValues.filter(Boolean).forEach(hv => {
    parts = parts.flatMap(p => {
      if (typeof p !== "string") return [p];
      const i = p.indexOf(hv);
      if (i === -1) return [p];
      return [
        p.slice(0, i),
        <mark key={hv + i} style={{ background: "rgba(251,191,36,.35)", outline: "2px solid #F59E0B", outlineOffset: 1, borderRadius: 2, padding: "0 1px", fontWeight: 700, color: "inherit", animation: "pulseHL 2s infinite" }}>{hv}</mark>,
        p.slice(i + hv.length)
      ];
    });
  });
  return <>{parts}</>;
}

function PDFHeader({ fund, page, s }) {
  return (
    <div>
      <div style={{ background: "#1E0A3C", padding: `${13*s}px ${24*s}px`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: `${10*s}px` }}>
          <div style={{ width: 40*s, height: 40*s, background: "#fff", borderRadius: 5*s, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18*s, color: "#1E0A3C", fontFamily: "serif" }}>W</div>
          <div>
            <div style={{ fontSize: `${13*s}px`, fontWeight: 700, color: "#fff" }}>{fund.name}</div>
            <div style={{ fontSize: `${9*s}px`, color: "rgba(255,255,255,.45)", marginTop: 2*s }}>{fund.reportDate} Fund Quarterly Report · Performance Report</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: `${9*s}px`, color: "rgba(255,255,255,.3)", letterSpacing: "0.5px", marginBottom: 2*s }}>PAGE</div>
          <div style={{ fontSize: `${18*s}px`, fontWeight: 700, color: "rgba(255,255,255,.7)", fontFamily: "'IBM Plex Mono',monospace" }}>{page}</div>
        </div>
      </div>
      <div style={{ height: 3*s, background: "linear-gradient(90deg,#7C3AED,#A855F7,#EC4899,#7C3AED)" }} />
    </div>
  );
}

function PDFSubRow({ label, data, bg, s }) {
  return (
    <tr style={{ background: bg }}>
      <td colSpan={3} style={{ padding: `${5*s}px ${6*s}px`, color: "#fff", fontSize: `${9.5*s}px`, fontWeight: 700 }}>{label}</td>
      {data.map((v, i) => (
        <td key={i} style={{ padding: `${5*s}px ${6*s}px`, color: "#fff", fontSize: `${10*s}px`, fontWeight: 700, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{v}</td>
      ))}
    </tr>
  );
}

function MetricRow({ row, activeCell, setAC, setValue }) {
  const ia = activeCell && activeCell.asset === row.asset && activeCell.metric === row.metric;
  return (
    <div className="row-hover" onClick={() => setAC({ asset: row.asset, metric: row.metric })}
      style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 30px", borderBottom: "1px solid #F3F4F6", borderLeft: ia ? `3px solid ${C.brand}` : "3px solid transparent", background: ia ? C.bgActive : C.bg, cursor: "pointer", transition: "border-left .1s,background .1s" }}>
      <div onClick={e => e.stopPropagation()} style={{ padding: "6px 8px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.border}` }}>
        <input type="checkbox" style={{ width: 11, height: 11 }} />
      </div>
      <div style={{ padding: "6px 10px", fontSize: 11, color: ia ? C.brand : C.textSec, borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.metric}</span>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ padding: "4px 8px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: row.modified ? C.amber : row.status === "found" ? C.green : C.border, display: "inline-block" }} />
        <input className={`val-input ${row.modified ? "modified" : row.status === "found" ? "filled" : "empty"}`}
          value={row.value} placeholder="not found — type to add"
          onChange={e => setValue(row.asset, row.metric, e.target.value)}
          onClick={e => { e.stopPropagation(); setAC({ asset: row.asset, metric: row.metric }); }} />
      </div>
      <div style={{ padding: "6px 4px", fontSize: 10, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>
        {(row.status === "found" || row.modified) ? "4" : "—"}
      </div>
    </div>
  );
}

function ListRow({ row, activeCell, setAC, setValue }) {
  const ia = activeCell && activeCell.asset === row.asset && activeCell.metric === row.metric;
  const m = ASSET_META[row.asset] || {};
  return (
    <div className="row-hover" onClick={() => setAC({ asset: row.asset, metric: row.metric })}
      style={{ display: "grid", gridTemplateColumns: "30px 160px 1fr 1fr 30px", borderBottom: "1px solid #F3F4F6", borderLeft: ia ? `3px solid ${C.brand}` : "3px solid transparent", background: ia ? C.bgActive : C.bg, cursor: "pointer", transition: "border-left .1s,background .1s" }}>
      <div onClick={e => e.stopPropagation()} style={{ padding: "6px 8px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.border}` }}>
        <input type="checkbox" style={{ width: 11, height: 11 }} />
      </div>
      <div style={{ padding: "5px 10px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>{m.icon || "🏢"}</span>
        <span style={{ fontSize: 11, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.asset}</span>
      </div>
      <div style={{ padding: "6px 10px", fontSize: 11, color: ia ? C.brand : C.textSec, borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.metric}</span>
      </div>
      <div onClick={e => e.stopPropagation()} style={{ padding: "4px 8px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: row.modified ? C.amber : row.status === "found" ? C.green : C.border, display: "inline-block" }} />
        <input className={`val-input ${row.modified ? "modified" : row.status === "found" ? "filled" : "empty"}`}
          value={row.value} placeholder="not found — type to add"
          onChange={e => setValue(row.asset, row.metric, e.target.value)}
          onClick={e => { e.stopPropagation(); setAC({ asset: row.asset, metric: row.metric }); }} />
      </div>
      <div style={{ padding: "6px 4px", fontSize: 10, color: C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>
        {(row.status === "found" || row.modified) ? "4" : "—"}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", background: "#F8F9FB", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", animation: "spin 1.5s linear infinite", boxShadow: "0 4px 20px rgba(124,58,237,.3)" }}>A</div>
      <div style={{ fontSize: 14, color: "#6B7280" }}>Loading fund report…</div>
      <div style={{ width: 200, height: 4, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, height: "100%", width: "55%", background: "linear-gradient(90deg,#7C3AED,#A855F7)", borderRadius: 2, animation: "barslide 1s ease infinite" }} />
      </div>
    </div>
  );
}

function PDFPage({ page, fund, zoom, highlightedValues, activeCell }) {
  const s = zoom / 100;
  const baseStyle = { width: `${750*s}px`, minHeight: `${1060*s}px`, background: "#fff", borderRadius: 3, boxShadow: "0 4px 30px rgba(0,0,0,.14)", overflow: "hidden", flexShrink: 0, fontFamily: "'IBM Plex Sans','Helvetica Neue',sans-serif", color: "#1A202C", fontSize: `${11.5*s}px`, transition: "width .2s" };

  if (page === 4) {
    const T = [
      { name: "Local Standing & Move",  date: "Dec-12", wecp: "87.8%", cap: "77.5",  real: "236.4", unreal: "—",   tot: "236.4", moic: "3.1x", irr: "51.5%",   s: "realized" },
      { name: "Great Sea Smoothing",    date: "May-14", wecp: "70.2%", cap: "62.2",  real: "171.9", unreal: "2.3", tot: "174.2", moic: "2.8x", irr: "48.6%",   s: "realized" },
      { name: "Watchmen International", date: "Oct-14", wecp: "61.5%", cap: "85.1",  real: "259.4", unreal: "—",   tot: "259.4", moic: "3.0x", irr: "78.5%",   s: "realized" },
      { name: "Expert Crew",            date: "Aug-15", wecp: "56.3%", cap: "163.1", real: "518.5", unreal: "—",   tot: "518.5", moic: "3.2x", irr: "156.7%",  s: "realized" },
      { name: "Winter Capital III",     date: "Mar-16", wecp: "—",     cap: "61.6",  real: "119.5", unreal: "—",   tot: "119.5", moic: "1.9x", irr: "104.6%",  s: "unrealized" },
      { name: "IPA Cold Transfer",      date: "Jan-12", wecp: "82.0%", cap: "140.5", real: "68.6",  unreal: "—",   tot: "68.6",  moic: "0.5x", irr: "(46.1%)", s: "unrealized" },
      { name: "DoubleFace Skin Wealth", date: "Nov-15", wecp: "83.7%", cap: "66.8",  real: "—",     unreal: "—",   tot: "—",     moic: "0.0x", irr: "NM",      s: "unrealized" },
    ];
    const isHL = (v) => highlightedValues.some(h => h && v && v.toString().includes(h));
    const vals = (r) => [r.date, r.wecp, r.cap, r.real, r.unreal, r.tot, r.moic, r.irr];
    const ths = ["($ in millions)", "Entry Date", `${fund.short} Ownership`, "Capital Invested", "Realized Proceeds", "Unrealized Value", "Total Value", "Multiple of Cost", "Gross IRR"];

    return (
      <div style={baseStyle}>
        <PDFHeader fund={fund} page={page} s={s} />
        <div style={{ padding: `${16*s}px ${24*s}px` }}>
          <p style={{ fontSize: `${11*s}px`, color: "#4B5563", marginBottom: `${14*s}px`, lineHeight: 1.6 }}>The table below summarizes Fund VII's investment performance as of June 30, 2020<sup>(a)</sup>.</p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: `${10*s}px` }}>
            <thead>
              <tr style={{ background: "#1E0A3C" }}>
                {ths.map((h, i) => (
                  <th key={i} style={{ padding: `${5*s}px ${6*s}px`, color: "#fff", fontWeight: 600, fontSize: `${8.5*s}px`, textAlign: i === 0 ? "left" : "right", borderRight: i < 8 ? "1px solid rgba(255,255,255,.1)" : "none", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "#EDE9FE" }}><td colSpan={9} style={{ padding: `${4*s}px ${6*s}px`, fontSize: `${9*s}px`, fontWeight: 700, color: "#5B21B6" }}>Realized Investments</td></tr>
              {T.filter(r => r.s === "realized").map((r, i) => {
                const ra = activeCell && activeCell.asset === r.name;
                return (
                  <tr key={i} style={{ background: ra ? "#F5F3FF" : i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F1F5F9", borderLeft: ra ? "3px solid #6C3AED" : "3px solid transparent" }}>
                    <td style={{ padding: `${5*s}px ${6*s}px`, fontWeight: 600, color: ra ? "#6C3AED" : "#1E293B", whiteSpace: "nowrap" }}>
                      <HighlightText text={r.name} highlightedValues={highlightedValues} />
                    </td>
                    {vals(r).map((v, vi) => {
                      const hi = isHL(v);
                      return (
                        <td key={vi} style={{ padding: `${5*s}px ${6*s}px`, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace", background: hi ? "rgba(251,191,36,.2)" : "transparent", outline: hi ? "2px solid #F59E0B" : "none", outlineOffset: -1, fontWeight: hi ? 700 : 400, color: hi ? "#78350F" : "#374151" }}>
                          <HighlightText text={v} highlightedValues={highlightedValues} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <PDFSubRow label="Realized Investments(b)" data={["$658.8", "$1,374.3", "$2.3", "$1,376.6", "2.1x", "40.8%"]} bg="#6C3AED" s={s} />
              <tr style={{ background: "#ECFDF5" }}><td colSpan={9} style={{ padding: `${4*s}px ${6*s}px`, fontSize: `${9*s}px`, fontWeight: 700, color: "#065F46" }}>Unrealized Investments</td></tr>
              {T.filter(r => r.s === "unrealized").map((r, i) => {
                const ra = activeCell && activeCell.asset === r.name;
                return (
                  <tr key={i} style={{ background: ra ? "#F5F3FF" : i % 2 === 0 ? "#fff" : "#FAFAFA", borderBottom: "1px solid #F1F5F9", borderLeft: ra ? "3px solid #6C3AED" : "3px solid transparent" }}>
                    <td style={{ padding: `${5*s}px ${6*s}px`, fontWeight: 600, color: ra ? "#6C3AED" : "#1E293B", whiteSpace: "nowrap" }}>
                      <HighlightText text={r.name} highlightedValues={highlightedValues} />
                    </td>
                    {vals(r).map((v, vi) => {
                      const hi = isHL(v);
                      return (
                        <td key={vi} style={{ padding: `${5*s}px ${6*s}px`, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace", background: hi ? "rgba(251,191,36,.2)" : "transparent", outline: hi ? "2px solid #F59E0B" : "none", outlineOffset: -1, fontWeight: hi ? 700 : 400, color: hi ? "#78350F" : "#374151" }}>
                          <HighlightText text={v} highlightedValues={highlightedValues} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <PDFSubRow label="Unrealized Investments" data={["$499.8", "$254.3", "$594.3", "$848.6", "1.7x", "14.4%"]} bg="#059669" s={s} />
              <tr style={{ background: "#1E0A3C" }}>
                <td colSpan={3} style={{ padding: `${6*s}px ${6*s}px`, color: "#fff", fontSize: `${11*s}px`, fontWeight: 800 }}>Total Investments</td>
                {["$1,158.7", "$1,628.6", "$596.6", "$2,225.2", "1.9x", "26.1%"].map((v, i) => (
                  <td key={i} style={{ padding: `${6*s}px ${6*s}px`, color: "#fff", fontSize: `${11*s}px`, fontWeight: 800, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 14*s, paddingTop: 10*s, borderTop: "1px solid #E5E7EB" }}>
            {[
              "(a) Past performance of WECP or any other investments described herein are provided for illustrative purposes only.",
              "(b) Capital invested represents aggregate capital invested by WECP, as applicable, in each portfolio company.",
              "(c) Realized Proceeds represents the sum of all net proceeds generated from dispositions.",
              "(d) Realized investments reflect all investments that have been exited or substantially exited as of June 30, 2020.",
            ].map((fn, i) => <p key={i} style={{ fontSize: `${8*s}px`, color: "#9CA3AF", lineHeight: 1.5, marginBottom: 3*s }}>{fn}</p>)}
          </div>
        </div>
      </div>
    );
  }

  const gMap = {
    1: { t: "Cover Page", i: "📋", d: `${fund.name} · ${fund.reportDate}` },
    2: { t: "Table of Contents", i: "📑", d: "Document navigation index" },
    3: { t: "Executive Summary", i: "📊", d: "Key performance highlights and fund status" },
    5: { t: "Asset Detail", i: "🏦", d: "Portfolio company deep dive" },
    6: { t: "Asset Detail", i: "🌊", d: "Portfolio company deep dive" },
    7: { t: "Asset Detail", i: "🔐", d: "Portfolio company deep dive" },
    8: { t: "Asset Detail", i: "⚙️", d: "Portfolio company deep dive" },
  };
  const g = gMap[page] || { t: `Page ${page}`, i: "📄", d: "" };
  return (
    <div style={baseStyle}>
      <PDFHeader fund={fund} page={page} s={s} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500*s, gap: 12*s, padding: 40*s }}>
        <div style={{ fontSize: 40*s }}>{g.i}</div>
        <div style={{ fontSize: 18*s, fontWeight: 700, color: "#111827", textAlign: "center" }}>{g.t}</div>
        <div style={{ fontSize: 12*s, color: "#6B7280" }}>{g.d}</div>
        <div style={{ marginTop: 8*s, padding: `${10*s}px ${16*s}px`, background: "#EDE9FE", border: "1px solid #DDD6FE", borderRadius: 8*s, fontSize: 11*s, color: "#6C3AED", textAlign: "center" }}>
          Navigate to <strong>page 4</strong> to see the performance table with interactive highlighting
        </div>
      </div>
    </div>
  );
}

function FundDashboard({ fund, fundEdits, setFundEdits, assets }) {
  function getVal(f) { const k = `${fund.id}__${f}`; return k in fundEdits ? fundEdits[k] : String(fund[f] ?? ""); }
  function setVal(f, v) { setFundEdits(p => ({ ...p, [`${fund.id}__${f}`]: v })); }
  function isMod(f) { const k = `${fund.id}__${f}`; return k in fundEdits && fundEdits[k] !== String(fund[f] ?? ""); }
  const editedCount = Object.keys(fundEdits).filter(k => k.startsWith(fund.id + "__")).length;

  const KPI_GROUPS = [
    { title: "PERFORMANCE METRICS", icon: "📈", color: "#6C3AED", colorBg: "#F5F3FF", items: [
      { label: "Net IRR",     field: "irr",         hint: "Annualised net internal rate of return" },
      { label: "TVPI",        field: "tvpi",         hint: "Total value to paid-in capital" },
      { label: "DPI",         field: "dpi",          hint: "Distributions to paid-in capital" },
      { label: "NAV",         field: "nav",          hint: "Net asset value as of last report" },
    ]},
    { title: "CAPITAL ACCOUNT", icon: "💰", color: "#059669", colorBg: "#ECFDF5", items: [
      { label: "Fund Size",   field: "size",         hint: "Total committed capital" },
      { label: "Committed",   field: "committed",    hint: "Capital formally committed by LPs" },
      { label: "Called",      field: "called",       hint: "Capital drawn down to date" },
      { label: "Distributed", field: "distributed",  hint: "Capital returned to LPs to date" },
    ]},
    { title: "FUND STRUCTURE", icon: "🏛️", color: "#2563EB", colorBg: "#EFF6FF", items: [
      { label: "Vintage",     field: "vintage",      hint: "Year fund was established" },
      { label: "Strategy",    field: "strategy",     hint: "Primary investment strategy" },
      { label: "Mgmt Fee",    field: "fee",          hint: "Annual management fee rate" },
      { label: "Carry",       field: "carry",        hint: "Performance fee (carry) rate" },
    ]},
    { title: "LEGAL & ADMIN", icon: "⚖️", color: "#D97706", colorBg: "#FFFBEB", items: [
      { label: "GP Entity",   field: "gp",           hint: "General partner legal entity" },
      { label: "Jurisdiction",field: "jurisdiction", hint: "Fund domicile and legal jurisdiction" },
      { label: "Inception",   field: "inceptionDate",hint: "Fund inception / first close date" },
      { label: "Next Close",  field: "nextClose",    hint: "Upcoming LP close date (if any)" },
    ]},
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#F8F9FB" }}>
      {/* Banner */}
      <div style={{ background: "#1E0A3C", padding: "22px 28px 18px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 350, height: "100%", background: "linear-gradient(135deg,rgba(124,58,237,.15),rgba(168,85,247,.07))", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, position: "relative" }}>
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 16px rgba(124,58,237,.4)" }}>{fund.short.charAt(0)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(167,139,250,.2)", color: "#DDD6FE", border: "1px solid rgba(167,139,250,.25)", borderRadius: 4, padding: "2px 8px" }}>{fund.strategy}</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: fund.status === "Active" ? "rgba(16,185,129,.18)" : fund.status === "Harvesting" ? "rgba(217,119,6,.18)" : "rgba(37,99,235,.18)", color: fund.status === "Active" ? "#6EE7B7" : fund.status === "Harvesting" ? "#FCD34D" : "#93C5FD", border: `1px solid ${fund.status === "Active" ? "rgba(16,185,129,.25)" : fund.status === "Harvesting" ? "rgba(217,119,6,.25)" : "rgba(37,99,235,.25)"}`, borderRadius: 4, padding: "2px 8px" }}>● {fund.status}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: 4 }}>{fund.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{fund.manager} · {fund.reportDate} · {assets.length} portfolio companies</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            {editedCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ background: "rgba(217,119,6,.18)", border: "1px solid rgba(217,119,6,.28)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#FCD34D", fontWeight: 600 }}>⚡ {editedCount} field{editedCount > 1 ? "s" : ""} edited</div>
                <button onClick={() => setFundEdits(p => { const n = { ...p }; Object.keys(n).filter(k => k.startsWith(fund.id + "__")).forEach(k => delete n[k]); return n; })} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit" }}>Reset</button>
              </div>
            )}
            <button style={{ background: "#6C3AED", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>💾 Save Changes</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 18, flexWrap: "wrap" }}>
          {[["Fund", fund.name.length > 38 ? fund.short : fund.name], ["Manager", fund.manager], ["Report", fund.reportDate], ["Status", fund.status], ["Portfolio", assets.length + " cos"]].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, padding: "6px 12px" }}>
              <div style={{ fontSize: 8.5, color: "rgba(255,255,255,.38)", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 2 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.82)", fontWeight: 600, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit hint */}
      <div style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A", padding: "9px 28px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>✏️</span>
        <span style={{ fontSize: 11.5, color: "#92400E" }}>All fields below are <strong>editable</strong> — click any value to update it. Changes are highlighted in amber.</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10.5, color: "#D97706", fontWeight: 700 }}>🏦 FUND-LEVEL DASHBOARD</span>
      </div>

      {/* KPI Cards */}
      <div style={{ padding: "22px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {KPI_GROUPS.map(group => (
          <div key={group.title} className="kpi-card" style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)", transition: "border-color .2s,box-shadow .2s" }}>
            <div style={{ background: group.colorBg, borderBottom: "1px solid #E5E7EB", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 17 }}>{group.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: group.color, letterSpacing: "0.6px" }}>{group.title}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {group.items.map(({ label, field, hint }, i) => {
                const val = getVal(field);
                const mod = isMod(field);
                const hasVal = val && safeTrim(val);
                return (
                  <div key={field} style={{ padding: "16px 18px", borderRight: i % 2 === 0 ? "1px solid #E5E7EB" : "none", borderBottom: i < 2 ? "1px solid #E5E7EB" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</span>
                      <span title={hint} style={{ fontSize: 10, color: C.textDim, cursor: "help" }}>ⓘ</span>
                      {mod && <span style={{ fontSize: 8, background: C.amberBg, color: C.amber, border: "1px solid #FDE68A", borderRadius: 3, padding: "0 4px", fontWeight: 700, marginLeft: "auto" }}>EDITED</span>}
                    </div>
                    <input className={`metric-input-cell${mod ? " modified" : ""}`}
                      value={val} placeholder={`Enter ${label.toLowerCase()}…`}
                      onChange={e => setVal(field, e.target.value)}
                      style={{ color: mod ? C.amber : hasVal ? group.color : C.textDim }} />
                    {!hasVal && !mod && <div style={{ fontSize: 9.5, color: C.textDim, marginTop: 3, fontStyle: "italic" }}>Click to add a value</div>}
                    {(hasVal || mod) && <div style={{ fontSize: 9.5, color: C.textMuted, marginTop: 3 }}>{hint}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio table */}
      <div style={{ margin: "0 28px 32px", background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
        <div style={{ background: "#F5F3FF", borderBottom: "1px solid #E5E7EB", padding: "12px 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 17 }}>📊</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.brand, letterSpacing: "0.6px" }}>PORTFOLIO COMPANIES</span>
          <span style={{ fontSize: 10, fontWeight: 600, background: C.brand, color: "#fff", borderRadius: 4, padding: "1px 7px", marginLeft: 4 }}>{assets.length} assets</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 10.5, color: C.textMuted }}>Data from ASSET INVESTMENT tab</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px 125px 115px 85px 80px", background: C.bgPanel, borderBottom: "1px solid #E5E7EB" }}>
          {["PORTFOLIO COMPANY", "ENTRY", "INVESTED", "DISTRIBUTIONS", "FMV", "MOIC", "IRR"].map((h, i) => (
            <div key={i} style={{ padding: "8px 12px", fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.7px", borderRight: i < 6 ? "1px solid #E5E7EB" : "none" }}>{h}</div>
          ))}
        </div>
        {assets.map((asset, idx) => {
          const meta = ASSET_META[asset] || { icon: "🏢", color: C.brand, invStatus: "Active" };
          const inv = (ASSET_DATA[asset] && ASSET_DATA[asset]["ASSET INVESTMENT"]) || {};
          const sColor = { Realized: C.green, Unrealized: C.brand, Active: C.amber }[meta.invStatus] || C.textDim;
          const sBg = { Realized: C.greenBg, Unrealized: C.brandLight, Active: C.amberBg }[meta.invStatus] || C.bgPanel;
          return (
            <div key={asset} style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px 125px 115px 85px 80px", borderBottom: idx < assets.length - 1 ? "1px solid #F3F4F6" : "none", background: idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
              <div style={{ padding: "11px 12px", display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid #E5E7EB" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${meta.color}15`, border: `1px solid ${meta.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{meta.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 2 }}>{asset}</div>
                  <span style={{ fontSize: 8.5, fontWeight: 600, background: sBg, color: sColor, borderRadius: 3, padding: "1px 5px" }}>{meta.invStatus}</span>
                </div>
              </div>
              {[inv["Entry date"] || "—", inv["Total capital invested"] || "—", inv["Total distributions"] || "—", inv["Residual value (FMV)"] || "—", inv["Multiple on invested capital (MOIC)"] || "—", inv["Asset IRR"] || "—"].map((v, vi) => (
                <div key={vi} style={{ padding: "11px 12px", fontSize: 11.5, fontFamily: "'IBM Plex Mono',monospace", color: v === "—" ? C.textDim : C.textSec, fontWeight: v === "—" ? 400 : 500, borderRight: vi < 5 ? "1px solid #E5E7EB" : "none", display: "flex", alignItems: "center" }}>{v}</div>
              ))}
            </div>
          );
        })}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 130px 125px 115px 85px 80px", background: "#1E0A3C" }}>
          <div style={{ padding: "11px 12px", fontSize: 11, fontWeight: 700, color: "#fff", borderRight: "1px solid rgba(255,255,255,.1)" }}>FUND TOTALS</div>
          <div style={{ borderRight: "1px solid rgba(255,255,255,.1)" }} />
          {["$1,158.7M", "$1,628.6M", "$596.6M", "1.9x", "26.1%"].map((v, i) => (
            <div key={i} style={{ padding: "11px 12px", fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "'IBM Plex Mono',monospace", borderRight: i < 4 ? "1px solid rgba(255,255,255,.1)" : "none" }}>{v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FundListScreen({ onOpen }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("vintage");
  const [sortDir, setSortDir] = useState(-1);
  const [hovered, setHovered] = useState(null);

  const SC = { Buyout: "#6C3AED", "Growth Equity": "#059669", Infrastructure: "#2563EB", "Real Assets": "#D97706" };
  const stC = { Active: C.green, Harvesting: C.amber, Deploying: C.blue };
  const stB = { Active: C.greenBg, Harvesting: C.amberBg, Deploying: C.blueBg };

  function toggleSort(col) { if (sortBy === col) setSortDir(d => -d); else { setSortBy(col); setSortDir(1); } }

  let rows = FUNDS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.strategy.toLowerCase().includes(search.toLowerCase()) ||
    f.manager.toLowerCase().includes(search.toLowerCase())
  );
  rows = [...rows].sort((a, b) => {
    const av = a[sortBy] ?? "", bv = b[sortBy] ?? "";
    return typeof av === "number" ? (av - bv) * sortDir : av.toString().localeCompare(bv.toString()) * sortDir;
  });

  const COLS = [
    { k: "name",        l: "FUND NAME", w: "1fr",  ns: true },
    { k: "strategy",    l: "STRATEGY",  w: "108px", ns: true },
    { k: "vintage",     l: "VINTAGE",   w: "70px" },
    { k: "size",        l: "SIZE",      w: "88px" },
    { k: "nav",         l: "NAV",       w: "88px" },
    { k: "irr",         l: "NET IRR",   w: "78px" },
    { k: "tvpi",        l: "TVPI",      w: "74px" },
    { k: "dpi",         l: "DPI",       w: "74px" },
    { k: "assetsCount", l: "ASSETS",    w: "62px" },
    { k: "status",      l: "STATUS",    w: "90px", ns: true },
    { k: "_action",     l: "",          w: "76px", ns: true },
  ];
  const gridCols = COLS.map(c => c.w).join(" ");

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", background: "#F8F9FB", minHeight: "100vh", display: "flex", flexDirection: "column", color: C.text }}>
      {/* Nav */}
      <div style={{ background: "#1E0A3C", display: "flex", alignItems: "center", padding: "0 24px", height: 52, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 28 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>A</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.4px" }}>accelex</span>
        </div>
        {["DASHBOARD", "DOCUMENTS", "TRACKER", "AUDIT"].map(n => (
          <button key={n} style={{ background: "none", border: "none", borderBottom: n === "DOCUMENTS" ? "2px solid #A855F7" : "2px solid transparent", marginBottom: "-1px", padding: "0 14px", height: 52, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.7px", color: n === "DOCUMENTS" ? "#E9D5FF" : "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>BL</div>
      </div>

      {/* Page header */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, padding: "22px 28px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.brand, letterSpacing: "0.6px", marginBottom: 5 }}>VALIDATE METRICS · STEP 2 OF 2</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-0.6px", lineHeight: 1.2 }}>Fund Portfolio</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>Select a fund to open its validation workspace and review extracted metrics against the quarterly report.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {[["Total Funds", FUNDS.length.toString(), "under management"], ["Active / Deploying", "3", "currently active"], ["Total NAV", "$14.8B", "aggregate value"]].map(([l, v, s]) => (
              <div key={l} style={{ background: C.bgPanel, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", minWidth: 118, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.5px", marginBottom: 4 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.brand, fontFamily: "'IBM Plex Mono',monospace", lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: `1.5px solid ${C.border}`, borderRadius: 9, padding: "9px 14px", width: 420, marginTop: 18, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by fund name, strategy or manager…" style={{ background: "none", border: "none", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none", flex: 1 }} />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>}
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, padding: "0 28px 28px", overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: gridCols, background: "#fff", border: `1px solid ${C.border}`, borderRadius: "10px 10px 0 0", marginTop: 16, borderBottom: "none", minWidth: 900 }}>
          {COLS.map((col, i) => (
            <div key={col.k} onClick={col.ns ? undefined : () => toggleSort(col.k)}
              style={{ padding: "10px 14px", fontSize: 9.5, fontWeight: 700, color: sortBy === col.k ? C.brand : C.textDim, letterSpacing: "0.6px", userSelect: "none", cursor: col.ns ? "default" : "pointer", display: "flex", alignItems: "center", borderRight: i < COLS.length - 1 ? `1px solid ${C.border}` : "none", whiteSpace: "nowrap" }}>
              {col.l}
              {!col.ns && <SortIcon col={col.k} sortBy={sortBy} sortDir={sortDir} />}
            </div>
          ))}
        </div>

        <div style={{ border: `1px solid ${C.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", background: "#fff", overflow: "hidden", minWidth: 900 }}>
          {rows.map((fund, idx) => {
            const sc = SC[fund.strategy] || C.brand;
            const stc = stC[fund.status] || C.textMuted;
            const stb = stB[fund.status] || C.bgPanel;
            const isHov = hovered === fund.id;
            const irrN = parseFloat(fund.irr);
            const tvpiN = parseFloat(fund.tvpi);
            const dpiN = parseFloat(fund.dpi);
            return (
              <div key={fund.id} className="fund-row"
                onMouseEnter={() => setHovered(fund.id)} onMouseLeave={() => setHovered(null)}
                onClick={() => onOpen(fund)}
                style={{ display: "grid", gridTemplateColumns: gridCols, borderBottom: idx < rows.length - 1 ? "1px solid #F3F4F6" : "none", background: isHov ? "#F5F3FF" : "#fff", animation: "fadeUp .15s ease", minWidth: 900 }}>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: `${sc}10`, border: `1.5px solid ${sc}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📁</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isHov ? C.brand : C.text, lineHeight: 1.25, marginBottom: 2 }}>{fund.name}</div>
                    <div style={{ fontSize: 10.5, color: C.textMuted }}>{fund.manager}</div>
                  </div>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, background: `${sc}10`, color: sc, border: `1px solid ${sc}18`, borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap" }}>{fund.strategy}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600, color: C.textSec }}>{fund.vintage}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: C.text }}>{fund.size}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: C.text }}>{fund.nav}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: irrN >= 20 ? C.green : irrN >= 12 ? C.amber : C.red }}>{fund.irr}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: tvpiN >= 1.8 ? C.green : tvpiN >= 1.3 ? C.amber : C.red }}>{fund.tvpi}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, color: dpiN >= 1.5 ? C.green : dpiN >= 0.8 ? C.amber : C.red }}>{fund.dpi}</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.textSec, fontFamily: "'IBM Plex Mono',monospace" }}>{fund.assetsCount}</span>
                  <span style={{ fontSize: 9.5, color: C.textDim }}>cos</span>
                </div>
                <div style={{ padding: "13px 14px", borderRight: `1px solid ${C.border}`, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 600, background: stb, color: stc, border: `1px solid ${stc}22`, borderRadius: 5, padding: "3px 8px", whiteSpace: "nowrap" }}>● {fund.status}</span>
                </div>
                <div style={{ padding: "13px 14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="fund-open-btn" style={{ background: isHov ? C.brand : C.brandLight, border: `1px solid ${isHov ? C.brand : "#DDD6FE"}`, borderRadius: 7, padding: "5px 12px", fontSize: 11, color: isHov ? "#fff" : C.brand, fontWeight: 600, transition: "all .2s", whiteSpace: "nowrap" }}>Open →</div>
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <div style={{ textAlign: "center", color: C.textDim, padding: "48px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14, color: C.textMuted }}>No funds match "<strong>{search}</strong>"</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.textDim, fontWeight: 600 }}>Latest reports:</span>
          {rows.map(f => (
            <span key={f.id} style={{ fontSize: 10, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "3px 10px", color: C.textMuted }}>
              <strong style={{ color: C.textSec }}>{f.short}</strong> · {f.reportDate}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function useResizable(initial = 48, min = 28, max = 72) {
  const [pct, setPct] = useState(initial);
  const dragging = useRef(false);
  const containerRef = useRef(null);
  const onMouseDown = useCallback(e => { e.preventDefault(); dragging.current = true; document.body.style.cursor = "col-resize"; document.body.style.userSelect = "none"; }, []);
  useEffect(() => {
    const mv = e => { if (!dragging.current || !containerRef.current) return; const r = containerRef.current.getBoundingClientRect(); setPct(Math.min(max, Math.max(min, ((e.clientX - r.left) / r.width) * 100))); };
    const up = () => { dragging.current = false; document.body.style.cursor = ""; document.body.style.userSelect = ""; };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, [min, max]);
  return { pct, containerRef, onMouseDown };
}

export default function App() {
  const [screen, setScreen]     = useState("list");
  const [selectedFund, setSF]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [metricType, setMT]     = useState("ASSET INVESTMENT");
  const [viewMode, setVM]       = useState("group");
  const [filter, setFilter]     = useState("all");
  const [highlightMode, setHM]  = useState("single");
  const [activeCell, setAC]     = useState(null);
  const [editedValues, setEV]   = useState({});
  const [expandedAssets, setEA] = useState(new Set());
  const [pdfPage, setPdfPage]   = useState(4);
  const [zoom, setZoom]         = useState(100);
  const [searchQ, setSearchQ]   = useState("");
  const [showTabInfo, setSTI]   = useState(false);
  const [showGroupInfo, setSGI] = useState(false);
  const [fundEdits, setFE]      = useState({});
  const { pct, containerRef, onMouseDown } = useResizable();

  function openFund(fund) {
    setLoading(true);
    setTimeout(() => { setSF(fund); setScreen("workspace"); setLoading(false); setMT("ASSET INVESTMENT"); setFilter("all"); setAC(null); setEV({}); setEA(new Set()); setPdfPage(4); setVM("group"); }, 700);
  }

  if (loading) return <><style>{GLOBAL_CSS}</style><LoadingScreen /></>;
  if (screen === "list") return <><style>{GLOBAL_CSS}</style><FundListScreen onOpen={openFund} /></>;

  const fund = selectedFund;
  const assets = ASSETS_BY_FUND[fund.id] || [];
  const metrics = METRICS_BY_TYPE[metricType] || [];

  function getValue(a, m) { const k = `${a}__${m}`; return k in editedValues ? editedValues[k] : ((ASSET_DATA[a] && ASSET_DATA[a][metricType] && ASSET_DATA[a][metricType][m]) ?? ""); }
  function setValue(a, m, v) { setEV(p => ({ ...p, [`${a}__${m}`]: v })); if (v.trim()) setAC({ asset: a, metric: m }); }
  function isModified(a, m) { const k = `${a}__${m}`; return k in editedValues && editedValues[k] !== ((ASSET_DATA[a] && ASSET_DATA[a][metricType] && ASSET_DATA[a][metricType][m]) ?? ""); }

  const allRows = assets.flatMap(a => metrics.map(m => { const v = getValue(a, m); return { id: `${a}__${m}`, asset: a, metric: m, value: v, status: safeTrim(v) ? "found" : "not_found", modified: isModified(a, m) }; }));
  const foundRows = allRows.filter(r => r.status === "found");
  const missingRows = allRows.filter(r => r.status === "not_found");
  let filtered = filter === "found" ? foundRows : filter === "not_found" ? missingRows : allRows;
  if (searchQ) filtered = filtered.filter(r => r.asset.toLowerCase().includes(searchQ.toLowerCase()) || r.metric.toLowerCase().includes(searchQ.toLowerCase()));

  function assetProgress(a) { const vs = metrics.map(m => getValue(a, m)); const f = vs.filter(v => safeTrim(v)).length; return { filled: f, total: metrics.length, pct: metrics.length ? Math.round(f / metrics.length * 100) : 0 }; }

  const highlightedValues = (() => {
    if (highlightMode === "none") return [];
    if (highlightMode === "single" && activeCell) return [getValue(activeCell.asset, activeCell.metric)].filter(Boolean);
    if (highlightMode === "current_filter") return filtered.filter(r => r.value).map(r => r.value);
    if (highlightMode === "all") return allRows.filter(r => r.value).map(r => r.value);
    return [];
  })();

  const TABS = Object.keys(METRICS_BY_TYPE);
  const tabMeta = TAB_META[metricType];

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',sans-serif", background: C.bg, height: "100vh", display: "flex", flexDirection: "column", fontSize: 13, color: C.text, overflow: "hidden" }}>
      <style>{GLOBAL_CSS}</style>

      {/* Nav */}
      <div style={{ background: "#1E0A3C", display: "flex", alignItems: "center", padding: "0 20px", height: 50, flexShrink: 0 }}>
        <div onClick={() => setScreen("list")} style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 28, cursor: "pointer" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#7C3AED,#A855F7)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>A</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "-0.3px" }}>accelex</span>
        </div>
        {["DASHBOARD", "DOCUMENTS", "TRACKER", "AUDIT", "FILTERS", "REFERENCE"].map(n => (
          <button key={n} style={{ background: "none", border: "none", borderBottom: n === "DOCUMENTS" ? "2px solid #A855F7" : "2px solid transparent", marginBottom: "-1px", padding: "0 12px", height: 50, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.7px", color: n === "DOCUMENTS" ? "#E9D5FF" : "rgba(255,255,255,.4)", cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => setScreen("list")} style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "rgba(255,255,255,.7)", cursor: "pointer", fontFamily: "inherit", marginRight: 10 }}>← All Funds</button>
        <div style={{ background: "rgba(167,139,250,.18)", border: "1px solid rgba(167,139,250,.3)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "#DDD6FE", fontWeight: 600 }}>📁 {fund.short}</div>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", marginLeft: 10 }}>BL</div>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", padding: "0 20px", height: 40, flexShrink: 0 }}>
        {[{ n: 1, l: "CONFIRM NETWORK", done: true }, { n: 2, l: "VALIDATE METRICS", done: false }].map(({ n, l, done }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 7, paddingRight: 14, height: "100%", borderBottom: !done ? `2px solid ${C.brand}` : "2px solid transparent" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: done ? "#10B981" : C.brand, color: "#fff", flexShrink: 0 }}>{done ? "✓" : n}</div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.7px", color: !done ? C.brand : C.textMuted }}>{l}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 18, background: C.border, margin: "0 14px" }} />
        <span style={{ fontSize: 11, color: C.textMuted }}>{fund.name}</span>
        <span style={{ fontSize: 11, color: C.textDim, margin: "0 5px" }}>›</span>
        <span style={{ fontSize: 11, color: C.textMuted }}>{fund.short} - {fund.reportDate} Fund Report.pdf</span>
        <div style={{ flex: 1 }} />
        {metricType !== "FUND" && [["Total", allRows.length, C.textSec], ["Found", foundRows.length, C.green], ["Missing", missingRows.length, C.red]].map(([l, v, col]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 16 }}>
            <span style={{ fontSize: 9, color: C.textDim, fontWeight: 600 }}>{l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: col, fontFamily: "'IBM Plex Mono',monospace" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "stretch", padding: "0 20px", flexShrink: 0 }}>
        {TABS.map(tab => {
          const tm = TAB_META[tab]; const active = metricType === tab;
          return (
            <button key={tab} className="tab-btn" onClick={() => { setMT(tab); setAC(null); setSTI(false); }}
              style={{ background: active ? C.brandLight : "transparent", border: "none", borderBottom: active ? `2px solid ${C.brand}` : "2px solid transparent", marginBottom: "-1px", padding: "8px 12px", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.3px", color: active ? C.brand : C.textMuted, cursor: "pointer", fontFamily: "inherit", transition: "all .15s", borderRadius: "4px 4px 0 0", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12 }}>{tm.icon}</span>{tab}
            </button>
          );
        })}
        <button onClick={() => setSTI(p => !p)} style={{ background: "none", border: "none", color: showTabInfo ? C.brand : C.textDim, cursor: "pointer", fontSize: 14, padding: "0 8px", display: "flex", alignItems: "center", marginLeft: 2 }}>ⓘ</button>
      </div>

      {showTabInfo && (
        <div style={{ background: C.brandLight, borderBottom: "1px solid #DDD6FE", padding: "12px 20px", flexShrink: 0, animation: "fadeUp .15s ease" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{tabMeta.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.brand }}>{metricType}</span>
                <span style={{ fontSize: 10, fontWeight: 600, background: C.brand, color: "#fff", borderRadius: 4, padding: "1px 7px" }}>{metrics.length} metrics</span>
              </div>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65, maxWidth: 680 }}>{tabMeta.desc}</p>
            </div>
            <button onClick={() => setSTI(false)} style={{ background: "none", border: "none", color: C.brand, cursor: "pointer", fontSize: 16, flexShrink: 0, fontWeight: 700, marginTop: 2 }}>✕</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.5px", alignSelf: "center", marginRight: 4 }}>METRICS:</span>
            {metrics.map(m => <span key={m} style={{ fontSize: 10, background: "#fff", border: "1px solid #DDD6FE", borderRadius: 4, padding: "2px 8px", color: C.brand, fontWeight: 500 }}>{m}</span>)}
          </div>
        </div>
      )}

      {/* FUND tab → full dashboard */}
      {metricType === "FUND" && <FundDashboard fund={fund} fundEdits={fundEdits} setFundEdits={setFE} assets={assets} />}

      {/* All other tabs → split workspace */}
      {metricType !== "FUND" && (
        <>
          {/* Filter bar */}
          <div style={{ background: C.bgPanel, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 6, padding: "7px 20px", flexShrink: 0 }}>
            {[{ k: "all", l: "All", c: allRows.length }, { k: "not_found", l: "Missing", c: missingRows.length, col: C.red }, { k: "found", l: "Found", c: foundRows.length, col: C.green }].map(({ k, l, c, col }) => (
              <button key={k} className="chip" onClick={() => setFilter(k)}
                style={{ background: filter === k ? (col ? `${col}10` : C.brandLight) : C.bg, border: `1.5px solid ${filter === k ? (col || C.brand) : C.border}`, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: filter === k ? (col || C.brand) : C.textMuted, transition: "all .15s", display: "flex", alignItems: "center", gap: 4 }}>
                {col && filter === k && <span style={{ width: 5, height: 5, borderRadius: "50%", background: col, display: "inline-block" }} />}
                {l} <strong>{c}</strong>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: "5px 10px" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search assets or metrics…" style={{ background: "none", border: "none", color: C.text, fontSize: 11, fontFamily: "inherit", outline: "none", width: 155 }} />
              {searchQ && <button onClick={() => setSearchQ("")} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>}
            </div>
            <div style={{ display: "flex", alignItems: "center", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 2 }}>
              {[["list", "List"], ["group", "Group"]].map(([v, l]) => (
                <button key={v} className="view-btn" onClick={() => setVM(v)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, transition: "all .15s", background: viewMode === v ? C.brand : "transparent", color: viewMode === v ? "#fff" : C.textMuted }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    {v === "list"
                      ? <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>
                      : <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>}
                  </svg>{l}
                </button>
              ))}
            </div>
            {viewMode === "group" && <button onClick={() => setSGI(p => !p)} style={{ background: showGroupInfo ? C.brandLight : "none", border: `1px solid ${showGroupInfo ? C.brand : C.border}`, borderRadius: 6, padding: "5px 9px", fontSize: 11, color: showGroupInfo ? C.brand : C.textDim, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>⊞ How grouping works</button>}
            <button style={{ background: C.brand, border: "none", borderRadius: 7, padding: "5px 13px", fontSize: 11, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ Add manually</button>
          </div>

          {showGroupInfo && viewMode === "group" && (
            <div style={{ background: "#FFFBF5", borderBottom: "1px solid #FDE68A", padding: "14px 20px", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 10 }}>⊞ How Group View works</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      {[["Group = Portfolio Company", "Each header = one company in the fund."], ["Rows = Tab metrics", "Expand to see all metrics for that company."], ["Progress bar = Tab completion", "Filled metrics ÷ total metrics in the current tab."], ["Click header to toggle", "Search auto-expands matching groups."]].map(([t, d]) => (
                        <div key={t} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                          <span style={{ color: "#D97706", fontWeight: 700, flexShrink: 0 }}>→</span>
                          <div><div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{t}</div><div style={{ fontSize: 10.5, color: C.textMuted, lineHeight: 1.5 }}>{d}</div></div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "0.6px", marginBottom: 6 }}>PER TAB</div>
                      {Object.entries(TAB_META).map(([tab, tm]) => (
                        <div key={tab} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 13, flexShrink: 0 }}>{tm.icon}</span>
                          <div><span style={{ fontSize: 10.5, fontWeight: 700, color: tm.color }}>{tab}: </span><span style={{ fontSize: 10.5, color: C.textMuted }}>{METRICS_BY_TYPE[tab].slice(0, 2).join(", ")}{METRICS_BY_TYPE[tab].length > 2 ? ` +${METRICS_BY_TYPE[tab].length - 2} more` : ""}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSGI(false)} style={{ background: "none", border: "none", color: "#D97706", cursor: "pointer", fontSize: 16, flexShrink: 0, fontWeight: 700 }}>✕</button>
              </div>
            </div>
          )}

          {/* Split view */}
          <div ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
            {/* LEFT */}
            <div style={{ width: `${pct}%`, display: "flex", flexDirection: "column", background: C.bg, overflow: "hidden", flexShrink: 0 }}>
              <div style={{ background: C.bgPanel, borderBottom: `1px solid ${C.border}`, padding: "4px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.7px", color: C.textDim }}>{viewMode === "list" ? "LIST VIEW — flat table" : "GROUP VIEW — by portfolio company"}</span>
                <span style={{ fontSize: 9, color: C.textDim, marginLeft: "auto" }}>{viewMode === "list" ? `${filtered.length} rows` : `${assets.length} companies · ${metrics.length} metrics`}</span>
              </div>

              {/* List view */}
              {viewMode === "list" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "30px 160px 1fr 1fr 30px", background: C.bgPanel, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                    {["", "ASSET NAME", "METRIC NAME", "VALUE  (editable)", "PG"].map((h, i) => (
                      <div key={i} style={{ padding: "7px 10px", fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.7px", borderRight: i < 4 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center" }}>
                        {i === 0 ? <input type="checkbox" style={{ width: 12, height: 12 }} /> : h}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {filtered.length === 0 && <div style={{ padding: "48px 24px", textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div><div style={{ fontSize: 13, color: C.textMuted }}>No metrics match your filters</div></div>}
                    {filtered.map((row, idx) => <ListRow key={row.id} row={row} activeCell={activeCell} setAC={setAC} setValue={setValue} />)}
                  </div>
                </>
              )}

              {/* Group view */}
              {viewMode === "group" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 30px", background: C.bgPanel, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                    {["", "METRIC NAME", "VALUE  (editable)", "PG"].map((h, i) => (
                      <div key={i} style={{ padding: "7px 10px", fontSize: 9, fontWeight: 700, color: C.textDim, letterSpacing: "0.7px", borderRight: i < 3 ? `1px solid ${C.border}` : "none", display: "flex", alignItems: "center" }}>
                        {i === 0 ? <input type="checkbox" style={{ width: 12, height: 12 }} /> : h}
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {assets.map(asset => {
                      const meta = ASSET_META[asset] || { icon: "🏢", color: C.brand, sector: "—", country: "—", invStatus: "—" };
                      const prog = assetProgress(asset);
                      const expanded = expandedAssets.has(asset);
                      const sColor = { Realized: C.green, Unrealized: C.brand, Active: C.amber }[meta.invStatus] || C.textDim;
                      const sBg = { Realized: C.greenBg, Unrealized: C.brandLight, Active: C.amberBg }[meta.invStatus] || C.bgPanel;
                      const assetRows = metrics.map(metric => {
                        const val = getValue(asset, metric);
                        return { id: `${asset}__${metric}`, asset, metric, value: val, status: safeTrim(val) ? "found" : "not_found", modified: isModified(asset, metric) };
                      }).filter(r =>
                        (filter === "found" ? r.status === "found" : filter === "not_found" ? r.status === "not_found" : true) &&
                        (!searchQ || r.metric.toLowerCase().includes(searchQ.toLowerCase()) || asset.toLowerCase().includes(searchQ.toLowerCase()))
                      );
                      if (searchQ && assetRows.length === 0) return null;
                      if (filter !== "all" && assetRows.length === 0) return null;
                      return (
                        <div key={asset} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <div onClick={() => setEA(p => { const n = new Set(p); n.has(asset) ? n.delete(asset) : n.add(asset); return n; })}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer", background: expanded ? "#F8F7FF" : C.bg, borderLeft: `3px solid ${expanded ? meta.color : "transparent"}`, transition: "background .12s" }}>
                            <span style={{ fontSize: 11, color: expanded ? C.brand : C.textDim, flexShrink: 0, fontWeight: 600 }}>{expanded ? "▾" : "▸"}</span>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `${meta.color}18`, border: `1px solid ${meta.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{meta.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: expanded ? C.text : C.textSec, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset}</div>
                              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                                <span style={{ fontSize: 9, color: C.textDim }}>{meta.sector}</span>
                                <span style={{ fontSize: 9, color: C.border }}>·</span>
                                <span style={{ fontSize: 9, color: C.textDim }}>{meta.country}</span>
                                <span style={{ fontSize: 9, fontWeight: 600, background: sBg, color: sColor, borderRadius: 3, padding: "1px 5px", marginLeft: 2 }}>{meta.invStatus}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", color: prog.pct === 100 ? C.green : prog.pct > 50 ? C.amber : C.red }}>{prog.pct}%</span>
                                <span style={{ fontSize: 9, color: C.textDim }}>{prog.filled}/{prog.total}</span>
                              </div>
                              <div style={{ width: 54, height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: `${prog.pct}%`, height: "100%", background: prog.pct === 100 ? C.green : prog.pct > 50 ? C.amber : C.red, borderRadius: 2, transition: "width .3s" }} />
                              </div>
                            </div>
                          </div>
                          {(expanded || !!searchQ) && assetRows.map((row) => (
                            <MetricRow key={row.id} row={row} activeCell={activeCell} setAC={setAC} setValue={setValue} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              <div style={{ padding: "7px 14px", borderTop: `1px solid ${C.border}`, background: C.bgPanel, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{allRows.length} rows · {foundRows.length} found · {missingRows.length} missing</span>
                {Object.keys(editedValues).length > 0 && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.amber, fontWeight: 600 }}>⚡ {Object.keys(editedValues).length} edited</span>
                    <button onClick={() => setEV({})} style={{ background: "none", border: "none", fontSize: 10, color: C.textDim, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>Reset</button>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="dh" onMouseDown={onMouseDown} style={{ width: 8, background: "transparent", cursor: "col-resize", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 10, position: "relative" }}>
              <div className="dl" style={{ width: 2, height: "100%", background: C.border, position: "absolute" }} />
              <div className="dg" style={{ background: C.bg, border: `1px solid ${C.borderStrong}`, borderRadius: 4, padding: "5px 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: C.textDim, fontSize: 5, zIndex: 1, lineHeight: 1 }}>
                {["●", "●", "●"].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>

            {/* RIGHT: PDF */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#ECECF0", overflow: "hidden", minWidth: 0 }}>
              <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 11, color: C.brand, fontWeight: 600, flexShrink: 0 }}>{fund.name}</span>
                  <span style={{ color: C.textDim }}>›</span>
                  <span style={{ fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fund.short} - {fund.reportDate} Fund Report.pdf</span>
                </div>
                <button style={{ background: C.bgPanel, border: `1px solid ${C.border}`, color: C.textMuted, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>BACK</button>
                <button style={{ background: C.brand, border: "none", color: "#fff", padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>FINISH</button>
              </div>

              {/* PDF controls */}
              <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "6px 16px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9.5, color: C.textDim, fontWeight: 700, letterSpacing: "0.5px" }}>VIEW</span>
                <div style={{ display: "flex", alignItems: "center", background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 5, padding: "1px 2px" }}>
                  <button onClick={() => setZoom(z => Math.max(50, z - 10))} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", padding: "2px 7px", fontSize: 14, fontFamily: "inherit" }}>−</button>
                  <span style={{ fontSize: 11, color: C.textSec, minWidth: 38, textAlign: "center", fontFamily: "'IBM Plex Mono',monospace" }}>{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(200, z + 10))} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", padding: "2px 7px", fontSize: 14, fontFamily: "inherit" }}>+</button>
                </div>
                <div style={{ width: 1, height: 16, background: C.border }} />
                <span style={{ fontSize: 9.5, color: C.textDim, fontWeight: 700, letterSpacing: "0.5px" }}>PAGE</span>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {[["⇤", () => setPdfPage(1), pdfPage <= 1], ["‹", () => setPdfPage(p => Math.max(1, p - 1)), pdfPage <= 1]].map(([ic, fn, dis], i) => (
                    <button key={i} onClick={fn} disabled={dis} style={{ background: C.bgPanel, border: `1px solid ${C.border}`, color: dis ? C.textDim : C.textSec, borderRadius: 4, width: 22, height: 22, cursor: dis ? "default" : "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                  ))}
                  <input value={pdfPage} onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= 8) setPdfPage(v); }} style={{ width: 30, background: C.bgPanel, border: `1px solid ${C.border}`, borderRadius: 4, color: C.text, textAlign: "center", fontSize: 11, fontFamily: "'IBM Plex Mono',monospace", padding: "2px 0", outline: "none" }} />
                  <span style={{ fontSize: 11, color: C.textDim }}>of 8</span>
                  {[["›", () => setPdfPage(p => Math.min(8, p + 1)), pdfPage >= 8], ["⇥", () => setPdfPage(8), pdfPage >= 8]].map(([ic, fn, dis], i) => (
                    <button key={i} onClick={fn} disabled={dis} style={{ background: C.bgPanel, border: `1px solid ${C.border}`, color: dis ? C.textDim : C.textSec, borderRadius: 4, width: 22, height: 22, cursor: dis ? "default" : "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px", display: "flex", justifyContent: "center", background: "#ECECF0" }}>
                <PDFPage page={pdfPage} fund={fund} zoom={zoom} highlightedValues={highlightedValues} activeCell={activeCell} />
              </div>

              {/* Highlight controls */}
              <div style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
                <span style={{ fontSize: 9.5, color: C.textDim, fontWeight: 700, letterSpacing: "0.8px", flexShrink: 0 }}>HIGHLIGHT</span>
                {[{ k: "current_filter", l: "Current filter" }, { k: "single", l: "Single metric" }, { k: "all", l: "All metrics" }, { k: "none", l: "None" }].map(({ k, l }) => (
                  <div key={k} onClick={() => setHM(k)} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                    <div style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${highlightMode === k ? C.brand : C.borderStrong}`, background: highlightMode === k ? C.brand : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
                      {highlightMode === k && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 11, color: highlightMode === k ? C.brand : C.textMuted, fontWeight: highlightMode === k ? 600 : 400, whiteSpace: "nowrap" }}>{l}</span>
                  </div>
                ))}
                {activeCell && highlightMode === "single" && (
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 10px", flexShrink: 0 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.amber, display: "inline-block" }} />
                    <span style={{ fontSize: 11, color: "#92400E", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{activeCell.asset} · {activeCell.metric}</span>
                    <button onClick={() => setAC(null)} style={{ background: "none", border: "none", color: C.amber, cursor: "pointer", fontSize: 12, padding: 0, marginLeft: 2, lineHeight: 1 }}>✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
