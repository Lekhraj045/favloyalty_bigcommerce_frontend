import "@/styles/globals.css";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        style={{ paddingLeft: "240px" }}
        className={clsx(
          "min-h-screen font-sans antialiased bg-zinc-100 text-[13px] text-[#303030] transition-[padding-left] duration-300 ease-in-out",
          fontSans.variable,
        )}
      >
        <Providers>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="flex-grow p-4">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
