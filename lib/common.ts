import axios from 'axios';
import dayjs from 'dayjs';

export type Nullable<T> = T | null;

export const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const getTimeDifferenceString = (time: Date) => {
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
};

export const phoneNumberRegex =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

export const maxIssueLength = 80;
export const maxLocationLength = 60;
export const maxPhoneLength = 20;
