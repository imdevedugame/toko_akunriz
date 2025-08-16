import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/products",
  "/services",
  "/about",
  "/contact",
  "/auth/login",
  "/auth/register",
  "/auth/admin-login",
  "/unauthorized",
  "/not-found",
  "/payment/success",
  "/payment/pending",
  "/payment/failed",
  // Tambahkan rute webhook Xendit secara eksplisit sebagai rute publik
  // Meskipun sudah ada pengecualian startsWith("/api/"), ini untuk memastikan
  // tidak ada logika middleware lain yang mengganggu.
  "/api/webhooks/xendit",
]

// Routes that require admin role
const adminRoutes = ["/admin"]

// Auth routes that should redirect if already logged in
const authRoutes = ["/auth/login", "/auth/register", "/auth/admin-login"]

// Protected routes that require authentication
const protectedRoutes = ["/profile", "/history"]

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  // Explicitly allow Xendit webhook to bypass all authentication/authorization
  // Ini adalah baris baru yang ditambahkan untuk memastikan webhook Xendit tidak terblokir.
  if (pathname === "/api/webhooks/xendit") {
    return NextResponse.next()
  }

  // Skip middleware for other API routes, static files, and images
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  let user = null
  if (token) {
    user = await verifyToken(token)
  }

  // Handle auth routes - redirect if already logged in
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      // Redirect based on role
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else {
        return NextResponse.redirect(new URL("/", request.url))
      }
    }
    return NextResponse.next()
  }

  // Handle public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route))) {
    const response = NextResponse.next()

    // Inject user info for API routes
    if (user) {
      response.headers.set("x-user-id", user.id as string)
      response.headers.set("x-user-role", user.role as string)
      response.headers.set("x-user-email", user.email as string)
    }

    return response
  }

  // Handle protected routes - require authentication
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Handle admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      const loginUrl = new URL("/auth/admin-login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // For any other protected route, check authentication
  if (!user && !publicRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Inject user info into headers for API routes
  const response = NextResponse.next()
  if (user) {
    response.headers.set("x-user-id", user.id as string)
    response.headers.set("x-user-role", user.role as string)
    response.headers.set("x-user-email", user.email as string)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
