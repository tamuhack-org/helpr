import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //make sure secrets exist
  const discordClientId = process.env.DISCORD_CLIENT_ID;
  const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
  if(!discordClientId || !discordClientSecret){
    res.status(500).json({error: "discord developer application client ID and client secret must be present in .env"});
    return;
  }

  //make sure logged in
  const token = await getToken({ req });
  if (!token || !token.email) {
    res.status(401).json({ error: 'Must be logged in via google before linking discord' });
    return;
  }

  //discord callback gives an authorization code
  const { code } = req.query;
  if (!code) {
    res.status(400).json({ error: 'No code provided' });
    return;
  }

  try {
    //after you get authorization code from discord get the access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback/discord`,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    //use access token to get user's ID
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
    });

    const discordId = userResponse.data.id;

    //seems redundant to get email then id
    //but thats how we did it before so im just sticking to it
    const user = await prisma.user.findUnique({
      where: {
        email: token?.email || '',
      },
    });
    if(!user){
      res.status(500).json({error: "Could not find user in DB"});
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { discordId: discordId },
    });

    //TODO: redirect to a success page?
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to link Discord account' });
  }
}
