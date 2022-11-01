import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Context } from "../contexts/Context";
import { useState } from "react";
import { ChakraProvider } from '@chakra-ui/react'
import customTheme from "../theme/index";
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  const [context, setContext] = useState({});

  return <Context.Provider value={[context, setContext]}><ChakraProvider theme={customTheme}>
  <Component {...pageProps} /></ChakraProvider><Analytics /></Context.Provider>
}

export default MyApp
