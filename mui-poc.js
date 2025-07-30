import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Divider,
  Tabs,
  Tab,
  Toolbar,
  AppBar,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Code as CodeIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
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

const ChatMessage = ({ message, isUser }) => (
  <Box sx={{ mb: 2, display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: '70%',
        bgcolor: isUser ? '#e3f2fd' : '#f5f5f5',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      }}
    >
      <Typography variant="body1">{message}</Typography>
    </Paper>
  </Box>
);

const DataLineageVisualization = ({ width, height }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!svgRef.current || !width || !height) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

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
      source: '#4CAF50',
      transform: '#2196F3',
      output: '#FF9800'
    };

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
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

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
      .attr('fill', '#999')
      .style('stroke','none');

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
      .attr('transform', `translate(${innerWidth - 150}, 20)`);

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
        .text(item.label);
    });

  }, [width, height]);

  return <svg ref={svgRef}></svg>;
};

const ResizablePanel = ({ children, isOpen, onClose, onMinimize, width, onWidthChange, minWidth = 300, maxWidth = 800 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(width);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartWidth(width);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = dragStartX - e.clientX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, dragStartWidth + deltaX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartX, dragStartWidth, width, onWidthChange, minWidth, maxWidth]);

  if (!isOpen) return null;

  return (
    <Box
      sx={{
        width: `${width}px`,
        height: '100%',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Resize handle */}
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          cursor: 'col-resize',
          bgcolor: 'transparent',
          '&:hover': {
            bgcolor: 'primary.main',
          },
        }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Panel header */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense" sx={{ minHeight: '48px' }}>
          <CodeIcon sx={{ mr: 1 }} />
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            Data Lineage
          </Typography>
          <IconButton size="small" onClick={onMinimize}>
            <MinimizeIcon />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Panel content */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default function ClaudeChatInterface() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Claude. How can I help you today?", isUser: false },
    { text: "Hi Claude! Can you show me the data lineage visualization?", isUser: true },
    { text: "Of course! I've opened the data lineage panel for you. It shows how data flows from your sources through transformations to final outputs. You can resize the panel by dragging the left edge.", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isPanelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(400);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { text: inputValue, isUser: true }]);
      setInputValue('');
      
      // Simulate Claude's response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "I understand your question. The data lineage visualization shows the complete flow of data through your pipeline, helping you understand dependencies and data transformations.", 
          isUser: false 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePanel = () => {
    setPanelOpen(!isPanelOpen);
    setIsMinimized(false);
  };

  const minimizePanel = () => {
    setIsMinimized(!isMinimized);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setIsMinimized(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Main chat area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: '400px'
      }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Claude Chat
            </Typography>
            <IconButton onClick={togglePanel} color="inherit">
              <CodeIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Messages area */}
        <Box sx={{ 
          flexGrow: 1, 
          p: 2, 
          overflow: 'auto',
          bgcolor: 'background.paper'
        }}>
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message.text}
              isUser={message.isUser}
            />
          ))}
        </Box>

        {/* Input area */}
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              variant="outlined"
              placeholder="Message Claude..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                }
              }}
            />
            <IconButton 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Resizable data visualization panel */}
      <ResizablePanel
        isOpen={isPanelOpen && !isMinimized}
        onClose={closePanel}
        onMinimize={minimizePanel}
        width={panelWidth}
        onWidthChange={setPanelWidth}
      >
        <Box sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Data Flow Visualization
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This diagram shows how data flows from sources through transformations to outputs.
          </Typography>
          <Box sx={{ 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 1,
            height: 'calc(100% - 100px)',
            overflow: 'hidden'
          }}>
            <DataLineageVisualization 
              width={panelWidth - 48} 
              height={window.innerHeight - 200} 
            />
          </Box>
        </Box>
      </ResizablePanel>

      {/* Minimized panel indicator */}
      {isPanelOpen && isMinimized && (
        <Box
          sx={{
            width: '40px',
            height: '100%',
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={minimizePanel}
        >
          <CodeIcon sx={{ transform: 'rotate(90deg)' }} />
        </Box>
      )}
    </Box>
  );
}
