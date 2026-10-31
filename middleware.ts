import { next } from "@vercel/functions";
import { isAdmin, unauthorized } from "./api/_auth";

export const config = {
  // Only the admin price editor is protected
  matcher: ['/admin/prices'],
};

export default function middleware(request: Request) {
  return isAdmin(request) ? next() : unauthorized();
}
