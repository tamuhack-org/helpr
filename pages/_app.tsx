//https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts

import '../styles/globals.css';

import type { AppProps } from 'next/app';
import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';

import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Analytics } from '@vercel/analytics/react';

export type NextPageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const AnyComponent = Component;

  return getLayout(
    <ChakraProvider
      toastOptions={{
        defaultOptions: {
          position: 'bottom-right',
          isClosable: true,
          duration: 3000,
        },
      }}
    >
      <SessionProvider session={pageProps.session}>
        <AnyComponent {...pageProps} />
        <Analytics />
      </SessionProvider>
    </ChakraProvider>
  );
}
