import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        return {
          id: `guest_${Date.now()}`,
          name: "Guest User",
          email: "guest@hyderabad.bits-pilani.ac.in",
          isGuest: true,
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      const email = user.email ?? ""
      const allowedDomain = "hyderabad.bits-pilani.ac.in"

      if (!email.endsWith(`@${allowedDomain}`)) {
        return false
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isGuest = user.isGuest
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isGuest = token.isGuest as boolean | undefined
      }
      return session
    }
  },
  events: {
    async signIn({ user, account }) {
      console.log("SIGNED IN:", user.email, account?.provider)
    },
  }


}
