import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Breadcrumbs() {
  const router = useRouter();
  const breadcrumbs = router.pathname.split('/').slice(1);

  return (
    <div className="flex gap-2 items-center w-full">
      {breadcrumbs.map((breadcrumb, index) => (
        <div className="flex gap-2 items-center" key={index}>
          <Link href={`/${breadcrumbs.slice(0, index + 1).join('/')}/`}>
            <p
              className={`${
                index == breadcrumbs.length - 1 ? '' : 'text-gray-500'
              } hover:underline`}
            >
              {breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1)}
            </p>
          </Link>
          <p
            className={`${
              index == breadcrumbs.length - 1 ? 'hidden' : 'text-xl'
            }`}
          >
            /
          </p>
        </div>
      ))}
    </div>
  );
}
