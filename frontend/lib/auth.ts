export const roleDestinations: Record<string, string> = {
  student: "/home",
  mentor: "/home",
  "fye-teacher": "/home",
};

export const getRoleDestination = (role?: string): string => {
  if (!role) {
    return "/home";
  }

  const normalizedRole = role.toLowerCase();
  return roleDestinations[normalizedRole] || "/home";
};

