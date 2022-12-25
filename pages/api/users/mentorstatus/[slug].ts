import type { NextApiRequest, NextApiResponse } from "next";
import type { Message } from "../../../../components/common/types";

/*
 * POST Request: Makes user a mentor
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Message>
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  const { userID } = req.query;
  res.status(200);
}
