import axios from 'axios';

export type Nullable<T> = T | null;

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);
