/**
 * RichTextEditor.jsx — MUI + TipTap rich text editor (mui-tiptap style)
 * ======================================================================
 * A rich text editor built the way `mui-tiptap` builds one: every piece of
 * chrome (toolbar buttons, selects, bubble menus, color pickers) is a real
 * MUI component (ToggleButton, Select, Popper, Paper, IconButton…) themed
 * through `@mui/material/styles`, instead of hand-rolled CSS classes.
 *
 * USAGE
 * -----
 * import { RichTextEditor } from './RichTextEditor';
 *
 * <RichTextEditor
 *   value={html}
 *   onChange={(html) => setHtml(html)}
 *   readOnly={false}
 *   placeholder="Start typing…"
 *   minHeight={300}
 *   maxHeight={600}
 * />
 *
 * PROPS
 * -----
 * value       string   HTML string (controlled)
 * onChange    fn       Called with updated HTML on every change
 * readOnly    boolean  Read-only display mode (default false)
 * placeholder string   Placeholder when editor is empty
 * minHeight   number   Min editor height px (default 300)
 * maxHeight   number   Max editor height px (default 600)
 * className   string   Extra class on root element
 * onFocus     fn       Called when editor gains focus
 * onBlur      fn       Called when editor loses focus
 */

// ─── React ────────────────────────────────────────────────────────────────────
import { useState, useRef, useEffect, useMemo, useCallback } from "react";

// ─── TipTap ──────────────────────────────────────────────────────────────────
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

// ─── MUI ─────────────────────────────────────────────────────────────────────
import { styled, alpha } from "@mui/material/styles";
import {
  Box, Paper, Container, Stack, Typography, Divider, Tooltip, ToggleButton,
  IconButton, ButtonBase, TextField, Button, Select, MenuItem, FormControl,
  Popper, ClickAwayListener, Chip, Switch, FormControlLabel,
} from "@mui/material";

// ─── Icons ───────────────────────────────────────────────────────────────────
import {
  Undo, Redo, FormatBold, FormatItalic, FormatUnderlined, StrikethroughS,
  Code, Subscript as SubscriptIcon, Superscript as SuperscriptIcon,
  FormatColorText, FormatColorFill, FormatAlignLeft, FormatAlignCenter,
  FormatAlignRight, FormatAlignJustify, FormatListBulleted, FormatListNumbered,
  Checklist, FormatIndentDecrease, FormatIndentIncrease, FormatQuote,
  DataObject, HorizontalRule as HorizontalRuleIcon, TableChart, Link as LinkIcon,
  LinkOff, Image as ImageIcon, UploadFile, FormatClear, Download, Print,
  Edit, Check, ViewColumn, TableRows, DeleteOutline, DeleteForever,
  CallMerge, CallSplit, Visibility,
} from "@mui/icons-material";

// =============================================================================
// Constants
// =============================================================================

const FONT_SIZES = [
  "10", "11", "12", "13", "14", "15", "16", "18", "20", "22",
  "24", "28", "32", "36", "40", "48", "56", "64", "72",
];

const FONT_FAMILIES = [
  { label: "Default", value: "inherit" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "'Helvetica Neue', Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Palatino", value: "'Palatino Linotype', Palatino, serif" },
  { label: "Garamond", value: "Garamond, serif" },
];

const HEADING_OPTIONS = [
  { label: "Paragraph", value: "0" },
  { label: "Heading 1", value: "1" },
  { label: "Heading 2", value: "2" },
  { label: "Heading 3", value: "3" },
  { label: "Heading 4", value: "4" },
  { label: "Heading 5", value: "5" },
  { label: "Heading 6", value: "6" },
];

const TEXT_COLORS = [
  "#000000", "#111827", "#374151", "#6B7280", "#9CA3AF",
  "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#3B82F6",
  "#6366F1", "#8B5CF6", "#EC4899", "#FFFFFF",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A", "#FDE68A", "#FED7AA", "#FECACA", "#F9A8D4",
  "#DDD6FE", "#BAE6FD", "#BBF7D0", "#D1FAE5", "#E0F2FE",
  "transparent",
];

// =============================================================================
// Word-paste sanitiser
// =============================================================================

function sanitisePastedHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<meta[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/<o:[^>]*>[\s\S]*?<\/o:[^>]*>/gi, "")
    .replace(/<\/?o:[^>]*>/gi, "")
    .replace(/<\/?w:[^>]*>/gi, "")
    .replace(/<\/?m:[^>]*>/gi, "")
    .replace(/\s+class="[^"]*mso[^"]*"/gi, "")
    .replace(/\s+class='[^']*mso[^']*'/gi, "")
    .replace(/style="([^"]*)"/gi, (_, s) => {
      const cleaned = s.split(";")
        .map((p) => p.trim())
        .filter((p) => p && !/^mso-|^tab-stops/i.test(p))
        .join("; ");
      return cleaned ? `style="${cleaned}"` : "";
    });
}

// =============================================================================
// Native placeholder extension (ProseMirror decoration, no extra package)
// =============================================================================

function makePlaceholderExtension(placeholder) {
  return Extension.create({
    name: "nativePlaceholder",
    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("nativePlaceholder"),
          props: {
            decorations(state) {
              const doc = state.doc;
              const isEmpty =
                doc.childCount === 1 &&
                doc.firstChild?.isTextblock &&
                doc.firstChild?.content.size === 0;
              if (!isEmpty) return DecorationSet.empty;
              const deco = Decoration.node(0, doc.content.size, {
                "data-placeholder": placeholder,
                class: "rte-is-empty",
              });
              return DecorationSet.create(doc, [deco]);
            },
          },
        }),
      ];
    },
  });
}

// =============================================================================
// FontSize — Tiptap v2 has no official font-size package; this mirrors the
// well-known "extend textStyle" pattern (same approach the v3 package uses).
// =============================================================================

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// =============================================================================
// Extensions — memoised so the array is stable across renders
// =============================================================================

function useExtensions(placeholder) {
  return useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: "rte-code-block" } },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "blockquote"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "rte-img" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
      CharacterCount,
      makePlaceholderExtension(placeholder),
    ],
    [placeholder]
  );
}

// =============================================================================
// Themed content area — mirrors mui-tiptap's `RichTextContent` styling
// =============================================================================

const StyledEditorContent = styled(EditorContent)(({ theme }) => ({
  "& .ProseMirror": {
    outline: "none",
    padding: theme.spacing(2.25, 3),
    color: theme.palette.text.primary,
    fontSize: 15,
    lineHeight: 1.7,
    textAlign: "left",
  },
  "& .ProseMirror .rte-is-empty::before": {
    content: "attr(data-placeholder)",
    float: "left",
    color: theme.palette.text.disabled,
    pointerEvents: "none",
    height: 0,
    fontStyle: "normal",
  },
  "& .ProseMirror h1": { fontSize: "2em", fontWeight: 700, lineHeight: 1.2, margin: "0.8em 0 0.3em" },
  "& .ProseMirror h2": { fontSize: "1.6em", fontWeight: 700, lineHeight: 1.25, margin: "0.7em 0 0.3em" },
  "& .ProseMirror h3": { fontSize: "1.3em", fontWeight: 600, lineHeight: 1.3, margin: "0.6em 0 0.25em" },
  "& .ProseMirror h4": { fontSize: "1.1em", fontWeight: 600, lineHeight: 1.4, margin: "0.5em 0 0.2em" },
  "& .ProseMirror h5": { fontSize: "1em", fontWeight: 600, margin: "0.4em 0 0.2em" },
  "& .ProseMirror h6": { fontSize: "0.9em", fontWeight: 600, margin: "0.4em 0 0.2em", color: theme.palette.text.secondary },
  "& .ProseMirror p": { margin: "0 0 0.5em" },
  "& .ProseMirror p:last-child": { marginBottom: 0 },
  "& .ProseMirror a": { color: theme.palette.primary.main, textDecoration: "underline", textUnderlineOffset: 2 },
  "& .ProseMirror a:hover": { color: theme.palette.primary.dark },
  "& .ProseMirror strong": { fontWeight: 700 },
  "& .ProseMirror em": { fontStyle: "italic" },
  "& .ProseMirror u": { textDecoration: "underline", textUnderlineOffset: 2 },
  "& .ProseMirror s": { textDecoration: "line-through", color: theme.palette.text.disabled },
  "& .ProseMirror code": {
    fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code','Courier New',monospace",
    fontSize: "0.85em",
    background: theme.palette.action.hover,
    padding: "0.12em 0.35em",
    borderRadius: 4,
    color: theme.palette.error.main,
    border: `1px solid ${theme.palette.divider}`,
  },
  "& .ProseMirror pre, & .ProseMirror .rte-code-block": {
    background: "#0f172a",
    color: "#e2e8f0",
    padding: "1em 1.25em",
    borderRadius: 10,
    overflowX: "auto",
    fontSize: "0.875em",
    margin: "1em 0",
    fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code','Courier New',monospace",
    lineHeight: 1.6,
    tabSize: 2,
  },
  "& .ProseMirror pre code": { background: "transparent", color: "inherit", padding: 0, border: "none", fontSize: "inherit" },
  "& .ProseMirror blockquote": {
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    margin: "1em 0",
    padding: "0.6em 1em",
    background: alpha(theme.palette.primary.main, 0.08),
    borderRadius: "0 8px 8px 0",
    color: theme.palette.text.secondary,
    fontStyle: "italic",
  },
  "& .ProseMirror blockquote p": { margin: 0 },
  "& .ProseMirror hr": { border: "none", borderTop: `2px solid ${theme.palette.divider}`, margin: "1.5em 0" },
  "& .ProseMirror ul:not([data-type='taskList'])": { listStyle: "disc", paddingLeft: "1.75em", margin: "0.5em 0" },
  "& .ProseMirror ol": { listStyle: "decimal", paddingLeft: "1.75em", margin: "0.5em 0" },
  "& .ProseMirror li": { margin: "0.25em 0" },
  "& .ProseMirror li p": { margin: 0 },
  "& .ProseMirror ul:not([data-type='taskList']) ul": { listStyle: "circle" },
  "& .ProseMirror ul[data-type='taskList']": { listStyle: "none", padding: 0 },
  "& .ProseMirror ul[data-type='taskList'] li": { display: "flex", alignItems: "flex-start", gap: "0.6em" },
  "& .ProseMirror ul[data-type='taskList'] li > label": { marginTop: "0.15em", flexShrink: 0, cursor: "pointer" },
  "& .ProseMirror ul[data-type='taskList'] li > label input[type='checkbox']": {
    width: 15, height: 15, cursor: "pointer", accentColor: theme.palette.primary.main,
  },
  "& .ProseMirror ul[data-type='taskList'] li[data-checked='true'] > div": {
    textDecoration: "line-through", color: theme.palette.text.disabled,
  },
  "& .ProseMirror img, & .ProseMirror .rte-img": {
    maxWidth: "100%", height: "auto", borderRadius: 8, margin: "0.5em 0", display: "block",
  },
  "& .ProseMirror img.ProseMirror-selectednode": { outline: `3px solid ${theme.palette.primary.main}`, borderRadius: 8 },
  "& .ProseMirror table": { borderCollapse: "collapse", width: "100%", margin: "1em 0", fontSize: "0.93em", tableLayout: "auto" },
  "& .ProseMirror th": {
    background: theme.palette.action.hover, fontWeight: 700, color: theme.palette.text.primary,
    padding: "10px 14px", textAlign: "left", border: `1px solid ${theme.palette.divider}`, position: "relative",
  },
  "& .ProseMirror td": { padding: "9px 14px", border: `1px solid ${theme.palette.divider}`, verticalAlign: "top", position: "relative" },
  "& .ProseMirror .selectedCell::after": {
    content: '""', position: "absolute", inset: 0, background: alpha(theme.palette.primary.main, 0.12), pointerEvents: "none",
  },
  "& .ProseMirror .column-resize-handle": {
    position: "absolute", right: -2, top: 0, bottom: 0, width: 4, background: theme.palette.primary.main, cursor: "col-resize",
  },
  "& .ProseMirror .tableWrapper": { overflowX: "auto" },
  "& .ProseMirror mark": { borderRadius: 2, padding: "0 2px" },
}));

// =============================================================================
// Toolbar primitives
// =============================================================================

const iconBtnSx = {
  border: 0,
  borderRadius: 1.5,
  minWidth: 32,
  width: 32,
  height: 32,
  padding: 0,
  color: "text.secondary",
  "&:hover": { bgcolor: "action.hover" },
  "&.Mui-selected": {
    bgcolor: "primary.main",
    color: "primary.contrastText",
    "&:hover": { bgcolor: "primary.dark" },
  },
  "&.Mui-disabled": { opacity: 0.35, border: 0 },
};

function MenuButton({ tooltip, onClick, active, disabled, danger, children }) {
  return (
    <Tooltip title={tooltip} arrow disableInteractive>
      <span>
        <ToggleButton
          value="on"
          size="small"
          selected={!!active}
          disabled={!!disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => { e.preventDefault(); onClick?.(); }}
          aria-label={tooltip}
          sx={{ ...iconBtnSx, ...(danger ? { color: "error.main" } : {}) }}
        >
          {children}
        </ToggleButton>
      </span>
    </Tooltip>
  );
}

const MenuDivider = () => <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />;

function ColorSwatchButton({ tooltip, icon, colors, current, onSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={tooltip} arrow disableInteractive>
        <span>
          <ToggleButton
            value="on"
            size="small"
            selected={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => setAnchorEl((v) => (v ? null : e.currentTarget))}
            aria-label={tooltip}
            sx={iconBtnSx}
          >
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              {icon}
              <Box
                sx={{
                  position: "absolute", left: 2, right: 2, bottom: -2, height: 3, borderRadius: "2px",
                  bgcolor: current && current !== "transparent" ? current : "transparent",
                  border: !current || current === "transparent" ? "1px dashed" : "none",
                  borderColor: "divider",
                }}
              />
            </Box>
          </ToggleButton>
        </span>
      </Tooltip>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper elevation={6} sx={{ p: 1, mt: 0.5, display: "grid", gridTemplateColumns: "repeat(7, 22px)", gap: 0.5 }}>
            {colors.map((c) => (
              <Tooltip key={c} title={c === "transparent" ? "None" : c} disableInteractive>
                <ButtonBase
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { onSelect(c); setAnchorEl(null); }}
                  sx={{
                    width: 22, height: 22, borderRadius: "4px",
                    bgcolor: c === "transparent" ? "transparent" : c,
                    border: "1px solid",
                    borderColor: c === current ? "primary.main" : "divider",
                    outline: c === current ? "2px solid" : "none",
                    outlineColor: "primary.main",
                  }}
                />
              </Tooltip>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

function HeadingSelect({ editor }) {
  const value = (() => {
    for (let i = 1; i <= 6; i++) if (editor.isActive("heading", { level: i })) return String(i);
    return "0";
  })();

  return (
    <FormControl size="small" sx={{ minWidth: 126 }}>
      <Select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          v === "0"
            ? editor.chain().focus().setParagraph().run()
            : editor.chain().focus().setHeading({ level: Number(v) }).run();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{ height: 32, fontSize: 13 }}
      >
        {HEADING_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function FontFamilySelect({ editor }) {
  const value = editor.getAttributes("textStyle").fontFamily || "inherit";
  return (
    <FormControl size="small" sx={{ minWidth: 132 }}>
      <Select
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          v === "inherit"
            ? editor.chain().focus().unsetFontFamily().run()
            : editor.chain().focus().setFontFamily(v).run();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{ height: 32, fontSize: 13 }}
      >
        {FONT_FAMILIES.map((f) => (
          <MenuItem key={f.value} value={f.value} sx={{ fontSize: 13, fontFamily: f.value }}>{f.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function FontSizeSelect({ editor }) {
  const value = (editor.getAttributes("textStyle").fontSize || "").replace("px", "");
  return (
    <FormControl size="small" sx={{ minWidth: 68 }}>
      <Select
        displayEmpty
        value={FONT_SIZES.includes(value) ? value : ""}
        onChange={(e) => {
          const v = e.target.value;
          v ? editor.chain().focus().setFontSize(v + "px").run() : editor.chain().focus().unsetFontSize().run();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        sx={{ height: 32, fontSize: 13 }}
      >
        <MenuItem value="" sx={{ fontSize: 13 }}>Size</MenuItem>
        {FONT_SIZES.map((s) => (
          <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function LinkMenuButton({ editor }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [url, setUrl] = useState("");
  const open = Boolean(anchorEl);

  const apply = () => {
    if (url.trim()) {
      editor.chain().focus().extendMarkRange("link")
        .setLink({ href: url.trim(), target: "_blank", rel: "noopener noreferrer" }).run();
    }
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Insert / edit link" arrow disableInteractive>
        <span>
          <ToggleButton
            value="on"
            size="small"
            selected={editor.isActive("link") || open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => { setUrl(editor.getAttributes("link").href || ""); setAnchorEl(e.currentTarget); }}
            aria-label="Insert link"
            sx={iconBtnSx}
          >
            <LinkIcon fontSize="small" />
          </ToggleButton>
        </span>
      </Tooltip>
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper elevation={6} sx={{ p: 1, mt: 0.5, display: "flex", gap: 0.75, alignItems: "center" }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="https://example.com"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); apply(); }
                if (e.key === "Escape") setAnchorEl(null);
              }}
              sx={{ width: 260 }}
            />
            <Button size="small" variant="contained" onClick={apply}>Apply</Button>
            {editor.isActive("link") && (
              <IconButton size="small" color="error" onClick={() => { editor.chain().focus().unsetLink().run(); setAnchorEl(null); }}>
                <LinkOff fontSize="small" />
              </IconButton>
            )}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

function ImageMenuButtons({ editor }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [url, setUrl] = useState("");
  const fileRef = useRef(null);
  const open = Boolean(anchorEl);

  const apply = () => {
    if (url.trim()) editor.chain().focus().setImage({ src: url.trim() }).run();
    setAnchorEl(null);
    setUrl("");
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => editor.chain().focus().setImage({ src: ev.target.result, alt: file.name }).run();
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      <Tooltip title="Insert image URL" arrow disableInteractive>
        <span>
          <ToggleButton
            value="on" size="small" selected={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-label="Insert image"
            sx={iconBtnSx}
          >
            <ImageIcon fontSize="small" />
          </ToggleButton>
        </span>
      </Tooltip>
      <Tooltip title="Upload image" arrow disableInteractive>
        <span>
          <ToggleButton
            value="on" size="small"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            aria-label="Upload image"
            sx={iconBtnSx}
          >
            <UploadFile fontSize="small" />
          </ToggleButton>
        </span>
      </Tooltip>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1300 }}>
        <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
          <Paper elevation={6} sx={{ p: 1, mt: 0.5, display: "flex", gap: 0.75, alignItems: "center" }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="https://example.com/image.png"
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); apply(); }
                if (e.key === "Escape") setAnchorEl(null);
              }}
              sx={{ width: 260 }}
            />
            <Button size="small" variant="contained" onClick={apply}>Insert</Button>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}

// =============================================================================
// Toolbar
// =============================================================================

function EditorToolbar({ editor, wordCount, charCount, onExportHTML, onPrint }) {
  if (!editor) return null;

  const textColor = editor.getAttributes("textStyle").color || "#000000";
  const hlColor = editor.getAttributes("highlight").color || "transparent";

  return (
    <Box
      role="toolbar"
      aria-label="Formatting toolbar"
      sx={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.5,
        px: 1, py: 0.75, bgcolor: "background.default",
        borderBottom: "1px solid", borderColor: "divider",
      }}
    >
      <MenuButton tooltip="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <HeadingSelect editor={editor} />
      <FontFamilySelect editor={editor} />
      <FontSizeSelect editor={editor} />
      <MenuDivider />

      <MenuButton tooltip="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <FormatBold fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <FormatItalic fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <FormatUnderlined fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughS fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Subscript" active={editor.isActive("subscript")} onClick={() => editor.chain().focus().toggleSubscript().run()}>
        <SubscriptIcon fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Superscript" active={editor.isActive("superscript")} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
        <SuperscriptIcon fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <ColorSwatchButton
        tooltip="Text color" icon={<FormatColorText fontSize="small" />} colors={TEXT_COLORS} current={textColor}
        onSelect={(c) => (c === "transparent" ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(c).run())}
      />
      <ColorSwatchButton
        tooltip="Highlight" icon={<FormatColorFill fontSize="small" />} colors={HIGHLIGHT_COLORS} current={hlColor}
        onSelect={(c) => (c === "transparent" ? editor.chain().focus().unsetHighlight().run() : editor.chain().focus().setHighlight({ color: c }).run())}
      />
      <MenuDivider />

      <MenuButton tooltip="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <FormatAlignLeft fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <FormatAlignCenter fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <FormatAlignRight fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <FormatAlignJustify fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <MenuButton tooltip="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <FormatListBulleted fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <FormatListNumbered fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <Checklist fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Decrease indent" disabled={!editor.can().liftListItem("listItem")} onClick={() => editor.chain().focus().liftListItem("listItem").run()}>
        <FormatIndentDecrease fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Increase indent" disabled={!editor.can().sinkListItem("listItem")} onClick={() => editor.chain().focus().sinkListItem("listItem").run()}>
        <FormatIndentIncrease fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <MenuButton tooltip="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <FormatQuote fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <DataObject fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <HorizontalRuleIcon fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <MenuButton tooltip="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <TableChart fontSize="small" />
      </MenuButton>
      <LinkMenuButton editor={editor} />
      <ImageMenuButtons editor={editor} />
      <MenuDivider />

      <MenuButton tooltip="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
        <FormatClear fontSize="small" />
      </MenuButton>
      <MenuDivider />

      <MenuButton tooltip="Export as HTML" onClick={onExportHTML}>
        <Download fontSize="small" />
      </MenuButton>
      <MenuButton tooltip="Print" onClick={onPrint}>
        <Print fontSize="small" />
      </MenuButton>

      <Box sx={{ ml: "auto", pl: 1 }}>
        <Typography variant="caption" color="text.disabled" sx={{ whiteSpace: "nowrap" }}>
          {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
        </Typography>
      </Box>
    </Box>
  );
}

// =============================================================================
// Bubble menus — built on TipTap's official <BubbleMenu>, styled with MUI
// =============================================================================

function BubbleIconButton({ onClick, active, danger, title, children }) {
  return (
    <Tooltip title={title} arrow disableInteractive>
      <IconButton
        size="small"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        sx={{
          width: 28, height: 28,
          color: danger ? "#fca5a5" : "#f9fafb",
          bgcolor: active ? "rgba(255,255,255,0.22)" : "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

function SelectionBubbleMenu({ editor }) {
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="selectionBubbleMenu"
      shouldShow={({ editor: ed, state }) => {
        if (state.selection.empty) return false;
        if (ed.isActive("link") || ed.isActive("table")) return false;
        return true;
      }}
      tippyOptions={{ duration: 100, placement: "top" }}
    >
      <Paper elevation={6} sx={{ display: "flex", alignItems: "center", gap: 0.25, p: 0.5, borderRadius: 2, bgcolor: "grey.900" }}>
        <BubbleIconButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <FormatBold fontSize="small" />
        </BubbleIconButton>
        <BubbleIconButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <FormatItalic fontSize="small" />
        </BubbleIconButton>
        <BubbleIconButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <FormatUnderlined fontSize="small" />
        </BubbleIconButton>
        <BubbleIconButton title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <StrikethroughS fontSize="small" />
        </BubbleIconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: "rgba(255,255,255,0.2)" }} />
        <BubbleIconButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run()}>
          <FormatColorFill fontSize="small" />
        </BubbleIconButton>
        <BubbleIconButton
          title="Add link"
          onClick={() => {
            const url = window.prompt("Link URL:", "https://");
            if (url) editor.chain().focus().setLink({ href: url, target: "_blank", rel: "noopener noreferrer" }).run();
          }}
        >
          <LinkIcon fontSize="small" />
        </BubbleIconButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: "rgba(255,255,255,0.2)" }} />
        <BubbleIconButton title="Clear formatting" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <FormatClear fontSize="small" />
        </BubbleIconButton>
      </Paper>
    </BubbleMenu>
  );
}

function LinkBubbleMenu({ editor }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!editor) return null;

  const commit = () => {
    editor.chain().focus().extendMarkRange("link")
      .setLink({ href: draft.trim(), target: "_blank", rel: "noopener noreferrer" }).run();
    setEditing(false);
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="linkBubbleMenu"
      shouldShow={({ editor: ed }) => ed.isActive("link")}
      tippyOptions={{ placement: "bottom", duration: 100, onHidden: () => setEditing(false) }}
    >
      <Paper elevation={6} sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 0.5, borderRadius: 2 }}>
        {editing ? (
          <>
            <TextField
              size="small"
              variant="standard"
              autoFocus
              placeholder="https://…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") setEditing(false);
              }}
              sx={{ width: 220, px: 1 }}
            />
            <IconButton size="small" onClick={commit}><Check fontSize="small" /></IconButton>
          </>
        ) : (
          <>
            <Typography
              variant="body2" noWrap
              sx={{ maxWidth: 220, px: 1, color: "primary.main", textDecoration: "underline", cursor: "pointer" }}
              onClick={() => window.open(editor.getAttributes("link").href, "_blank", "noopener,noreferrer")}
            >
              {editor.getAttributes("link").href}
            </Typography>
            <Tooltip title="Edit link" arrow disableInteractive>
              <IconButton size="small" onClick={() => { setDraft(editor.getAttributes("link").href || ""); setEditing(true); }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove link" arrow disableInteractive>
              <IconButton size="small" color="error" onClick={() => editor.chain().focus().unsetLink().run()}>
                <LinkOff fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Paper>
    </BubbleMenu>
  );
}

function TableBubbleMenu({ editor }) {
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubbleMenu"
      shouldShow={({ editor: ed }) => ed.isActive("table")}
      tippyOptions={{ placement: "top", duration: 100 }}
    >
      <Paper elevation={6} sx={{ display: "flex", alignItems: "center", gap: 0.25, p: 0.5, borderRadius: 2 }}>
        <MenuButton tooltip="Add column before" onClick={() => editor.chain().focus().addColumnBefore().run()}><ViewColumn fontSize="small" /></MenuButton>
        <MenuButton tooltip="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}><ViewColumn fontSize="small" sx={{ transform: "scaleX(-1)" }} /></MenuButton>
        <MenuButton tooltip="Add row above" onClick={() => editor.chain().focus().addRowBefore().run()}><TableRows fontSize="small" /></MenuButton>
        <MenuButton tooltip="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}><TableRows fontSize="small" sx={{ transform: "scaleY(-1)" }} /></MenuButton>
        <MenuDivider />
        <MenuButton tooltip="Merge cells" onClick={() => editor.chain().focus().mergeCells().run()}><CallMerge fontSize="small" /></MenuButton>
        <MenuButton tooltip="Split cell" onClick={() => editor.chain().focus().splitCell().run()}><CallSplit fontSize="small" /></MenuButton>
        <MenuButton tooltip="Toggle header row" active={editor.isActive("tableHeader")} onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
          <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>H</Typography>
        </MenuButton>
        <MenuDivider />
        <MenuButton tooltip="Delete row" danger onClick={() => editor.chain().focus().deleteRow().run()}><DeleteOutline fontSize="small" /></MenuButton>
        <MenuButton tooltip="Delete column" danger onClick={() => editor.chain().focus().deleteColumn().run()}><DeleteOutline fontSize="small" sx={{ transform: "rotate(90deg)" }} /></MenuButton>
        <MenuButton tooltip="Delete table" danger onClick={() => editor.chain().focus().deleteTable().run()}><DeleteForever fontSize="small" /></MenuButton>
      </Paper>
    </BubbleMenu>
  );
}

// =============================================================================
// RichTextEditor — main export
// =============================================================================

export function RichTextEditor({
  value = "",
  onChange,
  readOnly = false,
  placeholder = "Start typing or paste content here…",
  minHeight = 300,
  maxHeight = 600,
  className = "",
  onFocus,
  onBlur,
}) {
  const extensions = useExtensions(placeholder);

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    editorProps: {
      attributes: {
        "aria-multiline": "true",
        "aria-label": "Rich text editor",
        role: "textbox",
        spellcheck: "true",
        style: [
          `min-height:${minHeight}px`,
          !readOnly ? `max-height:${maxHeight}px; overflow-y:auto` : "",
        ].filter(Boolean).join(";"),
      },
      handlePaste(_view, event) {
        const cd = event.clipboardData;
        if (!cd) return false;
        const html = cd.getData("text/html");
        if (html) {
          event.preventDefault();
          editor.commands.insertContent(sanitisePastedHTML(html), {
            parseOptions: { preserveWhitespace: "full" },
          });
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
    onFocus: () => onFocus?.(),
    onBlur: () => onBlur?.(),
  });

  // Sync controlled value
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value ?? "", false);
    }
  }, [value, editor]);

  // Sync readOnly
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setOptions({ editable: !readOnly });
    editor.view.updateState(editor.view.state);
  }, [readOnly, editor]);

  const wordCount = editor?.storage.characterCount.words() ?? 0;
  const charCount = editor?.storage.characterCount.characters() ?? 0;

  const handleExportHTML = useCallback(() => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Exported Document</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#111}
  h1,h2,h3,h4,h5,h6{font-weight:700;margin:1em 0 .4em}
  h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.25em}
  p{margin:.5em 0}a{color:#2563eb}
  code{background:#f3f4f6;padding:.1em .3em;border-radius:3px;font-family:monospace;color:#dc2626}
  pre{background:#1e293b;color:#e2e8f0;padding:1em;border-radius:8px;overflow-x:auto}
  pre code{background:none;color:inherit;padding:0}
  blockquote{border-left:4px solid #3b82f6;margin:1em 0;padding:.5em 1em;background:#eff6ff;border-radius:0 8px 8px 0;font-style:italic;color:#1e40af}
  table{border-collapse:collapse;width:100%;margin:1em 0}
  th,td{padding:8px 12px;border:1px solid #e2e8f0}
  th{background:#f1f5f9;font-weight:700}
  ul{list-style:disc;padding-left:1.5em}ol{list-style:decimal;padding-left:1.5em}
  img{max-width:100%;height:auto;border-radius:8px}
</style></head><body>${editor.getHTML()}</body></html>`;
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([html], { type: "text/html" })),
      download: "document.html",
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }, [editor]);

  const handlePrint = useCallback(() => {
    if (!editor) return;
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>Print</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.7;color:#111}
  h1,h2,h3{font-weight:700;margin:1em 0 .4em}
  code{background:#f3f4f6;padding:.1em .3em;border-radius:3px;font-family:monospace}
  pre{background:#f3f4f6;padding:1em;border-radius:8px;overflow-x:auto}
  blockquote{border-left:4px solid #333;padding-left:1em;font-style:italic}
  table{border-collapse:collapse;width:100%}th,td{padding:8px 12px;border:1px solid #ccc}
  th{background:#f5f5f5;font-weight:700}
  ul{list-style:disc;padding-left:1.5em}ol{list-style:decimal;padding-left:1.5em}
  img{max-width:100%}@media print{body{margin:0}}
</style></head><body>${editor.getHTML()}</body></html>`);
    w.document.close();
    w.print();
  }, [editor]);

  return (
    <Paper
      variant="outlined"
      className={className}
      sx={{
        borderRadius: 3, overflow: "hidden", display: "flex", flexDirection: "column",
        position: "relative", ...(readOnly ? { border: "none" } : {}),
      }}
    >
      {!readOnly && (
        <EditorToolbar editor={editor} wordCount={wordCount} charCount={charCount} onExportHTML={handleExportHTML} onPrint={handlePrint} />
      )}

      <Box sx={{ flex: 1, overflowY: readOnly ? "visible" : "auto", overflowX: "hidden", position: "relative" }}>
        {editor && !readOnly && <SelectionBubbleMenu editor={editor} />}
        {editor && !readOnly && <LinkBubbleMenu editor={editor} />}
        {editor && !readOnly && <TableBubbleMenu editor={editor} />}
        <StyledEditorContent editor={editor} />
      </Box>

      {!readOnly && (
        <Box
          sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 1.5, py: 0.5, bgcolor: "background.default",
            borderTop: "1px solid", borderColor: "divider", gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount} chars
          </Typography>
          <Typography variant="caption" color="text.disabled" noWrap sx={{ textAlign: "right" }}>
            Ctrl+Z undo · Ctrl+B bold · Ctrl+K link · Select text for quick format
          </Typography>
        </Box>
      )}

      {readOnly && (
        <Chip
          size="small"
          icon={<Visibility fontSize="small" />}
          label="Read-only"
          sx={{ position: "absolute", top: 10, right: 12, zIndex: 20, bgcolor: "background.paper" }}
        />
      )}
    </Paper>
  );
}

// =============================================================================
// Demo App — remove before shipping
// =============================================================================

const DEMO_HTML = `
<h1>Rich Text Editor</h1>
<p>Paste from <strong>Microsoft Word</strong>, <em>web pages</em>, Google Docs, or emails — structure is preserved automatically.</p>
<h2>Features</h2>
<ul>
  <li><strong>Text</strong> — bold, italic, underline, strikethrough, inline <code>code</code></li>
  <li><strong>Typography</strong> — font family, font size, text color, highlight</li>
  <li><strong>Structure</strong> — 6 heading levels, blockquotes, code blocks, horizontal rules</li>
  <li><strong>Lists</strong> — bulleted, numbered, task lists, nested, indent/outdent</li>
  <li><strong>Tables</strong> — insert, resize, add/delete rows &amp; columns, merge/split cells</li>
  <li><strong>Media</strong> — images via URL or file upload</li>
  <li><strong>Export</strong> — download as HTML or print</li>
</ul>
<h2>Task list</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Paste from Word preserves tables and headings</div></li>
  <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Paste from web preserves links and images</div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Select any text to see the quick-format bubble</div></li>
  <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Toggle read-only mode above</div></li>
</ul>
<h3>Blockquote</h3>
<blockquote><p>Great editors preserve every detail of your content's structure — no matter where it came from.</p></blockquote>
<h3>Code block</h3>
<pre class="rte-code-block"><code>import { RichTextEditor } from './RichTextEditor';

function MyForm() {
  const [html, setHtml] = useState('');
  return &lt;RichTextEditor value={html} onChange={setHtml} /&gt;;
}</code></pre>
<h3>Table</h3>
<table>
  <thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>MUI toolbar &amp; selects</td><td>✅</td><td>ToggleButton, Select, Popper — no custom CSS classes</td></tr>
    <tr><td>MUI bubble menus</td><td>✅</td><td>Selection, link and table menus use TipTap's BubbleMenu + MUI Paper</td></tr>
    <tr><td>Themed content</td><td>✅</td><td>Typography styled via @mui/material/styles, follows the app theme</td></tr>
    <tr><td>Dark mode</td><td>✅</td><td>Inherits from the surrounding MUI theme's palette.mode</td></tr>
  </tbody>
</table>
`;

export default function RichApp() {
  const [content, setContent] = useState(DEMO_HTML);
  const [readOnly, setReadOnly] = useState(false);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Rich Text Editor</Typography>
        <FormControlLabel
          control={<Switch checked={readOnly} onChange={(e) => setReadOnly(e.target.checked)} />}
          label="Read-only preview"
        />
      </Stack>
      <RichTextEditor
        value={content}
        onChange={setContent}
        readOnly={readOnly}
        placeholder="Start typing or paste content from Word, web pages, emails…"
        minHeight={360}
        maxHeight={700}
      />
    </Container>
  );
}
