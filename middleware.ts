import { withAuth } from 'next-auth/middleware';

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware

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

      let data = { isAdmin: false, isMentor: true };
      try {
        data = await response.json();
      } catch (e) {
        console.log('Middleware error', e);
      }

      if (data.isAdmin) {
        return true;
      }

      for (const path of mentorPaths) {
        if (pathname.includes(path)) {
          return data.isMentor;
        }
      }

      return !!token;
    },
  },
  pages: {
    signIn: '/login',
  },
});

//Paths to run this middleware on  (all paths that require a user to be signed in)
export const config = {
  matcher: ['/admin', '/mentor', '/', '/dashboard/:path*'],
};
