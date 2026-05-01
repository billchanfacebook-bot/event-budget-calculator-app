export const publicRoutes = ["/", "/login", "/forgot-password", "/update-password", "/auth/callback"];
export const authRoutes = ["/login", "/forgot-password"];

export function isPublicRoute(pathname: string) {
  return publicRoutes.includes(pathname);
}

export function isAuthRoute(pathname: string) {
  return authRoutes.includes(pathname);
}
