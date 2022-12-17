import Head from 'next/head'
import { useSession, signIn, signOut } from "next-auth/react"
import Landing from '../components/Landing/Landing'
import { Inter } from '@next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { data: session } = useSession()

  if(!session) {
    return <Landing />
  }

  return (
    <>
      <Head>
        <title>HelpR</title>
        <meta name="description" content="Online Mentorship Queue For Hackathon Participants" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      HI
    </>
  )
}
