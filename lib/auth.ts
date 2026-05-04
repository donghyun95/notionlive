import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { verifyPassword } from './password';
import { prisma } from './prisma';
import { initializeUserByEmail } from '@/server/users/queries';

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
  events: {
    async createUser({ user }) {
      if (user.email) {
        await initializeUserByEmail(user.email);
      }
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        // 이미 이메일로 가입된 유저가 있는데
        if (existingUser?.password !== null) {
          // 👉 1. 그냥 막기

          return '/login?error=EMAIL_ALREADY_EXISTS';
          // 👉 2. 또는 연결 허용 (더 일반적)
          // 그냥 true 리턴하면 adapter가 account 연결 시도
        }
      }

      return true;
    },

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
