export function isProjectsAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.PROJECTS_ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail || !email) return false;

  return email.trim().toLowerCase() === adminEmail;
}