# HelpR

## What is HelpR?

HelpR is an [_open-source_](https://github.com/tamuhack-org/helpr) mentorship queue software built by TAMUhack. It allows for two basic functionalities:

1. Participants can submit tickets to a central queue. These tickets contain information about the issue,
   the participant location, and contact information.
2. Mentors can claim tickets that they have are comfortable handling. With HelpR, they can easily locate the participant and provide assistance.

Our goal was to keep the software as easy to use as possible for both participants and mentors.

|                     Home                      |                   Mentor View                   |
| :-------------------------------------------: | :---------------------------------------------: |
| ![](./public/images/mentoring/helpr-home.png) | ![](./public/images/mentoring/helpr-mentor.png) |

## HelpR Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [TailwindCSS](https://tailwindcss.com/)
- **Database**: PostgresSQL, [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth](https://next-auth.js.org/), Google Auth

## Quick Start

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftamuhack-org%2Fhelpr&env=NEXTAUTH_URL,NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,DATABASE_PRISMA_URL&envDescription=Necessary%20Environment%20Variables%20for%20Auth%20and%20DB.%20See%20link%20for%20more%20info%20about%20NextAuth%20variables&envLink=https%3A%2F%2Fnext-auth.js.org%2Fconfiguration%2Foptions)

Deploy to Vercel with only a few clicks. Vercel will ask for information about the necessary environment variables.

# Running HelpR Locally

## Getting Started

Getting HelpR up and running locally is pretty easy!

First, clone/fork [the repo](https://github.com/tamuhack-org/helpr) and install the dependencies:

```bash
$ git clone https://github.com/tamuhack-org/helpr.git
$ cd helpr
$ yarn
```

Then, create a `.env` file in the root of the project and add the following:

```bash filename=".env" copy
NEXT_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_PRISMA_URL=
```

See more information about these variables below.

Finally, run the development server:

```bash
$ yarn dev
```

## Environment Variables

#### NEXT_URL

Obtained by using the URL of the locally hosted site,
appended with `/api/auth`. Learn more from the [NextAuth Docs.](https://next-auth.js.org/configuration/options)\
Example: `NEXT_URL="http://localhost:3000/api/auth"`

#### NEXTAUTH_SECRET

A random string used to hash tokens, sign/encrypt cookies and generate cryptographic keys.
Learn more from the [NextAuth Docs.](https://next-auth.js.org/configuration/options)

Generate with openssl in the terminal:

```bash
$ openssl rand -base64 32
```

Example: `NEXTAUTH_SECRET=aBh15h3KSq/I5tH3C00135t/CY6UMGun=`

#### GOOGLE_CLIENT_ID

Follow these steps to obtain this information:

1. Create a new Google Cloud Project.
2. Create credentials for a new OAuth 2.0 Client ID.
3. Set the Application Type as Web Application and choose any name.
4. Add `http://localhost:3000` as an Authorized JavaScript origin.
5. Add `http://localhost:3000/api/auth/callback/google` as an Authorized redirect URI.
6. Save the configuration. Once created, you can view the Client ID and Client Secret.

<Callout type="info" emoji="💡">
For deploying the app, simply add new authorized Javascript origins and redirect URIs,
switching out `localhost:3000` with the canonical URL of the deployment.
</Callout>

#### GOOGLE_CLIENT_SECRET

Follow the above steps 👆

#### DATABASE_PRISMA_URL

The PostgreSQL database URL. A PostgreSQL database can be hosted on many platforms, including Heroku, AWS, and Vercel.
We recommend Vercel because it's free and easy to set up.

Example: `DATABASE_PRISMA_URL="postgresql://postgres:password@localhost:5432/vercel?pgbouncer=true&connect_timeout=15"`
