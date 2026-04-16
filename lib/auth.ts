import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null
        if (credentials.password !== process.env.ADMIN_PASSWORD) return null
        return {
          id: '1',
          name: 'Admin',
          email: process.env.ADMIN_EMAIL ?? 'admin@dadsstore.com',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // 24 hours
  },
  pages: {
    signIn: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
