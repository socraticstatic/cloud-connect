import { useRef, useEffect, useState } from 'react';
import { NetworkNode, NetworkEdge } from '../../types';
import { Node } from './Node';
import { Edge } from './Edge';

interface CanvasProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isCreatingEdge: boolean;
  edgeStart: string | null;
  onNodeClick: (node: NetworkNode) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onNodeDragEnd: () => void;
  onEdgeClick: (edge: NetworkEdge) => void;
  maxY: number;
  showEffects?: boolean;
}

export function Canvas({
  nodes,
  edges,
  selectedNode,
  selectedEdge,
  isCreatingEdge,
  edgeStart,
  onNodeClick,
  onNodeDrag,
  onNodeDragEnd,
  onEdgeClick,
  maxY,
  showEffects = false
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [snapToGrid] = useState(true);
  const gridSize = 20;
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0, centerX: 0, centerY: 0 });

  // Define toolbar heights - these should match the actual UI toolbar heights
  const topToolbarHeight = 0; // Removed the top toolbar offset to allow dragging in the top area
  const bottomToolbarHeight = 80;

  // Track canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width,
          height: rect.height, // Use full height without restrictions
          centerX: rect.width / 2,
          centerY: rect.height / 2
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [maxY]);

  // Track mouse position for edge creation preview
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        // Allow mouse to go all the way to the top of the canvas
        const y = Math.min(e.clientY - rect.top, maxY - bottomToolbarHeight);
        
        // Snap to grid if enabled
        setMousePosition({
          x: snapToGrid ? Math.round(x / gridSize) * gridSize : x,
          y: snapToGrid ? Math.round(y / gridSize) * gridSize : y
        });
      }
    };

    if (isCreatingEdge && edgeStart) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isCreatingEdge, edgeStart, maxY, snapToGrid, gridSize, bottomToolbarHeight]);

  // Calculate edge path with proper curvature
  const getEdgePath = (startX: number, startY: number, endX: number, endY: number) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const midX = startX + dx * 0.5;
    const midY = startY + dy * 0.5;
    return `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${midY} T ${endX} ${endY}`;
  };

  // Helper function to get a position in the lower part of the canvas
  const getLowerCanvasPosition = (index: number, total: number, nodeWidth: number = 64) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const canvasWidth = canvasDimensions.width;
    const canvasHeight = canvasDimensions.height;
    
    // Calculate position as a percentage of available space
    let yPosition = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.4);
    
    // Distribute nodes horizontally
    let xPosition;
    if (total <= 1) {
      xPosition = canvasWidth / 2 - nodeWidth / 2;
    } else {
      const spacing = canvasWidth / (total + 1);
      xPosition = spacing * (index + 1) - nodeWidth / 2;
    }
    
    // Snap to grid if enabled
    if (snapToGrid) {
      xPosition = Math.round(xPosition / gridSize) * gridSize;
      yPosition = Math.round(yPosition / gridSize) * gridSize;
    }
    
    return { 
      x: Math.max(0, Math.min(xPosition, canvasWidth - nodeWidth)),
      y: Math.max(0, Math.min(yPosition, canvasHeight - nodeWidth - bottomToolbarHeight))
    };
  };

  // Ensure nodes are within the visible canvas area
  const getSafePosition = (node: NetworkNode) => {
    if (!canvasRef.current) return node;
    
    // Use the node's current position or a default
    const x = typeof node.x === 'number' ? node.x : 0;
    const y = typeof node.y === 'number' ? node.y : 0;
    
    // Get canvas dimensions
    const canvasWidth = canvasDimensions.width || 800;
    const canvasHeight = canvasDimensions.height || 600;
    
    // Calculate bounds (accounting for node size and toolbars)
    const minX = 0;
    const maxX = Math.max(0, canvasWidth - 64); // 64px is node width
    const minY = 0; // Allow nodes to be placed at the top of the canvas
    const maxY = Math.max(minY, canvasHeight - bottomToolbarHeight - 64); // 64px is node height
    
    // Ensure node is within bounds
    const safeX = Math.max(minX, Math.min(maxX, x));
    const safeY = Math.max(minY, Math.min(maxY, y));
    
    return { ...node, x: safeX, y: safeY };
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50"
      onClick={(e) => {
        if (e.target === canvasRef.current && !isDragging) {
          onNodeClick(null as any);
          onEdgeClick(null as any);
        }
      }}
    >
      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 0.5px, transparent 0.5px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          zIndex: 0
        }}
      />
      {/* Subtle Accent Lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)',
          backgroundSize: `${gridSize * 5}px ${gridSize * 5}px`,
          zIndex: 0
        }}
      />

      {/* SVG Layer for Edges */}
      <svg 
        className="absolute inset-0" 
        style={{ zIndex: 1 }}
        width="100%"
        height="100%"
      >
        {/* Existing Edges */}
        {edges.map(edge => {
          // Get source and target nodes for this edge
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          
          // Only render edge if both nodes exist
          if (!sourceNode || !targetNode) {
            return null;
          }
          
          // Make safe versions of nodes that are within bounds
          const safeSourceNode = getSafePosition(sourceNode);
          const safeTargetNode = getSafePosition(targetNode);
          
          return (
            <Edge
              key={edge.id}
              edge={edge}
              nodes={[safeSourceNode, safeTargetNode, ...nodes.filter(n => 
                n.id !== sourceNode.id && n.id !== targetNode.id
              )]}
              isSelected={selectedEdge === edge.id}
              onClick={() => onEdgeClick(edge)}
              showEffects={showEffects}
            />
          );
        })}

        {/* Edge Creation Preview */}
        {isCreatingEdge && edgeStart && (
          <g>
            <path
              d={getEdgePath(
                nodes.find(n => n.id === edgeStart)?.x + 32 || 0,
                nodes.find(n => n.id === edgeStart)?.y + 32 || 0,
                mousePosition.x,
                mousePosition.y
              )}
              className="stroke-brand-blue stroke-2 stroke-dashed fill-none"
              style={{ pointerEvents: 'none' }}
            />
            {nodes.map(node => {
              if (node.id !== edgeStart) {
                const distance = Math.hypot(
                  (node.x + 32) - mousePosition.x,
                  (node.y + 32) - mousePosition.y
                );
                const isValidTarget = distance < 50;
                return isValidTarget ? (
                  <circle
                    key={`highlight-${node.id}`}
                    cx={node.x + 32}
                    cy={node.y + 32}
                    r="24"
                    className="fill-brand-lightBlue stroke-brand-blue stroke-2"
                    style={{ opacity: 0.5 }}
                  />
                ) : null;
              }
              return null;
            })}
          </g>
        )}
      </svg>

      {/* Nodes Layer */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {nodes.map(node => {
          // Ensure node is properly positioned within the visible area
          const safeNode = getSafePosition(node);
          
          return (
            <Node
              key={safeNode.id}
              node={safeNode}
              isSelected={selectedNode === safeNode.id}
              isCreatingEdge={isCreatingEdge}
              onClick={() => onNodeClick(safeNode)}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => {
                setIsDragging(false);
                onNodeDragEnd();
              }}
              onDrag={(x, y) => {
                // Ensure the node stays within canvas boundaries with the expanded draggable area
                const boundedX = Math.max(0, Math.min(x, canvasRef.current?.clientWidth - 64 || x));
                const boundedY = Math.max(
                  0, // Allow nodes to be placed at the top
                  Math.min(y, maxY - bottomToolbarHeight - 64)
                );
                
                // Snap to grid if enabled
                const snappedX = snapToGrid ? Math.round(boundedX / gridSize) * gridSize : boundedX;
                const snappedY = snapToGrid ? Math.round(boundedY / gridSize) * gridSize : boundedY;
                
                onNodeDrag(safeNode.id, snappedX, snappedY);
              }}
              showEffects={showEffects}
            />
          );
        })}
      </div>
    </div>
  );
}