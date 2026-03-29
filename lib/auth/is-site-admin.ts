export function isSiteAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.SITE_ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail || !email) return false;

  return email.trim().toLowerCase() === adminEmail;
}