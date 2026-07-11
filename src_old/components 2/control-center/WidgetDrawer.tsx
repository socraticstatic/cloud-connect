import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { WidgetDefinition } from './types';
import { AVAILABLE_WIDGETS } from './widgets';

interface WidgetDrawerProps {
  onAddWidget: (widget: WidgetDefinition) => void;
}

export function WidgetDrawer({ onAddWidget }: WidgetDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddWidget = (widget: WidgetDefinition) => {
    onAddWidget(widget);
    setIsOpen(false); // Close drawer immediately after adding widget
    
    window.addToast({
      type: 'success',
      title: 'Widget Added',
      message: `${widget.title} widget has been added to your dashboard`,
      duration: 3000
    });
  };

  return (
    <div 
      className={`
        absolute top-0 bottom-0 right-0 bg-white border-l border-gray-200 shadow-lg
        transition-all duration-300 ease-in-out z-10
        ${isOpen ? 'w-80' : 'w-10'}
      `}
    >
      {/* Collapsed State */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-full w-full flex flex-col items-center pt-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Open widget drawer"
        >
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mb-12">
            <ChevronLeft className="h-4 w-4" />
          </div>
          <div className="rotate-90 origin-center whitespace-nowrap">
            <span className="text-xs font-medium">Add Widgets</span>
          </div>
        </button>
      )}

      {/* Expanded State */}
      {isOpen && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Add Widgets</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                aria-label="Close widget drawer"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Widget Categories */}
          <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100% - 65px)' }}>
            {Object.entries(AVAILABLE_WIDGETS).map(([category, widgets]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {widgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleAddWidget(widget)}
                      className="widget-card w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all duration-200 text-left group"
                      style={{ borderRadius: '0.5rem !important' }}
                    >
                      <div className="flex items-center">
                        <div className={`
                          p-2 rounded-lg
                          ${widget.color === 'blue' ? 'bg-blue-50' :
                            widget.color === 'green' ? 'bg-green-50' :
                            widget.color === 'purple' ? 'bg-purple-50' :
                            widget.color === 'orange' ? 'bg-orange-50' :
                            'bg-gray-50'}
                        `}>
                          <widget.icon className={`
                            h-4 w-4
                            ${widget.color === 'blue' ? 'text-blue-500' :
                              widget.color === 'green' ? 'text-green-500' :
                              widget.color === 'purple' ? 'text-purple-500' :
                              widget.color === 'orange' ? 'text-orange-500' :
                              'text-gray-500'}
                          `} />
                        </div>
                        <div className="ml-3 flex-1">
                          <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {widget.title}
                          </h5>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {widget.description}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}