export function isAdminEmail(email: string | null | undefined) {
  const raw =
    process.env.ADMIN_EMAILS?.trim() ||
    process.env.PROJECTS_ADMIN_EMAIL?.trim() ||
    "";

  const adminEmails = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!email) return false;

  return adminEmails.includes(email.trim().toLowerCase());
}

/**
 * Alias por compatibilidad, por si en alguna parte antigua del proyecto
 * todavía estás usando el nombre anterior.
 */
export const isProjectsAdminEmail = isAdminEmail;