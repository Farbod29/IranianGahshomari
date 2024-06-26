"use client";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Hamishe } from "../../public/fonts/fonts";
import Footer from "../components/Footer/Footer"; // Import Footer component
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // List of routes where you want to show the footer
  const footerRoutes = [
    '/',
    '/smallCalendarMobile',
    '/FarakhorMobileDark',
    '/gahshomaranDark',
    '/ExtraTools',
    '/AiGenerator',
    '/PhoneAppGahshomar',
  ];

  return (
    <html lang='en' className={`${Hamishe.variable}`}>
      <Head>
        <title>{String(metadata.title)}</title>
        <meta
          name='description'
          content={metadata.description || 'Default Description'}
        />
        {/* Add other meta tags here as needed */}
      </Head>
      <body className='Hamishe min-h-screen flex flex-col'>
        <main className='flex-grow'>{children}</main>
        {footerRoutes.includes(pathname) && <Footer />}{' '}
        {/* Conditionally render Footer */}
      </body>
    </html>
  );
}

function ClientOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const footerRoutes = [
    '/',
    '/smallCalendarMobile',
    '/FarakhorMobileDark',
    '/gahshomaranDark',
    '/ExtraTools',
    '/AiGenerator',
    '/PhoneAppGahshomar',
  ];

  return (
    <>
      {children}
      {footerRoutes.includes(pathname) && <Footer />}
    </>
  );
}
