import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

// --- Types & helpers --------------------------------------------------------
const FIELD_TYPES = ["Table", "Text", "Number", "Date"];
const EXTRACTION_TYPES = ["Explicit", "Implicit", "Heuristic"];
const COLUMN_VALUE_TYPES = ["String", "Number", "Boolean", "Date"];

const MAX_FIELD_NAME = 300;
const MAX_INSTRUCTION = 255;

const defaultColumns = [
  { name: "product_name", type: "String", description: "Name of purchased product" },
  { name: "unit_amount", type: "Number", description: "Amount of product purchased" },
  { name: "unit_price", type: "Number", description: "Price per unit of product" },
];

const emptyColumn = { name: "", type: "String", description: "" };

// --- Column Row -------------------------------------------------------------
function ColumnRow({ sectionIdx, colIdx, column, onChange, onDelete }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Column name"
            placeholder="product_name"
            value={column.name}
            onChange={(e) => onChange(sectionIdx, colIdx, { ...column, name: e.target.value })}
            inputProps={{ maxLength: 128 }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={column.type}
              onChange={(e) => onChange(sectionIdx, colIdx, { ...column, type: e.target.value })}
            >
              {COLUMN_VALUE_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4.5}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Description"
            placeholder="What does this column capture?"
            value={column.description}
            onChange={(e) => onChange(sectionIdx, colIdx, { ...column, description: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} md={0.5} sx={{ display: "flex", justifyContent: { xs: "flex-end", md: "center" } }}>
          <Tooltip title="Remove column">
            <IconButton onClick={() => onDelete(sectionIdx, colIdx)} aria-label={`delete-column-${sectionIdx}-${colIdx}`}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Paper>
  );
}

// --- Column Section ---------------------------------------------------------
function ColumnSection({ idx, section, onAddColumn, onChangeColumn, onDeleteColumn, onDeleteSection }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Column Specific fields
        </Typography>
        <Chip size="small" label={`Section ${idx + 1}`} />
        <Chip size="small" label={`${section.columns.length} column${section.columns.length !== 1 ? "s" : ""}`} />
        <Box sx={{ flex: 1 }} />
        {onDeleteSection && idx > 0 && (
          <Button color="error" size="small" onClick={() => onDeleteSection(idx)}>Remove section</Button>
        )}
      </Stack>

      <Stack spacing={1.5}>
        {section.columns.map((col, cIdx) => (
          <ColumnRow
            key={`${idx}-${cIdx}-${col.name}`}
            sectionIdx={idx}
            colIdx={cIdx}
            column={col}
            onChange={onChangeColumn}
            onDelete={onDeleteColumn}
          />
        ))}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Button startIcon={<AddIcon />} variant="outlined" onClick={() => onAddColumn(idx)}>
          Add column
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />
    </Box>
  );
}

// --- Main Form --------------------------------------------------------------
export default function AddFieldsForm() {
  const [fieldName, setFieldName] = useState("SERVICE_TABLE");
  const [instruction, setInstruction] = useState(
    "Line items listing purchased products, unit amount and unit cost"
  );
  const [type, setType] = useState("Table");
  const [extractionType, setExtractionType] = useState("Explicit");

  // sections: each has its own set of columns
  const [sections, setSections] = useState([
    { columns: defaultColumns },
  ]);

  const remainingName = useMemo(
    () => Math.max(0, MAX_FIELD_NAME - fieldName.length),
    [fieldName]
  );
  const remainingInstruction = useMemo(
    () => Math.max(0, MAX_INSTRUCTION - instruction.length),
    [instruction]
  );

  // --- Section & Column handlers -------------------------------------------
  const addSection = () => {
    setSections((prev) => [...prev, { columns: [ { ...emptyColumn } ] }]);
  };
  const deleteSection = (sIdx) => {
    setSections((prev) => prev.filter((_, i) => i !== sIdx));
  };

  const addColumn = (sIdx) => {
    setSections((prev) =>
      prev.map((s, i) => (i === sIdx ? { ...s, columns: [...s.columns, { ...emptyColumn }] } : s))
    );
  };

  const changeColumn = (sIdx, cIdx, updated) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? { ...s, columns: s.columns.map((c, j) => (j === cIdx ? updated : c)) }
          : s
      )
    );
  };

  const deleteColumn = (sIdx, cIdx) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx ? { ...s, columns: s.columns.filter((_, j) => j !== cIdx) } : s
      )
    );
  };

  const reset = () => {
    setFieldName("SERVICE_TABLE");
    setInstruction(
      "Line items listing purchased products, unit amount and unit cost"
    );
    setType("Table");
    setExtractionType("Explicit");
    setSections([{ columns: defaultColumns }]);
  };

  const submit = () => {
    const payload = {
      fieldName,
      instruction,
      type,
      extractionType,
      sections,
    };
    alert("Submitted!\n\n" + JSON.stringify(payload, null, 2));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: 1, borderColor: "divider" }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Add fields
          </Typography>
          <Tooltip title="Create new fields for extraction and normalization tasks.">
            <InfoIcon fontSize="small" />
          </Tooltip>
        </Stack>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Create new fields for extraction and normalization tasks.
        </Typography>

        {/* Field name / Instruction */}
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Field name"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              inputProps={{ maxLength: MAX_FIELD_NAME }}
              helperText={`${remainingName} characters left`}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              inputProps={{ maxLength: MAX_INSTRUCTION }}
              helperText={`${remainingInstruction} characters left`}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                {FIELD_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Extractions type</InputLabel>
              <Select
                label="Extractions type"
                value={extractionType}
                onChange={(e) => setExtractionType(e.target.value)}
              >
                {EXTRACTION_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {sections.map((section, sIdx) => (
          <ColumnSection
            key={`section-${sIdx}`}
            idx={sIdx}
            section={section}
            onAddColumn={addColumn}
            onChangeColumn={changeColumn}
            onDeleteColumn={deleteColumn}
            onDeleteSection={deleteSection}
          />
        ))}

        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Button color="inherit" onClick={reset}>Cancel</Button>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addSection}>Add new field</Button>
              <Button variant="contained" color="warning" onClick={submit}>
                Done
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
