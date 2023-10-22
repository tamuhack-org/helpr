import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    jwt: async ({ token }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: token?.email || '',
        },
        include: {
          ticket: true,
        },
      });
      token.admin = user?.admin || false;
      token.mentor = user?.mentor || false;
      return token;
    },
    session: async ({ session, token }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: token?.email || '',
        },
        include: {
          ticket: true,
        },
      });
      session.user.admin = user?.admin || false;
      session.user.mentor = user?.mentor || false;
      return session;
    },
  },
});
