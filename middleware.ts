import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// Protected routes that require authentication
const protectedRoutes = ["/admin", "/history", "/profile", "/dashboard"]

// Admin only routes
const adminRoutes = ["/admin"]

// Auth routes (redirect if already logged in)
const authRoutes = ["/auth/login", "/auth/register", "/auth/admin-login"]

// Public routes that don't require authentication
const publicRoutes = ["/", "/products", "/services", "/about", "/contact", "/payment", "/unauthorized"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and certain API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/products") ||
    pathname.startsWith("/api/services") ||
    pathname.startsWith("/api/categories") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/upload")
  ) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname === route)
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // If accessing auth routes while logged in, redirect to appropriate dashboard
  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const user = payload as any

      if (user.role === "admin" && pathname === "/auth/admin-login") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (user.role !== "admin" && (pathname === "/auth/login" || pathname === "/auth/register")) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (error) {
      // Invalid token, clear it and continue to auth page
      const response = NextResponse.next()
      response.cookies.delete("token")
      return response
    }
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If token exists, verify it
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      const user = payload as any

      // Check admin access
      if (isAdminRoute && user.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", user.id.toString())
      requestHeaders.set("x-user-role", user.role)
      requestHeaders.set("x-user-email", user.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error("JWT verification failed:", error)

      // Invalid token, clear it and redirect to login if accessing protected route
      const response = isProtectedRoute
        ? NextResponse.redirect(new URL("/auth/login", request.url))
        : NextResponse.next()

      response.cookies.delete("token")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes that don't need middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|api/products|api/services|api/categories|api/webhooks|api/upload|_next/static|_next/image|favicon.ico).*)",
  ],
}
