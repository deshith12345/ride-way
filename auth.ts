import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import type { Provider } from "next-auth/providers"

const providers: Provider[] = []

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  )
}

const otherProviders = authConfig.providers.filter(p => p.id !== "credentials" && p.id !== "google")

providers.push(
  ...otherProviders,
  CredentialsProvider({
    id: "credentials",
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Invalid credentials")
      }

      const user = await prisma.user.findUnique({
        where: {
          email: credentials.email as string,
        },
      })

      if (!user || !user.password) {
        throw new Error("Invalid credentials")
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      )

      if (!isPasswordValid) {
        throw new Error("Invalid credentials")
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    },
  })
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const email = user.email as string
          if (!email) return false

          const existingUser = await prisma.user.findUnique({
            where: { email },
          })

          if (existingUser) {
            user.role = existingUser.role
            user.id = existingUser.id
          } else {
            const cookieStore = await cookies()
            const intendedRole = cookieStore.get("intended_role")?.value || "TRAVELLER"
            
            // Manually pre-create the user with the correct role
            // so NextAuth/PrismaAdapter links the OAuth account to this user
            const newUser = await prisma.user.create({
              data: {
                email,
                name: user.name,
                image: user.image,
                role: (intendedRole.toUpperCase() as UserRole) || UserRole.TRAVELLER,
              }
            })
            
            user.role = newUser.role
            user.id = newUser.id
          }
        }
        return true
      } catch (error) {
        console.error("SignIn Callback Error:", error)
        return false
      }
    },
  },
})

