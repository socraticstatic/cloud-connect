import { create } from 'zustand';
import { Connection, Alert, User } from '../types';
import { WidgetInstance } from '../components/control-center/types';
import { Group } from '../types/group';
import { createWidgetSlice, WidgetSlice } from './slices/widgetSlice';
import { createConnectionSlice, ConnectionSlice } from './slices/connectionSlice';
import { createAlertSlice, AlertSlice } from './slices/alertSlice';
import { createUserSlice, UserSlice } from './slices/userSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createGroupSlice, GroupSlice } from './slices/groupSlice';
import { createRuleSlice, RuleSlice } from './slices/ruleSlice';
import { createAgenticSlice, AgenticSlice } from './slices/agenticSlice';
import { createAPIToolboxSlice, APIToolboxSlice } from './slices/apiToolboxSlice';
import { createNotificationSlice, NotificationSlice } from './slices/notificationSlice';
import { createFontSizeSlice, FontSizeSlice } from './slices/fontSizeSlice';
import { createColumnVisibilitySlice, ColumnVisibilitySlice } from './slices/columnVisibilitySlice';
import { createDetachedWindowSlice, DetachedWindowSlice } from './slices/detachedWindowSlice';
import { createKeyboardShortcutsSlice, KeyboardShortcutsSlice } from './slices/keyboardShortcutsSlice';
import { createRoleSlice, RoleSlice } from './slices/roleSlice';
import { sampleConnections, sampleUsers, sampleGroups } from '../data/sampleData';
import { safeJsonParse } from '../utils/errorHandling';

// Load persisted state from localStorage with error handling
const loadPersistedState = () => {
  try {
    const persistedState = localStorage.getItem('appState');
    if (persistedState) {
      return safeJsonParse(persistedState, {});
    }
  } catch (error) {
    console.error('Failed to load persisted state:', error);
  }
  return {};
};

// Save state to localStorage with error handling
const persistState = (state: any) => {
  try {
    const stateToStore = {
      connections: state.connections,
      groups: state.groups,
      activeTab: state.activeTab
      // Add other state you want to persist
    };
    localStorage.setItem('appState', JSON.stringify(stateToStore));
  } catch (error) {
    console.error('Failed to persist state:', error);
  }
};

interface Store extends
  ConnectionSlice,
  AlertSlice,
  UserSlice,
  UISlice,
  WidgetSlice,
  GroupSlice,
  RuleSlice,
  AgenticSlice,
  APIToolboxSlice,
  NotificationSlice,
  FontSizeSlice,
  ColumnVisibilitySlice,
  DetachedWindowSlice,
  KeyboardShortcutsSlice,
  RoleSlice {}

// Create store with persisted or sample data
export const useStore = create<Store>((set, get) => {
  // Load persisted state
  const persistedState = loadPersistedState();
  
  // Merge with defaults
  const initialState = {
    connections: persistedState.connections || [...sampleConnections],
    users: [...sampleUsers],
    groups: persistedState.groups || [...sampleGroups],
    selectedConnection: null,
    selectedGroupId: null,
    activeTab: persistedState.activeTab || 'connections',
    alerts: [],
    widgets: []
  };

  const store = {
    ...createConnectionSlice(set, get),
    ...createAlertSlice(set),
    ...createUserSlice(set),
    ...createUISlice(set),
    ...createWidgetSlice(set),
    ...createGroupSlice(set, get),
    ...createRuleSlice(set, get),
    ...createAgenticSlice(set),
    ...createAPIToolboxSlice(set, get),
    ...createNotificationSlice(set),
    ...createFontSizeSlice(set, get),
    ...createColumnVisibilitySlice(set, get),
    ...createDetachedWindowSlice(set, get),
    ...createKeyboardShortcutsSlice(set, get),
    ...createRoleSlice(set, get),
    ...initialState,

    // Add a reset function to clear everything (useful for development/testing)
    reset: () => {
      localStorage.removeItem('appState');
      set({
        connections: [...sampleConnections],
        users: [...sampleUsers],
        groups: [...sampleGroups],
        selectedConnection: null,
        selectedGroupId: null,
        activeTab: 'connections',
        alerts: [],
        widgets: [],
        rules: [],
        evaluationResults: [],
        isEvaluating: false
      });
    }
  };

  // Load sample rules on initialization
  setTimeout(() => {
    store.loadSampleRules();
  }, 0);

  return store;
});

// Subscribe to state changes to persist to localStorage - moved outside of store creation
useStore.subscribe((state) => {
  persistState(state);
});