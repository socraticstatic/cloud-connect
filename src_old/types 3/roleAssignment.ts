import { Role, Permission } from './permissions';
import { ScopePath, ResourceFilter } from './scope';

/**
 * Role Assignment - The core of RBAC
 *
 * A role assignment grants a principal (user/group) a role at a specific scope.
 * The role determines WHAT permissions they have.
 * The scope determines WHERE those permissions apply.
 * Optional filters determine WHICH resources they can access.
 */

export type PrincipalType = 'user' | 'group' | 'service';

export interface RoleAssignment {
  id: string;

  // Who is being granted the role
  principalId: string;
  principalType: PrincipalType;
  principalName?: string;

  // What role are they being assigned
  role: Role;

  // Where does this role apply (hierarchical scope path)
  scope: ScopePath;

  // Optional conditions
  conditions?: RoleAssignmentConditions;

  // Metadata
  assignedBy?: string;
  assignedAt: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked';

  // Audit
  revokedBy?: string;
  revokedAt?: Date;
  revokeReason?: string;
}

export interface RoleAssignmentConditions {
  // Further limit which resources can be accessed
  resourceFilter?: ResourceFilter;

  // Department/Pool membership requirements
  requireDepartments?: string[];
  requirePools?: string[];

  // Security requirements
  requiresMFA?: boolean;
  requiresApproval?: boolean;

  // Time-based conditions
  timebound?: {
    start: Date;
    end: Date;
  };

  // IP-based restrictions
  allowedIPs?: string[];
  deniedIPs?: string[];

  // Custom conditions
  customConditions?: Record<string, any>;
}

export interface RoleAssignmentRequest {
  principalId: string;
  principalType: PrincipalType;
  role: Role;
  scope: ScopePath;
  conditions?: RoleAssignmentConditions;
  justification: string;
  requestedBy: string;
  requestedAt: Date;
}

export interface RoleAssignmentApproval {
  assignmentId: string;
  approvedBy: string;
  approvedAt: Date;
  comments?: string;
  approved: boolean;
}

// Helper to check if an assignment is currently active
export function isAssignmentActive(assignment: RoleAssignment): boolean {
  if (assignment.status !== 'active') return false;

  const now = new Date();

  // Check expiration
  if (assignment.expiresAt && assignment.expiresAt < now) {
    return false;
  }

  // Check timebound conditions
  if (assignment.conditions?.timebound) {
    const { start, end } = assignment.conditions.timebound;
    if (now < start || now > end) {
      return false;
    }
  }

  return true;
}

// Helper to get all permissions from an assignment
export function getAssignmentPermissions(assignment: RoleAssignment): Permission[] {
  const { ROLE_PERMISSIONS } = require('./permissions');
  return ROLE_PERMISSIONS[assignment.role] || [];
}

// Helper to check if assignment covers a specific scope path
export function assignmentCoversScope(
  assignment: RoleAssignment,
  targetScope: ScopePath
): boolean {
  const { ScopePathBuilder } = require('./scope');
  return ScopePathBuilder.isParentOf(assignment.scope, targetScope);
}

// Helper to get effective resource filter from assignment
export function getEffectiveFilter(assignment: RoleAssignment): ResourceFilter {
  if (assignment.conditions?.resourceFilter) {
    return assignment.conditions.resourceFilter;
  }

  const { ROLE_DEFAULT_FILTER } = require('./permissions');
  return ROLE_DEFAULT_FILTER[assignment.role];
}
