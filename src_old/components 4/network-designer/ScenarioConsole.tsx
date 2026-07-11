import { useState, useEffect, useRef } from 'react';
import { Terminal, Cpu, Wifi, Server, Database, Shield, Clock, Zap, AlertTriangle } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../types';

interface ScenarioConsoleProps {
  isRunning: boolean;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  onComplete?: () => void;
}

export function ScenarioConsole({ isRunning, nodes, edges, onComplete }: ScenarioConsoleProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<string>('initializing');
  const [showWarning, setShowWarning] = useState(false);
  const [showError, setShowError] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(0);
  const consoleRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);
  
  // Reset state when scenario starts
  useEffect(() => {
    if (isRunning) {
      setLogs([]);
      setProgress(0);
      setCurrentPhase('initializing');
      setShowWarning(false);
      setShowError(false);
      setCompletedSteps(0);
      
      // Start the simulation
      runSimulation();
    }
  }, [isRunning]);
  
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
    
    const prefix = type === 'info' ? '[INFO]' :
                  type === 'success' ? '[SUCCESS]' :
                  type === 'warning' ? '[WARNING]' :
                  '[ERROR]';
                  
    const colorClass = type === 'info' ? 'text-cyan-400' :
                      type === 'success' ? 'text-green-400' :
                      type === 'warning' ? 'text-yellow-400' :
                      'text-red-400';
                      
    setLogs(prev => [...prev, `<span class="${colorClass}">${timestamp} ${prefix}</span> ${message}`]);
  };
  
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const getRandomLatency = () => {
    return (Math.random() * 10 + 1).toFixed(2);
  };
  
  const getRandomPacketLoss = () => {
    return (Math.random() * 0.1).toFixed(4);
  };
  
  const getRandomThroughput = (max: number) => {
    return (Math.random() * max * 0.8 + max * 0.1).toFixed(2);
  };
  
  const getRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };
  
  const runSimulation = async () => {
    try {
      // Phase 1: Initialization
      addLog('Network scenario simulation initializing...', 'info');
      addLog(`Detected ${nodes.length} nodes and ${edges.length} connections in topology`, 'info');
      await sleep(800);
      addLog('Loading network configuration parameters...', 'info');
      await sleep(600);
      addLog('Initializing virtual network environment...', 'info');
      await sleep(1000);
      
      setCurrentPhase('topology');
      setProgress(10);
      setCompletedSteps(1);
      
      // Phase 2: Topology Validation
      addLog('Beginning topology validation...', 'info');
      await sleep(800);
      
      // Check for isolated nodes
      const connectedNodes = new Set<string>();
      edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });
      
      const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
      if (isolatedNodes.length > 0) {
        addLog(`Detected ${isolatedNodes.length} isolated nodes in topology`, 'warning');
        setShowWarning(true);
        await sleep(500);
        isolatedNodes.forEach(async (node) => {
          addLog(`Node "${node.name}" (${node.id}) has no connections`, 'warning');
          await sleep(300);
        });
      } else {
        addLog('All nodes are properly connected in the topology', 'success');
      }
      
      await sleep(800);
      addLog('Validating connection paths...', 'info');
      await sleep(1000);
      addLog('Topology validation complete', 'success');
      
      setCurrentPhase('activation');
      setProgress(25);
      setCompletedSteps(2);
      
      // Phase 3: Node Activation
      addLog('Beginning node activation sequence...', 'info');
      
      // Activate nodes in sequence
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        addLog(`Activating node: ${node.name} (${node.type})`, 'info');
        await sleep(300);
        
        // Random chance of warning
        if (Math.random() < 0.2 && !showWarning) {
          addLog(`Resource allocation warning on ${node.name}`, 'warning');
          setShowWarning(true);
          await sleep(300);
          addLog(`Adjusting resource allocation for ${node.name}`, 'info');
          await sleep(500);
          addLog(`Resource allocation optimized for ${node.name}`, 'success');
        } else {
          addLog(`Node ${node.name} activated successfully`, 'success');
        }
        
        await sleep(500);
        setProgress(25 + Math.floor((i + 1) / nodes.length * 25));
      }
      
      setCurrentPhase('connections');
      setProgress(50);
      setCompletedSteps(3);
      
      // Phase 4: Connection Establishment
      addLog('Beginning connection establishment...', 'info');
      
      // Establish connections in sequence
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          addLog(`Establishing ${edge.type} connection: ${sourceNode.name} → ${targetNode.name}`, 'info');
          await sleep(400);
          
          // Random chance of error
          if (Math.random() < 0.1 && !showError) {
            addLog(`Connection error: Unable to establish initial handshake`, 'error');
            setShowError(true);
            await sleep(500);
            addLog(`Retrying connection with fallback protocol...`, 'info');
            await sleep(800);
            addLog(`Connection established using fallback protocol`, 'success');
          } else {
            addLog(`Connection established: ${edge.bandwidth} link active`, 'success');
          }
          
          await sleep(300);
        }
        
        setProgress(50 + Math.floor((i + 1) / edges.length * 25));
      }
      
      setCurrentPhase('testing');
      setProgress(75);
      setCompletedSteps(4);
      
      // Phase 5: Network Testing
      addLog('Beginning network performance testing...', 'info');
      await sleep(800);
      
      // Test each connection
      for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        if (sourceNode && targetNode) {
          addLog(`Testing connection: ${sourceNode.name} → ${targetNode.name}`, 'info');
          await sleep(300);
          
          // Generate random performance metrics
          const latency = getRandomLatency();
          const packetLoss = getRandomPacketLoss();
          const throughput = getRandomThroughput(parseInt(edge.bandwidth));
          
          addLog(`Latency: ${latency}ms | Packet Loss: ${packetLoss}% | Throughput: ${throughput} Gbps`, 'info');
          
          // Random chance of performance warning
          if (parseFloat(latency) > 8 && !showWarning) {
            addLog(`Performance warning: Latency above threshold (${latency}ms > 8.00ms)`, 'warning');
            setShowWarning(true);
          }
          
          await sleep(500);
        }
      }
      
      await sleep(800);
      addLog('Network performance testing complete', 'success');
      
      setCurrentPhase('traffic');
      setProgress(90);
      setCompletedSteps(5);
      
      // Phase 6: Traffic Simulation
      addLog('Beginning traffic simulation...', 'info');
      await sleep(800);
      
      // Simulate traffic patterns
      for (let i = 0; i < 5; i++) {
        const sourceIP = getRandomIP();
        const destIP = getRandomIP();
        const protocol = Math.random() > 0.5 ? 'TCP' : 'UDP';
        const port = Math.floor(Math.random() * 65535);
        
        addLog(`${protocol} traffic: ${sourceIP}:${port} → ${destIP}:${port === 80 ? 'HTTP' : port === 443 ? 'HTTPS' : port}`, 'info');
        await sleep(300);
      }
      
      await sleep(800);
      addLog('Traffic simulation complete', 'success');
      
      // Final phase
      setCurrentPhase('complete');
      setProgress(100);
      setCompletedSteps(6);
      
      addLog('Network scenario simulation completed successfully', 'success');
      addLog('All nodes and connections are operational', 'success');
      
      // Call onComplete callback
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Simulation error:', error);
      addLog(`Simulation error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setShowError(true);
      
      // Call onComplete callback even on error
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }
  };
  
  if (!isRunning) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Terminal className="h-5 w-5 text-green-400 mr-2" />
          <h2 className="text-lg font-mono text-green-400">Network Scenario Simulation</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-400 font-mono">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
          {showError && (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
              <span className="text-sm text-red-400 font-mono">Errors Detected</span>
            </div>
          )}
          {showWarning && !showError && (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mr-2" />
              <span className="text-sm text-yellow-400 font-mono">Warnings Detected</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Console Output */}
        <div className="flex-1 bg-gray-900 p-4 overflow-hidden flex flex-col">
          <div 
            ref={consoleRef}
            className="flex-1 font-mono text-sm text-gray-300 overflow-y-auto"
            style={{ 
              backgroundColor: '#0d1117',
              backgroundImage: 'linear-gradient(rgba(0, 150, 150, 0.03) 1px, transparent 1px)',
              backgroundSize: '100% 2em'
            }}
          >
            <div className="p-4 space-y-1">
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className="console-line"
                  dangerouslySetInnerHTML={{ __html: log }}
                />
              ))}
              {/* Blinking cursor */}
              <div className="inline-block w-2 h-4 bg-green-500 animate-pulse"></div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-800 mt-4 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Status Indicators */}
          <div className="mt-2 grid grid-cols-6 gap-2">
            {[
              { phase: 'initializing', label: 'Init', icon: Cpu },
              { phase: 'topology', label: 'Topology', icon: Database },
              { phase: 'activation', label: 'Activation', icon: Server },
              { phase: 'connections', label: 'Connections', icon: Wifi },
              { phase: 'testing', label: 'Testing', icon: Shield },
              { phase: 'traffic', label: 'Traffic', icon: Zap }
            ].map((step, index) => (
              <div 
                key={step.phase}
                className={`flex flex-col items-center justify-center p-2 rounded ${
                  currentPhase === step.phase 
                    ? 'bg-green-900 text-green-400 animate-pulse' 
                    : index < completedSteps
                      ? 'bg-gray-800 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                }`}
              >
                <step.icon className="h-4 w-4 mb-1" />
                <span className="text-xs font-mono">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats Panel */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
          <h3 className="text-sm font-mono text-gray-400 mb-4 uppercase tracking-wider">Network Statistics</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">Topology</span>
                <span className="text-xs font-mono text-green-400">{nodes.length} nodes / {edges.length} edges</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Source Nodes</span>
                  <span className="text-gray-300">{nodes.filter(n => n.type === 'source').length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Routers</span>
                  <span className="text-gray-300">{nodes.filter(n => n.type === 'router').length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Destination Nodes</span>
                  <span className="text-gray-300">{nodes.filter(n => n.type === 'destination').length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Network Devices</span>
                  <span className="text-gray-300">{nodes.filter(n => n.type === 'network').length}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">Bandwidth</span>
                <span className="text-xs font-mono text-green-400">
                  {edges.reduce((sum, edge) => {
                    const value = parseInt(edge.bandwidth.replace(/[^\d]/g, ''));
                    const unit = edge.bandwidth.includes('Gbps') ? 1 : 
                                edge.bandwidth.includes('Tbps') ? 1000 : 1;
                    return sum + (value * unit);
                  }, 0)} Gbps
                </span>
              </div>
              <div className="space-y-1">
                {['Direct Connect', 'Cloud Router', 'Ultra-Low Latency', 'Backbone'].map(type => (
                  <div key={type} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{type}</span>
                    <span className="text-gray-300">{edges.filter(e => e.type === type).length} links</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">Performance</span>
                <span className="text-xs font-mono text-green-400">Simulated</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Avg. Latency</span>
                  <span className="text-gray-300">{(Math.random() * 5 + 2).toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Packet Loss</span>
                  <span className="text-gray-300">{(Math.random() * 0.1).toFixed(4)}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Jitter</span>
                  <span className="text-gray-300">{(Math.random() * 2).toFixed(2)} ms</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Throughput</span>
                  <span className="text-gray-300">{(Math.random() * 80 + 10).toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-400">Security</span>
                <span className="text-xs font-mono text-green-400">Enabled</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Encryption</span>
                  <span className="text-gray-300">AES-256</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Firewall</span>
                  <span className="text-gray-300">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">DDoS Protection</span>
                  <span className="text-gray-300">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Threat Detection</span>
                  <span className="text-gray-300">Real-time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}