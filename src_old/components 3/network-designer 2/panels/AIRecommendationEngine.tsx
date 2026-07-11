import { useState, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Server, Cloud, Router, Network } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIRecommendationEngineProps {
  onApplyRecommendation: (nodes: NetworkNode[], edges: NetworkEdge[]) => void;
}

export function AIRecommendationEngine({ onApplyRecommendation }: AIRecommendationEngineProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hello! I'm your network design assistant. I can help create a network topology based on your requirements. What kind of network are you looking to build today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [networkPurpose, setNetworkPurpose] = useState('');
  const [networkScale, setNetworkScale] = useState('');
  const [networkRequirements, setNetworkRequirements] = useState<string[]>([]);
  const [showRecommendation, setShowRecommendation] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    scrollToBottom();

    // Process user input
    setTimeout(() => {
      processUserInput(input);
    }, 500);
  };

  const processUserInput = (userInput: string) => {
    let response = '';
    
    switch (currentStep) {
      case 0: // Initial question about network purpose
        setNetworkPurpose(userInput);
        response = `Thanks! Your network will be designed for: "${userInput}". What scale of network do you need? (Small/Medium/Large/Global)`;
        setCurrentStep(1);
        break;
        
      case 1: // Question about network scale
        setNetworkScale(userInput);
        response = `Great! I'll design a ${userInput.toLowerCase()} scale network. What are your key requirements? Select from: performance, security, cost efficiency, scalability, or redundancy.`;
        setCurrentStep(2);
        break;
        
      case 2: // Question about requirements
        setNetworkRequirements(parseRequirements(userInput));
        response = `Based on your needs for a ${networkScale.toLowerCase()} network focused on "${networkPurpose}" with emphasis on ${formatRequirements(parseRequirements(userInput))}, I can recommend a network topology. Would you like me to generate it now?`;
        setCurrentStep(3);
        break;
        
      case 3: // Confirmation to generate recommendation
        if (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('sure')) {
          response = "Great! I'm generating your network design. Please wait a moment...";
          
          setTimeout(() => {
            setMessages(prev => [
              ...prev, 
              {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Your network design is ready! Click 'Apply Recommendation' below to see the visualization."
              }
            ]);
            setIsTyping(false);
            setShowRecommendation(true);
          }, 1500);
        } else {
          response = "I understand. Let's continue discussing your requirements. What else would you like to specify?";
          setCurrentStep(2);
        }
        break;
        
      default:
        response = "Is there anything specific about the network design you'd like me to explain?";
    }
    
    // Only add response if we're not in the generating state
    if (response) {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const parseRequirements = (input: string): string[] => {
    const requirements: string[] = [];
    
    // Check for keywords
    const keywords = [
      { term: 'performance', category: 'high performance' },
      { term: 'fast', category: 'high performance' },
      { term: 'secure', category: 'security' },
      { term: 'cost', category: 'cost efficiency' },
      { term: 'scale', category: 'scalability' },
      { term: 'redundant', category: 'redundancy' },
      { term: 'cloud', category: 'cloud integration' },
    ];
    
    const inputLower = input.toLowerCase();
    keywords.forEach(({ term, category }) => {
      if (inputLower.includes(term) && !requirements.includes(category)) {
        requirements.push(category);
      }
    });
    
    // Default to some requirements if none detected
    if (requirements.length === 0) {
      if (inputLower.includes('gaming') || inputLower.includes('video')) {
        requirements.push('high performance');
      } else if (inputLower.includes('business')) {
        requirements.push('reliability', 'security');
      } else {
        requirements.push('scalability');
      }
    }
    
    return requirements;
  };

  const formatRequirements = (requirements: string[]): string => {
    if (requirements.length === 0) return 'general use';
    if (requirements.length === 1) return requirements[0];
    
    const lastRequirement = requirements[requirements.length - 1];
    const otherRequirements = requirements.slice(0, -1);
    return `${otherRequirements.join(', ')} and ${lastRequirement}`;
  };

  const generateNetworkRecommendation = () => {
    // Determine network complexity based on scale
    const nodeCount = networkScale.toLowerCase().includes('small') ? 4 :
                     networkScale.toLowerCase().includes('medium') ? 6 :
                     networkScale.toLowerCase().includes('large') ? 8 : 10;
    
    // Create nodes and edges based on requirements
    const newNodes: NetworkNode[] = [];
    const newEdges: NetworkEdge[] = [];
    
    // Add source nodes
    const sourceCount = Math.max(1, Math.floor(nodeCount / 4));
    for (let i = 0; i < sourceCount; i++) {
      newNodes.push({
        id: `source-${i}`,
        type: 'source',
        x: 100,
        y: 100 + i * 150,
        name: i === 0 ? 'Primary Data Center' : `Secondary Data Center ${i}`,
        icon: Server,
        status: 'inactive',
        config: {
          redundancy: networkRequirements.includes('redundancy')
        }
      });
    }
    
    // Add routers
    const routerCount = Math.max(1, Math.floor(nodeCount / 3));
    for (let i = 0; i < routerCount; i++) {
      newNodes.push({
        id: `router-${i}`,
        type: 'router',
        x: 300,
        y: 100 + i * 150,
        name: `Network Router ${i + 1}`,
        icon: Router,
        status: 'inactive',
        config: {
          highPerformance: networkRequirements.includes('high performance')
        }
      });
    }
    
    // Add cloud destinations
    const cloudCount = Math.max(1, Math.floor(nodeCount / 4));
    const cloudProviders = ['AWS', 'Azure', 'Google'];
    for (let i = 0; i < cloudCount; i++) {
      newNodes.push({
        id: `cloud-${i}`,
        type: 'destination',
        x: 500,
        y: 100 + i * 150,
        name: `${cloudProviders[i % cloudProviders.length]} Cloud`,
        icon: Cloud,
        status: 'inactive',
        config: {
          provider: cloudProviders[i % cloudProviders.length],
          region: 'US East'
        }
      });
    }
    
    // Connect sources to routers
    for (let i = 0; i < sourceCount; i++) {
      for (let j = 0; j < routerCount; j++) {
        if (nodeCount < 6 || Math.random() > 0.3) {
          newEdges.push({
            id: `edge-s${i}-r${j}`,
            source: `source-${i}`,
            target: `router-${j}`,
            type: 'Direct Connect',
            bandwidth: networkRequirements.includes('high performance') ? '100 Gbps' : '10 Gbps',
            status: 'inactive'
          });
        }
      }
    }
    
    // Connect routers to clouds
    for (let i = 0; i < routerCount; i++) {
      for (let j = 0; j < cloudCount; j++) {
        if (nodeCount < 6 || Math.random() > 0.3) {
          newEdges.push({
            id: `edge-r${i}-c${j}`,
            source: `router-${i}`,
            target: `cloud-${j}`,
            type: networkRequirements.includes('high performance') ? 'Ultra-Low Latency' : 'Cloud Router',
            bandwidth: networkRequirements.includes('high performance') ? '100 Gbps' : '10 Gbps',
            status: 'inactive'
          });
        }
      }
    }
    
    // Apply the recommendation
    onApplyRecommendation(newNodes, newEdges);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  <Sparkles className="h-4 w-4 text-brand-blue mr-2" />
                  <span className="text-sm font-medium text-brand-blue">Network AI Assistant</span>
                </div>
              )}
              <div className="whitespace-pre-line text-sm">
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Recommendation Panel */}
      {showRecommendation && (
        <div className="mt-4 p-4 bg-brand-lightBlue border border-brand-blue/20 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-brand-blue mr-2" />
              <h3 className="text-lg font-medium text-gray-900">AI-Generated Network Design</h3>
            </div>
            <button
              onClick={generateNetworkRecommendation}
              className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-darkBlue transition-colors"
            >
              Apply Recommendation
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Network Specifications</h4>
              <ul className="text-sm text-gray-600">
                <li>• Scale: {networkScale}</li>
                <li>• Purpose: {networkPurpose}</li>
                <li>• Key Requirements: {formatRequirements(networkRequirements)}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Topology Features</h4>
              <ul className="text-sm text-gray-600">
                <li>• Optimized node placement</li>
                <li>• Intelligent connection routing</li>
                <li>• {networkRequirements.includes('redundancy') ? 'Redundant paths' : 'Efficient paths'}</li>
                <li>• {networkRequirements.includes('high performance') ? 'High-performance links' : 'Standard links'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 relative">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your network requirements here..."
          className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-brand-blue resize-none"
          rows={3}
        />
        <button
          onClick={handleSendMessage}
          disabled={!input.trim() || isTyping}
          className={`absolute right-3 bottom-3 p-2 rounded-full ${
            !input.trim() || isTyping
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-brand-blue text-white hover:bg-brand-darkBlue'
          }`}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}