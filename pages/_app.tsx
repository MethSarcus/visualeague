import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Context } from "../contexts/Context";
import { useState } from "react";
import { ChakraProvider } from '@chakra-ui/react'
import customTheme from "../theme/index";

function MyApp({ Component, pageProps }: AppProps) {
  const [context, setContext] = useState("default context value");

  return <Context.Provider value={[context, setContext]}><ChakraProvider theme={customTheme}>
  <Component {...pageProps} /></ChakraProvider></Context.Provider>
}

export default MyApp
