import { useState } from “react”;

const components = [
{
category: “Inputs”,
color: “#1976d2”,
items: [
{ name: “Button”, usecase: “Triggering actions like form submit, navigation, dialogs”, code: `<Button variant="contained">Submit</Button>` },
{ name: “IconButton”, usecase: “Compact icon-only actions like delete, edit, share”, code: `<IconButton><DeleteIcon /></IconButton>` },
{ name: “TextField”, usecase: “User text input — login forms, search bars, data entry”, code: `<TextField label="Email" variant="outlined" />` },
{ name: “Select”, usecase: “Dropdown selection from a list of options”, code: `<Select value={val}><MenuItem value="a">A</MenuItem></Select>` },
{ name: “Checkbox”, usecase: “Multi-select options, toggle settings, terms acceptance”, code: `<Checkbox checked={true} onChange={handleChange} />` },
{ name: “Radio”, usecase: “Single selection among mutually exclusive options”, code: `<RadioGroup><FormControlLabel value="a" control={<Radio />} label="A" /></RadioGroup>` },
{ name: “Switch”, usecase: “Toggle binary settings like dark mode, notifications”, code: `<Switch checked={checked} onChange={handleChange} />` },
{ name: “Slider”, usecase: “Range or value selection like volume, price filter”, code: `<Slider value={30} min={0} max={100} />` },
{ name: “Autocomplete”, usecase: “Searchable dropdown with suggestions like country picker”, code: `<Autocomplete options={options} renderInput={(p) => <TextField {...p} />} />` },
{ name: “Rating”, usecase: “Star ratings for reviews or feedback”, code: `<Rating value={4} onChange={handleChange} />` },
{ name: “DatePicker”, usecase: “Date selection for booking, scheduling, filters”, code: `<DatePicker label="Date" value={date} onChange={setDate} />` },
{ name: “TimePicker”, usecase: “Time selection for scheduling and reminders”, code: `<TimePicker label="Time" value={time} onChange={setTime} />` },
{ name: “FileInput”, usecase: “Upload files via hidden input + button trigger”, code: `<Button component="label">Upload<input type="file" hidden /></Button>` },
{ name: “ToggleButton”, usecase: “Multi-option selection like text alignment, view mode”, code: `<ToggleButtonGroup value={align}><ToggleButton value="left">Left</ToggleButton></ToggleButtonGroup>` },
]
},
{
category: “Data Display”,
color: “#388e3c”,
items: [
{ name: “Table”, usecase: “Displaying structured tabular data like reports, CRUD lists”, code: `<Table><TableHead><TableRow><TableCell>Name</TableCell></TableRow></TableHead></Table>` },
{ name: “DataGrid”, usecase: “Advanced sortable/filterable tables for large datasets”, code: `<DataGrid rows={rows} columns={columns} pageSize={5} />` },
{ name: “List”, usecase: “Displaying navigation items, settings menus, chat threads”, code: `<List><ListItem><ListItemText primary="Item" /></ListItem></List>` },
{ name: “Chip”, usecase: “Tags, filter labels, user selections, status badges”, code: `<Chip label="React" onDelete={handleDelete} />` },
{ name: “Badge”, usecase: “Notification count indicators on icons or buttons”, code: `<Badge badgeContent={4} color="error"><MailIcon /></Badge>` },
{ name: “Avatar”, usecase: “User profile photos, initials, or icon representations”, code: `<Avatar src="/photo.jpg" alt="John" />` },
{ name: “AvatarGroup”, usecase: “Stacked avatars showing team members or collaborators”, code: `<AvatarGroup max={4}><Avatar /><Avatar /></AvatarGroup>` },
{ name: “Typography”, usecase: “All text rendering — headings, body, captions, labels”, code: `<Typography variant="h4">Hello World</Typography>` },
{ name: “Tooltip”, usecase: “Contextual hints on hover for icons or truncated text”, code: `<Tooltip title="Delete"><IconButton><DeleteIcon /></IconButton></Tooltip>` },
{ name: “Divider”, usecase: “Visual separator between sections or list items”, code: `<Divider />` or `<Divider>OR</Divider>` },
{ name: “Icon”, usecase: “Visual indicators using Material Design icon library”, code: `<StarIcon color="primary" fontSize="large" />` },
{ name: “ImageList”, usecase: “Masonry or grid photo galleries”, code: `<ImageList cols={3}><ImageListItem><img src="..." /></ImageListItem></ImageList>` },
]
},
{
category: “Feedback”,
color: “#f57c00”,
items: [
{ name: “Alert”, usecase: “Success/error/warning messages after actions”, code: `<Alert severity="success">Saved successfully!</Alert>` },
{ name: “Snackbar”, usecase: “Temporary toast notifications at screen edge”, code: `<Snackbar open={open} message="Copied!" autoHideDuration={3000} />` },
{ name: “Dialog”, usecase: “Confirmation modals, forms in overlays, alerts”, code: `<Dialog open={open}><DialogContent>Content</DialogContent></Dialog>` },
{ name: “CircularProgress”, usecase: “Loading spinners for async operations”, code: `<CircularProgress />` or `<CircularProgress value={70} variant="determinate" />` },
{ name: “LinearProgress”, usecase: “File upload progress, page loading bars”, code: `<LinearProgress variant="determinate" value={60} />` },
{ name: “Skeleton”, usecase: “Placeholder loading UI before content arrives”, code: `<Skeleton variant="rectangular" width={210} height={118} />` },
{ name: “Backdrop”, usecase: “Dimming overlay behind modals or loading screens”, code: `<Backdrop open={open}><CircularProgress /></Backdrop>` },
]
},
{
category: “Navigation”,
color: “#7b1fa2”,
items: [
{ name: “AppBar”, usecase: “Top navigation bar with logo, title, and actions”, code: `<AppBar position="static"><Toolbar><Typography>App</Typography></Toolbar></AppBar>` },
{ name: “Drawer”, usecase: “Side navigation panels, mobile menus, filters sidebar”, code: `<Drawer open={open} onClose={toggle}><List>...</List></Drawer>` },
{ name: “BottomNavigation”, usecase: “Mobile tab bar navigation at the bottom of screen”, code: `<BottomNavigation value={val}><BottomNavigationAction label="Home" /></BottomNavigation>` },
{ name: “Tabs”, usecase: “Switching between content views like profile/settings/posts”, code: `<Tabs value={tab} onChange={handleChange}><Tab label="Home" /></Tabs>` },
{ name: “Breadcrumbs”, usecase: “Showing navigation hierarchy like Home > Products > Shoes”, code: `<Breadcrumbs><Link href="/">Home</Link><Typography>Products</Typography></Breadcrumbs>` },
{ name: “Menu”, usecase: “Contextual dropdowns like user profile or action menus”, code: `<Menu open={open} anchorEl={el}><MenuItem>Profile</MenuItem></Menu>` },
{ name: “Pagination”, usecase: “Page navigation for tables or content lists”, code: `<Pagination count={10} page={page} onChange={handleChange} />` },
{ name: “SpeedDial”, usecase: “Floating action button with expandable sub-actions”, code: `<SpeedDial ariaLabel="actions" icon={<SpeedDialIcon />}>...</SpeedDial>` },
{ name: “Stepper”, usecase: “Multi-step forms like checkout, onboarding wizards”, code: `<Stepper activeStep={1}><Step><StepLabel>Step 1</StepLabel></Step></Stepper>` },
{ name: “Link”, usecase: “Styled anchor links with MUI theming”, code: `<Link href="/about" underline="hover">About</Link>` },
]
},
{
category: “Layout & Surfaces”,
color: “#c62828”,
items: [
{ name: “Box”, usecase: “Utility container with sx prop for quick styling/spacing”, code: `<Box sx={{ p: 2, display: 'flex', gap: 2 }}>...</Box>` },
{ name: “Container”, usecase: “Centered max-width content wrapper for page layouts”, code: `<Container maxWidth="lg">...</Container>` },
{ name: “Grid”, usecase: “12-column responsive grid layout for page structure”, code: `<Grid container spacing={2}><Grid item xs={12} md={6}>...</Grid></Grid>` },
{ name: “Stack”, usecase: “Flex layout shortcut for vertical/horizontal stacking”, code: `<Stack spacing={2} direction="row">...</Stack>` },
{ name: “Paper”, usecase: “Elevated surface containers for cards, panels, forms”, code: `<Paper elevation={3} sx={{ p: 2 }}>Content</Paper>` },
{ name: “Card”, usecase: “Self-contained content blocks like product or blog cards”, code: `<Card><CardContent><Typography>Title</Typography></CardContent></Card>` },
{ name: “Accordion”, usecase: “Expandable FAQ, settings panels, collapsible content”, code: `<Accordion><AccordionSummary>Q</AccordionSummary><AccordionDetails>A</AccordionDetails></Accordion>` },
{ name: “AppBar + Toolbar”, usecase: “App header with nav items, search, profile actions”, code: `<AppBar><Toolbar><IconButton>...</IconButton></Toolbar></AppBar>` },
]
},
{
category: “Utils & Theming”,
color: “#00695c”,
items: [
{ name: “ThemeProvider”, usecase: “Global theme customization — colors, typography, spacing”, code: `<ThemeProvider theme={theme}><App /></ThemeProvider>` },
{ name: “CssBaseline”, usecase: “Normalize browser CSS, apply MUI’s baseline styles”, code: `<CssBaseline />` },
{ name: “GlobalStyles”, usecase: “Inject global CSS into the document”, code: `<GlobalStyles styles={{ body: { background: '#f5f5f5' } }} />` },
{ name: “useMediaQuery”, usecase: “Responsive breakpoint detection in components”, code: `const isMobile = useMediaQuery(theme.breakpoints.down('sm'));` },
{ name: “useTheme”, usecase: “Access current theme values in components”, code: `const theme = useTheme(); // theme.palette.primary.main` },
{ name: “Collapse”, usecase: “Animate height transitions for show/hide content”, code: `<Collapse in={open}><Alert>More info</Alert></Collapse>` },
{ name: “Fade”, usecase: “Fade in/out transitions for modals, tooltips”, code: `<Fade in={checked}><Box>Content</Box></Fade>` },
{ name: “Grow”, usecase: “Scale+fade transition for popups and menus”, code: `<Grow in={checked}><Box>Content</Box></Grow>` },
{ name: “Zoom”, usecase: “Zoom transitions for FABs and speed dials”, code: `<Zoom in={checked}><Fab>+</Fab></Zoom>` },
{ name: “ClickAwayListener”, usecase: “Detect clicks outside a component to close dropdowns”, code: `<ClickAwayListener onClickAway={handleClose}><Box>...</Box></ClickAwayListener>` },
{ name: “Portal”, usecase: “Render children outside DOM hierarchy (for modals)”, code: `<Portal container={document.body}><Alert>Floating</Alert></Portal>` },
{ name: “Popper”, usecase: “Low-level positioning for custom dropdowns/tooltips”, code: `<Popper open={open} anchorEl={el}><Paper>Content</Paper></Popper>` },
]
}
];

export default function MUIReference() {
const [activeCategory, setActiveCategory] = useState(null);
const [search, setSearch] = useState(””);
const [expandedItem, setExpandedItem] = useState(null);

const filtered = components.map(cat => ({
…cat,
items: cat.items.filter(item =>
item.name.toLowerCase().includes(search.toLowerCase()) ||
item.usecase.toLowerCase().includes(search.toLowerCase())
)
})).filter(cat => cat.items.length > 0);

const display = activeCategory
? filtered.filter(c => c.category === activeCategory)
: filtered;

const total = components.reduce((sum, c) => sum + c.items.length, 0);

return (
<div style={{ fontFamily: “‘Segoe UI’, system-ui, sans-serif”, minHeight: “100vh”, background: “#f8f9fa”, color: “#1a1a1a” }}>
{/* Header */}
<div style={{ background: “linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)”, color: “white”, padding: “40px 32px 32px”, position: “sticky”, top: 0, zIndex: 100, boxShadow: “0 4px 20px rgba(0,0,0,0.2)” }}>
<div style={{ maxWidth: 1100, margin: “0 auto” }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 12, marginBottom: 8 }}>
<div style={{ width: 36, height: 36, background: “rgba(255,255,255,0.2)”, borderRadius: 8, display: “flex”, alignItems: “center”, justifyContent: “center”, fontSize: 20 }}>⬡</div>
<h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: “-0.5px” }}>Material UI Components</h1>
<span style={{ background: “rgba(255,255,255,0.2)”, borderRadius: 20, padding: “2px 10px”, fontSize: 13, marginLeft: 4 }}>{total} components</span>
</div>
<p style={{ margin: “0 0 20px”, opacity: 0.8, fontSize: 14 }}>Complete reference with use cases and code snippets</p>

```
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input
          placeholder="🔍  Search components or use cases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: "10px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.15)", color: "white", fontSize: 14, outline: "none", backdropFilter: "blur(10px)" }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => setActiveCategory(null)} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.3)", background: !activeCategory ? "white" : "transparent", color: !activeCategory ? "#1565c0" : "white", fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>All</button>
          {components.map(c => (
            <button key={c.category} onClick={() => setActiveCategory(activeCategory === c.category ? null : c.category)}
              style={{ padding: "8px 14px", borderRadius: 6, border: `1px solid ${activeCategory === c.category ? c.color : "rgba(255,255,255,0.3)"}`, background: activeCategory === c.category ? c.color : "transparent", color: "white", fontSize: 12, cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
              {c.category}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* Content */}
  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
    {display.map(category => (
      <div key={category.category} style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 4, height: 28, background: category.color, borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: category.color }}>{category.category}</h2>
          <span style={{ background: category.color + "18", color: category.color, borderRadius: 12, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{category.items.length}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
          {category.items.map(item => {
            const key = `${category.category}-${item.name}`;
            const isOpen = expandedItem === key;
            return (
              <div key={item.name}
                onClick={() => setExpandedItem(isOpen ? null : key)}
                style={{ background: "white", borderRadius: 10, border: `1px solid ${isOpen ? category.color : "#e8eaed"}`, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s", boxShadow: isOpen ? `0 4px 16px ${category.color}22` : "0 1px 4px rgba(0,0,0,0.06)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: isOpen ? category.color : "transparent", transition: "all 0.2s" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{item.name}</span>
                      <span style={{ background: category.color + "15", color: category.color, borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>MUI</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: "#5f6368", lineHeight: 1.5 }}>{item.usecase}</p>
                  </div>
                  <span style={{ fontSize: 16, color: category.color, marginLeft: 8, transition: "transform 0.2s", display: "block", transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: 14, borderTop: "1px dashed #e8eaed", paddingTop: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: category.color, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Code Example</div>
                    <pre style={{ margin: 0, background: "#f8f9fa", border: "1px solid #e8eaed", borderRadius: 6, padding: "10px 12px", fontSize: 11.5, overflowX: "auto", color: "#37474f", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{item.code}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}

    {display.length === 0 && (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#9aa0a6" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>No components found</div>
        <div style={{ fontSize: 14, marginTop: 8 }}>Try a different search term</div>
      </div>
    )}

    <div style={{ marginTop: 40, padding: "20px 24px", background: "#e8f0fe", borderRadius: 10, borderLeft: "4px solid #1976d2" }}>
      <div style={{ fontWeight: 700, color: "#1565c0", marginBottom: 4 }}>💡 Pro Tip</div>
      <div style={{ fontSize: 13, color: "#1a73e8", lineHeight: 1.6 }}>
        Click any component card to see its code example. Use the category filters or search bar to quickly find what you need. MUI v5+ uses <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: 3 }}>sx</code> prop for styling and <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: 3 }}>@mui/material</code> as the main package.
      </div>
    </div>
  </div>
</div>
```

);
}
