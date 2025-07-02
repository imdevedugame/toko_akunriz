import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import db from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  email: string
  name: string
  role: "user" | "reseller" | "admin"
  phone?: string
  balance: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const [rows] = await db.execute("SELECT id, email, name, role, phone, balance FROM users WHERE id = ?", [
      decoded.id,
    ])

    const users = rows as any[]
    return users.length > 0 ? users[0] : null
  } catch (error) {
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("token")?.value

  if (!token) return null
  return getUserFromToken(token)
}

export function requireAuth(roles?: string[]) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (roles && !roles.includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return user
  }
}
