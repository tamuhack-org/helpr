import { withAuth } from 'next-auth/middleware';

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    async authorized({ req, token }) {
      const { pathname } = req.nextUrl;
      const roles = { isAdmin: false, isMentor: false };

      const response = await fetch(
        'https://helpr.tamuhack.org/api/users/getRoles?' +
          new URLSearchParams({
            email: token?.email || '',
          })
      );

      const data = await response.json();

      roles.isMentor = data.isMentor;
      roles.isAdmin = data.isAdmin;

      if (roles.isAdmin) {
        return true;
      }

      if (pathname === '/mentor' || pathname.includes('/dashboard')) {
        return roles.isMentor;
      }
      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/admin', '/mentor', '/', '/dashboard/:path*'],
};
