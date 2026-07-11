import { useState, useRef, useEffect } from 'react';
import { Cloud, Server, Network, Globe, Router, Wifi, Shield } from 'lucide-react';
import { NetworkNode } from '../../types';

interface NodeProps {
  node: NetworkNode;
  isSelected: boolean;
  isCreatingEdge: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrag: (x: number, y: number) => void;
  onNameChange?: (newName: string) => void;
  showEffects?: boolean;
}

export function Node({
  node,
  isSelected,
  isCreatingEdge,
  onClick,
  onDragStart,
  onDragEnd,
  onDrag,
  onNameChange,
  showEffects = false
}: NodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isEditingName, setIsEditingName] = useState(false);
  const [nodeName, setNodeName] = useState(node.name);

  // Track node position - this is critical for proper positioning
  const [position, setPosition] = useState({ x: node.x || 0, y: node.y || 0 });

  // Update position when node coordinates change
  useEffect(() => {
    if (typeof node.x === 'number' && typeof node.y === 'number') {
      setPosition({ x: node.x, y: node.y });
    }
  }, [node.x, node.y]);

  // Handle drag events
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (nodeRef.current) {
        const rect = nodeRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left - dragOffset.x;
          const y = e.clientY - rect.top - dragOffset.y;
          onDrag(x, y);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onDrag, onDragEnd]);

  // Handle tooltip positioning
  const handleMouseEnter = (e: React.MouseEvent) => {
    if (nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
    setShowTooltip(true);
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Dynamically determine the appropriate icon based on node type and properties
  const getIconComponent = () => {
    // Determine icon based on node type and other properties
    switch (node.type) {
      case 'source':
        // Check if it's an Internet connection based on name or config
        if (node.name?.toLowerCase().includes('internet') || 
            node.config?.connectionType?.toLowerCase().includes('internet')) {
          return Globe;
        }
        return Server;
      
      case 'destination':
        // Cloud providers typically get the Cloud icon
        if (node.config?.provider || node.name?.toLowerCase().includes('cloud')) {
          return Cloud;
        }
        return Server;
      
      case 'router':
        return Router;
      
      case 'network':
        // If it's an internet connection based on name
        if (node.name?.toLowerCase().includes('internet')) {
          return Globe;
        }
        return Network;
      
      case 'wifi':
        return Wifi;
      
      case 'security':
        return Shield;
      
      default:
        return Server; // Default fallback
    }
  };

  const IconComponent = getIconComponent();

  // Get status color based on node type and status
  const getStatusColor = () => {
    if (node.status !== 'active') return 'bg-gray-400';

    switch (node.type) {
      case 'source':
        return 'bg-green-500';
      case 'destination':
        return 'bg-brand-blue';
      case 'router':
        return 'bg-purple-500';
      case 'network':
        return 'bg-indigo-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get node background color based on type with gradient
  const getBackgroundColor = () => {
    if (isSelected) return 'bg-gradient-to-br from-brand-lightBlue to-blue-50';
    if (isDragging) return 'bg-gradient-to-br from-gray-50 to-white';

    switch (node.type) {
      case 'source':
        return 'bg-gradient-to-br from-green-50 to-emerald-50';
      case 'destination':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50';
      case 'router':
        return 'bg-gradient-to-br from-purple-50 to-indigo-50';
      case 'network':
        return 'bg-gradient-to-br from-indigo-50 to-blue-50';
      default:
        return 'bg-gradient-to-br from-white to-gray-50';
    }
  };

  // Get icon color based on type and state
  const getIconColor = () => {
    if (isSelected) return 'text-brand-blue';
    if (isDragging) return 'text-gray-600';

    switch (node.type) {
      case 'source':
        return 'text-green-600';
      case 'destination':
        return 'text-brand-blue';
      case 'router':
        return 'text-purple-600';
      case 'network':
        return 'text-indigo-600';
      default:
        return 'text-gray-400';
    }
  };

  const handleNameSubmit = () => {
    if (nodeName.trim() && onNameChange) {
      onNameChange(nodeName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setNodeName(node.name);
      setIsEditingName(false);
    }
  };

  return (
    <>
      <div
        ref={nodeRef}
        className={`
          absolute w-16 h-16 flex items-center justify-center
          rounded-2xl transition-all duration-200
          ${getBackgroundColor()}
          ${isCreatingEdge ? 'cursor-pointer' : 'cursor-move'}
          ${isDragging ? 'cursor-grabbing shadow-2xl scale-110 ring-2 ring-brand-blue ring-opacity-30' : 'cursor-grab shadow-md hover:shadow-xl hover:scale-105'}
          border ${isSelected ? 'border-brand-blue border-2 ring-2 ring-brand-blue ring-opacity-20' : 'border-gray-200 border-opacity-50'}
          transform-gpu backdrop-blur-sm
        `}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: isDragging ? 50 : isSelected ? 40 : 30,
          transform: 'translate(0, 0)' // Reset any transform - we're using left/top instead
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) {
            onClick();
          }
        }}
        onMouseDown={(e) => {
          if (!isCreatingEdge && nodeRef.current) {
            e.stopPropagation();
            const rect = nodeRef.current.getBoundingClientRect();
            setDragOffset({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
            setIsDragging(true);
            onDragStart();
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Icon */}
        <IconComponent className={`
          h-8 w-8 transition-all duration-200
          ${getIconColor()}
          ${isDragging ? 'scale-90' : 'scale-100'}
        `} />
        
        {/* Node Label */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleNameKeyDown}
              className="px-1 py-0.5 text-xs font-medium bg-white border border-brand-blue rounded focus:outline-none focus:ring-2 focus:ring-brand-blue"
              style={{ minWidth: '100px' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className={`
                text-xs font-medium transition-all duration-200
                ${isSelected ? 'text-brand-blue' : 'text-gray-600'}
                hover:text-brand-blue cursor-text
              `}
              onDoubleClick={() => setIsEditingName(true)}
            >
              {node.name}
            </span>
          )}
        </div>

        {/* Status Indicator */}
        <div className="absolute -top-1 -right-1">
          <div className={`
            w-3 h-3 rounded-full transition-all duration-200
            ${getStatusColor()}
          `} />
        </div>

        {/* Position Indicators */}
        {isSelected && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-md shadow-sm border border-gray-200 px-2 py-1 text-xs font-mono whitespace-nowrap">
            {Math.round(position.x)}, {Math.round(position.y)}
          </div>
        )}

        {/* Connection Points */}
        {isCreatingEdge && (
          <>
            <div className="absolute inset-0 rounded-lg border-2 border-brand-blue border-dashed" />
            <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full bg-brand-lightBlue border-2 border-brand-blue" />
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full bg-brand-lightBlue border-2 border-brand-blue" />
          </>
        )}
      </div>

      {/* Tooltip - Elegant White Style */}
      {showTooltip && !isDragging && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          <div className="bg-white text-gray-800 px-4 py-3 rounded-xl shadow-2xl border border-gray-200 text-sm">
            <div className="font-semibold text-gray-900">{node.name}</div>
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-blue"></span>
              {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
              {node.config?.location && ` • ${node.config.location}`}
              {node.config?.provider && ` • ${node.config.provider}`}
            </div>
            {node.config && Object.keys(node.config).length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(node.config).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-400 text-[10px] uppercase tracking-wide">{key}: </span>
                    <span className="text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}