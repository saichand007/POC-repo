import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Send as SendIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Code as CodeIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Help as HelpIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  Storage as StorageIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon,
  DragHandle as DragHandleIcon
} from '@mui/icons-material';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment
} from '@mui/material';
import * as d3 from 'd3';

// Mock data for data lineage
const mockDataLineage = {
  nodes: [
    { id: 'source1', label: 'Customer DB', type: 'source', x: 50, y: 100 },
    { id: 'source2', label: 'Sales DB', type: 'source', x: 50, y: 200 },
    { id: 'source3', label: 'Product DB', type: 'source', x: 50, y: 300 },
    { id: 'transform1', label: 'Data Cleaning', type: 'transform', x: 200, y: 150 },
    { id: 'transform2', label: 'Join Tables', type: 'transform', x: 350, y: 200 },
    { id: 'transform3', label: 'Aggregation', type: 'transform', x: 500, y: 175 },
    { id: 'output1', label: 'Analytics Dashboard', type: 'output', x: 650, y: 150 },
    { id: 'output2', label: 'ML Model', type: 'output', x: 650, y: 220 },
  ],
  links: [
    { source: 'source1', target: 'transform1' },
    { source: 'source2', target: 'transform1' },
    { source: 'source3', target: 'transform2' },
    { source: 'transform1', target: 'transform2' },
    { source: 'transform2', target: 'transform3' },
    { source: 'transform3', target: 'output1' },
    { source: 'transform3', target: 'output2' },
  ]
};

const sideNavItems = [
  { icon: HomeIcon, label: 'Dashboard', active: false },
  { icon: MessageIcon, label: 'Chat', active: true },
  { icon: StorageIcon, label: 'Data Sources', active: false },
  { icon: BarChartIcon, label: 'Analytics', active: false },
  { icon: DescriptionIcon, label: 'Reports', active: false },
  { icon: SettingsIcon, label: 'Settings', active: false },
];

const ChatMessage = React.memo(({ message, isUser, hasButton, onOpenDataLineage }) => (
  <Box sx={{ 
    mb: 2,
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start'
  }}>
    <Paper
      elevation={0}
      sx={{
        p: 2,
        maxWidth: '70%',
        backgroundColor: isUser ? 'primary.main' : 'grey.100',
        color: isUser ? 'common.white' : 'text.primary',
        borderRadius: isUser 
          ? '18px 18px 0 18px' 
          : '18px 18px 18px 0'
      }}
    >
      {hasButton ? (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Of course! I can show you the data lineage visualization. This diagram shows how data flows from your sources through transformations to final outputs.
          </Typography>
          <Button 
            onClick={onOpenDataLineage}
            variant="contained"
            size="small"
            startIcon={<CodeIcon />}
            sx={{ mb: 1 }}
          >
            Open Data Lineage Visualization
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            You can resize the panels by dragging the divider between them.
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2">{message}</Typography>
      )}
    </Paper>
  </Box>
));

const DataLineageVisualization = React.memo(({ width, height }) => {
  const svgRef = useRef();
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !width || !height || isResizing) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = Math.max(100, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleLinear().domain([0, 700]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, 400]).range([0, innerHeight]);

    // Color scheme for different node types
    const colorMap = {
      source: '#10B981',
      transform: '#3B82F6',
      output: '#F59E0B'
    };

    // Add arrowhead marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 13)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#6B7280')
      .style('stroke','none');

    // Draw links
    g.selectAll('.link')
      .data(mockDataLineage.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => {
        const sourceNode = mockDataLineage.nodes.find(n => n.id === d.source);
        return xScale(sourceNode.x);
      })
      .attr('y1', d => {
        const sourceNode = mockDataLineage.nodes.find(n => n.id === d.source);
        return yScale(sourceNode.y);
      })
      .attr('x2', d => {
        const targetNode = mockDataLineage.nodes.find(n => n.id === d.target);
        return xScale(targetNode.x);
      })
      .attr('y2', d => {
        const targetNode = mockDataLineage.nodes.find(n => n.id === d.target);
        return yScale(targetNode.y);
      })
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(mockDataLineage.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${xScale(d.x)}, ${yScale(d.y)})`);

    nodes.append('rect')
      .attr('width', 120)
      .attr('height', 40)
      .attr('x', -60)
      .attr('y', -20)
      .attr('rx', 8)
      .attr('fill', d => colorMap[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => d.label);

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${Math.max(0, innerWidth - 150)}, 20)`);

    const legendData = [
      { type: 'source', label: 'Data Sources' },
      { type: 'transform', label: 'Transformations' },
      { type: 'output', label: 'Outputs' }
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 25})`);

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorMap[item.type]);

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .attr('fill', '#374151')
        .text(item.label);
    });

  }, [width, height, isResizing]);

  useEffect(() => {
    let timeoutId;
    setIsResizing(true);
    
    timeoutId = setTimeout(() => {
      setIsResizing(false);
    }, 150);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [width, height]);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative'
    }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      {isResizing && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'grey.50',
          opacity: 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="body2" color="text.secondary">
            Resizing...
          </Typography>
        </Box>
      )}
    </Box>
  );
});

const SplitPane = React.memo(({ children, split = 'vertical', defaultSize = '60%', onPaneResize }) => {
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [tempSize, setTempSize] = useState(defaultSize);
  const containerRef = useRef();
  const rafRef = useRef();

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setTempSize(size);
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, [size]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        
        if (split === 'vertical') {
          const newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100;
          const clampedSize = Math.max(30, Math.min(70, newSize));
          setTempSize(`${clampedSize}%`);
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setSize(tempSize);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      const numericSize = parseFloat(tempSize);
      if (onPaneResize) {
        setTimeout(() => onPaneResize(numericSize), 100);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isDragging, split, onPaneResize, tempSize]);

  const currentSize = isDragging ? tempSize : size;

  const pane1Style = {
    width: currentSize,
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  };

  const pane2Style = {
    width: `calc(100% - ${currentSize})`,
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  };

  return (
    <Box ref={containerRef} sx={{ 
      display: 'flex', 
      height: '100%', 
      position: 'relative'
    }}>
      <Box sx={{
        ...pane1Style,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        {children[0]}
        {isDragging && (
          <Box sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'transparent',
            zIndex: 10
          }} />
        )}
      </Box>
      
      <Box 
        sx={{
          width: '8px',
          cursor: 'col-resize',
          bgcolor: isDragging ? 'primary.main' : 'grey.200',
          '&:hover': {
            bgcolor: 'grey.300'
          },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20
        }}
        onMouseDown={handleMouseDown}
      >
        <Box sx={{
          position: 'absolute',
          width: 24,
          height: 24,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: isDragging ? 'primary.main' : 'grey.300',
          borderRadius: '50%',
          boxShadow: isDragging ? 2 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s'
        }}>
          <DragHandleIcon sx={{ fontSize: 16, color: 'grey.500' }} />
        </Box>
      </Box>
      
      <Box sx={{
        ...pane2Style,
        pointerEvents: isDragging ? 'none' : 'auto'
      }}>
        {children[1]}
        {isDragging && (
          <Box sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'transparent',
            zIndex: 10
          }} />
        )}
      </Box>
    </Box>
  );
});

const ChatInput = React.memo(({ inputValue, setInputValue, handleSendMessage, handleKeyPress }) => {
  return (
    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message AI Assistant..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              bgcolor: 'grey.100',
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: 'transparent'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.25)'
              }
            }
          }}
        />
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
          sx={{ 
            minWidth: 48, 
            height: 48, 
            borderRadius: '50%',
            boxShadow: 'none'
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
});

const DataLineagePanel = React.memo(({ visualizationDimensions, closeDataLineage }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" color="text.primary">
            Data Lineage
          </Typography>
        </Box>
        <IconButton onClick={closeDataLineage} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Box sx={{ 
        flex: 1, 
        p: 3, 
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Data Flow Visualization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This diagram shows how data flows from sources through transformations to outputs.
        </Typography>
        <Paper 
          variant="outlined" 
          sx={{ 
            height: 'calc(100% - 100px)',
            overflow: 'hidden',
            bgcolor: 'grey.50'
          }}
        >
          <DataLineageVisualization 
            width={visualizationDimensions.width} 
            height={visualizationDimensions.height} 
          />
        </Paper>
      </Box>
    </Box>
  );
});

const ChatPanel = React.memo(({ messages, openDataLineage, inputValue, setInputValue, handleSendMessage, handleKeyPress }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper'
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ 
            bgcolor: 'primary.main', 
            width: 40, 
            height: 40,
            background: 'linear-gradient(135deg, #3f51b5, #9c27b0)'
          }}>
            AI
          </Avatar>
          <Box>
            <Typography variant="subtitle1" color="text.primary">
              AI Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
              <Box component="span" sx={{ 
                width: 8, 
                height: 8, 
                bgcolor: 'success.main', 
                borderRadius: '50%', 
                mr: 0.5 
              }} />
              Online
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        flex: 1, 
        p: 3, 
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}>
        {messages.map((message, index) => (
          <ChatMessage 
            key={index}
            message={message.text}
            hasButton={message.hasButton}
            isUser={message.isUser}
            onOpenDataLineage={openDataLineage}
          />
        ))}
      </Box>

      <ChatInput 
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
      />
    </Box>
  );
});

const Header = React.memo(({ onMenuToggle }) => (
  <AppBar 
    position="static" 
    color="inherit" 
    elevation={0}
    sx={{ 
      borderBottom: '1px solid',
      borderColor: 'divider',
      px: 2,
      py: 1
    }}
  >
    <Toolbar sx={{ px: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          onClick={onMenuToggle}
          sx={{ display: { lg: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            A
          </Avatar>
          <Typography variant="h6" component="h1" color="text.primary">
            AI Assistant
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search conversations..."
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            width: 240,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'grey.100',
              borderRadius: '20px',
              pl: 1.5
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            sx: { py: 0.5 }
          }}
        />
        
        <IconButton>
          <Badge color="error" variant="dot" overlap="circular">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        
        <IconButton>
          <MoreVertIcon />
        </IconButton>
        
        <IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
            <PersonIcon fontSize="small" />
          </Avatar>
        </IconButton>
      </Box>
    </Toolbar>
  </AppBar>
));

const SideNavigation = React.memo(({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1200,
            display: { lg: 'none' }
          }}
          onClick={onClose}
        />
      )}
      
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 256,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                A
              </Avatar>
              <Typography variant="subtitle1" color="text.primary">
                AI Assistant
              </Typography>
            </Box>
          </Box>
          
          <List sx={{ flex: 1, p: 1 }}>
            {sideNavItems.map((item, index) => (
              <ListItem 
                key={index}
                button
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: item.active ? 'primary.light' : 'transparent',
                  color: item.active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.light' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <ListItem button>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Help & Support" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </Box>
        </Box>
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            width: 256,
            boxSizing: 'border-box',
            position: 'relative'
          }
        }}
        open
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                A
              </Avatar>
              <Typography variant="subtitle1" color="text.primary">
                AI Assistant
              </Typography>
            </Box>
          </Box>
          
          <List sx={{ flex: 1, p: 1 }}>
            {sideNavItems.map((item, index) => (
              <ListItem 
                key={index}
                button
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: item.active ? 'primary.light' : 'transparent',
                  color: item.active ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.light' : 'action.hover'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            <ListItem button>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HelpIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Help & Support" 
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </Box>
        </Box>
      </Drawer>
    </>
  );
});

const Footer = React.memo(() => (
  <Box 
    component="footer"
    sx={{ 
      bgcolor: 'background.paper',
      borderTop: '1px solid',
      borderColor: 'divider',
      px: 3,
      py: 2
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © 2025 AI Assistant
        </Typography>
        <Button size="small" color="inherit">
          Privacy Policy
        </Button>
        <Button size="small" color="inherit">
          Terms of Service
        </Button>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Version 1.0.0
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
          <Typography variant="caption" color="text.secondary">
            All systems operational
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
));

export default function HomePage() {
  const [isSideNavOpen, setSideNavOpen] = useState(false);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [visualizationDimensions, setVisualizationDimensions] = useState({
    width: 400,
    height: 500
  });
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI Assistant. I can help you with data analysis, visualizations, and data lineage. How can I help you today?", isUser: false },
    { text: "Hi! Can you show me the data lineage visualization?", isUser: true },
    { 
      text: "", 
      isUser: false,
      hasButton: true
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const updateVisualizationSize = useCallback((panelSizePercent) => {
    const windowWidth = window.innerWidth;
    const sideNavWidth = 256;
    const availableWidth = windowWidth - sideNavWidth;
    const panelWidth = availableWidth * ((100 - panelSizePercent) / 100);
    
    setVisualizationDimensions({
      width: Math.max(300, panelWidth - 100),
      height: Math.max(400, window.innerHeight - 280)
    });
  }, []);

  const openDataLineage = useCallback(() => {
    setPanelOpen(true);
    updateVisualizationSize(60);
  }, [updateVisualizationSize]);

  const closeDataLineage = useCallback(() => {
    setPanelOpen(false);
  }, []);

  const handleSendMessage = useCallback(() => {
    if (inputValue.trim()) {
      const userMessage = inputValue.trim();
      setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
      setInputValue('');
      
      setTimeout(() => {
        const messageLower = userMessage.toLowerCase();
        let response;

        if (messageLower.includes('data') || messageLower.includes('visual') || messageLower.includes('lineage') || 
            messageLower.includes('chart') || messageLower.includes('diagram') || messageLower.includes('flow') ||
            messageLower.includes('show') || messageLower.includes('see') || messageLower.includes('open')) {
          response = { 
            text: "", 
            isUser: false, 
            hasButton: true 
          };
        } else {
          const regularResponses = [
            "I understand your question. I can help you with data analysis, visualizations, and understanding your data pipeline.",
            "That's a great question! I can assist with various data-related tasks including lineage tracking and flow analysis.",
            "I'm here to help with your data needs. Would you like to explore any visualizations or data relationships?",
            "I can help you understand your data better. Let me know if you'd like to see any specific visualizations."
          ];
          const randomResponse = regularResponses[Math.floor(Math.random() * regularResponses.length)];
          response = { text: randomResponse, isUser: false };
        }
        
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
  }, [inputValue]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const toggleSideNav = useCallback(() => {
    setSideNavOpen(prev => !prev);
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: 'grey.100'
    }}>
      <Header onMenuToggle={toggleSideNav} />
      
      <Box sx={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden'
      }}>
        <SideNavigation 
          isOpen={isSideNavOpen} 
          onClose={() => setSideNavOpen(false)} 
        />
        
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          overflow: 'hidden'
        }}>
          {isPanelOpen ? (
            <SplitPane 
              defaultSize="60%" 
              onPaneResize={updateVisualizationSize}
            >
              <ChatPanel 
                messages={messages}
                openDataLineage={openDataLineage}
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleSendMessage={handleSendMessage}
                handleKeyPress={handleKeyPress}
              />
              <DataLineagePanel 
                visualizationDimensions={visualizationDimensions}
                closeDataLineage={closeDataLineage}
              />
            </SplitPane>
          ) : (
            <ChatPanel 
              messages={messages}
              openDataLineage={openDataLineage}
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
            />
          )}
        </Box>
      </Box>
      
      <Footer />
    </Box>
  );
}
