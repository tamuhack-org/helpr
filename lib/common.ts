import axios from 'axios';
import dayjs from 'dayjs';

export type Nullable<T> = T | null;

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export function getTimeDifferenceString(time: Date) {
  const formattedTime = dayjs(time);
  let difference = Date.now() - formattedTime.valueOf();
  difference = difference / 1000;
  if (difference < 3600) {
    return `${Math.round(difference / 60)} min`;
  } else if (difference < 86400) {
    return `${Math.round(difference / 3600)} h`;
  } else {
    return `${Math.round(difference / 86400)} d`;
  }
}
