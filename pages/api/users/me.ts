import type { NextApiRequest, NextApiResponse } from "next";
import type { Message } from "../../../components/common/types";
import type { User, Users } from "../../../components/users/types";

const sampleUser1: User = {
  email: "testemail@gmail.com",
  name: "Test User",
  is_admin: false,
  is_mentor: true,
  is_silenced: false,
  time_created: "1",
};

/*
 * GET Request: Returns current user
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<User | Message>
) {
  if (req.method !== "GET") {
    res.status(405).send({ message: "Only GET requests allowed" });
    return;
  }

  res.status(200).json(sampleUser1);
}
