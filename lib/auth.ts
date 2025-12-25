import NextAuth, { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { type Session } from "next-auth"
import { type JWT } from "next-auth/jwt"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session
      token: JWT
    }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
