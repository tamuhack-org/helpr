export type Ticket = {
  time_opened: string;
  time_claimed?: string;
  time_resolved?: string;
  time_last_updated?: string;
  description: string;
  location: string;
  contact: string;
  review_description?: string;
  review_stars?: number;
  author: string;
  claimant?: string;
};

export type Tickets = {
  data: Ticket[];
};
