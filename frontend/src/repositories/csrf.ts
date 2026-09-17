// Django sets the csrftoken cookie in response to GET /api/admin/session/
// (see backend/content/views.py AdminSessionView) — readable by JS by design,
// unlike the session cookie itself, so it can be echoed back as a header.
export function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}
