import { withAuth } from 'next-auth/middleware';

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware

//paths to run this middleware on
const authPaths = ['/admin', '/mentor', '/', '/dashboard/:path*'];

//Root level paths that mentors have access to OVER regular users
//For example, "/" is accessible by mentors, but users can also access it, so we DO NOT include it.
const mentorPaths = ['/mentor', '/dashboard'];

export default withAuth({
  callbacks: {
    async authorized({ req, token }) {
      const { pathname } = req.nextUrl;

      if (!token || !token.email) {
        return false;
      }

      const response = await fetch(
        'https://helpr.tamuhack.org/api/users/getRoles?' +
          new URLSearchParams({
            email: token.email,
          })
      );

      const data = await response.json();

      if (data.isAdmin) {
        return true;
      }

      mentorPaths.forEach((path) => {
        if (pathname.includes(path)) {
          return data.isMentor;
        }
      });

      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: authPaths,
};
