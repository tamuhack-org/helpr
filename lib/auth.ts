import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import prisma from "./prisma";
import verifyHMAC from "./verifyHMAC";


export enum BuzzCode {
  DiscordNotLinked = "DISCORD_NOT_LINKED",
  HasExistingTicket = "HAS_EXISTING_TICKET",
  AlreadyClaimedTicket = "TICKET_ALREADY_CLAIMED",
  TICKET_MISMATCH = "TICKET_MISMATCH",
}

//only status of 200 indicates authenticated
interface AuthResult {
  status: number,
  email?: string,
  code?: BuzzCode
}

export async function getAuthenticatedUserEmail(req: NextApiRequest): Promise<AuthResult> {
  //check browser for token
  const token = await getToken({ req });
  if (token?.email) return { status: 200, email: token.email }

  //TODO: hella redundancy here with db calls
  const { discordId } = req.body;
  if (!discordId) return { status: 400 };

  const user = await prisma.user.findUnique({
    where: {
      discordId: discordId,
    },
  });

  if (!user) return { status: 400, code: BuzzCode.DiscordNotLinked };

  const reqHmacSignature = req.headers['x-authorization-content-hmac'];
  const reqHmacTimestamp = req.headers['x-authorization-timestamp'];
  const hmacMatch = verifyHMAC(req.body, { signature: reqHmacSignature as string, timestamp: reqHmacTimestamp as string });
  if (!hmacMatch) return { status: 401 };

  return { status: 200, email: user.email };
}

