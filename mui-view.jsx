import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  LinearProgress,
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  InputAdornment,
  Tooltip,
  Alert,
  Avatar,
} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  Error as ErrorIcon,
  ExpandMore,
  ChevronRight,
  ThumbUp,
  ThumbDown,
  Visibility,
  FilterList,
  Download,
  BarChart,
  Refresh,
  AutoAwesome,
  Search,
  Close,
  Storage,
  VerifiedUser,
  TrendingUp,
  FlashOn,
  Assessment,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1e40af',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

// Mock data generator (same as before)
const generateMockData = () => {
  const categories = [
    {
      id: 'cat-1',
      name: 'Missing Reference Data',
      icon: 'Storage',
      criticality: 'high',
      subcategories: [
        {
          id: 'sub-1-1',
          name: 'Missing ISIN',
          records: Array.from({ length: 45 }, (_, i) => ({
            id: `rec-1-1-${i + 1}`,
            securityId: `SEC-2024-${String(i + 1).padStart(3, '0')}`,
            securityName: ['Apple Inc.', 'Tesla Inc.', 'Microsoft Corp', 'Amazon.com Inc.', 'Google LLC'][i % 5],
            errorDescription: 'ISIN code not found in reference database',
            aiAnalysis: 'Security identified but ISIN missing from master data. Cross-reference with Bloomberg API shows valid ISIN exists.',
            suggestedSolution: 'Update master data with ISIN from Bloomberg reference',
            dataSource: 'Bloomberg API',
            confidence: 90 + (i % 10),
            status: ['pending', 'pending', 'approved', 'rejected', 'pending'][i % 5],
            criticality: ['high', 'critical', 'medium'][i % 3],
            detectedDate: new Date(2024, 1, 14 - (i % 7)).toISOString()
          }))
        },
        {
          id: 'sub-1-2',
          name: 'Missing CUSIP',
          records: Array.from({ length: 32 }, (_, i) => ({
            id: `rec-1-2-${i + 1}`,
            securityId: `SEC-2024-${String(100 + i + 1).padStart(3, '0')}`,
            securityName: ['Microsoft Corp Bonds', 'Oracle Corp', 'IBM Bonds'][i % 3],
            errorDescription: 'CUSIP identifier not populated',
            aiAnalysis: 'Database lookup against CUSIP Global Services returned valid identifier.',
            suggestedSolution: 'Populate CUSIP field with validated identifier',
            dataSource: 'CUSIP Global Services',
            confidence: 95 + (i % 5),
            status: ['pending', 'approved', 'pending'][i % 3],
            criticality: ['medium', 'high'][i % 2],
            detectedDate: new Date(2024, 1, 13 - (i % 5)).toISOString()
          }))
        },
        {
          id: 'sub-1-3',
          name: 'Missing SEDOL',
          records: Array.from({ length: 28 }, (_, i) => ({
            id: `rec-1-3-${i + 1}`,
            securityId: `SEC-2024-${String(200 + i + 1).padStart(3, '0')}`,
            securityName: ['BP PLC', 'Shell PLC', 'HSBC Holdings'][i % 3],
            errorDescription: 'SEDOL code missing for UK security',
            aiAnalysis: 'London Stock Exchange requires SEDOL. Verified code available in LSE reference data.',
            suggestedSolution: 'Add SEDOL from LSE master file',
            dataSource: 'LSE Reference Data',
            confidence: 98,
            status: ['pending', 'pending', 'approved'][i % 3],
            criticality: 'high',
            detectedDate: new Date(2024, 1, 12 - (i % 4)).toISOString()
          }))
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'Data Quality Issues',
      icon: 'Assessment',
      criticality: 'medium',
      subcategories: [
        {
          id: 'sub-2-1',
          name: 'Price Anomalies',
          records: Array.from({ length: 67 }, (_, i) => ({
            id: `rec-2-1-${i + 1}`,
            securityId: `SEC-2024-${String(300 + i + 1).padStart(3, '0')}`,
            securityName: ['Goldman Sachs', 'JPMorgan Chase', 'Morgan Stanley', 'Wells Fargo'][i % 4],
            errorDescription: `Price ${['spike', 'drop', 'anomaly'][i % 3]} detected`,
            aiAnalysis: 'Historical price analysis shows anomalous value. Market data confirms correction needed.',
            suggestedSolution: 'Correct price to market-validated value',
            dataSource: 'NYSE Market Data',
            confidence: 85 + (i % 15),
            status: ['pending', 'pending', 'rejected', 'approved'][i % 4],
            criticality: ['high', 'critical', 'medium'][i % 3],
            detectedDate: new Date(2024, 1, 14 - (i % 10)).toISOString()
          }))
        },
        {
          id: 'sub-2-2',
          name: 'Duplicate Entries',
          records: Array.from({ length: 53 }, (_, i) => ({
            id: `rec-2-2-${i + 1}`,
            securityId: `SEC-2024-${String(400 + i + 1).padStart(3, '0')}`,
            securityName: ['Bank of America', 'Citigroup', 'US Bancorp'][i % 3],
            errorDescription: 'Multiple records found with same identifier',
            aiAnalysis: 'Same ISIN appears multiple times. Primary record identified with most complete data.',
            suggestedSolution: 'Consolidate to primary record and archive duplicates',
            dataSource: 'Internal Database Scan',
            confidence: 92,
            status: ['pending', 'approved'][i % 2],
            criticality: 'medium',
            detectedDate: new Date(2024, 1, 13 - (i % 8)).toISOString()
          }))
        }
      ]
    },
    {
      id: 'cat-3',
      name: 'Regulatory Compliance',
      icon: 'VerifiedUser',
      criticality: 'critical',
      subcategories: [
        {
          id: 'sub-3-1',
          name: 'MiFID II Requirements',
          records: Array.from({ length: 89 }, (_, i) => ({
            id: `rec-3-1-${i + 1}`,
            securityId: `SEC-2024-${String(600 + i + 1).padStart(3, '0')}`,
            securityName: ['Deutsche Bank AG', 'BNP Paribas', 'Societe Generale', 'UniCredit'][i % 4],
            errorDescription: `Missing ${['LEI', 'CFI code', 'ISIN', 'asset class'][i % 4]}`,
            aiAnalysis: 'MiFID II regulatory requirement not met. Validated data available from regulatory database.',
            suggestedSolution: 'Add required regulatory identifier from official source',
            dataSource: ['GLEIF', 'ESMA FIRDS', 'Bloomberg'][i % 3],
            confidence: 99,
            status: ['pending', 'pending', 'approved'][i % 3],
            criticality: 'critical',
            detectedDate: new Date(2024, 1, 14 - (i % 12)).toISOString()
          }))
        }
      ]
    }
  ];
  
  return categories;
};

const SecurityMasterDashboard = () => {
  const [data] = useState(generateMockData());
  
  // Auto-select first category on mount
  const firstCategory = data[0];
  
  const [expandedCategories, setExpandedCategories] = useState(new Set([firstCategory?.id]));
  const [selectedCategory, setSelectedCategory] = useState(firstCategory?.id || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState({});
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState(new Set());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCriticality, setFilterCriticality] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [actionType, setActionType] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;

    data.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.records.forEach(rec => {
          total++;
          if (rec.status === 'pending') pending++;
          else if (rec.status === 'approved') approved++;
          else if (rec.status === 'rejected') rejected++;

          if (rec.criticality === 'critical') critical++;
          else if (rec.criticality === 'high') high++;
          else if (rec.criticality === 'medium') medium++;
        });
      });
    });

    return { total, pending, approved, rejected, critical, high, medium };
  }, [data]);

  const getSubcategorySummary = (records) => {
    const summary = {
      total: records.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      critical: 0,
      high: 0,
      medium: 0,
      avgConfidence: 0
    };

    let totalConfidence = 0;
    records.forEach(rec => {
      if (rec.status === 'pending') summary.pending++;
      else if (rec.status === 'approved') summary.approved++;
      else if (rec.status === 'rejected') summary.rejected++;

      if (rec.criticality === 'critical') summary.critical++;
      else if (rec.criticality === 'high') summary.high++;
      else if (rec.criticality === 'medium') summary.medium++;

      totalConfidence += rec.confidence;
    });

    summary.avgConfidence = records.length > 0 ? Math.round(totalConfidence / records.length) : 0;
    return summary;
  };

  const getSubcategoryAIInsights = (subcategoryName, records) => {
    const summary = getSubcategorySummary(records);
    const pendingRecords = records.filter(r => r.status === 'pending');
    
    const sources = new Set(pendingRecords.map(r => r.dataSource));
    const sourcesList = Array.from(sources).join(', ');
    
    let analysis = '';
    let solution = '';
    
    if (subcategoryName.includes('ISIN')) {
      analysis = `Identified ${summary.pending} securities with missing ISIN codes across multiple instruments. Cross-referenced with ${sourcesList} to validate existence of proper identifiers.`;
      solution = `Bulk update recommended: Populate ISIN fields from validated reference data sources. This will ensure MiFID II compliance for ${summary.pending} securities.`;
    } else if (subcategoryName.includes('CUSIP')) {
      analysis = `Found ${summary.pending} US securities lacking CUSIP identifiers. Verified against CUSIP Global Services database.`;
      solution = `Automated bulk import from CUSIP Global Services recommended to resolve ${summary.pending} identifier gaps.`;
    } else if (subcategoryName.includes('Price')) {
      analysis = `Detected ${summary.pending} pricing anomalies through statistical analysis. Common patterns: decimal errors, stale prices, outliers.`;
      solution = `Recommend bulk price correction using validated market data. Critical to execute before EOD to prevent incorrect valuations.`;
    } else {
      analysis = `Analyzed ${summary.pending} error records. Common patterns identified with validated solutions from ${sourcesList}.`;
      solution = `Bulk resolution recommended for ${summary.pending} pending errors. High confidence solutions ready for approval.`;
    }

    return { analysis, solution, confidence: summary.avgConfidence, sources: sourcesList };
  };

  const toggleCategory = (catId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(catId)) {
      newExpanded.delete(catId);
    } else {
      newExpanded.add(catId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleCategorySelection = (catId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(catId)) {
      newSelected.delete(catId);
    } else {
      newSelected.add(catId);
    }
    setSelectedCategories(newSelected);
  };

  const toggleSubcategorySelection = (subId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedSubcategories);
    if (newSelected.has(subId)) {
      newSelected.delete(subId);
    } else {
      newSelected.add(subId);
    }
    setSelectedSubcategories(newSelected);
  };

  const currentCategory = selectedCategory
    ? data.find(cat => cat.id === selectedCategory)
    : null;

  const currentSubcategory = selectedSubcategory 
    ? data.flatMap(cat => cat.subcategories).find(sub => sub.id === selectedSubcategory)
    : null;

  const getCriticalityColor = (criticality) => {
    switch (criticality) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Storage: <Storage />,
      Assessment: <Assessment />,
      VerifiedUser: <VerifiedUser />,
      TrendingUp: <TrendingUp />,
      FlashOn: <FlashOn />,
    };
    return icons[iconName] || <Storage />;
  };

  const filteredRecords = useMemo(() => {
    if (!currentSubcategory) return [];
    
    return currentSubcategory.records.filter(rec => {
      const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
      const matchesCriticality = filterCriticality === 'all' || rec.criticality === filterCriticality;
      const matchesSearch = !searchTerm || 
        rec.securityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.securityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.errorDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCriticality && matchesSearch;
    });
  }, [currentSubcategory, filterStatus, filterCriticality, searchTerm]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'securityId',
        header: 'Security ID',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'securityName',
        header: 'Security Name',
        size: 200,
      },
      {
        accessorKey: 'errorDescription',
        header: 'Error Description',
        size: 250,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 130,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={getStatusColor(cell.getValue())}
            size="small"
            icon={
              cell.getValue() === 'approved' ? <CheckCircle /> :
              cell.getValue() === 'rejected' ? <Cancel /> :
              <Schedule />
            }
          />
        ),
      },
      {
        accessorKey: 'criticality',
        header: 'Level',
        size: 120,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue()}
            color={getCriticalityColor(cell.getValue())}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: 'confidence',
        header: 'AI Confidence',
        size: 140,
        Cell: ({ cell }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesome sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={600}>
              {cell.getValue()}%
            </Typography>
          </Stack>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 150,
        enableSorting: false,
        Cell: ({ row }) => (
          row.original.status === 'pending' && (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Approve">
                <IconButton
                  size="small"
                  color="success"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Approved ${row.original.id}`);
                  }}
                >
                  <ThumbUp fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Rejected ${row.original.id}`);
                  }}
                >
                  <ThumbDown fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRecord(row.original);
                    setShowDetailModal(true);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )
        ),
      },
    ],
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Paper elevation={1} sx={{ zIndex: 10 }}>
          <Box sx={{ px: 3, py: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <AutoAwesome />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Security Master AI Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered error detection and resolution
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh">
                  <IconButton>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Export">
                  <IconButton>
                    <Download />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Analytics">
                  <IconButton>
                    <BarChart />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Dashboard Metrics */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Error Status
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main">
                          {stats.total}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                        <ErrorIcon />
                      </Avatar>
                    </Stack>
                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                      <Chip label={`${stats.pending} Pending`} size="small" color="warning" variant="outlined" />
                      <Chip label={`${stats.approved} OK`} size="small" color="success" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Criticality
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="error.main">
                          {stats.critical + stats.high}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'error.light', width: 40, height: 40 }}>
                        <Warning />
                      </Avatar>
                    </Stack>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip label={`${stats.critical} Critical`} size="small" color="error" variant="outlined" />
                      <Chip label={`${stats.high} High`} size="small" color="warning" variant="outlined" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" sx={{ color: 'primary.light' }} fontWeight={600}>
                          Resolution Rate
                        </Typography>
                        <Typography variant="h4" fontWeight={700}>
                          {((stats.approved / stats.total) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'primary.dark', width: 40, height: 40 }}>
                        <AutoAwesome />
                      </Avatar>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(stats.approved / stats.total) * 100}
                      sx={{
                        mt: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'primary.dark',
                        '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined" sx={{ borderColor: 'warning.main', borderWidth: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Needs Review
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="warning.main">
                          {stats.pending}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'warning.light', width: 40, height: 40 }}>
                        <Schedule />
                      </Avatar>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" mt={1}>
                      {stats.critical} critical · {stats.high} high priority
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          AI Confidence
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="secondary.main">
                          {(() => {
                            let totalConf = 0;
                            let count = 0;
                            data.forEach(cat => cat.subcategories.forEach(sub => sub.records.forEach(rec => {
                              totalConf += rec.confidence;
                              count++;
                            })));
                            return count > 0 ? Math.round(totalConf / count) : 0;
                          })()}%
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'secondary.light', width: 40, height: 40 }}>
                        <AutoAwesome />
                      </Avatar>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" mt={1}>
                      High confidence solutions
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Sidebar */}
          <Paper
            elevation={1}
            sx={{
              width: 350,
              overflow: 'auto',
              borderRadius: 0,
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList fontSize="small" />
                Categories & Subcategories
              </Typography>
            </Box>
            <List>
              {data.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const isSelectedCat = selectedCategories.has(category.id);
                const categoryPendingCount = category.subcategories.reduce(
                  (sum, sub) => sum + sub.records.filter(r => r.status === 'pending').length, 0
                );
                
                return (
                  <React.Fragment key={category.id}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Chip
                          label={category.criticality}
                          size="small"
                          color={getCriticalityColor(category.criticality)}
                        />
                      }
                      sx={{
                        bgcolor: isSelectedCat ? 'primary.lighter' : selectedCategory === category.id && !selectedSubcategory ? 'primary.50' : 'transparent',
                        borderLeft: isSelectedCat || (selectedCategory === category.id && !selectedSubcategory) ? 4 : 0,
                        borderColor: 'primary.main',
                      }}
                    >
                      <ListItemButton
                        onClick={() => {
                          toggleCategory(category.id);
                          setSelectedCategory(category.id);
                          setSelectedSubcategory(null);
                          setSelectedRecords({});
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={isSelectedCat}
                          onClick={(e) => toggleCategorySelection(category.id, e)}
                          sx={{ mr: 1 }}
                        />
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {isExpanded ? <ExpandMore /> : <ChevronRight />}
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: isSelectedCat ? 'primary.main' : 'grey.300' }}>
                            {getIconComponent(category.icon)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={category.name}
                          secondary={
                            <Box component="span">
                              {category.subcategories.length} subcategories
                              {categoryPendingCount > 0 && (
                                <Chip
                                  label={`${categoryPendingCount} pending`}
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20 }}
                                />
                              )}
                            </Box>
                          }
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItemButton>
                    </ListItem>
                    
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {category.subcategories.map(subcategory => {
                          const summary = getSubcategorySummary(subcategory.records);
                          const isSubSelected = selectedSubcategory === subcategory.id;
                          const isChecked = selectedSubcategories.has(subcategory.id);
                          
                          return (
                            <ListItem
                              key={subcategory.id}
                              disablePadding
                              sx={{
                                pl: 4,
                                bgcolor: isChecked ? 'success.lighter' : isSubSelected ? 'primary.50' : 'transparent',
                                borderLeft: isChecked || isSubSelected ? 4 : 0,
                                borderColor: isChecked ? 'success.main' : 'primary.main',
                              }}
                            >
                              <ListItemButton
                                onClick={() => {
                                  setSelectedSubcategory(subcategory.id);
                                  setSelectedRecords({});
                                }}
                              >
                                <Checkbox
                                  edge="start"
                                  checked={isChecked}
                                  onClick={(e) => toggleSubcategorySelection(subcategory.id, e)}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <ListItemText
                                  primary={subcategory.name}
                                  secondary={
                                    <Stack direction="row" spacing={0.5} mt={0.5}>
                                      <Chip label={summary.total} size="small" variant="outlined" />
                                      {summary.pending > 0 && (
                                        <Chip
                                          icon={<Schedule sx={{ fontSize: 12 }} />}
                                          label={summary.pending}
                                          size="small"
                                          color="warning"
                                        />
                                      )}
                                      {summary.critical > 0 && (
                                        <Chip
                                          label={`${summary.critical} crit`}
                                          size="small"
                                          color="error"
                                        />
                                      )}
                                    </Stack>
                                  }
                                  primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                />
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>

          {/* Right Panel */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {currentSubcategory ? (
              <>
                {/* Subcategory Header */}
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'primary.50', borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Typography variant="h5" fontWeight={700}>
                          {currentSubcategory.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {currentCategory?.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        {(() => {
                          const summary = getSubcategorySummary(currentSubcategory.records);
                          return (
                            <>
                              <Chip label={`${summary.total} total`} size="small" />
                              {summary.pending > 0 && (
                                <Chip
                                  icon={<Schedule />}
                                  label={`${summary.pending} pending`}
                                  size="small"
                                  color="warning"
                                />
                              )}
                              {summary.critical > 0 && (
                                <Chip
                                  icon={<Warning />}
                                  label={`${summary.critical} critical`}
                                  size="small"
                                  color="error"
                                />
                              )}
                              <Chip
                                icon={<AutoAwesome />}
                                label={`${summary.avgConfidence}% confidence`}
                                size="small"
                                color="primary"
                              />
                            </>
                          );
                        })()}
                      </Stack>
                    </Box>
                    {getSubcategorySummary(currentSubcategory.records).pending > 0 && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ThumbUp />}
                          size="small"
                        >
                          Approve All ({getSubcategorySummary(currentSubcategory.records).pending})
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<ThumbDown />}
                          size="small"
                        >
                          Reject All
                        </Button>
                      </Stack>
                    )}
                  </Stack>

                  {/* AI Insights */}
                  <Grid container spacing={2}>
                    {(() => {
                      const aiInsights = getSubcategoryAIInsights(currentSubcategory.name, currentSubcategory.records);
                      return (
                        <>
                          <Grid item xs={6}>
                            <Alert
                              severity="info"
                              icon={<AutoAwesome />}
                              sx={{ '& .MuiAlert-message': { width: '100%' } }}
                            >
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                AI Analysis Summary
                              </Typography>
                              <Typography variant="body2">
                                {aiInsights.analysis}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Sources: {aiInsights.sources}
                              </Typography>
                            </Alert>
                          </Grid>
                          <Grid item xs={6}>
                            <Alert
                              severity="success"
                              icon={<CheckCircle />}
                              sx={{ '& .MuiAlert-message': { width: '100%' } }}
                            >
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Recommended Action
                              </Typography>
                              <Typography variant="body2">
                                {aiInsights.solution}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={aiInsights.confidence}
                                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                color="success"
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {aiInsights.confidence}% confidence
                              </Typography>
                            </Alert>
                          </Grid>
                        </>
                      );
                    })()}
                  </Grid>
                </Paper>

                {/* Filters */}
                <Paper elevation={0} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                      placeholder="Search securities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1, maxWidth: 400 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Criticality</InputLabel>
                      <Select
                        value={filterCriticality}
                        onChange={(e) => setFilterCriticality(e.target.value)}
                        label="Criticality"
                      >
                        <MenuItem value="all">All Levels</MenuItem>
                        <MenuItem value="critical">Critical</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                      </Select>
                    </FormControl>
                    {Object.keys(selectedRecords).length > 0 && (
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`${Object.keys(selectedRecords).length} selected`}
                          color="primary"
                          onDelete={() => setSelectedRecords({})}
                        />
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<ThumbUp />}
                          size="small"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<ThumbDown />}
                          size="small"
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                {/* Material React Table */}
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <MaterialReactTable
                    columns={columns}
                    data={filteredRecords}
                    enableRowSelection
                    enableColumnOrdering
                    enableStickyHeader
                    enableStickyFooter
                    enablePagination
                    initialState={{
                      pagination: { pageSize: 50, pageIndex: 0 },
                      density: 'compact',
                    }}
                    muiTableContainerProps={{
                      sx: { maxHeight: 'calc(100vh - 450px)' }
                    }}
                    muiTableProps={{
                      sx: {
                        tableLayout: 'fixed',
                      }
                    }}
                    onRowSelectionChange={setSelectedRecords}
                    state={{ rowSelection: selectedRecords }}
                    getRowId={(row) => row.id}
                    muiTableBodyRowProps={({ row }) => ({
                      onClick: () => {
                        setSelectedRecord(row.original);
                        setShowDetailModal(true);
                      },
                      sx: {
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'primary.50',
                        },
                      },
                    })}
                  />
                </Box>
              </>
            ) : currentCategory ? (
              <Box sx={{ p: 4, overflow: 'auto' }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Category Overview: {currentCategory.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Select a subcategory to view detailed error analysis
                </Typography>
                {/* Add category summary cards here */}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Stack alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}>
                    <FilterList sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Typography variant="h5" fontWeight={600}>
                    Select a Category
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose a category from the left sidebar to get started
                  </Typography>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        {/* Detail Modal */}
        <Dialog
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedRecord && (
            <>
              <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    Error Details
                  </Typography>
                  <IconButton onClick={() => setShowDetailModal(false)} size="small">
                    <Close />
                  </IconButton>
                </Stack>
              </DialogTitle>
              <DialogContent dividers>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={selectedRecord.status.toUpperCase()}
                      color={getStatusColor(selectedRecord.status)}
                    />
                    <Chip
                      label={selectedRecord.criticality.toUpperCase()}
                      color={getCriticalityColor(selectedRecord.criticality)}
                      variant="outlined"
                    />
                    <Chip
                      label={`${selectedRecord.confidence}% Confidence`}
                      color="primary"
                    />
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Security ID
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                        {selectedRecord.securityId}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Security Name
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedRecord.securityName}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Alert severity="error">
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Error Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedRecord.errorDescription}
                    </Typography>
                  </Alert>

                  <Alert severity="info">
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      AI Analysis
                    </Typography>
                    <Typography variant="body2">
                      {selectedRecord.aiAnalysis}
                    </Typography>
                  </Alert>

                  <Alert severity="success">
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Suggested Solution
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedRecord.suggestedSolution}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Source: {selectedRecord.dataSource}
                    </Typography>
                  </Alert>
                </Stack>
              </DialogContent>
              {selectedRecord.status === 'pending' && (
                <DialogActions>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ThumbUp />}
                    onClick={() => {
                      alert('Approved');
                      setShowDetailModal(false);
                    }}
                  >
                    Approve Solution
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ThumbDown />}
                    onClick={() => {
                      alert('Rejected');
                      setShowDetailModal(false);
                    }}
                  >
                    Reject Solution
                  </Button>
                </DialogActions>
              )}
            </>
          )}
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default SecurityMasterDashboard;
