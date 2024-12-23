import useSWR from 'swr';
import { fetcher } from '../common';

//Default settings when a HelpR instance is deployed.
//These settings can be changed in the admin dashboard and will add a key value pair to the Settings table in the DB
//Basically, when HelpR checks settings, it checks the DB first, then defaults to this const
//This is how Dripos does it and I hate it, but I think this is the best solution here
export const SETTINGS = {
  EVENT_ID: '',
  DISABLED: false,
};

export interface Settings {
  EVENT_ID: string;
  DISABLED: boolean;
}

export const useSettings = () => {
  const { data, error, isLoading } = useSWR<Settings>('/api/settings', fetcher);

  return {
    data,
    error,
    isLoading,
  };
};

export const fetchSetting = async <T extends keyof Settings>(
  key: T
): Promise<Settings[T]> => {
  return SETTINGS[key];
};
