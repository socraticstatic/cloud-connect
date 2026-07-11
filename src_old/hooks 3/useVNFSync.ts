import { useEffect, useRef } from 'react';
import { VNF } from '../types/vnf';
import { CloudRouter } from '../types/cloudrouter';

interface SyncMessage {
  type: 'VNF_UPDATED' | 'CLOUD_ROUTERS_UPDATED' | 'FULL_SYNC' | 'REQUEST_SYNC' | 'VNF_UPDATED_FROM_DETACHED' | 'DETACHED_CLOSED' | 'PARENT_CLOSED';
  payload?: {
    vnfs?: VNF[];
    cloudRouters?: CloudRouter[];
  };
  windowId?: string;
}

interface UseVNFSyncProps {
  vnfs: VNF[];
  cloudRouters: CloudRouter[];
  connectionId: string;
  onVNFsUpdate?: (vnfs: VNF[]) => void;
  onCloudRoutersUpdate?: (cloudRouters: CloudRouter[]) => void;
}

export function useVNFSync({
  vnfs,
  cloudRouters,
  connectionId,
  onVNFsUpdate,
  onCloudRoutersUpdate
}: UseVNFSyncProps) {
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Create broadcast channel for cross-window communication
    const channel = new BroadcastChannel('vnf-sync');
    channelRef.current = channel;

    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      const { type, payload, windowId } = event.data;

      switch (type) {
        case 'REQUEST_SYNC':
          // Detached window is requesting initial data
          channel.postMessage({
            type: 'FULL_SYNC',
            payload: {
              vnfs,
              cloudRouters
            }
          });
          break;

        case 'VNF_UPDATED_FROM_DETACHED':
          // Detached window made changes, update local state
          if (payload?.vnfs && onVNFsUpdate) {
            onVNFsUpdate(payload.vnfs);
          }
          break;

        case 'DETACHED_CLOSED':
          // Detached window closed, no action needed
          console.log('[VNFSync] Detached window closed:', windowId);
          break;
      }
    };

    channel.addEventListener('message', handleMessage);

    // Cleanup on unmount
    return () => {
      // Notify detached windows that parent is closing
      channel.postMessage({ type: 'PARENT_CLOSED' });
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;
    };
  }, []);

  // Sync VNFs when they change
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'VNF_UPDATED',
        payload: { vnfs }
      });
    }
  }, [vnfs]);

  // Sync cloud routers when they change
  useEffect(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'CLOUD_ROUTERS_UPDATED',
        payload: { cloudRouters }
      });
    }
  }, [cloudRouters]);

  return {
    broadcast: (message: SyncMessage) => {
      if (channelRef.current) {
        channelRef.current.postMessage(message);
      }
    }
  };
}
