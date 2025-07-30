import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  Drawer, 
  Avatar,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Send, 
  Close, 
  Minimize, 
  Code, 
  DragHandle,
  Menu,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import * as d3 from 'd3';

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const chatContainerRef = useRef(null);
  const d3ContainerRef = useRef(null);
  const dragHandleRef = useRef(null);

  // Mock data for D3 visualization
  const mockData = {
    name: "Data Source",
    children: [
      { 
        name: "Extraction",
        children: [
          { name: "API Call", value: 100 },
          { name: "Data Validation", value: 80 }
        ]
      },
      { 
        name: "Transformation",
        children: [
          { name: "Cleaning", value: 120 },
          { name: "Normalization", value: 90 },
          { name: "Feature Engineering", value: 110 }
        ]
      },
      { 
        name: "Loading",
        children: [
          { name: "Database Write", value: 70 },
          { name: "Cache Update", value: 60 }
        ]
      }
    ]
  };

  // Initialize D3 visualization
  useEffect(() => {
    if (!showDataPanel || !d3ContainerRef.current) return;

    const width = panelWidth - 40;
    const height = panelMinimized ? 60 : 500;

    // Clear previous visualization
    d3.select(d3ContainerRef.current).selectAll("*").remove();

    const svg = d3.select(d3ContainerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    const root = d3.hierarchy(mockData);
    const treeLayout = d3.tree().size([width - 40, height - 100]);

    treeLayout(root);

    // Draw the links
    svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

    // Draw the nodes
    const node = svg.append("g")
      .selectAll("g")
      .data(root.descendants())
      .join("g")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("fill", d => d.children ? "#555" : "#999")
      .attr("r", 6);

    node.append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.children ? -12 : 12)
      .attr("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.data.name)
      .clone(true).lower()
      .attr("stroke", "white")
      .attr("stroke-width", 3);

  }, [showDataPanel, panelMinimized, panelWidth]);

  // Handle drag events for resizing panel
  useEffect(() => {
    if (!dragHandleRef.current) return;

    const handleMouseDown = (e) => {
      setIsDragging(true);
      document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
    };

    const dragHandle = dragHandleRef.current;
    dragHandle.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      dragHandle.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newUserMessage = { 
      id: messages.length + 1, 
      text: inputValue, 
      sender: 'user' 
    };
    
    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse = { 
        id: messages.length + 2, 
        text: `I received your message: "${inputValue}". This is a simulated response.`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, botResponse]);
      
      // Scroll to bottom
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      flexDirection: 'column',
      backgroundColor: '#f7f7f8'
    }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={0} sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e5e5'
      }}>
        <Toolbar>
          <Avatar 
            sx={{ 
              bgcolor: '#10a37f', 
              width: 32, 
              height: 32,
              mr: 2
            }}
          >
            C
          </Avatar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Claude
          </Typography>
          <Tooltip title="Toggle Data Panel">
            <IconButton 
              color="inherit" 
              onClick={() => setShowDataPanel(!showDataPanel)}
              sx={{ color: showDataPanel ? '#10a37f' : 'inherit' }}
            >
              <Code />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Chat Panel */}
        <Box sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Messages Container */}
          <Box 
            ref={chatContainerRef}
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              p: 2,
              backgroundColor: 'white'
            }}
          >
            {messages.map((message) => (
              <Box 
                key={message.id} 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.sender === 'user' ? '#10a37f' : '#f0f0f0',
                    color: message.sender === 'user' ? 'white' : 'inherit',
                    borderRadius: message.sender === 'user' 
                      ? '18px 18px 0 18px' 
                      : '18px 18px 18px 0'
                  }}
                >
                  <Typography variant="body1">{message.text}</Typography>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Input Area */}
          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5',
            backgroundColor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Claude..."
                variant="outlined"
                sx={{ 
                  mr: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    backgroundColor: '#f7f7f8'
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendMessage}
                disabled={inputValue.trim() === ''}
                sx={{ 
                  minWidth: '48px', 
                  height: '48px', 
                  borderRadius: '50%',
                  backgroundColor: '#10a37f',
                  '&:hover': {
                    backgroundColor: '#0d8a6d'
                  }
                }}
              >
                <Send />
              </Button>
            </Box>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center', color: '#666' }}>
              Claude can make mistakes. Consider checking important information.
            </Typography>
          </Box>
        </Box>

        {/* Data Visualization Panel */}
        {showDataPanel && (
          <>
            <Box 
              ref={dragHandleRef}
              sx={{
                width: '8px',
                cursor: 'col-resize',
                backgroundColor: isDragging ? '#10a37f' : 'transparent',
                '&:hover': {
                  backgroundColor: '#e5e5e5'
                }
              }}
            />
            <Paper 
              elevation={0}
              sx={{ 
                width: panelWidth,
                height: '100%',
                borderLeft: '1px solid #e5e5e5',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f7f7f8',
                overflow: 'hidden'
              }}
            >
              {/* Panel Header */}
              <Box sx={{ 
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                borderBottom: '1px solid #e5e5e5'
              }}>
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  Data Lineage
                </Typography>
                <Box>
                  <IconButton 
                    size="small" 
                    onClick={() => setPanelMinimized(!panelMinimized)}
                  >
                    {panelMinimized ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => setShowDataPanel(false)}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {/* Panel Content */}
              <Box 
                ref={d3ContainerRef}
                sx={{ 
                  flexGrow: 1,
                  p: 2,
                  overflow: 'auto',
                  display: panelMinimized ? 'none' : 'block'
                }}
              />
              
              {panelMinimized && (
                <Box sx={{ 
                  p: 2,
                  textAlign: 'center',
                  color: '#666'
                }}>
                  <Typography variant="caption">
                    Data lineage panel minimized
                  </Typography>
                </Box>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ChatWindow;
