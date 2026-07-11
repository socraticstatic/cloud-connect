// Load the model modules in dependency order; each extends window.CC.
import './state';
import './state-telemetry';
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
