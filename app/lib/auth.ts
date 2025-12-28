import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

 callbacks: {
  async signIn({ user, account }) {
    const email = user.email ?? ""
    const allowedDomain = "hyderabad.bits-pilani.ac.in"

    if (!email.endsWith(`@${allowedDomain}`)) {
      return false
    }

    // ✅ allow account relinking during dev
    return true
  },
},
events: {
  async signIn({ user, account }) {
    // optional logging
    console.log("SIGNED IN:", user.email, account?.provider)
  },
}


}
