import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { verifyPassword } from './password';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
        turnstileToken: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });

        if (!user || !user.password) return null;

        const ok = await verifyPassword(
          String(credentials.password),
          user.password,
        );

        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          color: user.color,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id;
      }

      if (user) {
        token.image = user.image;
        token.color = user.color;
      }

      return token;
    },
    session({ session, token }) {
      if (!session.user) {
        return session;
      }

      if (typeof token.id === 'string') {
        session.user.id = token.id;
      }

      if (typeof token.image === 'string' || token.image === null) {
        session.user.image = token.image;
      }

      if (typeof token.color === 'string' || token.color === null) {
        session.user.color = token.color;
      }

      return session;
    },
  },
});
