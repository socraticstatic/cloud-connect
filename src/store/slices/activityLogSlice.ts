import { StateCreator } from 'zustand';

/**
 * Durable customer activity history (GA requirement): every lifecycle event,
 * timestamped, with the acting admin. "A toast that disappears is not a record."
 * Security events (e.g. a key rejected by AWS) land here too.
 */

export type ActivityEventType =
  | 'created'
  | 'key-generated'
  | 'key-accepted'
  | 'live'
  | 'healed'
  | 'key-uploaded'
  | 'bandwidth-changed'
  | 'expired'
  | 'deleted'
  | 'security';

export interface ActivityEvent {
  at: string;            // ISO timestamp
  admin: string;         // acting admin (accountability — access is admin-only)
  connectionId?: string;
  type: ActivityEventType;
  message: string;
}

export interface ActivityLogSlice {
  activityEvents: ActivityEvent[];
  logActivity: (e: Omit<ActivityEvent, 'at' | 'admin'>) => void;
}

function currentAdmin(): string {
  try {
    const raw = localStorage.getItem('att_nb_user');
    if (raw) {
      const u = JSON.parse(raw);
      return u?.email || u?.name || 'admin';
    }
  } catch { /* fall through */ }
  return 'admin';
}

export const createActivityLogSlice: StateCreator<ActivityLogSlice> = (set) => ({
  activityEvents: [],
  logActivity: (e) =>
    set((state) => ({
      activityEvents: [
        { ...e, at: new Date().toISOString(), admin: currentAdmin() },
        ...state.activityEvents,
      ],
    })),
});
