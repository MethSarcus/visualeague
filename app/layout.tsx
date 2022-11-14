"use client";
import { ChakraProvider } from "@chakra-ui/react";
import { Analytics } from "@vercel/analytics/react";
import { useState } from "react";
import { Context } from "../contexts/Context";
import "../styles/globals.css";
import customTheme from "../theme/index";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [context, setContext] = useState({});
  return (
    <html lang="en">
      <body>
        {
          <Context.Provider value={[context, setContext]}>
            <ChakraProvider theme={customTheme}>
              {children}
              <Analytics />
            </ChakraProvider>
          </Context.Provider>
        }
      </body>
    </html>
  );
}
