import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { Connection } from '../../types';
import { WidgetDrawer } from './WidgetDrawer';
import { WidgetGrid } from './WidgetGrid';
import { WidgetDefinition, WidgetInstance } from './types';
import { useStore } from '../../store/useStore';
import { AgenticAssistantDemo } from './AgenticAssistantDemo';

interface ControlCenterProps {
  connections: Connection[];
}

export function ControlCenter({ connections }: ControlCenterProps) {
  const { widgets, addWidget, updateWidget, removeWidget, reorderWidgets } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleAddWidget = (widget: WidgetDefinition) => {
    const newWidget: WidgetInstance = {
      id: `${widget.id}-${Date.now()}`,
      widgetId: widget.id,
      position: {
        x: 0,
        y: Math.max(...widgets.map(w => w.position.y + w.size.h), 0)
      },
      size: {
        w: widget.defaultW || 1,
        h: widget.defaultH || 1
      }
    };

    addWidget(newWidget);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;
    if (!over) return;

    const oldIndex = widgets.findIndex(w => w.id === active.id);
    const newIndex = widgets.findIndex(w => w.id === over.id);

    if (oldIndex !== newIndex) {
      const newWidgets = [...widgets];
      const [movedWidget] = newWidgets.splice(oldIndex, 1);
      newWidgets.splice(newIndex, 0, movedWidget);
      reorderWidgets(newWidgets);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget(widgetId);

    window.addToast({
      type: 'success',
      title: 'Widget Removed',
      message: 'Widget has been removed from your dashboard',
      duration: 3000
    });
  };

  const handleUpdateWidget = (widgetId: string, updates: Partial<WidgetInstance>) => {
    updateWidget(widgetId, updates);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative min-h-[calc(100vh-16rem)] bg-gray-50 rounded-lg">
        <WidgetGrid
          widgets={widgets}
          activeId={activeId}
          onRemoveWidget={handleRemoveWidget}
          onUpdateWidget={handleUpdateWidget}
          connections={connections}
        />

        <WidgetDrawer onAddWidget={handleAddWidget} />
        <AgenticAssistantDemo />
      </div>
    </DndContext>
  );
}