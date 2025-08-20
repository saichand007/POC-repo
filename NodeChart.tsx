import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const NetworkGraph = () => {
  const svgRef = useRef();
  const [selectedNode, setSelectedNode] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Sample data based on the image - Buster Keaton and related movies/people
  const graphData = {
    nodes: [
      { id: "Buster Keaton", type: "person", group: 1, details: { born: "1895", died: "1966", profession: "Actor, Director, Producer", known_for: "Silent comedy films" } },
      { id: "Sherlock Jr.", type: "movie", group: 2, details: { year: "1924", director: "Buster Keaton", genre: "Comedy", runtime: "45 min" } },
      { id: "The General", type: "movie", group: 2, details: { year: "1926", director: "Buster Keaton", genre: "Comedy/Action", runtime: "67 min" } },
      { id: "Our Hospitality", type: "movie", group: 2, details: { year: "1923", director: "Buster Keaton", genre: "Comedy", runtime: "65 min" } },
      { id: "Steamboat Bill Jr.", type: "movie", group: 2, details: { year: "1928", director: "Charles Reisner", genre: "Comedy", runtime: "70 min" } },
      { id: "The Navigator", type: "movie", group: 2, details: { year: "1924", director: "Buster Keaton", genre: "Comedy", runtime: "59 min" } },
      { id: "Seven Chances", type: "movie", group: 2, details: { year: "1925", director: "Buster Keaton", genre: "Comedy/Romance", runtime: "56 min" } },
      { id: "College", type: "movie", group: 2, details: { year: "1927", director: "James W. Horne", genre: "Comedy", runtime: "66 min" } },
      { id: "The Cameraman", type: "movie", group: 2, details: { year: "1928", director: "Edward Sedgwick", genre: "Comedy/Romance", runtime: "76 min" } },
      { id: "Go West", type: "movie", group: 2, details: { year: "1925", director: "Buster Keaton", genre: "Comedy/Western", runtime: "69 min" } },
      { id: "Battling Butler", type: "movie", group: 2, details: { year: "1926", director: "Buster Keaton", genre: "Comedy", runtime: "77 min" } },
      { id: "Three Ages", type: "movie", group: 2, details: { year: "1923", director: "Buster Keaton", genre: "Comedy", runtime: "63 min" } },
      { id: "The Playhouse", type: "movie", group: 2, details: { year: "1921", director: "Buster Keaton", genre: "Comedy Short", runtime: "22 min" } },
      { id: "Cops", type: "movie", group: 2, details: { year: "1922", director: "Buster Keaton", genre: "Comedy Short", runtime: "18 min" } },
      { id: "The Paleface", type: "movie", group: 2, details: { year: "1922", director: "Buster Keaton", genre: "Comedy Short", runtime: "20 min" } },
      { id: "Harold Lloyd", type: "person", group: 3, details: { born: "1893", died: "1971", profession: "Actor, Comedian", known_for: "Silent comedy films" } },
      { id: "Charlie Chaplin", type: "person", group: 3, details: { born: "1889", died: "1977", profession: "Actor, Director, Composer", known_for: "The Tramp character" } },
      { id: "Roscoe Arbuckle", type: "person", group: 3, details: { born: "1887", died: "1933", profession: "Actor, Director", known_for: "Silent comedy pioneer" } },
      { id: "Edward F. Cline", type: "person", group: 3, details: { born: "1891", died: "1961", profession: "Director, Actor", known_for: "Comedy direction" } },
      { id: "Paul Wegener", type: "person", group: 3, details: { born: "1874", died: "1948", profession: "Actor, Director", known_for: "German expressionist films" } },
      { id: "The Golem", type: "movie", group: 2, details: { year: "1920", director: "Paul Wegener", genre: "Horror/Fantasy", runtime: "85 min" } },
      { id: "Kid Brother", type: "movie", group: 2, details: { year: "1927", director: "Ted Wilde", genre: "Comedy", runtime: "82 min" } },
      { id: "My Little Chickadee", type: "movie", group: 2, details: { year: "1940", director: "Edward F. Cline", genre: "Comedy/Western", runtime: "83 min" } },
      { id: "Barton Fink", type: "movie", group: 2, details: { year: "1991", director: "Coen Brothers", genre: "Drama/Thriller", runtime: "116 min" } },
      { id: "Mascot Pictures", type: "studio", group: 4, details: { founded: "1927", type: "Film Studio", specialty: "Low-budget serials and features" } }
    ],
    links: [
      { source: "Buster Keaton", target: "Sherlock Jr.", label: "DIRECTED", direction: "outgoing" },
      { source: "Buster Keaton", target: "The General", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "Our Hospitality", label: "DIRECTED", direction: "outgoing" },
      { source: "Buster Keaton", target: "Steamboat Bill Jr.", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "The Navigator", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "Seven Chances", label: "DIRECTED", direction: "outgoing" },
      { source: "Buster Keaton", target: "College", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "The Cameraman", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "Go West", label: "DIRECTED", direction: "outgoing" },
      { source: "Buster Keaton", target: "Battling Butler", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "Three Ages", label: "DIRECTED", direction: "outgoing" },
      { source: "Buster Keaton", target: "The Playhouse", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "Cops", label: "STARRED_IN", direction: "outgoing" },
      { source: "Buster Keaton", target: "The Paleface", label: "STARRED_IN", direction: "outgoing" },
      { source: "Harold Lloyd", target: "Kid Brother", label: "STARRED_IN", direction: "outgoing" },
      { source: "Charlie Chaplin", target: "Harold Lloyd", label: "CONTEMPORARY", direction: "bidirectional" },
      { source: "Buster Keaton", target: "Roscoe Arbuckle", label: "WORKED_WITH", direction: "bidirectional" },
      { source: "Edward F. Cline", target: "My Little Chickadee", label: "DIRECTED", direction: "outgoing" },
      { source: "Paul Wegener", target: "The Golem", label: "STARRED_IN", direction: "outgoing" },
      { source: "Edward F. Cline", target: "Barton Fink", label: "INFLUENCED", direction: "outgoing" },
      { source: "Mascot Pictures", target: "The General", label: "DISTRIBUTED", direction: "outgoing" }
    ]
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 800;

    // Zoom scale tracking
    let currentZoomScale = 1;

    // Node size constraints
    const minNodeRadius = 15;
    const maxNodeRadius = 60;
    const baseNodeRadius = {
      main: 25,
      normal: 20
    };

    svg.attr("width", width).attr("height", height);

    // Create main group for zooming
    const g = svg.append("g");

    // Define arrow markers for directed edges
    const defs = svg.append("defs");
    
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666");

    defs.append("marker")
      .attr("id", "arrowhead-bi")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 2)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#666");

    // Function to calculate required edge length based on text
    function calculateRequiredEdgeLength(label, zoomScale = 1) {
      const fontSize = Math.min(Math.max(10 * Math.sqrt(zoomScale), 8), 14);
      const textDimensions = getTextDimensions(label, fontSize);
      return Math.max(textDimensions.width + 40, 120); // Minimum 120px, or text width + 40px padding
    }

    // Function to get dynamic edge length based on zoom
    function getDynamicEdgeLength(d, zoomScale = 1) {
      const baseLength = calculateRequiredEdgeLength(d.label, zoomScale);
      // Scale edge length with zoom - more zoom = longer edges for better text visibility
      const zoomMultiplier = Math.max(1, zoomScale * 0.8);
      return baseLength * zoomMultiplier;
    }

    // Functions to calculate scaled sizes
    function getScaledNodeRadius(d) {
      const baseRadius = d.id === "Buster Keaton" ? baseNodeRadius.main : baseNodeRadius.normal;
      const scaledRadius = baseRadius * Math.sqrt(currentZoomScale);
      return Math.min(Math.max(scaledRadius, minNodeRadius), maxNodeRadius);
    }

    function getScaledFontSize(d) {
      const baseFontSize = d.id === "Buster Keaton" ? 9 : 8;
      const scaledFontSize = baseFontSize * Math.sqrt(currentZoomScale);
      return Math.min(Math.max(scaledFontSize, 6), 16);
    }

    function getScaledStrokeWidth(base = 2) {
      return Math.min(Math.max(base * Math.sqrt(currentZoomScale), 1), 6);
    }

    // Function to check if text should be visible based on zoom
    function shouldShowText() {
      return currentZoomScale > 0.8;
    }

    // Function to calculate text dimensions
    function getTextDimensions(text, fontSize) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = `${fontSize}px sans-serif`;
      const metrics = context.measureText(text);
      return {
        width: metrics.width,
        height: fontSize
      };
    }

    // Add zoom behavior with scale tracking
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        currentZoomScale = event.transform.k;
        g.attr("transform", event.transform);
        
        updateNodeSizes();
        updateTextSizes();
        updateEdgeSizes();
        updateEdgeLengths(); // Update edge lengths when zoom changes
      });

    svg.call(zoom);

    // Create color scale for different node types
    const color = d3.scaleOrdinal()
      .domain([1, 2, 3, 4])
      .range(["#4CAF50", "#8BC34A", "#689F38", "#558B2F"]);

    // Create force simulation with dynamic edge lengths
    const simulation = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(d => getDynamicEdgeLength(d, currentZoomScale)))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("z-index", "1000")
      .style("pointer-events", "none");

    // Create links with arrows
    const link = g.append("g")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", d => {
        if (d.direction === "outgoing") return "url(#arrowhead)";
        if (d.direction === "bidirectional") return "url(#arrowhead)";
        return null;
      })
      .attr("marker-start", d => d.direction === "bidirectional" ? "url(#arrowhead-bi)" : null);

    // Create link labels with background padding
    const linkLabelGroup = g.append("g").attr("class", "link-labels");

    const linkLabelBg = linkLabelGroup.selectAll("rect")
      .data(graphData.links)
      .enter().append("rect")
      .attr("fill", "white")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 0.5)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("opacity", 0)
      .style("pointer-events", "none");

    const linkLabels = linkLabelGroup.selectAll("text")
      .data(graphData.links)
      .enter().append("text")
      .attr("class", "link-label")
      .attr("font-size", "10px")
      .attr("fill", "#555")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-weight", "600")
      .text(d => d.label)
      .attr("opacity", 0)
      .style("pointer-events", "none");

    // Create nodes with dynamic sizing
    const node = g.append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", d => getScaledNodeRadius(d))
      .attr("fill", d => color(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", d => getScaledStrokeWidth(2))
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Function to wrap text inside circles
    function wrapTextInCircle(text, radius, fontSize) {
      const words = text.split(/\s+/);
      const charWidth = fontSize * 0.6;
      const maxCharsPerLine = Math.floor((radius * 1.8) / charWidth);
      const lineHeight = fontSize + 1;
      const maxLines = Math.floor((radius * 1.8) / lineHeight);
      
      let lines = [];
      let currentLine = "";
      
      for (let word of words) {
        if ((currentLine + word).length <= maxCharsPerLine) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
          if (lines.length >= maxLines - 1) break;
        }
      }
      if (currentLine && lines.length < maxLines) {
        lines.push(currentLine);
      }
      
      if (lines.length > 0 && text.length > maxCharsPerLine * maxLines) {
        lines[lines.length - 1] = lines[lines.length - 1].substring(0, maxCharsPerLine - 3) + "...";
      }
      
      return lines;
    }

    // Create node labels
    const nodeLabels = g.append("g")
      .selectAll("g")
      .data(graphData.nodes)
      .enter().append("g")
      .attr("class", "node-label-group")
      .style("pointer-events", "none");

    function renderNodeText() {
      nodeLabels.each(function(d) {
        const radius = getScaledNodeRadius(d);
        const fontSize = getScaledFontSize(d);
        const lines = wrapTextInCircle(d.id, radius, fontSize);
        const lineHeight = fontSize + 1;
        const totalHeight = lines.length * lineHeight;
        const startY = -totalHeight / 2 + lineHeight / 2;

        d3.select(this).selectAll("text").remove();

        d3.select(this)
          .selectAll("text")
          .data(lines)
          .enter().append("text")
          .attr("text-anchor", "middle")
          .attr("font-size", fontSize + "px")
          .attr("font-weight", d.id === "Buster Keaton" ? "bold" : "normal")
          .attr("fill", "#333")
          .attr("dy", (line, i) => startY + i * lineHeight)
          .text(line => line);
      });
    }

    renderNodeText();

    // Add double-click to unpin nodes
    node.on("dblclick", function(event, d) {
      d.fx = null;
      d.fy = null;
      
      d3.select(this)
        .transition()
        .duration(200)
        .attr("stroke", "#fff")
        .attr("stroke-width", getScaledStrokeWidth(2));
    });

    // Add click to show node details
    node.on("click", function(event, d) {
      event.stopPropagation();
      setSelectedNode(d);
      setShowDetails(true);
    });

    // Add hover effects with tooltips
    node.on("mouseover", function(event, d) {
      const currentRadius = getScaledNodeRadius(d);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", Math.min(currentRadius * 1.2, maxNodeRadius))
        .attr("stroke-width", getScaledStrokeWidth(3));
      
      tooltip
        .style("visibility", "visible")
        .html(`<strong>${d.id}</strong><br/>Type: ${d.type}<br/>${d.fx !== null ? '📌 Pinned (double-click to unpin)' : '🔄 Free-moving'}<br/>Click for details`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mousemove", function(event, d) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function(event, d) {
      const currentRadius = getScaledNodeRadius(d);
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", currentRadius)
        .attr("stroke-width", d.fx !== null ? getScaledStrokeWidth(3) : getScaledStrokeWidth(2));
      
      tooltip.style("visibility", "hidden");
    });

    // Update functions for zoom scaling
    function updateNodeSizes() {
      node
        .transition()
        .duration(100)
        .attr("r", d => getScaledNodeRadius(d))
        .attr("stroke-width", d => d.fx !== null ? getScaledStrokeWidth(3) : getScaledStrokeWidth(2));
    }

    function updateTextSizes() {
      renderNodeText();
    }

    function updateEdgeSizes() {
      link
        .transition()
        .duration(100)
        .attr("stroke-width", getScaledStrokeWidth(2));
      
      const showText = shouldShowText();
      const labelFontSize = Math.min(Math.max(10 * Math.sqrt(currentZoomScale), 8), 14);
      
      // Update font size for all labels
      linkLabels
        .attr("font-size", labelFontSize + "px");
      
      // Update background sizes dynamically based on text width
      if (showText) {
        linkLabelBg.each(function(d) {
          const dimensions = getTextDimensions(d.label, labelFontSize);
          d3.select(this)
            .attr("width", dimensions.width + 8)
            .attr("height", dimensions.height + 4)
            .attr("x", -(dimensions.width + 8) / 2)
            .attr("y", -(dimensions.height + 4) / 2);
        });
      }
      
      // Note: Actual visibility is handled in the tick function based on edge length vs text width
    }

    // Update positions on each simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => {
          const targetRadius = getScaledNodeRadius(d.target);
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const offset = targetRadius + 5;
          return d.target.x - (dx / distance) * offset;
        })
        .attr("y2", d => {
          const targetRadius = getScaledNodeRadius(d.target);
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const offset = targetRadius + 5;
          return d.target.y - (dy / distance) * offset;
        });

      const showText = shouldShowText();
      
      if (showText) {
        linkLabels.each(function(d) {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const edgeLength = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate text width dynamically
          const labelFontSize = Math.min(Math.max(10 * Math.sqrt(currentZoomScale), 8), 14);
          const textDimensions = getTextDimensions(d.label, labelFontSize);
          const requiredLength = textDimensions.width + 20; // Add 20px padding
          
          // Since edges are now sized to accommodate text, be more lenient with display
          if (edgeLength > requiredLength * 0.8) { // Show if edge is at least 80% of required length
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            let adjustedAngle = angle;
            if (angle > 90 || angle < -90) {
              adjustedAngle = angle + 180;
            }
            
            // Position text above the edge
            const offsetDistance = 12;
            const perpX = -dy / edgeLength * offsetDistance;
            const perpY = dx / edgeLength * offsetDistance;
            
            const midX = (d.source.x + d.target.x) / 2 + perpX;
            const midY = (d.source.y + d.target.y) / 2 + perpY;
            
            d3.select(this)
              .attr("transform", `translate(${midX}, ${midY}) rotate(${adjustedAngle})`)
              .attr("opacity", 1);
          } else {
            d3.select(this).attr("opacity", 0);
          }
        });

        linkLabelBg.each(function(d) {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const edgeLength = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate text width dynamically
          const labelFontSize = Math.min(Math.max(10 * Math.sqrt(currentZoomScale), 8), 14);
          const textDimensions = getTextDimensions(d.label, labelFontSize);
          const requiredLength = textDimensions.width + 20; // Add 20px padding
          
          // Since edges are now sized to accommodate text, be more lenient with display
          if (edgeLength > requiredLength * 0.8) { // Show if edge is at least 80% of required length
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            let adjustedAngle = angle;
            if (angle > 90 || angle < -90) {
              adjustedAngle = angle + 180;
            }
            
            const offsetDistance = 12;
            const perpX = -dy / edgeLength * offsetDistance;
            const perpY = dx / edgeLength * offsetDistance;
            
            const midX = (d.source.x + d.target.x) / 2 + perpX;
            const midY = (d.source.y + d.target.y) / 2 + perpY;
            
            d3.select(this)
              .attr("transform", `translate(${midX}, ${midY}) rotate(${adjustedAngle})`)
              .attr("opacity", 0.9);
          } else {
            d3.select(this).attr("opacity", 0);
          }
        });
      } else {
        // Hide all text when zoom is too low
        linkLabels.attr("opacity", 0);
        linkLabelBg.attr("opacity", 0);
      }

      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      nodeLabels
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d3.select(this)
        .attr("stroke", "#ff6b6b")
        .attr("stroke-width", getScaledStrokeWidth(3));
    }

    // Zoom functions for buttons
    window.zoomIn = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1.5);
    };

    window.zoomOut = () => {
      svg.transition().duration(300).call(zoom.scaleBy, 1 / 1.5);
    };

    window.resetZoom = () => {
      // Reset to centered 100% zoom and update edge lengths
      currentZoomScale = 1.0;
      updateEdgeLengths(); // Update edge lengths for 100% zoom
      
      setTimeout(() => {
        const g = svg.select('g');
        if (g.node()) {
          const bounds = g.node().getBBox();
          
          if (bounds.width > 0 && bounds.height > 0) {
            const graphCenterX = bounds.x + bounds.width / 2;
            const graphCenterY = bounds.y + bounds.height / 2;
            const viewCenterX = width / 2;
            const viewCenterY = height / 2;
            
            const translateX = viewCenterX - graphCenterX;
            const translateY = viewCenterY - graphCenterY;
            
            svg.transition().duration(500).call(
              zoom.transform,
              d3.zoomIdentity.translate(translateX, translateY).scale(1.0)
            );
          } else {
            svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
          }
        } else {
          svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
        }
      }, 200); // Wait for edge length update to settle
    };

    window.unpinAllNodes = () => {
      graphData.nodes.forEach(d => {
        d.fx = null;
        d.fy = null;
      });
      
      node
        .transition()
        .duration(300)
        .attr("stroke", "#fff")
        .attr("stroke-width", getScaledStrokeWidth(2));
      
      simulation.alphaTarget(0.3).restart();
      setTimeout(() => simulation.alphaTarget(0), 1000);
    };

    return () => {
      tooltip.remove();
    };

  }, []);

  // Center the graph after initial layout settles
  useEffect(() => {
    const timer = setTimeout(() => {
      const svgElement = d3.select(svgRef.current);
      const g = svgElement.select('g');
      
      if (g.node()) {
        const bounds = g.node().getBBox();
        
        if (bounds.width > 0 && bounds.height > 0) {
          const width = 1000;
          const height = 800;
          
          // Calculate center offset to position graph in the middle at 100% zoom
          const graphCenterX = bounds.x + bounds.width / 2;
          const graphCenterY = bounds.y + bounds.height / 2;
          const viewCenterX = width / 2;
          const viewCenterY = height / 2;
          
          const translateX = viewCenterX - graphCenterX;
          const translateY = viewCenterY - graphCenterY;
          
          const zoom = d3.zoom().scaleExtent([0.1, 4]);
          svgElement.transition()
            .duration(1000)
            .call(zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(1.0));
        }
      }
    }, 1500); // Wait for simulation to settle

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg shadow-lg p-4">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Network Graph Visualization</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span>Main Person</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
              <span>Movies</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
              <span>Other People</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-700 rounded-full mr-2"></div>
              <span>Studios</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button 
            onClick={() => window.zoomIn && window.zoomIn()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button 
            onClick={() => window.zoomOut && window.zoomOut()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button 
            onClick={() => window.resetZoom && window.resetZoom()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            title="Reset Zoom"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button 
            onClick={() => window.unpinAllNodes && window.unpinAllNodes()}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            title="Unpin All Nodes"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="relative flex">
        <div className="flex-1">
          <svg ref={svgRef} className="border border-gray-300 rounded bg-white"></svg>
        </div>
        
        {showDetails && selectedNode && (
          <div className="w-80 ml-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">Node Details</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Name</h4>
                <p className="text-gray-800 font-medium">{selectedNode.id}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Type</h4>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  selectedNode.type === 'person' ? 'bg-blue-100 text-blue-800' :
                  selectedNode.type === 'movie' ? 'bg-green-100 text-green-800' :
                  selectedNode.type === 'studio' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedNode.type.charAt(0).toUpperCase() + selectedNode.type.slice(1)}
                </span>
              </div>
              
              {selectedNode.details && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Details</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedNode.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-sm text-gray-800 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</h4>
                <p className="text-sm text-gray-700">
                  {selectedNode.fx !== null ? '📌 Pinned (double-click to unpin)' : '🔄 Free-moving'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>• <strong>Drag nodes</strong> to reposition them - they'll stay where you place them (📌 pinned)</p>
        <p>• <strong>Click nodes</strong> to see detailed information</p>
        <p>• <strong>Double-click nodes</strong> to unpin them and let forces move them freely</p>
        <p>• <strong>Hover over nodes</strong> for quick info and status</p>
        <p>• <strong>Arrows</strong> show relationship direction</p>
        <p>• <strong>Zoom in</strong> to see relationship labels with padding above edges</p>
        <p>• <strong>Dynamic edge lengths</strong> - Edges automatically extend based on text width and zoom level</p>
        <p>• <strong>Smart text display</strong> - Labels appear when edges are long enough to accommodate text</p>
        <p>• <strong>Default view</strong> shows full graph centered at 100% zoom with optimal edge spacing</p>
        <p>• <strong>Mouse wheel</strong> to zoom, or use the zoom buttons</p>
      </div>
    </div>
  );
};

export default NetworkGraph;