export function isAdminEmail(email?: string | null) {
  if (!email) return false;

  const adminEmailList = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return adminEmailList.includes(email.toLowerCase());
}
