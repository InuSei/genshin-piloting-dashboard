import { next } from "@vercel/functions";

export const config = {
  // Only the admin price editor is protected
  matcher: ['/admin/prices'],
};

export default function middleware(request: Request) {
  const auth = request.headers.get("authorization");

  if (auth?.startsWith("Basic ")) {
    try {
      const [user, pass] = atob(auth.slice(6)).split(":");
      if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
        return next();
      }
    } catch {
      // malformed header → treat as unauthenticated
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Zapolyarny Bureau Admin"' },
  });
}