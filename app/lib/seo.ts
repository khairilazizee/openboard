export function getBaseUrl() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
}
