// Role mapping utilities
// Maps frontend role names to backend role names
export const mapFrontendToBackendRole = (frontendRole: string | null | undefined): string => {
  if (!frontendRole) return "student";
  
  const normalized = frontendRole.toLowerCase();
  switch (normalized) {
    case "student":
      return "student";
    case "mentor":
    case "peer_mentor":
      return "peer_mentor";
    case "fye-teacher":
    case "fye_teacher":
      return "fye_teacher";
    case "admin":
      return "admin";
    default:
      return "student";
  }
};

// Maps backend role names to frontend display names
export const mapBackendToFrontendRole = (backendRole: string | null | undefined): string => {
  if (!backendRole) return "student";
  
  const normalized = backendRole.toLowerCase();
  switch (normalized) {
    case "student":
      return "student";
    case "peer_mentor":
      return "mentor";
    case "fye_teacher":
      return "fye-teacher";
    case "admin":
      return "admin";
    default:
      return "student";
  }
};

// Role display names
export const getRoleDisplayName = (role: string | null | undefined): string => {
  if (!role) return "User";
  
  const normalized = role.toLowerCase();
  switch (normalized) {
    case "student":
      return "Student";
    case "mentor":
    case "peer_mentor":
      return "Peer Mentor";
    case "fye-teacher":
    case "fye_teacher":
      return "FYE Instructor";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
};

// Role destinations for routing
export const roleDestinations: Record<string, string> = {
  student: "/home",
  mentor: "/home",
  "fye-teacher": "/home",
  admin: "/admin/dashboard",
  // Also support backend role names
  peer_mentor: "/home",
  fye_teacher: "/home",
};

export const getRoleDestination = (role?: string): string => {
  if (!role) {
    return "/home";
  }

  const normalizedRole = role.toLowerCase();
  // Try direct match first
  if (roleDestinations[normalizedRole]) {
    return roleDestinations[normalizedRole];
  }
  
  // Try mapping backend role to frontend role
  const frontendRole = mapBackendToFrontendRole(role);
  return roleDestinations[frontendRole] || "/home";
};

