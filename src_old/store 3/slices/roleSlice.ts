import { StateCreator } from 'zustand';

export type UserRole = 'user' | 'admin' | 'super-admin';

export interface ImpersonationState {
  isImpersonating: boolean;
  targetUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  originalUser: {
    name: string;
    email: string;
    role: UserRole;
  } | null;
  startTime: string | null;
}

export interface RoleSlice {
  currentRole: UserRole;
  impersonation: ImpersonationState;
  setRole: (role: UserRole) => void;
  startImpersonation: (targetUser: { id: string; name: string; email: string; role: UserRole }) => void;
  exitImpersonation: () => void;
}

export const createRoleSlice: StateCreator<RoleSlice> = (set, get) => ({
  currentRole: 'admin',
  impersonation: {
    isImpersonating: false,
    targetUser: null,
    originalUser: null,
    startTime: null,
  },

  setRole: (role) => {
    set({ currentRole: role });
    window.addToast?.({
      type: 'info',
      title: 'Role Changed',
      message: `Now viewing as ${role === 'super-admin' ? 'Super Admin' : role === 'admin' ? 'Tenant Admin' : 'Standard User'}`,
      duration: 3000,
    });
  },

  startImpersonation: (targetUser) => {
    const currentState = get();
    set({
      impersonation: {
        isImpersonating: true,
        targetUser,
        originalUser: {
          name: 'Emilio Estevez',
          email: 'emilio.estevez@att.com',
          role: currentState.currentRole,
        },
        startTime: new Date().toISOString(),
      },
      currentRole: targetUser.role,
    });

    window.addToast?.({
      type: 'info',
      title: 'Impersonation Started',
      message: `Now viewing as ${targetUser.name}`,
      duration: 4000,
    });
  },

  exitImpersonation: () => {
    const currentState = get();
    const originalRole = currentState.impersonation.originalUser?.role || 'admin';

    set({
      impersonation: {
        isImpersonating: false,
        targetUser: null,
        originalUser: null,
        startTime: null,
      },
      currentRole: originalRole,
    });

    window.addToast?.({
      type: 'success',
      title: 'Impersonation Ended',
      message: 'Returned to your account',
      duration: 3000,
    });
  },
});
