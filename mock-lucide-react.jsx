import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, AlertCircle, ChevronDown, ChevronRight, MessageSquare, ThumbsUp, ThumbsDown, Eye, Zap, TrendingUp, Filter, Download, Search, BarChart3, RefreshCw, Sparkles, FileCheck, Database, Shield } from 'lucide-react';

const generateMockData = () => {
  const categories = [
    {
      id: 'cat-1',
      name: 'Missing Reference Data',
      icon: Database,
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
      icon: FileCheck,
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
        },
        {
          id: 'sub-2-3',
          name: 'Invalid Date Fields',
          records: Array.from({ length: 41 }, (_, i) => ({
            id: `rec-2-3-${i + 1}`,
            securityId: `SEC-2024-${String(500 + i + 1).padStart(3, '0')}`,
            securityName: ['Corporate Bond A', 'Municipal Bond B', 'Treasury Note C'][i % 3],
            errorDescription: 'Maturity date in past or invalid format',
            aiAnalysis: 'Date validation failed. Prospectus and issuer data confirm correct maturity date.',
            suggestedSolution: 'Update with validated maturity date',
            dataSource: 'Issuer Prospectus',
            confidence: 94,
            status: ['pending', 'approved', 'pending'][i % 3],
            criticality: ['high', 'medium'][i % 2],
            detectedDate: new Date(2024, 1, 11 - (i % 6)).toISOString()
          }))
        }
      ]
    },
    {
      id: 'cat-3',
      name: 'Regulatory Compliance',
      icon: Shield,
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
        },
        {
          id: 'sub-3-2',
          name: 'Dodd-Frank Reporting',
          records: Array.from({ length: 72 }, (_, i) => ({
            id: `rec-3-2-${i + 1}`,
            securityId: `SEC-2024-${String(700 + i + 1).padStart(3, '0')}`,
            securityName: ['Swap Contract A', 'Derivative B', 'Futures C'][i % 3],
            errorDescription: 'Missing UPI or UTI for derivatives reporting',
            aiAnalysis: 'CFTC reporting requires unique product/transaction identifier. Generated from instrument details.',
            suggestedSolution: 'Generate and assign UPI/UTI per CFTC rules',
            dataSource: 'CFTC Guidelines',
            confidence: 96,
            status: ['pending', 'approved'][i % 2],
            criticality: ['critical', 'high'][i % 2],
            detectedDate: new Date(2024, 1, 13 - (i % 9)).toISOString()
          }))
        }
      ]
    },
    {
      id: 'cat-4',
      name: 'Corporate Actions',
      icon: TrendingUp,
      criticality: 'high',
      subcategories: [
        {
          id: 'sub-4-1',
          name: 'Dividend Mismatches',
          records: Array.from({ length: 38 }, (_, i) => ({
            id: `rec-4-1-${i + 1}`,
            securityId: `SEC-2024-${String(800 + i + 1).padStart(3, '0')}`,
            securityName: ['Coca-Cola', 'PepsiCo', 'Procter & Gamble'][i % 3],
            errorDescription: 'Ex-dividend date discrepancy detected',
            aiAnalysis: 'Company announcement and vendor feeds show different ex-div date. Impacts valuations.',
            suggestedSolution: 'Update ex-dividend date to match official announcement',
            dataSource: 'Company IR + Bloomberg',
            confidence: 97,
            status: ['pending', 'approved', 'pending'][i % 3],
            criticality: 'high',
            detectedDate: new Date(2024, 1, 14 - (i % 7)).toISOString()
          }))
        },
        {
          id: 'sub-4-2',
          name: 'Stock Splits',
          records: Array.from({ length: 15 }, (_, i) => ({
            id: `rec-4-2-${i + 1}`,
            securityId: `SEC-2024-${String(900 + i + 1).padStart(3, '0')}`,
            securityName: ['Tech Corp A', 'Growth Stock B', 'Mega Cap C'][i % 3],
            errorDescription: 'Split ratio not reflected in pricing',
            aiAnalysis: 'Corporate action filed but not applied to historical prices. Adjustment factor required.',
            suggestedSolution: 'Apply split adjustment to price history',
            dataSource: 'SEC Filings',
            confidence: 100,
            status: ['pending', 'approved'][i % 2],
            criticality: 'high',
            detectedDate: new Date(2024, 1, 12 - (i % 5)).toISOString()
          }))
        }
      ]
    },
    {
      id: 'cat-5',
      name: 'Market Data Feed Errors',
      icon: Zap,
      criticality: 'high',
      subcategories: [
        {
          id: 'sub-5-1',
          name: 'Stale Data',
          records: Array.from({ length: 124 }, (_, i) => ({
            id: `rec-5-1-${i + 1}`,
            securityId: `SEC-2024-${String(1000 + i + 1).padStart(4, '0')}`,
            securityName: ['Equity Fund', 'Bond ETF', 'Index Tracker'][i % 3],
            errorDescription: 'Last update timestamp exceeds SLA threshold',
            aiAnalysis: 'Feed latency detected. Alternative vendor data available and validated.',
            suggestedSolution: 'Switch to backup feed or refresh from primary source',
            dataSource: 'Multiple Vendors',
            confidence: 88,
            status: ['pending', 'pending', 'rejected'][i % 3],
            criticality: ['high', 'medium'][i % 2],
            detectedDate: new Date(2024, 1, 14 - (i % 14)).toISOString()
          }))
        }
      ]
    }
  ];
  
  return categories;
};

const SecurityMasterDashboard = () => {
  const [data] = useState(generateMockData());
  
  // Auto-select first category on mount, but no subcategory
  const firstCategory = data[0];
  
  const [expandedCategories, setExpandedCategories] = useState(new Set([firstCategory?.id]));
  const [selectedCategory, setSelectedCategory] = useState(firstCategory?.id || null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedRecords, setSelectedRecords] = useState(new Set());
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [sortConfig, setSortConfig] = useState({ key: 'detectedDate', direction: 'desc' });

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

  const stats = useMemo(() => {
    let total = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let critical = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

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
          else if (rec.criticality === 'low') low++;
        });
      });
    });

    return { total, pending, approved, rejected, critical, high, medium, low };
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
      low: 0,
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
      else if (rec.criticality === 'low') summary.low++;

      totalConfidence += rec.confidence;
    });

    summary.avgConfidence = records.length > 0 ? Math.round(totalConfidence / records.length) : 0;
    return summary;
  };

  // Generate aggregated AI analysis for subcategory
  const getSubcategoryAIInsights = (subcategoryName, records) => {
    const summary = getSubcategorySummary(records);
    const pendingRecords = records.filter(r => r.status === 'pending');
    
    // Get most common data sources
    const sources = new Set(pendingRecords.map(r => r.dataSource));
    const sourcesList = Array.from(sources).join(', ');
    
    // Aggregate patterns
    let analysis = '';
    let solution = '';
    
    if (subcategoryName.includes('ISIN')) {
      analysis = `Identified ${summary.pending} securities with missing ISIN codes across multiple instruments. Cross-referenced with ${sourcesList} to validate existence of proper identifiers. All securities are actively traded and have valid ISINs in reference databases.`;
      solution = `Bulk update recommended: Populate ISIN fields from validated reference data sources. This will ensure MiFID II compliance and improve trade matching accuracy across ${summary.pending} securities.`;
    } else if (subcategoryName.includes('CUSIP')) {
      analysis = `Found ${summary.pending} US securities lacking CUSIP identifiers. Verified against CUSIP Global Services database - all records have valid, assigned CUSIPs that are not present in master data.`;
      solution = `Automated bulk import from CUSIP Global Services recommended. This will resolve ${summary.pending} identifier gaps and enable proper settlement processing for US securities.`;
    } else if (subcategoryName.includes('SEDOL')) {
      analysis = `${summary.pending} UK/European securities missing SEDOL codes. Validated against London Stock Exchange reference data - all SEDOLs are active and properly assigned to listed securities.`;
      solution = `Bulk synchronization with LSE master data recommended to populate ${summary.pending} missing SEDOL codes, ensuring UK market compliance and trading connectivity.`;
    } else if (subcategoryName.includes('Price')) {
      analysis = `Detected ${summary.pending} pricing anomalies through statistical analysis. Common patterns: decimal point errors (40%), stale prices (35%), negative values (15%), extreme outliers (10%). Validated corrections against ${sourcesList}.`;
      solution = `Recommend bulk price correction using validated market data. Critical to execute before EOD to prevent incorrect valuations affecting ${summary.pending} positions.`;
    } else if (subcategoryName.includes('Duplicate')) {
      analysis = `Identified ${summary.pending} duplicate security records with identical identifiers but different internal IDs. Analysis shows clear primary records with most complete data profiles (98% data completeness vs 45% avg for duplicates).`;
      solution = `Automated consolidation recommended: Merge to primary records and archive duplicates. This will clean ${summary.pending} redundant entries and prevent trade booking errors.`;
    } else if (subcategoryName.includes('Date')) {
      analysis = `${summary.pending} securities have invalid date fields (maturity dates in past, invalid formats, or missing values). Cross-referenced with issuer prospectuses and official documentation to identify correct dates.`;
      solution = `Bulk date correction from authoritative sources recommended. Affects ${summary.pending} fixed income securities - critical for accurate yield calculations and maturity management.`;
    } else if (subcategoryName.includes('MiFID II')) {
      analysis = `${summary.pending} securities missing mandatory MiFID II regulatory identifiers (LEI, CFI codes, asset classifications). Validated data available from GLEIF and ESMA FIRDS databases - 100% match rate.`;
      solution = `Immediate bulk update required for regulatory compliance. Failure to populate these ${summary.pending} records will result in trade reporting failures and potential regulatory penalties.`;
    } else if (subcategoryName.includes('Dodd-Frank')) {
      analysis = `${summary.pending} derivative contracts missing required UPI/UTI identifiers for CFTC reporting. Generated identifiers follow CFTC specifications and are ready for implementation.`;
      solution = `Bulk assignment of UPI/UTI codes recommended to achieve Dodd-Frank compliance for ${summary.pending} derivative positions. Must be completed before next reporting cycle.`;
    } else if (subcategoryName.includes('Dividend')) {
      analysis = `${summary.pending} dividend events show discrepancies between internal system and official company announcements. Verified correct dates against company IR websites and multiple market data vendors.`;
      solution = `Bulk ex-dividend date corrections recommended. Affects position valuations for ${summary.pending} equity holdings - should be executed before market open to prevent P&L distortions.`;
    } else if (subcategoryName.includes('Split')) {
      analysis = `${summary.pending} corporate actions for stock splits not reflected in price history. Adjustment factors calculated and validated against official SEC filings and exchange announcements.`;
      solution = `Apply historical price adjustments for ${summary.pending} securities. Critical for accurate performance reporting and ensuring continuity of price charts.`;
    } else if (subcategoryName.includes('Stale')) {
      analysis = `${summary.pending} securities have stale market data exceeding SLA thresholds. Alternative vendor feeds validated and available for immediate failover. Average data age: 4.5 hours vs 15-minute SLA.`;
      solution = `Recommend immediate failover to backup data feeds for ${summary.pending} securities. Critical for trading operations - stale data prevents accurate order pricing and risk assessment.`;
    } else {
      analysis = `Analyzed ${summary.pending} error records in this category. Common patterns identified with validated solutions from ${sourcesList}. Average AI confidence: ${summary.avgConfidence}%.`;
      solution = `Bulk resolution recommended for ${summary.pending} pending errors. All proposed fixes have been validated against authoritative data sources and follow standard remediation procedures.`;
    }

    return { analysis, solution, confidence: summary.avgConfidence, sources: sourcesList };
  };

  // Get selected subcategory and category
  const currentSubcategory = selectedSubcategory 
    ? data.flatMap(cat => cat.subcategories).find(sub => sub.id === selectedSubcategory)
    : null;
  
  const currentCategory = selectedCategory
    ? data.find(cat => cat.id === selectedCategory)
    : (currentSubcategory
      ? data.find(cat => cat.subcategories.some(sub => sub.id === selectedSubcategory))
      : null);

  const toggleRecordSelection = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const toggleAllRecords = (records) => {
    const recordIds = records.map(r => r.id);
    const allSelected = recordIds.every(id => selectedRecords.has(id));
    
    const newSelected = new Set(selectedRecords);
    if (allSelected) {
      recordIds.forEach(id => newSelected.delete(id));
    } else {
      recordIds.forEach(id => newSelected.add(id));
    }
    setSelectedRecords(newSelected);
  };

  const getCriticalityColor = (criticality) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[criticality] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending;
  };

  const getCriticalityIcon = (criticality) => {
    if (criticality === 'critical') return <AlertCircle className="w-4 h-4" />;
    if (criticality === 'high') return <AlertTriangle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  
  // Filter and sort records
  const filteredRecords = useMemo(() => {
    if (!currentSubcategory) return [];
    
    let records = currentSubcategory.records;

    // Apply filters
    records = records.filter(rec => {
      const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
      const matchesCriticality = filterCriticality === 'all' || rec.criticality === filterCriticality;
      const matchesSearch = !searchTerm || 
        rec.securityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.securityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.errorDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesCriticality && matchesSearch;
    });

    // Apply sorting
    records.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'detectedDate') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortConfig.key === 'confidence') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return records;
  }, [currentSubcategory, filterStatus, filterCriticality, searchTerm, sortConfig]);

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate total pending items across all selections
  const getTotalPendingCount = () => {
    let count = 0;
    
    // Count from selected categories
    selectedCategories.forEach(catId => {
      const category = data.find(cat => cat.id === catId);
      if (category) {
        category.subcategories.forEach(sub => {
          count += sub.records.filter(r => r.status === 'pending').length;
        });
      }
    });
    
    // Count from selected subcategories
    selectedSubcategories.forEach(subId => {
      const subcategory = data.flatMap(cat => cat.subcategories).find(sub => sub.id === subId);
      if (subcategory) {
        count += subcategory.records.filter(r => r.status === 'pending').length;
      }
    });
    
    // Count from selected records
    count += selectedRecords.size;
    
    return count;
  };

  const handleBulkApprove = (target = 'mixed') => {
    setActionType('approve');
    setActionTarget(target);
    setShowCommentModal(true);
  };

  const handleBulkReject = (target = 'mixed') => {
    setActionType('reject');
    setActionTarget(target);
    setShowCommentModal(true);
  };

  const handleQuickApprove = (recordId, e) => {
    e.stopPropagation();
    alert(`Quick approved record: ${recordId}`);
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      newSet.delete(recordId);
      return newSet;
    });
  };

  const handleQuickReject = (recordId, e) => {
    e.stopPropagation();
    alert(`Quick rejected record: ${recordId}`);
    setSelectedRecords(prev => {
      const newSet = new Set(prev);
      newSet.delete(recordId);
      return newSet;
    });
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Security Master AI Analysis</h1>
                <p className="text-sm text-gray-600">AI-powered error detection and resolution</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert('Refreshing...')}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => alert('Exporting...')}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                title="Export"
              >
                <Download className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => alert('Analytics...')}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                title="Analytics"
              >
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Consolidated Dashboard - Single Line */}
          <div className="flex items-stretch gap-3 mt-4">
            {/* Status Overview Card */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Error Status</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-yellow-700">{stats.pending}</span> Pending
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-green-700">{stats.approved}</span> Approved
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-red-700">{stats.rejected}</span> Rejected
                  </span>
                </div>
              </div>
            </div>

            {/* Criticality Overview Card */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Criticality Levels</p>
                    <p className="text-2xl font-bold text-red-600">{stats.critical + stats.high}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-red-700">{stats.critical}</span> Critical
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-orange-700">{stats.high}</span> High
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold text-yellow-700">{stats.medium}</span> Medium
                  </span>
                </div>
              </div>
            </div>

            {/* Resolution Progress Card */}
            <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <p className="text-xs text-blue-100 font-medium">Resolution Rate</p>
                  <p className="text-2xl font-bold">{((stats.approved / stats.total) * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-blue-400 rounded-full h-2 mt-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-blue-100 mt-1">
                {stats.approved} of {stats.total} resolved
              </p>
            </div>

            {/* Pending Action Card */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border-2 border-yellow-300 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Needs Review</p>
                    <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-red-700">{stats.critical}</span> critical · 
                <span className="font-semibold text-orange-700 ml-1">{stats.high}</span> high priority
              </div>
            </div>

            {/* AI Confidence Card */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Avg AI Confidence</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {(() => {
                      let totalConfidence = 0;
                      let count = 0;
                      data.forEach(cat => {
                        cat.subcategories.forEach(sub => {
                          sub.records.forEach(rec => {
                            totalConfidence += rec.confidence;
                            count++;
                          });
                        });
                      });
                      return count > 0 ? Math.round(totalConfidence / count) : 0;
                    })()}%
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                High confidence solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left-Right Split */}
      <div className="flex h-[calc(100vh-180px)]">
        {/* Left Sidebar: Hierarchical Category/Subcategory Tree */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Categories & Subcategories
            </h2>
          </div>
          <div className="p-2">
            {data.map(category => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategories.has(category.id);
              const isSelected = selectedCategories.has(category.id);
              const categoryPendingCount = category.subcategories.reduce(
                (sum, sub) => sum + sub.records.filter(r => r.status === 'pending').length, 0
              );
              
              return (
                <div key={category.id} className="mb-2">
                  {/* Category Header */}
                  <div
                    className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors text-left border-2 ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-500' 
                        : selectedCategory === category.id && !selectedSubcategory
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleCategorySelection(category.id, e)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      title="Select all errors in category"
                    />
                    <button
                      onClick={() => {
                        toggleCategory(category.id);
                        setSelectedCategory(category.id);
                        setSelectedSubcategory(null);
                        setCurrentPage(1);
                        setSelectedRecords(new Set());
                      }}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      )}
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-200' : 'bg-gray-200'}`}>
                        <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{category.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-600">
                            {category.subcategories.length} subcategories
                          </p>
                          {categoryPendingCount > 0 && (
                            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full font-medium">
                              {categoryPendingCount} pending
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCriticalityColor(category.criticality)}`}>
                        {category.criticality}
                      </span>
                    </button>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {category.subcategories.map(subcategory => {
                        const summary = getSubcategorySummary(subcategory.records);
                        const isSubSelected = selectedSubcategory === subcategory.id;
                        const isChecked = selectedSubcategories.has(subcategory.id);
                        
                        return (
                          <div
                            key={subcategory.id}
                            className={`w-full flex items-center gap-2 p-2.5 rounded-lg transition-all ${
                              isSubSelected
                                ? 'bg-blue-50 border-2 border-blue-500'
                                : isChecked
                                ? 'bg-green-50 border-2 border-green-500'
                                : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => toggleSubcategorySelection(subcategory.id, e)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              title="Select all errors in subcategory"
                            />
                            <button
                              onClick={() => {
                                setSelectedSubcategory(subcategory.id);
                                setCurrentPage(1);
                                setSelectedRecords(new Set());
                              }}
                              className="flex-1 text-left"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900 truncate flex-1">
                                  {subcategory.name}
                                </span>
                                <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full ml-2">
                                  {summary.total}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {summary.pending > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded">
                                    <Clock className="w-3 h-3" />
                                    {summary.pending}
                                  </span>
                                )}
                                {summary.approved > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                                    <CheckCircle className="w-3 h-3" />
                                    {summary.approved}
                                  </span>
                                )}
                                {summary.critical > 0 && (
                                  <span className="text-xs text-red-600 font-medium">
                                    {summary.critical} crit
                                  </span>
                                )}
                                {summary.avgConfidence > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-blue-600">
                                    <Sparkles className="w-3 h-3" />
                                    {summary.avgConfidence}%
                                  </span>
                                )}
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Subcategory Details + Error Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentSubcategory ? (
            <>
              {/* Subcategory AI Summary Header */}
              <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{currentSubcategory.name}</h2>
                      <span className="text-sm text-gray-600">
                        {currentCategory?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const summary = getSubcategorySummary(currentSubcategory.records);
                        return (
                          <>
                            <span className="text-sm text-gray-700">
                              <span className="font-semibold">{summary.total}</span> total errors
                            </span>
                            {summary.pending > 0 && (
                              <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">{summary.pending}</span> pending
                              </span>
                            )}
                            {summary.critical > 0 && (
                              <span className="flex items-center gap-1 text-sm text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="font-semibold">{summary.critical}</span> critical
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                              <Sparkles className="w-4 h-4" />
                              <span className="font-semibold">{summary.avgConfidence}%</span> avg confidence
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSubcategorySummary(currentSubcategory.records).pending > 0 && (
                      <>
                        <button
                          onClick={() => handleBulkApprove('subcategory')}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm"
                          title="Approve all pending in subcategory"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Approve All ({getSubcategorySummary(currentSubcategory.records).pending})
                        </button>
                        <button
                          onClick={() => handleBulkReject('subcategory')}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
                          title="Reject all pending in subcategory"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Reject All
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* AI Analysis Summary */}
                {(() => {
                  const aiInsights = getSubcategoryAIInsights(currentSubcategory.name, currentSubcategory.records);
                  return (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-100 border-l-4 border-blue-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-blue-700" />
                          <h3 className="text-sm font-semibold text-blue-900">AI Analysis Summary</h3>
                        </div>
                        <p className="text-sm text-blue-900 leading-relaxed">
                          {aiInsights.analysis}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-xs text-blue-700">
                          <Database className="w-3 h-3" />
                          <span>Sources: {aiInsights.sources}</span>
                        </div>
                      </div>
                      <div className="bg-green-100 border-l-4 border-green-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-700" />
                          <h3 className="text-sm font-semibold text-green-900">Recommended Action</h3>
                        </div>
                        <p className="text-sm text-green-900 leading-relaxed">
                          {aiInsights.solution}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 bg-green-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${aiInsights.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-green-700">
                            {aiInsights.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Filters and Actions Bar */}
              <div className="bg-white border-b border-gray-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search securities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select 
                      value={filterCriticality}
                      onChange={(e) => setFilterCriticality(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="all">All Levels</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <select 
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="50">50 rows</option>
                      <option value="100">100 rows</option>
                      <option value="200">200 rows</option>
                      <option value="500">500 rows</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    {(selectedRecords.size > 0 || selectedCategories.size > 0 || selectedSubcategories.size > 0) && (
                      <>
                        <div className="flex items-center gap-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-sm">
                            {selectedCategories.size > 0 && (
                              <span className="text-blue-700">
                                <span className="font-semibold">{selectedCategories.size}</span> cat
                              </span>
                            )}
                            {selectedSubcategories.size > 0 && (
                              <span className="text-blue-700">
                                <span className="font-semibold">{selectedSubcategories.size}</span> subcat
                              </span>
                            )}
                            {selectedRecords.size > 0 && (
                              <span className="text-blue-700">
                                <span className="font-semibold">{selectedRecords.size}</span> records
                              </span>
                            )}
                          </div>
                          <div className="h-4 w-px bg-blue-300" />
                          <span className="text-sm font-semibold text-blue-900">
                            {getTotalPendingCount()} pending
                          </span>
                        </div>
                        <button
                          onClick={() => handleBulkApprove('mixed')}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-medium shadow-sm"
                          title="Approve selected"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleBulkReject('mixed')}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
                          title="Reject selected"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRecords(new Set());
                            setSelectedCategories(new Set());
                            setSelectedSubcategories(new Set());
                          }}
                          className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600"
                          title="Clear selection"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Table */}
              <div className="flex-1 overflow-auto bg-gray-50">
                <table className="w-full">
                  <thead className="bg-white sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={paginatedRecords.length > 0 && paginatedRecords.every(r => selectedRecords.has(r.id))}
                          onChange={() => toggleAllRecords(paginatedRecords)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('securityId')}
                      >
                        Security ID {sortConfig.key === 'securityId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('securityName')}
                      >
                        Security Name {sortConfig.key === 'securityName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Error Description
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('criticality')}
                      >
                        Level {sortConfig.key === 'criticality' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('confidence')}
                      >
                        AI Conf. {sortConfig.key === 'confidence' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedRecords.map(record => (
                      <tr 
                        key={record.id} 
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(record)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedRecords.has(record.id)}
                            onChange={() => toggleRecordSelection(record.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-medium text-gray-700">
                            {record.securityId}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">
                            {record.securityName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 line-clamp-2">
                            {record.errorDescription}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(record.criticality)}`}>
                            {getCriticalityIcon(record.criticality)}
                            {record.criticality}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-900">{record.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {record.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleQuickApprove(record.id, e)}
                                className="p-1.5 rounded bg-green-500 text-white hover:bg-green-600"
                                title="Approve"
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleQuickReject(record.id, e)}
                                className="p-1.5 rounded bg-red-500 text-white hover:bg-red-600"
                                title="Reject"
                              >
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleViewDetails(record)}
                                className="p-1.5 rounded bg-blue-500 text-white hover:bg-blue-600"
                                title="View details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRecords.length === 0 && (
                  <div className="text-center py-12 bg-white">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">No errors match your filters</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white border-t border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} errors
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : currentCategory ? (
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-6 max-w-6xl mx-auto">
                {/* Category Overview Header */}
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {(() => {
                        const CategoryIcon = currentCategory.icon;
                        return (
                          <div className="bg-blue-100 p-4 rounded-lg">
                            <CategoryIcon className="w-8 h-8 text-blue-600" />
                          </div>
                        );
                      })()}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentCategory.name}</h2>
                        <p className="text-sm text-gray-600">
                          {currentCategory.subcategories.length} subcategories · 
                          {currentCategory.subcategories.reduce((sum, sub) => sum + sub.records.length, 0)} total errors
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCriticalityColor(currentCategory.criticality)}`}>
                      {currentCategory.criticality.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  {/* Category-level Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    {(() => {
                      const categoryStats = {
                        total: 0,
                        pending: 0,
                        approved: 0,
                        rejected: 0,
                        critical: 0,
                        high: 0,
                        avgConfidence: 0
                      };
                      let totalConfidence = 0;
                      currentCategory.subcategories.forEach(sub => {
                        sub.records.forEach(rec => {
                          categoryStats.total++;
                          if (rec.status === 'pending') categoryStats.pending++;
                          else if (rec.status === 'approved') categoryStats.approved++;
                          else if (rec.status === 'rejected') categoryStats.rejected++;
                          if (rec.criticality === 'critical') categoryStats.critical++;
                          if (rec.criticality === 'high') categoryStats.high++;
                          totalConfidence += rec.confidence;
                        });
                      });
                      categoryStats.avgConfidence = Math.round(totalConfidence / categoryStats.total);

                      return (
                        <>
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm font-medium text-gray-600">Pending</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-700">{categoryStats.pending}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-gray-600">Approved</span>
                            </div>
                            <p className="text-3xl font-bold text-green-700">{categoryStats.approved}</p>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              <span className="text-sm font-medium text-gray-600">Critical/High</span>
                            </div>
                            <p className="text-3xl font-bold text-red-700">{categoryStats.critical + categoryStats.high}</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                              <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
                            </div>
                            <p className="text-3xl font-bold text-purple-700">{categoryStats.avgConfidence}%</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Subcategory Cards Grid */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Subcategories Overview
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentCategory.subcategories.map(subcategory => {
                      const summary = getSubcategorySummary(subcategory.records);
                      const aiInsights = getSubcategoryAIInsights(subcategory.name, subcategory.records);
                      
                      return (
                        <div 
                          key={subcategory.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedSubcategory(subcategory.id);
                            setCurrentPage(1);
                            setSelectedRecords(new Set());
                          }}
                        >
                          <div className="p-5">
                            {/* Subcategory Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">{subcategory.name}</h4>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className="text-sm text-gray-700">
                                    <span className="font-semibold">{summary.total}</span> total errors
                                  </span>
                                  {summary.pending > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                                      <Clock className="w-4 h-4" />
                                      <span className="font-semibold">{summary.pending}</span> pending
                                    </span>
                                  )}
                                  {summary.critical > 0 && (
                                    <span className="flex items-center gap-1 text-sm text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                      <AlertTriangle className="w-4 h-4" />
                                      <span className="font-semibold">{summary.critical}</span> critical
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-semibold">{summary.avgConfidence}%</span> confidence
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {summary.pending > 0 && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubcategories(new Set([subcategory.id]));
                                        handleBulkApprove('subcategory');
                                      }}
                                      className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                      title="Approve all pending"
                                    >
                                      <ThumbsUp className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSubcategories(new Set([subcategory.id]));
                                        handleBulkReject('subcategory');
                                      }}
                                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                      title="Reject all pending"
                                    >
                                      <ThumbsDown className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => {
                                    setSelectedSubcategory(subcategory.id);
                                    setCurrentPage(1);
                                  }}
                                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </div>
                            </div>

                            {/* AI Insights */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="w-4 h-4 text-blue-600" />
                                  <h5 className="text-xs font-semibold text-blue-900">AI Analysis</h5>
                                </div>
                                <p className="text-sm text-blue-900 leading-relaxed line-clamp-3">
                                  {aiInsights.analysis}
                                </p>
                              </div>
                              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <h5 className="text-xs font-semibold text-green-900">Recommended Action</h5>
                                </div>
                                <p className="text-sm text-green-900 leading-relaxed line-clamp-3">
                                  {aiInsights.solution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-6 max-w-6xl mx-auto">
                {/* Priority Dashboard Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Priority Dashboard</h2>
                      <p className="text-sm text-gray-600">High-priority errors requiring immediate attention</p>
                    </div>
                  </div>
                </div>

                {/* Critical Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow-sm border-2 border-red-300 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <span className="text-3xl font-bold text-red-600">{stats.critical}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Critical Priority</p>
                    <p className="text-xs text-gray-600 mt-1">Immediate action required</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border-2 border-orange-300 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-3xl font-bold text-orange-600">{stats.high}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">High Priority</p>
                    <p className="text-xs text-gray-600 mt-1">Review within 24 hours</p>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border-2 border-yellow-300 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-yellow-100 p-2 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Pending Review</p>
                    <p className="text-xs text-gray-600 mt-1">Awaiting approval</p>
                  </div>
                </div>

                {/* Top Priority Errors by Category */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Critical & High Priority by Category
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {data.map(category => {
                        const CategoryIcon = category.icon;
                        const criticalCount = category.subcategories.reduce((sum, sub) => 
                          sum + sub.records.filter(r => r.criticality === 'critical' && r.status === 'pending').length, 0
                        );
                        const highCount = category.subcategories.reduce((sum, sub) => 
                          sum + sub.records.filter(r => r.criticality === 'high' && r.status === 'pending').length, 0
                        );
                        
                        if (criticalCount === 0 && highCount === 0) return null;
                        
                        return (
                          <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <CategoryIcon className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{category.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  {criticalCount > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-medium">
                                      <AlertCircle className="w-3 h-3" />
                                      {criticalCount} critical
                                    </span>
                                  )}
                                  {highCount > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-medium">
                                      <AlertTriangle className="w-3 h-3" />
                                      {highCount} high
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                toggleCategory(category.id);
                                // Auto-select first subcategory with critical/high items
                                const prioritySub = category.subcategories.find(sub => 
                                  sub.records.some(r => (r.criticality === 'critical' || r.criticality === 'high') && r.status === 'pending')
                                );
                                if (prioritySub) {
                                  setSelectedSubcategory(prioritySub.id);
                                  setCurrentPage(1);
                                }
                              }}
                              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              Review
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500 p-3 rounded-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                        <p className="text-sm text-gray-600">High-confidence solutions ready</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {data.flatMap(cat => cat.subcategories).slice(0, 3).map(sub => {
                        const summary = getSubcategorySummary(sub.records);
                        if (summary.pending === 0) return null;
                        return (
                          <div key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{sub.name}</p>
                              <p className="text-xs text-gray-600">{summary.pending} pending · {summary.avgConfidence}% confidence</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSubcategory(sub.id);
                                setCurrentPage(1);
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              View →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-sm border border-yellow-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-yellow-500 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Aging Items</h3>
                        <p className="text-sm text-gray-600">Oldest pending errors</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        const allRecords = data.flatMap(cat => cat.subcategories.flatMap(sub => 
                          sub.records.filter(r => r.status === 'pending').map(r => ({ ...r, subcategory: sub }))
                        ));
                        const oldestRecords = allRecords
                          .sort((a, b) => new Date(a.detectedDate).getTime() - new Date(b.detectedDate).getTime())
                          .slice(0, 3);
                        
                        return oldestRecords.map(record => {
                          const daysOld = Math.floor((new Date().getTime() - new Date(record.detectedDate).getTime()) / (1000 * 60 * 60 * 24));
                          return (
                            <div key={record.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{record.securityName}</p>
                                <p className="text-xs text-gray-600">{daysOld} days old · {record.subcategory.name}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedSubcategory(record.subcategory.id);
                                  setCurrentPage(1);
                                  handleViewDetails(record);
                                }}
                                className="text-yellow-700 hover:text-yellow-800 text-sm font-medium"
                              >
                                View →
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Getting Started Guide */}
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    Quick Start Guide
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-blue-600">1</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Select Category</p>
                      <p className="text-xs text-gray-600">Choose from the left sidebar</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-green-600">2</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Review AI Analysis</p>
                      <p className="text-xs text-gray-600">Read subcategory insights</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl font-bold text-purple-600">3</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Approve or Reject</p>
                      <p className="text-xs text-gray-600">Use checkboxes for bulk actions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Error Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCriticalityColor(selectedRecord.criticality)}`}>
                    {selectedRecord.criticality.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {selectedRecord.confidence}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Security ID</p>
                    <p className="font-mono text-sm font-medium">{selectedRecord.securityId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Security Name</p>
                    <p className="text-sm font-medium">{selectedRecord.securityName}</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Error Description</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedRecord.errorDescription}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">AI Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedRecord.aiAnalysis}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Suggested Solution</h4>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{selectedRecord.suggestedSolution}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Database className="w-3 h-3" />
                    <span>Source: {selectedRecord.dataSource}</span>
                  </div>
                </div>

                {selectedRecord.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRecords(new Set([selectedRecord.id]));
                        handleBulkApprove();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Approve Solution
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRecords(new Set([selectedRecord.id]));
                        handleBulkReject();
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Reject Solution
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  Error Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                    {selectedRecord.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCriticalityColor(selectedRecord.criticality)}`}>
                    {selectedRecord.criticality.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {selectedRecord.confidence}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Security ID</p>
                    <p className="font-mono text-sm font-medium">{selectedRecord.securityId}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Security Name</p>
                    <p className="text-sm font-medium">{selectedRecord.securityName}</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Error Description</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedRecord.errorDescription}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">AI Analysis</h4>
                  </div>
                  <p className="text-sm text-gray-900">{selectedRecord.aiAnalysis}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-gray-900">Suggested Solution</h4>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{selectedRecord.suggestedSolution}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Database className="w-3 h-3" />
                    <span>Source: {selectedRecord.dataSource}</span>
                  </div>
                </div>

                {selectedRecord.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRecords(new Set([selectedRecord.id]));
                        handleBulkApprove('records');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      Approve Solution
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRecords(new Set([selectedRecord.id]));
                        handleBulkReject('records');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-medium"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      Reject Solution
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {actionType === 'approve' ? (
                  <div className="bg-green-100 p-3 rounded-full">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="bg-red-100 p-3 rounded-full">
                    <ThumbsDown className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {actionType === 'approve' ? 'Approve Selection' : 'Reject Selection'}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    {actionTarget === 'subcategory' && (
                      (() => {
                        const selectedSubs = Array.from(selectedSubcategories);
                        if (selectedSubs.length === 1) {
                          const sub = data.flatMap(cat => cat.subcategories).find(s => s.id === selectedSubs[0]);
                          if (sub) {
                            const summary = getSubcategorySummary(sub.records);
                            return <p>{summary.pending} pending errors in {sub.name}</p>;
                          }
                        }
                        const totalPending = selectedSubs.reduce((sum, subId) => {
                          const sub = data.flatMap(cat => cat.subcategories).find(s => s.id === subId);
                          return sum + (sub ? getSubcategorySummary(sub.records).pending : 0);
                        }, 0);
                        return <p>{totalPending} pending errors across {selectedSubs.length} subcategories</p>;
                      })()
                    )}
                    {actionTarget === 'mixed' && (
                      <div className="space-y-0.5">
                        {selectedCategories.size > 0 && (
                          <p>• {selectedCategories.size} {selectedCategories.size === 1 ? 'category' : 'categories'}</p>
                        )}
                        {selectedSubcategories.size > 0 && (
                          <p>• {selectedSubcategories.size} {selectedSubcategories.size === 1 ? 'subcategory' : 'subcategories'}</p>
                        )}
                        {selectedRecords.size > 0 && (
                          <p>• {selectedRecords.size} individual {selectedRecords.size === 1 ? 'record' : 'records'}</p>
                        )}
                        <p className="font-semibold text-gray-900 mt-1">
                          Total: {getTotalPendingCount()} pending errors
                        </p>
                      </div>
                    )}
                    {actionTarget === 'records' && (
                      <p>{selectedRecords.size} error(s) selected</p>
                    )}
                  </div>
                </div>
              </div>
              
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={actionType === 'approve' ? 'Add optional comment for AI learning...' : 'Explain why rejecting...'}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentText('');
                    setActionType(null);
                    const action = actionType === 'approve' ? 'Approved' : 'Rejected';
                    const count = actionTarget === 'subcategory'
                      ? Array.from(selectedSubcategories).reduce((sum, subId) => {
                          const sub = data.flatMap(cat => cat.subcategories).find(s => s.id === subId);
                          return sum + (sub ? getSubcategorySummary(sub.records).pending : 0);
                        }, 0)
                      : getTotalPendingCount();
                    alert(`${action} ${count} items${commentText ? ` with note: "${commentText}"` : ''}`);
                    setSelectedRecords(new Set());
                    setSelectedCategories(new Set());
                    setSelectedSubcategories(new Set());
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium text-white ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                </button>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentText('');
                    setActionType(null);
                    setActionTarget(null);
                  }}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityMasterDashboard;
