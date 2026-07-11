import { useState } from 'react';
import { AlertTriangle, AlertCircle, Clock, Activity, Network, X } from 'lucide-react';
import { Alert } from '../../../types';
import { motion } from 'framer-motion';

interface AlertCardProps {
  alert: Alert;
  onDismiss?: (id: string) => void;
  isMobile?: boolean;
}

export function AlertCard({ alert, onDismiss, isMobile = false }: AlertCardProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  const getIcon = () => {
    switch (alert.type) {
      case 'critical':
        return Activity;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      text: 'text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-500',
      title: 'text-amber-800',
      text: 'text-amber-700'
    },
    info: {
      bg: 'bg-brand-lightBlue',
      border: 'border-brand-blue/20',
      icon: 'text-brand-blue',
      title: 'text-brand-blue',
      text: 'text-brand-blue/80'
    }
  }[alert.type];

  const Icon = getIcon();

  const handleDismiss = () => {
    if (onDismiss) {
      setIsDismissing(true);
      // Wait for animation to complete before removing
      setTimeout(() => {
        onDismiss(alert.id);
      }, 300);
    }
  };

  if (isMobile) {
    // Mobile-optimized version
    return (
      <motion.div 
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isDismissing ? 0 : 1, 
          y: isDismissing ? -10 : 0,
          height: isDismissing ? 0 : 'auto'
        }}
        transition={{ duration: 0.3 }}
        className={`${styles.bg} ${styles.border} border rounded-lg overflow-hidden relative`}
      >
        <div className="p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <Icon className={`h-5 w-5 ${styles.icon}`} />
            </div>
            <div className="ml-3 flex-1 pr-6">
              <h3 className={`text-sm font-medium ${styles.title}`}>
                {alert.title}
              </h3>
              <p className={`mt-1 text-sm ${styles.text}`}>
                {alert.message}
              </p>
              
              <div className="mt-3 pt-3 border-t border-gray-200/50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(alert.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="capitalize">{alert.type} Alert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dismiss button */}
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Desktop version
  return (
    <motion.div 
      initial={{ opacity: 1, y: 0 }}
      animate={{ 
        opacity: isDismissing ? 0 : 1, 
        y: isDismissing ? -10 : 0,
        height: isDismissing ? 0 : 'auto'
      }}
      transition={{ duration: 0.3 }}
      className={`${styles.bg} ${styles.border} border rounded-lg py-2.5 px-3 relative group`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-4 w-4 ${styles.icon} mt-0.5`} />
        </div>
        <div className="ml-2.5 w-0 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {alert.title}
          </h3>
          <p className={`mt-0.5 text-xs ${styles.text}`}>
            {alert.message}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {/* Dismiss button - only visible on hover */}
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200"
          aria-label="Dismiss alert"
        >
          <X className="h-3 w-3 text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
}