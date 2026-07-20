// Load the model modules in dependency order; each extends window.CC.
import './state';
import './state-telemetry';
/* Groups must load BEFORE state-rules: flows() tags every flow with group
   membership via CC.groupsFor, and state-billing calls flows() at module load
   to freeze its steer baseline. Load groups later and that call throws into
   billing's try/catch, leaving the steer baseline silently empty. */
import './state-groups';
import './state-rules';
import './state-routing';
import './state-apps';
import './state-billing';
import './state-console';
import './state-findings';
import './state-share';
import './state-actions';
import type { CloudControl } from './types';

export const CC = (window as unknown as { CC: CloudControl }).CC;
export type { CloudControl } from './types';
