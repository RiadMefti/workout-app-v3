import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

// Protect all pages - users must be authenticated to access anything
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/login"], // Only login page is public
  },
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
