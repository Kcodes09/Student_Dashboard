import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email ?? ""
      const allowedDomain = "hyderabad.bits-pilani.ac.in"

      if (!email.toLowerCase().endsWith(`@${allowedDomain}`)) {
        return false
      }

      return true
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
