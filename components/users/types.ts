export type User = {
  email: string;
  name: string;
  is_admin: boolean;
  is_mentor: boolean;
  is_silenced: boolean;
  time_created: string;
  currently_opened_ticket_id?: string;
  currently_claimed_ticket_id?: null;
};

export type Users = {
  data: User[];
};
