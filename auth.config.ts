import type { NextAuthConfig } from "next-auth"

// Minimal edge-compatible config — used by the middleware (proxy.ts).
// Must NOT import prisma, bcrypt, or any Node-only modules.
export const authConfig = {
  pages:     { signIn: "/login", error: "/login" },
  session:   { strategy: "jwt" },
  secret:    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [],
  callbacks: {
    authorized() { return true },
  },
} satisfies NextAuthConfig
