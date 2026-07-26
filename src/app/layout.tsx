import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {

  title: "Zensa HMS",

  description:
    "Hospital Management System"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (

    <html lang="en">

      <body
        className="
          min-h-screen
          bg-slate-100
          text-slate-900
        "
      >
        {children}
      </body>

    </html>
  );
}