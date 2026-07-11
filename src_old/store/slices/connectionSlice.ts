import { StateCreator } from 'zustand';
import { Connection } from '../../types';

export interface ConnectionSlice {
  connections: Connection[];
  selectedConnection: string | null;
  addConnection: (connection: Connection) => Promise<void>;
  updateConnection: (id: string, updates: Partial<Connection>) => Promise<void>;
  removeConnection: (id: string) => Promise<void>;
  setSelectedConnection: (id: string | null) => void;
  fetchConnections: () => Promise<void>;
}

export const createConnectionSlice: StateCreator<ConnectionSlice> = (set, get) => ({
  connections: [],
  selectedConnection: null,

  fetchConnections: async () => {
    // No-op since we're using sample data
    return Promise.resolve();
  },

  addConnection: async (connection) => {
    try {
      // Check if name is unique
      const existingConnection = get().connections.find(
        conn => conn.name.toLowerCase() === connection.name.toLowerCase()
      );

      if (existingConnection) {
        throw new Error('A connection with this name already exists');
      }

      // Generate a unique ID if not provided
      const newId = connection.id || `conn-${Date.now()}`;
      
      // Ensure new connections start as inactive
      const newConnection: Connection = {
        ...connection,
        id: newId,
        status: 'Inactive',
        performance: {
          latency: '<10ms',
          packetLoss: '<0.1%',
          jitter: '<2ms',
          uptime: '99.9%',
          throughput: '0%',
          tunnels: 'Inactive',
          bandwidthUtilization: 0,
          currentUsage: '0 Gbps',
          utilizationTrend: [0, 0, 0, 0, 0, 0, 0]
        },
        features: {
          dedicatedConnection: true,
          redundantPath: connection.features?.redundantPath || false,
          autoScaling: connection.features?.autoScaling || false,
          loadBalancing: connection.features?.loadBalancing || false
        },
        security: {
          encryption: 'AES-256',
          firewall: true,
          ddosProtection: true,
          ipSecEnabled: true
        }
      };

      // Simulate network delay to make it more realistic
      await new Promise(resolve => setTimeout(resolve, 500));

      set((state) => ({ 
        connections: [newConnection, ...state.connections]
      }));

      window.addToast({
        type: 'success',
        title: 'Connection Created',
        message: 'New connection has been created. You can activate it from the management dashboard.',
        duration: 3000
      });

    } catch (error) {
      console.error('Error adding connection:', error);
      window.addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create connection',
        duration: 3000
      });
      throw error;
    }
  },

  updateConnection: async (id, updates) => {
    try {
      const connection = get().connections.find(conn => conn.id === id);

      if (!connection) {
        throw new Error('Connection not found');
      }

      // Check if trying to modify configuration while connection is active
      // Allow status changes, but prevent other modifications when active
      const isConfigChange = Object.keys(updates).some(key => key !== 'status');
      if (connection.status === 'Active' && isConfigChange) {
        throw new Error('Cannot modify an active connection. Please deactivate the connection first.');
      }

      // If name is being updated, check for uniqueness
      if (updates.name) {
        const existingConnection = get().connections.find(
          conn => conn.id !== id && conn.name.toLowerCase() === updates.name?.toLowerCase()
        );

        if (existingConnection) {
          throw new Error('A connection with this name already exists');
        }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      set((state) => ({
        connections: state.connections.map((conn) =>
          conn.id === id ? { ...conn, ...updates } : conn
        ),
      }));

      window.addToast({
        type: 'success',
        title: 'Connection Updated',
        message: updates.status !== undefined
          ? `Connection is now ${updates.status}`
          : 'Connection has been updated successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error updating connection:', error);
      window.addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to update connection',
        duration: 3000
      });
      throw error;
    }
  },

  removeConnection: async (id) => {
    try {
      const connection = get().connections.find(conn => conn.id === id);

      if (!connection) {
        throw new Error('Connection not found');
      }

      if (connection.status === 'Active') {
        throw new Error('Cannot delete an active connection. Please deactivate the connection first.');
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      set((state) => ({
        connections: state.connections.filter((conn) => conn.id !== id),
      }));

      window.addToast({
        type: 'success',
        title: 'Connection Deleted',
        message: 'Connection has been deleted successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      window.addToast({
        type: 'error',
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete connection',
        duration: 3000
      });
      throw error;
    }
  },

  setSelectedConnection: (id) => set({ selectedConnection: id }),
});