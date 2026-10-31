// Shared by middleware.ts (admin page) and api/prices.ts (price saves).
// The leading underscore keeps Vercel from turning this file into a route.

export function isAdmin(request: Request): boolean {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Basic ")) return false;

  try {
    const [user, pass] = atob(auth.slice(6)).split(":");
    return user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS;
  } catch {
    // malformed header → treat as unauthenticated
    return false;
  }
}

export function unauthorized(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Zapolyarny Bureau Admin"' },
  });
}
