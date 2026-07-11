import { useState, useRef, useEffect } from 'react';
import { Edit2, Minimize2, Cloud } from 'lucide-react';
import { NetworkNode } from '../../../types';
import { IconButton } from '../../common/IconButton';
import { ConnectionOverflowMenu } from '../ConnectionOverflowMenu';

interface ConnectionCardHeaderProps {
  name: string;
  type: string;
  icon: React.ReactNode;
  isEditingName: boolean;
  nodeName: string;
  nameError: string | null;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameSubmit: () => void;
  onNameKeyDown: (e: React.KeyboardEvent) => void;
  onEditNameClick: () => void;
  onMinimize: () => void;
  connection: any;
}

/**
 * Header component for the connection card
 * Displays the connection name, type, and actions
 */
export function ConnectionCardHeader({
  name,
  type,
  icon,
  isEditingName,
  nodeName,
  nameError,
  onNameChange,
  onNameSubmit,
  onNameKeyDown,
  onEditNameClick,
  onMinimize,
  connection
}: ConnectionCardHeaderProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border-b border-fw-secondary">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-fw-wash rounded-lg">
            {icon}
          </div>
          <div>
            {isEditingName ? (
              <div>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={nodeName}
                  onChange={onNameChange}
                  onBlur={onNameSubmit}
                  onKeyDown={onNameKeyDown}
                  className={`w-full px-2 py-1 text-sm font-medium bg-fw-base border ${nameError ? 'border-fw-error' : 'border-fw-active'} rounded focus:outline-none focus:ring-2 focus:ring-fw-active`}
                  placeholder="Enter connection name"
                  onClick={(e) => e.stopPropagation()}
                />
                {nameError && (
                  <p className="text-xs text-fw-error mt-1">{nameError}</p>
                )}
              </div>
            ) : (
              <div>
                <h3
                  className="text-sm font-medium text-fw-heading cursor-text"
                  onClick={onEditNameClick}
                >
                  {name}
                </h3>
                {connection?.origin?.source === 'aws-marketplace' && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-orange-100 to-blue-100 border border-orange-300 rounded text-xs font-semibold text-orange-800">
                      <Cloud className="w-3 h-3" />
                      AWS Partner
                    </span>
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-fw-bodyLight">{type}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={<Minimize2 className="h-4 w-4" />}
            onClick={onMinimize}
            variant="ghost"
            size="sm"
            title="Minimize"
          />
          <ConnectionOverflowMenu connection={connection} />
        </div>
      </div>
    </div>
  );
}