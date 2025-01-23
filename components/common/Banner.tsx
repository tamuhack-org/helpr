import React from 'react';
import useSWR from 'swr';
import { fetcher } from '../../lib/common';

export const Banner = () => {
  const { data } = useSWR(`/api/events/active`, fetcher, {});

  const url = data?.event?.url ?? '#';
  const bannerText = data?.event?.bannerText ?? '';

  if (!bannerText) return <div></div>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${url ? '' : 'pointer-events-none'}`}
    >
      <div className="absolute flex justify-center items-center py-6 px-8 h-8 top-0 w-screen bg-blue-500 ">
        <p className="text-white font-bold">{bannerText}</p>
      </div>
    </a>
  );
};
