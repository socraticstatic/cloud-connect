import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Cloud } from 'lucide-react';
import { Connection } from '../../types';
import { Group } from '../../types/group';
import { useStore } from '../../store/useStore';
import { motion } from 'framer-motion';

// Import modular components
import { ConnectionCardHeader } from './card/ConnectionCardHeader';
import { ConnectionCardStatus } from './card/ConnectionCardStatus';
import { ConnectionCardMetrics } from './card/ConnectionCardMetrics';
import { ConnectionCardProgress } from './card/ConnectionCardProgress';
import { ConnectionCardAction } from './card/ConnectionCardAction';
import { ConnectionCardMinimized } from './card/ConnectionCardMinimized';

interface ConnectionCardProps {
  connection: Connection;
  groups?: Group[];
  isMinimized?: boolean;
  onClick?: () => void;
}

/**
 * Card component for displaying connection information
 * Supports both expanded and minimized views
 */
export function ConnectionCard({ connection, groups = [], isMinimized: isMinimizedProp = false, onClick }: ConnectionCardProps) {
  const navigate = useNavigate();
  const updateConnection = useStore(state => state.updateConnection);
  const [isMinimized, setIsMinimized] = useState(isMinimizedProp);
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(420);
  const [isEditingName, setIsEditingName] = useState(connection.name.startsWith('Internet to'));
  const [nodeName, setNodeName] = useState(connection.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showEffects] = useState(true);

  // Update local minimized state when prop changes
  useEffect(() => {
    setIsMinimized(isMinimizedProp);
  }, [isMinimizedProp]);

  // Progress bar and countdown timer animation
  useEffect(() => {
    if (isPending) {
      const startTime = Date.now();
      const duration = 7000; // 7 seconds to emulate 7 minutes
      const totalSeconds = 420; // 7 minutes = 420 seconds

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        const secondsRemaining = Math.max(0, Math.ceil(totalSeconds - (elapsed / duration) * totalSeconds));

        setProgress(newProgress);
        setRemainingTime(secondsRemaining);

        if (newProgress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          setIsPending(false);
          setProgress(0);
          setRemainingTime(420);
        }
      };

      requestAnimationFrame(updateProgress);
    }
  }, [isPending]);

  const handleNameSubmit = () => {
    setNameError(null);
    
    if (!nodeName.trim()) {
      setNameError("Connection name cannot be empty");
      return;
    }
    
    // Check if the name already exists (case-insensitive) and isn't the current connection
    const connections = useStore.getState().connections;
    const nameExists = connections.some(conn => 
      conn.id !== connection.id && 
      conn.name.toLowerCase() === nodeName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setNameError("A connection with this name already exists");
      return;
    }
    
    // If validation passes, update the connection
    updateConnection(connection.id, { name: nodeName.trim() })
      .catch(error => {
        setNameError(error.message);
      });
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setNodeName(connection.name);
      setNameError(null);
      setIsEditingName(false);
    }
  };

  const getBillingInfo = () => {
    const planLabels = {
      'trial': { label: '22 days left', color: 'green', bgColor: 'bg-green-50', textColor: 'text-fw-success' },
      'pay-as-you-go': { label: 'Pay as you go', color: 'blue', bgColor: 'bg-brand-lightBlue', textColor: 'text-fw-link' },
      '12-months': { label: '12 Months', color: 'blue', bgColor: 'bg-brand-lightBlue', textColor: 'text-fw-link' },
      '24-months': { label: '24 Months', color: 'blue', bgColor: 'bg-brand-lightBlue', textColor: 'text-fw-link' },
      '36-months': { label: '36 Months', color: 'purple', bgColor: 'bg-purple-50', textColor: 'text-fw-link' }
    };

    const planId = connection.billing?.planId || 'pay-as-you-go';
    const planInfo = planLabels[planId as keyof typeof planLabels] || planLabels['pay-as-you-go'];

    return {
      type: planId.charAt(0).toUpperCase() + planId.slice(1),
      cost: connection.billing?.total,
      label: planInfo.label,
      color: planInfo.color,
      bgColor: planInfo.bgColor,
      textColor: planInfo.textColor
    };
  };
  
  // Provider logo mapping
  const getCardIcon = () => {
    const provider = connection.provider;
    switch(provider) {
      case 'AWS':
      case 'Azure':
      case 'Google':
        return <Cloud className="h-5 w-5 text-fw-link" />;
      default:
        return connection.type === 'GCP Connection for AT&T' ?
          <Globe className="h-5 w-5 text-fw-link" /> :
          <Cloud className="h-5 w-5 text-fw-link" />;
    }
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    const newStatus = connection.status === 'Active' ? 'Inactive' : 'Active';
    const isActivating = newStatus === 'Active';

    if (isActivating) {
      // Activating: Show timer countdown (7 seconds emulating 7 minutes)
      setIsPending(true);

      // Show initial toast
      window.addToast({
        type: 'info',
        title: 'Activation Initiated',
        message: `Connection activation typically takes 7 minutes to complete. A notification will appear when finished.`,
        duration: 6000
      });

      // Simulate activation after 7 seconds (emulating 7 minutes)
      setTimeout(() => {
        updateConnection(connection.id, { status: newStatus });
        setIsPending(false);
        setProgress(0);
        setRemainingTime(420);

        window.addToast({
          type: 'success',
          title: 'Connection Activated',
          message: `Connection is now Active`,
          duration: 3000
        });
      }, 7000);
    } else {
      // Deactivating: Instant change, no timer
      updateConnection(connection.id, { status: newStatus });

      window.addToast({
        type: 'success',
        title: 'Connection Deactivated',
        message: `Connection is now Inactive`,
        duration: 3000
      });
    }
  };

  const getHealthStatus = () => {
    if (connection.status !== 'Active') return { label: 'Inactive', color: 'bg-gray-100 text-gray-600' };

    const utilization = connection.performance?.bandwidthUtilization || 0;
    if (utilization > 90) {
      return { label: 'Critical', color: 'bg-red-50 text-red-700' };
    } else if (utilization > 80) {
      return { label: 'Warning', color: 'bg-amber-50 text-amber-700' };
    } else if (utilization > 60) {
      return { label: 'Good', color: 'bg-brand-lightBlue text-brand-blue' };
    } else {
      return { label: 'Optimal', color: 'bg-complementary-green/10 text-complementary-green' };
    }
  };

  const getStatusDotColor = () => {
    if (connection.status !== 'Active') return 'bg-gray-400';
    const utilization = connection.performance?.bandwidthUtilization || 0;
    if (utilization > 90) return 'bg-red-500';
    if (utilization > 80) return 'bg-complementary-amber';
    if (utilization > 60) return 'bg-brand-blue';
    return 'bg-complementary-green';
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/connections/${connection.id}`);
    }
  };

  const healthStatus = getHealthStatus();
  const billingInfo = getBillingInfo();

  return (
    <motion.div
      className={`
        relative
        bg-fw-base rounded-xl border border-fw-secondary
        shadow-sm
        hover:shadow-md
        transition-all duration-300 ease-in-out
        transform hover:translate-y-[-2px]
        ${isMinimized ? 'h-[88px]' : ''}
        cursor-pointer
      `}
      data-tour-target="connection-card"
      onClick={handleCardClick}
      // Add motion animation when pending
      animate={isPending ? {
        boxShadow: ['0 2px 4px rgba(0,0,0,0.05)', '0 0 8px rgba(0,159,219,0.5)', '0 2px 4px rgba(0,0,0,0.05)'],
        scale: [1, 1.02, 1],
        transition: { 
          repeat: Infinity, 
          duration: 2.5,
          ease: "easeInOut"
        }
      } : {}}
    >
      {/* Progress Bar */}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-fw-neutral rounded-t-xl overflow-hidden">
          <motion.div
            className="h-full bg-fw-link transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
            // Add pulse animation to the progress bar
            animate={{
              opacity: [0.7, 1, 0.7],
              transition: { 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }
            }}
          />
        </div>
      )}

      {isMinimized ? (
        // Minimized View
        <ConnectionCardMinimized
          connection={connection}
          groups={groups}
          getStatusDotColor={getStatusDotColor}
          getCardIcon={getCardIcon}
          handleToggleStatus={handleToggleStatus}
          isPending={isPending}
          progress={progress}
          remainingTime={remainingTime}
          navigate={navigate}
          onMaximize={() => setIsMinimized(false)}
          showEffects={showEffects}
        />
      ) : (
        // Expanded View
        <>
          <ConnectionCardHeader 
            name={connection.name}
            type={connection.type}
            icon={getCardIcon()}
            isEditingName={isEditingName}
            nodeName={nodeName}
            nameError={nameError}
            onNameChange={(e) => setNodeName(e.target.value)}
            onNameSubmit={handleNameSubmit}
            onNameKeyDown={handleNameKeyDown}
            onEditNameClick={() => setIsEditingName(true)}
            onMinimize={() => setIsMinimized(true)}
            connection={connection}
          />

          <div className="p-4 space-y-4">
            {/* Bandwidth Utilization Bar */}
            <ConnectionCardProgress
              performance={connection.performance}
              bandwidth={connection.bandwidth}
            />

            {/* Connection Metrics */}
            <ConnectionCardMetrics
              connection={connection}
              billingInfo={billingInfo}
              performance={connection.performance}
            />
          </div>

          {/* Status */}
          <ConnectionCardStatus
            status={connection.status}
            bandwidthUtilization={connection.performance?.bandwidthUtilization || 0}
            isPending={isPending}
            progress={progress}
            remainingTime={remainingTime}
            handleToggleStatus={handleToggleStatus}
            healthStatus={healthStatus}
            showEffects={showEffects}
          />

          {/* Action */}
          <ConnectionCardAction connectionId={connection.id} />
        </>
      )}
    </motion.div>
  );
}