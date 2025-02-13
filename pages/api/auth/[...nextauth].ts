import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '../../../lib/prisma';

import { isMentor } from '@/lib/helpers/permission-helper';

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
          roles: true,
        },
      });

      if (!user) {
        return token;
      }

      const hasMentorRole = await isMentor(user);

      token.admin = user?.admin || false;
      token.mentor = hasMentorRole;
      return token;
    },
    session: async ({ session, token }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: token?.email || '',
        },
        include: {
          roles: true,
        },
      });

      if (!user) {
        return session;
      }

      const hasMentorRole = await isMentor(user);

      session.user.admin = user?.admin || false;
      session.user.mentor = hasMentorRole;

      console.log(user);
      return session;
    },
  },
});
