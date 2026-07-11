import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import { Connection, Alert, User } from '../types';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      connections: [],
      alerts: [],
      users: [],
      selectedConnection: null,
      activeTab: 'connections'
    });
  });

  describe('connection state', () => {
    it('adds a connection', () => {
      const connection: Connection = {
        id: '1',
        name: 'Test Connection',
        type: 'AWS Direct Connect',
        status: 'Active',
        bandwidth: '10 Gbps',
        location: 'US East'
      };

      useStore.getState().addConnection(connection);
      expect(useStore.getState().connections).toHaveLength(1);
      expect(useStore.getState().connections[0]).toEqual(connection);
    });

    it('updates a connection', () => {
      const connection: Connection = {
        id: '1',
        name: 'Test Connection',
        type: 'AWS Direct Connect',
        status: 'Active',
        bandwidth: '10 Gbps',
        location: 'US East'
      };

      useStore.getState().addConnection(connection);
      useStore.getState().updateConnection('1', { name: 'Updated Connection' });
      
      expect(useStore.getState().connections[0].name).toBe('Updated Connection');
    });

    it('removes a connection', () => {
      const connection: Connection = {
        id: '1',
        name: 'Test Connection',
        type: 'AWS Direct Connect',
        status: 'Active',
        bandwidth: '10 Gbps',
        location: 'US East'
      };

      useStore.getState().addConnection(connection);
      useStore.getState().removeConnection('1');
      
      expect(useStore.getState().connections).toHaveLength(0);
    });
  });

  describe('alert state', () => {
    it('adds an alert', () => {
      const alert: Alert = {
        id: '1',
        type: 'warning',
        title: 'Test Alert',
        message: 'Test Message',
        timestamp: new Date().toISOString(),
        connectionId: '1'
      };

      useStore.getState().addAlert(alert);
      expect(useStore.getState().alerts).toHaveLength(1);
      expect(useStore.getState().alerts[0]).toEqual(alert);
    });

    it('removes an alert', () => {
      const alert: Alert = {
        id: '1',
        type: 'warning',
        title: 'Test Alert',
        message: 'Test Message',
        timestamp: new Date().toISOString(),
        connectionId: '1'
      };

      useStore.getState().addAlert(alert);
      useStore.getState().removeAlert('1');
      
      expect(useStore.getState().alerts).toHaveLength(0);
    });

    it('clears all alerts', () => {
      const alerts: Alert[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Test Alert 1',
          message: 'Test Message 1',
          timestamp: new Date().toISOString(),
          connectionId: '1'
        },
        {
          id: '2',
          type: 'error',
          title: 'Test Alert 2',
          message: 'Test Message 2',
          timestamp: new Date().toISOString(),
          connectionId: '2'
        }
      ];

      alerts.forEach(alert => useStore.getState().addAlert(alert));
      useStore.getState().clearAlerts();
      
      expect(useStore.getState().alerts).toHaveLength(0);
    });
  });

  describe('UI state', () => {
    it('sets active tab', () => {
      useStore.getState().setActiveTab('marketplace');
      expect(useStore.getState().activeTab).toBe('marketplace');
    });
  });
});