import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const GraphVisualization = () => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedTypes, setSelectedTypes] = useState(new Set(['Person', 'Company', 'Product']));
  const [selectedRelations, setSelectedRelations] = useState(new Set(['WORKS_AT', 'OWNS', 'USES']));
  const [searchTerm, setSearchTerm] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [forceStrength, setForceStrength] = useState(-400);
  const [linkDistance, setLinkDistance] = useState(150);
  const [showControls, setShowControls] = useState(false);
  const [performanceMode, setPerformanceMode] = useState(true);

  // Generate 250 nodes with realistic data
  const generateNodes = () => {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    const companies = ['TechCorp', 'DataSys', 'InnovateLabs', 'CloudNet', 'StartupHub', 'SecureNet', 'MediaTech', 'FinanceApp', 'EduTech', 'HealthCare Inc', 'Retail Solutions', 'AutoDrive', 'BioGenetics', 'SmartHome', 'FoodTech', 'TravelHub', 'GreenEnergy', 'SpaceVentures', 'RoboticSys', 'Blockchain Co', 'AI Dynamics', 'Cyber Security', 'Mobile Solutions', 'Web Services', 'Data Analytics', 'Cloud Systems', 'Digital Marketing', 'E-Commerce Hub', 'Gaming Studio', 'Social Platform', 'Streaming Service', 'Payment Systems', 'Insurance Tech', 'Real Estate App', 'Logistics Pro', 'Manufacturing Inc', 'Consulting Group', 'Design Studio', 'Architecture Firm', 'Legal Services', 'HR Solutions', 'Accounting Plus', 'Sales Force', 'Customer Success', 'Product Innovation', 'Research Labs', 'Development Center', 'Quality Assurance', 'Tech Support', 'Operations Hub'];
    const products = ['Analytics Pro', 'Cloud Suite', 'AI Platform', 'Data Viz Pro', 'Security Suite', 'DevTools Pro', 'Payment Gateway', 'CRM Plus', 'Learning Platform', 'Health Tracker', 'Inventory Manager', 'Project Manager', 'Communication Hub', 'File Storage', 'Video Conferencing', 'Email Service', 'Calendar App', 'Task Manager', 'Note Taking', 'Password Manager', 'VPN Service', 'Backup Solution', 'Monitoring Tool', 'Testing Framework', 'API Gateway', 'Database Manager', 'Code Editor', 'Design Tool', 'Collaboration Suite', 'Marketing Automation', 'Sales Pipeline', 'Customer Portal', 'Support Ticketing', 'Knowledge Base', 'Survey Tool', 'Form Builder', 'Workflow Engine', 'Reporting Dashboard', 'Business Intelligence', 'Mobile SDK'];
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Product', 'Design', 'Support', 'Legal', 'Research', 'Quality Assurance', 'Data Science', 'DevOps', 'Security', 'Business Development'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Indianapolis', 'Charlotte', 'San Francisco', 'Seattle', 'Denver', 'Boston', 'Portland', 'Las Vegas', 'Detroit', 'Memphis', 'Baltimore', 'Milwaukee', 'Nashville', 'Oklahoma City', 'Louisville', 'Richmond', 'New Orleans', 'Salt Lake City', 'Kansas City', 'Tampa', 'Atlanta', 'Miami', 'Cleveland', 'Minneapolis', 'Raleigh', 'Tulsa'];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Media', 'Energy', 'Transportation', 'Real Estate', 'Consulting', 'Legal', 'Agriculture', 'Entertainment'];
    
    const nodes = [];
    let id = 1;
    
    // Generate 160 Person nodes
    for (let i = 0; i < 160; i++) {
      nodes.push({
        id: id++,
        label: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        type: 'Person',
        properties: {
          age: 22 + Math.floor(Math.random() * 40),
          department: departments[Math.floor(Math.random() * departments.length)],
          city: cities[Math.floor(Math.random() * cities.length)]
        }
      });
    }
    
    // Generate 60 Company nodes
    for (let i = 0; i < 60; i++) {
      nodes.push({
        id: id++,
        label: companies[i % companies.length] + (i >= companies.length ? ` ${Math.floor(i / companies.length) + 1}` : ''),
        type: 'Company',
        properties: {
          founded: 2000 + Math.floor(Math.random() * 25),
          employees: 50 + Math.floor(Math.random() * 1000),
          industry: industries[Math.floor(Math.random() * industries.length)]
        }
      });
    }
    
    // Generate 30 Product nodes
    for (let i = 0; i < 30; i++) {
      nodes.push({
        id: id++,
        label: products[i % products.length] + (i >= products.length ? ` v${i - products.length + 2}` : ''),
        type: 'Product',
        properties: {
          version: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
          price: 299 + Math.floor(Math.random() * 2500),
          category: ['Software', 'SaaS', 'Platform', 'Tool', 'Service'][Math.floor(Math.random() * 5)]
        }
      });
    }
    
    return nodes;
  };

  const generateLinks = (nodes) => {
    const links = [];
    const persons = nodes.filter(n => n.type === 'Person');
    const companies = nodes.filter(n => n.type === 'Company');
    const products = nodes.filter(n => n.type === 'Product');
    
    // Each person works at a company
    persons.forEach((person, i) => {
      const company = companies[Math.floor(Math.random() * companies.length)];
      links.push({
        source: person.id,
        target: company.id,
        label: 'WORKS_AT',
        type: 'WORKS_AT'
      });
    });
    
    // Each company owns products
    companies.forEach((company) => {
      const numProducts = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numProducts && products.length > 0; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const exists = links.some(l => l.source === company.id && l.target === product.id && l.type === 'OWNS');
        if (!exists) {
          links.push({
            source: company.id,
            target: product.id,
            label: 'OWNS',
            type: 'OWNS'
          });
        }
      }
    });
    
    // Some persons use products
    for (let i = 0; i < persons.length * 0.4; i++) {
      const person = persons[Math.floor(Math.random() * persons.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const exists = links.some(l => l.source === person.id && l.target === product.id && l.type === 'USES');
      if (!exists) {
        links.push({
          source: person.id,
          target: product.id,
          label: 'USES',
          type: 'USES'
        });
      }
    }
    
    return links;
  };

  const allNodes = generateNodes();
  const allLinks = generateLinks(allNodes);
  
  const rawData = {
    nodes: allNodes,
    links: allLinks
  };

  const nodeColors = {
    Person: '#68bdf6',
    Company: '#6dce9e',
    Product: '#faafc2'
  };

  const edgeColors = {
    WORKS_AT: '#a5abb6',
    OWNS: '#f2b777',
    USES: '#de9bdb'
  };

  useEffect(() => {
    if (!svgRef.current) return;

    setIsSimulating(true);
    setProgress(0);

    // Filter data based on selections and search
    const filteredNodes = rawData.nodes.filter(node => 
      selectedTypes.has(node.type) && 
      node.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    
    const filteredLinks = rawData.links.filter(link => 
      selectedRelations.has(link.type) &&
      filteredNodeIds.has(link.source.id || link.source) &&
      filteredNodeIds.has(link.target.id || link.target)
    );

    const data = {
      nodes: filteredNodes.map(n => ({ ...n })),
      links: filteredLinks.map(l => ({ ...l }))
    };

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 900;
    const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    // Calculate initial transform for fit-to-view
    let initialTransform = d3.zoomIdentity;

    // Force simulation with optimized parameters
    let tickCount = 0;
    const maxTicks = 150;
    let animationFrameId = null;
    let isPanning = false;
    
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(linkDistance))
      .force('charge', d3.forceManyBody().strength(forceStrength).theta(0.9))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(performanceMode ? 35 : 40).iterations(1))
      .alpha(1)
      .alphaDecay(0.08)
      .velocityDecay(0.5);

    // Zoom behavior with label visibility control and performance optimization
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('start', () => {
        isPanning = true;
        if (performanceMode) {
          linkLabelGroup.style('display', 'none');
        }
      })
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        
        const zoomLevel = event.transform.k;
        
        // Show edge labels only if nodes < 20 OR zoom level > 1.5
        if (!isPanning) {
          const showLabels = data.nodes.length < 20 || zoomLevel > 1.5;
          linkLabelGroup.style('display', showLabels ? 'block' : 'none');
        }
        
        // Dynamic font size based on zoom level
        const baseFontSize = 10;
        const minFontSize = 8;
        const maxFontSize = 14;
        
        let dynamicFontSize;
        if (zoomLevel < 1) {
          dynamicFontSize = Math.max(minFontSize, baseFontSize / Math.sqrt(zoomLevel));
        } else {
          dynamicFontSize = Math.min(maxFontSize, baseFontSize * Math.sqrt(zoomLevel));
        }
        
        const fontScale = dynamicFontSize / baseFontSize;
        
        // Update text font size
        linkLabelGroup.selectAll('.label-text')
          .attr('font-size', dynamicFontSize)
          .attr('dy', 4 * fontScale);
        
        // Update background rectangle size to match text
        linkLabelGroup.selectAll('.label-bg')
          .attr('height', 18 * fontScale)
          .each(function(d) {
            const width = (d.label.length * 7 + 10) * fontScale;
            d3.select(this)
              .attr('width', width)
              .attr('x', -width / 2)
              .attr('y', -9 * fontScale);
          });
      })
      .on('end', (event) => {
        isPanning = false;
        const zoomLevel = event.transform.k;
        const showLabels = data.nodes.length < 20 || zoomLevel > 1.5;
        linkLabelGroup.style('display', showLabels ? 'block' : 'none');
      });

    svg.call(zoom);

    // Arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(Object.keys(edgeColors))
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('fill', d => edgeColors[d])
      .attr('stroke', d => edgeColors[d])
      .attr('stroke-width', 0.5)
      .attr('d', 'M0,-4L10,0L0,4L2,0Z');

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter().append('line')
      .attr('stroke', d => edgeColors[d.type])
      .attr('stroke-width', 2)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

    // Link labels with Neo4j-style background boxes
    const linkLabelGroup = g.append('g')
      .selectAll('g')
      .data(data.links)
      .enter().append('g')
      .attr('class', 'link-label')
      .style('display', data.nodes.length < 20 ? 'block' : 'none');

    // Background rectangles for labels
    linkLabelGroup.append('rect')
      .attr('class', 'label-bg')
      .attr('fill', '#4a5568')
      .attr('stroke', '#2d3748')
      .attr('stroke-width', 1)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('height', 18)
      .each(function(d) {
        const width = d.label.length * 7 + 10;
        d3.select(this)
          .attr('width', width)
          .attr('x', -width / 2)
          .attr('y', -9);
      });

    // Label text
    linkLabelGroup.append('text')
      .attr('class', 'label-text')
      .attr('font-size', 10)
      .attr('fill', '#e2e8f0')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-family', 'monospace')
      .attr('font-weight', '500')
      .text(d => d.label);

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', function(event, d) {
        const tooltip = d3.select(tooltipRef.current);
        tooltip.style('display', 'block')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px');
        
        let content = `<div class="tooltip-title">${d.label}</div>`;
        content += `<div class="tooltip-type">Type: ${d.type}</div>`;
        
        if (d.properties) {
          content += '<div class="tooltip-divider">Properties:</div>';
          Object.entries(d.properties).forEach(([key, value]) => {
            content += `<div class="tooltip-property"><span class="tooltip-key">${key}:</span> ${value}</div>`;
          });
        }
        
        tooltip.html(content);
      })
      .on('mouseout', function() {
        d3.select(tooltipRef.current).style('display', 'none');
      });

    // Node circles
    node.append('circle')
      .attr('r', 30)
      .attr('fill', d => nodeColors[d.type])
      .attr('stroke', '#fff')
      .attr('stroke-width', 3);

    // Node labels - wrapped to fit within circle with ellipsis
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 0)
      .attr('font-size', 9)
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .attr('pointer-events', 'none')
      .each(function(d) {
        const text = d3.select(this);
        const words = d.label.split(/\s+/);
        const maxWidth = 48;
        const maxLines = 2;
        const lineHeight = 1.1;
        
        let lines = [];
        let currentLine = [];
        
        for (let i = 0; i < words.length; i++) {
          currentLine.push(words[i]);
          const testLine = currentLine.join(' ');
          const testTspan = text.append('tspan').text(testLine);
          const lineWidth = testTspan.node().getComputedTextLength();
          testTspan.remove();
          
          if (lineWidth > maxWidth && currentLine.length > 1) {
            currentLine.pop();
            lines.push(currentLine.join(' '));
            currentLine = [words[i]];
            
            if (lines.length >= maxLines) break;
          }
        }
        
        if (currentLine.length > 0 && lines.length < maxLines) {
          lines.push(currentLine.join(' '));
        }
        
        if (lines.length > maxLines) {
          lines = lines.slice(0, maxLines);
        }
        
        if (currentLine.length > 0 && lines.length >= maxLines) {
          const lastLineIndex = lines.length - 1;
          const remainingWords = words.slice(words.indexOf(lines[lastLineIndex].split(' ').pop()) + 1);
          if (remainingWords.length > 0) {
            lines[lastLineIndex] += '...';
          }
        }
        
        lines.forEach((lineText, i) => {
          const tspan = text.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? `${-(lines.length - 1) * lineHeight * 0.5}em` : `${lineHeight}em`)
            .text(lineText);
          
          let truncated = lineText;
          while (tspan.node().getComputedTextLength() > maxWidth && truncated.length > 3) {
            truncated = truncated.substring(0, truncated.length - 4) + '...';
            tspan.text(truncated);
          }
        });
      });

    // Simulation tick with progress tracking and throttling
    let lastUpdate = Date.now();
    const updateInterval = performanceMode ? 50 : 32;
    const skipRenderUntil = 30;
    
    simulation.on('tick', () => {
      tickCount++;
      
      if (tickCount % 5 === 0) {
        setProgress(Math.min(100, Math.floor((tickCount / maxTicks) * 100)));
      }
      
      if (tickCount < skipRenderUntil) {
        if (tickCount >= maxTicks) {
          simulation.stop();
          finalizeFitToView();
        }
        return;
      }
      
      const now = Date.now();
      if (now - lastUpdate < updateInterval) return;
      lastUpdate = now;
      
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        linkLabelGroup
          .attr('transform', d => {
            const midX = (d.source.x + d.target.x) / 2;
            const midY = (d.source.y + d.target.y) / 2;
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            const offsetDistance = 12;
            const perpX = -dy / length * offsetDistance;
            const perpY = dx / length * offsetDistance;
            
            const x = midX + perpX;
            const y = midY + perpY;
            
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            if (angle > 90) angle -= 180;
            if (angle < -90) angle += 180;
            
            return `translate(${x},${y}) rotate(${angle})`;
          });

        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });
      
      if (tickCount >= maxTicks) {
        simulation.stop();
        finalizeFitToView();
      }
    });

    const finalizeFitToView = () => {
      setIsSimulating(false);
      setProgress(100);
      
      setTimeout(() => {
        const bounds = g.node().getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        if (fullWidth === 0 || fullHeight === 0) return;

        const scale = 0.9 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        initialTransform = d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale);

        svg.transition()
          .duration(750)
          .call(zoom.transform, initialTransform);
      }, 100);
    };

    simulation.on('end', () => {
      if (tickCount < maxTicks) {
        finalizeFitToView();
      }
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      if (performanceMode) {
        linkLabelGroup.style('display', 'none');
      }
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
      const currentZoom = d3.zoomTransform(svg.node());
      const showLabels = data.nodes.length < 20 || currentZoom.k > 1.5;
      linkLabelGroup.style('display', showLabels ? 'block' : 'none');
    }

    window.zoomIn = () => svg.transition().call(zoom.scaleBy, 1.3);
    window.zoomOut = () => svg.transition().call(zoom.scaleBy, 0.7);
    window.resetZoom = () => svg.transition().duration(750).call(zoom.transform, initialTransform);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      simulation.stop();
    };

  }, [selectedTypes, selectedRelations, searchTerm, forceStrength, linkDistance, performanceMode]);

  const toggleType = (type) => {
    const newSet = new Set(selectedTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedTypes(newSet);
  };

  const toggleRelation = (relation) => {
    const newSet = new Set(selectedRelations);
    if (newSet.has(relation)) {
      newSet.delete(relation);
    } else {
      newSet.add(relation);
    }
    setSelectedRelations(newSet);
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #111827;
          color: white;
          padding: 1rem;
        }

        .tooltip {
          position: fixed;
          background-color: #1f2937;
          border: 1px solid #4b5563;
          border-radius: 0.5rem;
          padding: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          pointer-events: none;
          z-index: 50;
          display: none;
        }

        .tooltip-title {
          font-weight: bold;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .tooltip-type {
          font-size: 0.75rem;
          color: #d1d5db;
          margin-bottom: 0.25rem;
        }

        .tooltip-divider {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.5rem;
          border-top: 1px solid #4b5563;
          padding-top: 0.5rem;
        }

        .tooltip-property {
          font-size: 0.75rem;
          color: #d1d5db;
        }

        .tooltip-key {
          color: #9ca3af;
        }

        .filter-bar {
          margin-bottom: 1rem;
          background-color: #1f2937;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .search-input {
          flex: 1;
          padding: 0.5rem 1rem;
          background-color: #374151;
          border: 1px solid #4b5563;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }

        .btn-secondary {
          background-color: #374151;
          color: white;
        }

        .btn-secondary:hover {
          background-color: #4b5563;
        }

        .btn-primary {
          background-color: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background-color: #1d4ed8;
        }

        .btn-green {
          background-color: #059669;
          color: white;
          width: 100%;
        }

        .btn-green:hover {
          background-color: #047857;
        }

        .btn-gray {
          background-color: #374151;
          color: white;
          width: 100%;
        }

        .btn-gray:hover {
          background-color: #4b5563;
        }

        .controls-panel {
          padding-top: 0.75rem;
          border-top: 1px solid #374151;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .control-group {
          display: flex;
          flex-direction: column;
        }

        .control-label {
          display: block;
          font-size: 0.875rem;
          color: #9ca3af;
          margin-bottom: 0.5rem;
        }

        .control-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background-color: #374151;
          border: 1px solid #4b5563;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
        }

        .control-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .slider {
          width: 100%;
          height: 4px;
          background: #4b5563;
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .control-hint {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
          text-align: center;
        }

        .main-content {
          display: flex;
          gap: 1rem;
          flex: 1;
          min-height: 0;
        }

        .sidebar {
          background-color: #1f2937;
          padding: 1rem;
          border-radius: 0.5rem;
          width: 16rem;
          overflow-y: auto;
        }

        .sidebar-title {
          font-size: 1.125rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .sidebar-section {
          margin-bottom: 1.5rem;
        }

        .sidebar-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #9ca3af;
        }

        .legend-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .legend-checkbox {
          margin-right: 0.5rem;
          cursor: pointer;
        }

        .legend-color-circle {
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .legend-color-line {
          width: 2rem;
          height: 0.125rem;
          margin-right: 0.5rem;
        }

        .legend-label {
          font-size: 0.875rem;
        }

        .graph-container {
          flex: 1;
          background-color: #1f2937;
          border-radius: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .graph-svg {
          width: 100%;
          height: 100%;
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(17, 24, 39, 0.75);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
        }

        .loading-text {
          color: white;
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }

        .progress-bar {
          width: 16rem;
          height: 1rem;
          background-color: #374151;
          border-radius: 9999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s;
        }

        .progress-text {
          color: #9ca3af;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .zoom-controls {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .zoom-btn {
          width: 2.5rem;
          height: 2.5rem;
          background-color: #374151;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .zoom-btn:hover {
          background-color: #4b5563;
        }

        .zoom-btn-text {
          font-size: 0.875rem;
        }
      `}</style>

      <div className="container">
        <div
          ref={tooltipRef}
          className="tooltip"
        />
        
        <div className="filter-bar">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary"
            >
              Clear
            </button>
            <button
              onClick={() => setShowControls(!showControls)}
              className="btn btn-primary"
            >
              {showControls ? 'Hide' : 'Show'} Controls
            </button>
          </div>
          
          {showControls && (
            <div className="controls-panel">
              <div className="controls-grid">
                <div className="control-group">
                  <label className="control-label">
                    Force Strength: {forceStrength}
                  </label>
                  <input
                    type="range"
                    min="-1000"
                    max="-100"
                    value={forceStrength}
                    onChange={(e) => setForceStrength(parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>More Clustered</span>
                    <span>More Spread</span>
                  </div>
                </div>
                
                <div className="control-group">
                  <label className="control-label">
                    Link Distance: {linkDistance}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={linkDistance}
                    onChange={(e) => setLinkDistance(parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="slider-labels">
                    <span>Closer</span>
                    <span>Further Apart</span>
                  </div>
                </div>
                
                <div className="control-group">
                  <label className="control-label">Performance Mode</label>
                  <button
                    onClick={() => setPerformanceMode(!performanceMode)}
                    className={performanceMode ? 'btn btn-green' : 'btn btn-gray'}
                  >
                    {performanceMode ? '⚡ High Performance' : '🎨 High Quality'}
                  </button>
                  <div className="control-hint">
                    {performanceMode ? 'Faster rendering' : 'Better visuals'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="main-content">
          <div className="sidebar">
            <h3 className="sidebar-title">Legend</h3>
            
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Node Types</h4>
              {Object.entries(nodeColors).map(([type, color]) => (
                <div key={type} className="legend-item">
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(type)}
                    onChange={() => toggleType(type)}
                    className="legend-checkbox"
                  />
                  <div
                    className="legend-color-circle"
                    style={{ backgroundColor: color }}
                  />
                  <span className="legend-label">{type}</span>
                </div>
              ))}
            </div>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Relationships</h4>
              {Object.entries(edgeColors).map(([relation, color]) => (
                <div key={relation} className="legend-item">
                  <input
                    type="checkbox"
                    checked={selectedRelations.has(relation)}
                    onChange={() => toggleRelation(relation)}
                    className="legend-checkbox"
                  />
                  <div
                    className="legend-color-line"
                    style={{ backgroundColor: color }}
                  />
                  <span className="legend-label">{relation}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="graph-container">
            <svg ref={svgRef} className="graph-svg" />
            
            {isSimulating && (
              <div className="loading-overlay">
                <div className="loading-text">Calculating Layout...</div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="progress-text">{progress}%</div>
              </div>
            )}
            
            <div className="zoom-controls">
              <button
                onClick={() => window.zoomIn()}
                className="zoom-btn"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => window.zoomOut()}
                className="zoom-btn"
                title="Zoom Out"
              >
                −
              </button>
              <button
                onClick={() => window.resetZoom()}
                className="zoom-btn zoom-btn-text"
                title="Reset Zoom"
              >
                ⟲
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GraphVisualization;
