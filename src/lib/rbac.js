/**
 * CrisisChain — Role-Based Access Control (RBAC) Constants & Helpers
 * 
 * Roles:
 *   'user'     → Public citizens. Can report incidents only.
 *   'official' → Responders (police, fire, medical). Can view/manage live incidents.
 *   'admin'    → Full system control. Analytics, resources, settings, user management.
 */

// ── ROLE CONSTANTS ──
export const ROLES = {
  USER: 'user',
  OFFICIAL: 'official',
  ADMIN: 'admin',
};

// ── ROUTE → MINIMUM ROLE MAPPING ──
// Defines which roles can access each route.
// 'null' means any authenticated user can access.
export const ROUTE_ACCESS = {
  '/':          null,              // Public
  '/login':     null,              // Public
  '/register':  null,              // Public
  '/report':    [ROLES.USER, ROLES.OFFICIAL, ROLES.ADMIN],  // All authenticated
  '/dashboard': [ROLES.OFFICIAL, ROLES.ADMIN],
  '/alerts':    [ROLES.OFFICIAL, ROLES.ADMIN],
  '/resources': [ROLES.ADMIN],
  '/analytics': [ROLES.ADMIN],
  '/settings':  [ROLES.ADMIN],
};

// ── PERMISSION CONSTANTS ──
export const PERMISSIONS = {
  // Incident actions
  REPORT_INCIDENT:    'report_incident',
  VIEW_ALL_INCIDENTS: 'view_all_incidents',
  UPDATE_STATUS:      'update_status',
  DELETE_INCIDENT:    'delete_incident',

  // Resource actions
  VIEW_RESOURCES:     'view_resources',
  ADD_RESOURCE:       'add_resource',
  DELETE_RESOURCE:    'delete_resource',

  // Organization actions
  MANAGE_ORGS:        'manage_orgs',

  // User management
  MANAGE_USERS:       'manage_users',

  // Analytics
  VIEW_ANALYTICS:     'view_analytics',

  // Settings
  MANAGE_SETTINGS:    'manage_settings',
};

// ── ROLE → PERMISSIONS MAP ──
const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.REPORT_INCIDENT,
  ],
  [ROLES.OFFICIAL]: [
    PERMISSIONS.REPORT_INCIDENT,
    PERMISSIONS.VIEW_ALL_INCIDENTS,
    PERMISSIONS.UPDATE_STATUS,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.REPORT_INCIDENT,
    PERMISSIONS.VIEW_ALL_INCIDENTS,
    PERMISSIONS.UPDATE_STATUS,
    PERMISSIONS.DELETE_INCIDENT,
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.ADD_RESOURCE,
    PERMISSIONS.DELETE_RESOURCE,
    PERMISSIONS.MANAGE_ORGS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
};

// ── HELPER FUNCTIONS ──

/**
 * Check if a given role has a specific permission.
 * @param {string} role - 'user' | 'official' | 'admin'
 * @param {string} permission - One of PERMISSIONS constants
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

/**
 * Check if a role can access a given route path.
 * @param {string} role - 'user' | 'official' | 'admin'
 * @param {string} path - Route path (e.g., '/dashboard')
 * @returns {boolean}
 */
export function canAccessRoute(role, path) {
  const allowed = ROUTE_ACCESS[path];
  if (allowed === null || allowed === undefined) return true; // Public route
  return allowed.includes(role);
}

/**
 * Get the user-facing label for a role.
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  switch (role) {
    case ROLES.ADMIN:    return 'ADMIN';
    case ROLES.OFFICIAL: return 'OFFICIAL';
    case ROLES.USER:     return 'USER';
    default:             return 'UNKNOWN';
  }
}

/**
 * Get the accent color for a role badge.
 * @param {string} role
 * @returns {string}
 */
export function getRoleColor(role) {
  switch (role) {
    case ROLES.ADMIN:    return '#ef4444';
    case ROLES.OFFICIAL: return '#3b82f6';
    case ROLES.USER:     return '#00FFCC';
    default:             return '#6b7280';
  }
}

/**
 * Resolve a user-selected signup role string to the system role value.
 * @param {string} uiRole - The display role selected during signup
 * @returns {string} - The system role ('user', 'official', or 'admin')
 */
export function resolveSignupRole(uiRole) {
  switch (uiRole) {
    case 'Hospital / Medical':
    case 'Government Official':
      return ROLES.OFFICIAL;
    case 'Civilian / Victim':
    default:
      return ROLES.USER;
  }
}

/**
 * Get the default redirect path for a role after login.
 * @param {string} role
 * @returns {string}
 */
export function getDefaultRoute(role) {
  switch (role) {
    case ROLES.ADMIN:    return '/dashboard';
    case ROLES.OFFICIAL: return '/dashboard';
    case ROLES.USER:     return '/report';
    default:             return '/';
  }
}

/**
 * Filter sidebar navigation items based on role.
 * @param {Array} navItems - Array of { id, path, ... }
 * @param {string} role - Current user role
 * @returns {Array} Filtered navigation items
 */
export function filterNavByRole(navItems, role) {
  return navItems.filter(item => canAccessRoute(role, item.path));
}
