import { withAuth } from 'next-auth/middleware';

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const roles = { isAdmin: false, isMentor: false };

      fetch(
        'https://helpr.tamuhack.org/api/users/getRoles' +
          new URLSearchParams({
            email: token?.email || '',
          })
      ).then((res) => {
        console.log(res.json());
      });

      if (roles.isAdmin) {
        return true;
      }

      if (
        req.nextUrl.pathname === '/mentor' ||
        req.nextUrl.pathname.includes('/dashboard')
      ) {
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
