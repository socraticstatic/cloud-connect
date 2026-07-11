import { Server, Cloud, Router, Network, Plus, Undo, Play, Check, Save, Trash2, Sparkles } from 'lucide-react';
import { NetworkNode } from '../../types';

interface ToolbarProps {
  onAddNode: (type: NetworkNode['type']) => void;
  onToggleEdgeCreation: () => void;
  isCreatingEdge: boolean;
  onCancel: () => void;
  hasConnections: boolean;
  canUndo: boolean;
  onRunScenario?: () => void;
  isRunningScenario?: boolean;
  onCreateConnections?: () => void;
  onSaveTemplate?: () => void;
  onClearCanvas?: () => void;
}

export function Toolbar({
  onAddNode,
  onToggleEdgeCreation,
  isCreatingEdge,
  onCancel,
  hasConnections,
  canUndo,
  onRunScenario,
  isRunningScenario = false,
  onCreateConnections,
  onSaveTemplate,
  onClearCanvas
}: ToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-sm border border-gray-200 p-2 flex items-center space-x-4 min-w-[800px]" style={{ zIndex: 50 }}>
      {/* Node Tools */}
      <div className="flex items-center space-x-4 border-r border-gray-200 pr-4">
        <button
          onClick={() => onAddNode('source')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full flex items-center space-x-2"
          title="Add Source Node"
        >
          <Server className="h-5 w-5" />
          <span className="text-sm">Source</span>
        </button>
        <button
          onClick={() => onAddNode('destination')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full flex items-center space-x-2"
          title="Add Cloud Provider"
        >
          <Cloud className="h-5 w-5" />
          <span className="text-sm">Cloud</span>
        </button>
        <button
          onClick={() => onAddNode('router')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full flex items-center space-x-2"
          title="Add Router"
        >
          <Router className="h-5 w-5" />
          <span className="text-sm">Router</span>
        </button>
        <button
          onClick={() => onAddNode('network')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-full flex items-center space-x-2"
          title="Add Network Device"
        >
          <Network className="h-5 w-5" />
          <span className="text-sm">Network</span>
        </button>
      </div>

      {/* Connection Tool */}
      <div className="relative group">
        <button
          onClick={onToggleEdgeCreation}
          className={`p-2 rounded-full ${
            isCreatingEdge
              ? 'text-brand-blue bg-brand-lightBlue'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <Plus className="h-5 w-5" />
        </button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Click on the nodes you wish to connect. Toggle when you're done.
        </div>
      </div>

      {/* Scenario Runner */}
      {onRunScenario && (
        <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
          <div className="relative group">
            <button
              onClick={onRunScenario}
              disabled={!hasConnections || isRunningScenario}
              title="Run Network Scenario"
              className={`
                p-2 text-sm font-medium transition-colors no-rounded
                ${!hasConnections
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isRunningScenario
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {isRunningScenario 
                ? <Sparkles className="h-5 w-5 animate-pulse text-green-500" /> 
                : <Play className="h-5 w-5" />
              }
            </button>
          </div>
        </div>
      )}

      {/* Save Template */}
      <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
        <button
          onClick={onSaveTemplate}
          disabled={!hasConnections}
          title="Save as Template"
          className={`
            p-2 text-sm font-medium transition-colors no-rounded
            ${!hasConnections
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <Save className="h-5 w-5" />
        </button>
      </div>

      {/* History Controls */}
      <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
        <button
          onClick={onCancel}
          disabled={!canUndo}
          title="Undo"
          className={`
            p-2 text-sm font-medium transition-colors no-rounded
            ${!canUndo
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <Undo className="h-5 w-5" />
        </button>
      </div>

      {/* Clear Canvas */}
      <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
        <button
          onClick={onClearCanvas}
          disabled={!hasConnections}
          title="Clear Canvas"
          className={`
            p-2 text-sm font-medium transition-colors no-rounded
            ${!hasConnections
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Create Connections */}
      <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
        <button
          onClick={onCreateConnections}
          disabled={!hasConnections}
          title="Create Connections"
          className={`
            p-2 text-sm font-medium transition-colors no-rounded
            ${!hasConnections
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <Check className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}