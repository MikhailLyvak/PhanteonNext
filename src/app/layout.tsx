import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import Footer from "./components/LayoutItems/Footer";
import LoginModal from "./components/Auth/AuthModal";
import QueryProvider from "@/providers/QueryProvider";
import Drawer from "./components/HeaderComps/Drawer";
import MainDrawer from "./components/HeaderComps/Drawers/MainDrawer";
import InnerWhiteHeader from "./components/LayoutItems/components/Header/InnerWhiteHeader";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "PantheonX",
  description: "PantheonX crypto dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/Header/LogoColoredSmall.svg" />
      </head>
      <body
        className={`bg-[#171723] antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <InnerWhiteHeader />
          <LoginModal />
          <Drawer />
          <MainDrawer />
          <main className="flex-1 pt-1 md:pt-2">
            {children}
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
