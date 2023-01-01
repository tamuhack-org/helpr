import type { NextApiRequest, NextApiResponse } from "next";
import type { Message } from "../../../../components/common/types";

/*
 * POST Request: Resolves ticket
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  res.status(200);
}
