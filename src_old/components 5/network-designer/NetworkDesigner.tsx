// Add TypeScript interface to make this importable for type checking
interface NetworkDesignerProps {
  onComplete: (config: Connection[]) => void;
  onCancel: () => void;
  initialNodes?: NetworkNode[];
  initialEdges?: NetworkEdge[];
  editMode?: boolean;
  connectionId?: string;
}

import { useState, useEffect } from 'react';
import { Server, Cloud, Router, Network, Settings, Zap, Sparkles, MessageSquare as MessageSquareIcon, Globe } from 'lucide-react';
import { Connection, NetworkNode, NetworkEdge } from '../../types';
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { StatusBar } from './StatusBar';
import { ConfigurationPanel } from './panels/ConfigurationPanel';
import { TemplatesDrawer } from './TemplatesDrawer';
import { AIRecommendationEngine } from './panels/AIRecommendationEngine';
import { ScenarioConsole } from './ScenarioConsole';

// Preload common templates at the module level
import { preloadCommonTemplates } from './templates';

export function NetworkDesigner({ 
  onComplete, 
  onCancel,
  initialNodes = [],
  initialEdges = [],
  editMode = false,
  connectionId
}: NetworkDesignerProps) {
  // Preload common templates when the component loads
  useEffect(() => {
    preloadCommonTemplates();
  }, []);

  console.log("NetworkDesigner received props:", {
    initialNodes,
    initialEdges,
    editMode,
    connectionId
  });

  // Initialize with provided nodes/edges or empty arrays
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<NetworkEdge | null>(null);
  const [isCreatingEdge, setIsCreatingEdge] = useState(false);
  const [edgeStart, setEdgeStart] = useState<string | null>(null);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'ai'>('config');
  const [showEffects, setShowEffects] = useState(true);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  // History for undo functionality
  const [history, setHistory] = useState<{
    nodes: NetworkNode[][];
    edges: NetworkEdge[][];
    currentIndex: number;
  }>({
    nodes: [[]],
    edges: [[]],
    currentIndex: 0
  });

  // Initialize with the provided initial nodes and edges
  useEffect(() => {
    if (initialNodes.length > 0 || initialEdges.length > 0) {
      console.log("Initializing NetworkDesigner with:", { initialNodes, initialEdges });
      setNodes([...initialNodes]); // Use spread to ensure we create new arrays
      setEdges([...initialEdges]);
      setHistory({
        nodes: [[...initialNodes]],
        edges: [[...initialEdges]],
        currentIndex: 0
      });
    } else {
      console.log("No initial nodes/edges provided, using empty arrays");
    }
  }, [initialNodes, initialEdges]);

  const saveToHistory = (newNodes: NetworkNode[], newEdges: NetworkEdge[]) => {
    const newHistory = {
      nodes: [...history.nodes.slice(0, history.currentIndex + 1), [...newNodes]],
      edges: [...history.edges.slice(0, history.currentIndex + 1), [...newEdges]],
      currentIndex: history.currentIndex + 1
    };
    setHistory(newHistory);
  };

  const handleUndo = () => {
    if (history.currentIndex > 0) {
      const newIndex = history.currentIndex - 1;
      setNodes([...history.nodes[newIndex]]);
      setEdges([...history.edges[newIndex]]);
      setHistory({ ...history, currentIndex: newIndex });
      
      // Clear selections when undoing
      setSelectedNode(null);
      setSelectedEdge(null);
      setIsCreatingEdge(false);
      setEdgeStart(null);
    }
  };

  const handleRunScenario = async () => {
    if (!edges.length) return;

    setIsRunningScenario(true);
  };

  const handleScenarioComplete = () => {
    // Reset status after scenario completes
    setNodes(prev => prev.map(node => ({ ...node, status: 'inactive' })));
    setEdges(prev => prev.map(e => ({ ...e, status: 'inactive' })));
    setIsRunningScenario(false);

    window.addToast({
      type: 'success',
      title: 'Scenario Complete',
      message: 'Network simulation completed successfully',
      duration: 3000
    });
  };

  const getNodeIcon = (type: NetworkNode['type']) => {
    switch (type) {
      case 'source':
        return Server;
      case 'destination':
        return Cloud;
      case 'router':
        return Router;
      case 'network':
        return Network;
      default:
        return Server;
    }
  };

  const handleAddNode = (type: NetworkNode['type']) => {
    // Calculate position based on node type and canvas dimensions
    let x = 0, y = 0;
    const canvasWidth = canvasDimensions.width;
    const canvasHeight = canvasDimensions.height;
    
    // Place nodes in a more organized way based on their type
    switch (type) {
      case 'source':
        // Sources on the left side
        x = canvasWidth * 0.2;
        y = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.4);
        break;
      case 'destination':
        // Destinations on the right side
        x = canvasWidth * 0.8;
        y = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.4);
        break;
      case 'router':
        // Routers in the center
        x = canvasWidth * 0.5;
        y = canvasHeight * 0.3 + Math.random() * (canvasHeight * 0.4);
        break;
      case 'network':
        // Networks in the lower part
        x = canvasWidth * 0.2 + Math.random() * (canvasWidth * 0.6);
        y = canvasHeight * 0.7;
        break;
      default:
        x = Math.random() * (canvasWidth * 0.8) + (canvasWidth * 0.1);
        y = Math.random() * (canvasHeight * 0.8) + (canvasHeight * 0.1);
    }
    
    // Ensure y is within bounds
    y = Math.min(y, canvasDimensions.height - 64);
    
    // Snap to grid (assuming grid size of 20)
    x = Math.round(x / 20) * 20;
    y = Math.round(y / 20) * 20;

    const newNode: NetworkNode = {
      id: `node-${Date.now()}`,
      type,
      x,
      y,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      status: 'inactive',
      config: {} // Initialize empty config object
    };

    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    setSelectedNode(newNode);
    saveToHistory(newNodes, edges);
  };

  const handleNodeClick = (node: NetworkNode) => {
    if (isCreatingEdge) {
      if (edgeStart) {
        if (edgeStart !== node.id) {
          const newEdge: NetworkEdge = {
            id: `edge-${Date.now()}`,
            source: edgeStart,
            target: node.id,
            type: 'Internet to Cloud',
            bandwidth: '1 Gbps',
            status: 'inactive'
          };
          const newEdges = [...edges, newEdge];
          setEdges(newEdges);
          setSelectedEdge(newEdge);
          saveToHistory(nodes, newEdges);
        }
        setIsCreatingEdge(false);
        setEdgeStart(null);
      } else {
        setEdgeStart(node.id);
      }
    } else {
      setSelectedNode(node);
      setSelectedEdge(null);
      setActiveTab('config');
    }
  };

  const handleNodeDrag = (nodeId: string, x: number, y: number) => {
    const adjustedY = Math.min(y, 600 - 64);
    
    const newNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, x, y: adjustedY } : node
    );
    setNodes(newNodes);
  };

  const handleNodeDragEnd = () => {
    saveToHistory(nodes, edges);
  };

  const handleEdgeClick = (edge: NetworkEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setActiveTab('config');
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<NetworkNode>) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Create a new node object with the updates
    const updatedNode = {
      ...node,
      ...updates,
      // If updating config, merge it with existing config
      config: updates.config ? { ...node.config, ...updates.config } : node.config
    };

    // If y coordinate is being updated, ensure it's within bounds
    if (typeof updatedNode.y === 'number') {
      updatedNode.y = Math.min(updatedNode.y, 600 - 64);
    }

    const newNodes = nodes.map(n => n.id === nodeId ? updatedNode : n);
    setNodes(newNodes);
    saveToHistory(newNodes, edges);
  };

  const handleUpdateEdge = (edgeId: string, updates: Partial<NetworkEdge>) => {
    const newEdges = edges.map(edge =>
      edge.id === edgeId ? { ...edge, ...updates } : edge
    );
    setEdges(newEdges);
    saveToHistory(nodes, newEdges);
  };

  const handleDeleteNode = (nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId);
    const newEdges = edges.filter(e => 
      e.source !== nodeId && e.target !== nodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    saveToHistory(newNodes, newEdges);
  };

  const handleDeleteEdge = (edgeId: string) => {
    const newEdges = edges.filter(e => e.id !== edgeId);
    setEdges(newEdges);
    setSelectedEdge(null);
    saveToHistory(nodes, newEdges);
  };

  const handleClearCanvas = () => {
    if (nodes.length === 0 && edges.length === 0) return;
    
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsCreatingEdge(false);
    setEdgeStart(null);
    saveToHistory([], []);
    
    window.addToast({
      type: 'info',
      title: 'Canvas Cleared',
      message: 'All nodes and connections have been removed',
      duration: 3000
    });
  };

  const handleCreateConnections = () => {
    if (edges.length === 0) {
      window.addToast({
        type: 'warning',
        title: 'No Connections',
        message: 'Please create at least one connection before proceeding',
        duration: 3000
      });
      return;
    }
    
    // Convert network design to connections
    const connections = edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      return {
        id: editMode && connectionId ? connectionId : `conn-${Date.now()}`,
        name: `${sourceNode?.name || 'Source'} to ${targetNode?.name || 'Target'}`,
        type: edge.type,
        status: 'Inactive',
        bandwidth: edge.bandwidth,
        location: sourceNode?.config?.region || targetNode?.config?.region || 'US East',
        provider: targetNode?.config?.provider || 'AWS'
      };
    });
    
    onComplete(connections);
  };

  const handleToggleEffects = () => {
    setShowEffects(!showEffects);
  };

  const handleApplyAIRecommendation = (newNodes: NetworkNode[], newEdges: NetworkEdge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    saveToHistory(newNodes, newEdges);
    setActiveTab('config');
    
    window.addToast({
      type: 'success',
      title: 'AI Recommendation Applied',
      message: 'Network topology has been created based on your requirements',
      duration: 3000
    });
  };

  // Update canvas dimensions when the component mounts or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.network-designer-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasDimensions({
          width: rect.width,
          height: Math.min(rect.height, 600)
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className="flex flex-col h-[1000px] bg-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden network-designer-container">
      {/* Header with special effects toggle */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-brand-blue mr-2" />
          <h2 className="text-lg font-medium text-gray-900">
            {editMode ? 'Edit Network Topology' : 'Network Designer'}
          </h2>
        </div>
        <button 
          onClick={handleToggleEffects}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
            showEffects 
              ? 'bg-brand-blue text-white' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Zap className="h-4 w-4 mr-1.5" />
          {showEffects ? 'Effects On' : 'Effects Off'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1">
        <Toolbar
          onAddNode={handleAddNode}
          onToggleEdgeCreation={() => setIsCreatingEdge(!isCreatingEdge)}
          isCreatingEdge={isCreatingEdge}
          onCancel={handleUndo}
          hasConnections={edges.length > 0}
          canUndo={history.currentIndex > 0}
          onRunScenario={handleRunScenario}
          isRunningScenario={isRunningScenario}
          onClearCanvas={handleClearCanvas}
          onCreateConnections={handleCreateConnections}
        />

        <StatusBar
          nodes={nodes}
          edges={edges}
          onRefresh={() => {
            window.addToast({
              type: 'info',
              title: 'Refreshing Network',
              message: 'Updating network status and metrics...',
              duration: 2000
            });
          }}
        />

        <Canvas
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode?.id || null}
          selectedEdge={selectedEdge?.id || null}
          isCreatingEdge={isCreatingEdge}
          edgeStart={edgeStart}
          onNodeClick={handleNodeClick}
          onNodeDrag={handleNodeDrag}
          onNodeDragEnd={handleNodeDragEnd}
          onEdgeClick={handleEdgeClick}
          maxY={600}
          showEffects={showEffects}
        />
      </div>

      {/* Bottom Panel */}
      <div className="h-[400px] bg-white border-t border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('config')}
            className={`
              flex items-center px-6 py-3 text-sm font-medium
              ${activeTab === 'config'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Settings className={`h-4 w-4 mr-2 ${
              activeTab === 'config' ? 'text-brand-blue' : 'text-gray-400'
            }`} />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`
              flex items-center px-6 py-3 text-sm font-medium
              ${activeTab === 'templates'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Cloud className={`h-4 w-4 mr-2 ${
              activeTab === 'templates' ? 'text-brand-blue' : 'text-gray-400'
            }`} />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`
              flex items-center px-6 py-3 text-sm font-medium
              ${activeTab === 'ai'
                ? 'text-brand-blue border-b-2 border-brand-blue'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <MessageSquareIcon className={`h-4 w-4 mr-2 ${
              activeTab === 'ai' ? 'text-brand-blue' : 'text-gray-400'
            }`} />
            A.I. Recommendation Engine
          </button>
        </div>

        <div className="p-4 h-[calc(100%-49px)] overflow-y-auto">
          {activeTab === 'templates' && (
            <TemplatesDrawer onApplyTemplate={(newNodes, newEdges) => {
              setNodes(newNodes);
              setEdges(newEdges);
              saveToHistory(newNodes, newEdges);
              setActiveTab('config');
            }} />
          )}

          {activeTab === 'config' && (
            <ConfigurationPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onUpdateNode={handleUpdateNode}
              onUpdateEdge={handleUpdateEdge}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
            />
          )}

          {activeTab === 'ai' && (
            <AIRecommendationEngine 
              onApplyRecommendation={handleApplyAIRecommendation}
            />
          )}
        </div>
      </div>

      {/* Scenario Console */}
      <ScenarioConsole 
        isRunning={isRunningScenario}
        nodes={nodes}
        edges={edges}
        onComplete={handleScenarioComplete}
      />
    </div>
  );
}