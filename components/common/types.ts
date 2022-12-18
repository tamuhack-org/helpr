import type { User } from "../users/types";


export type Message = {
  message: string;
}

export type NavProps = {
  page: string,
  user?: User,
}