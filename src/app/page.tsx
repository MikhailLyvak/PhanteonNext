'use client'

import { Montserrat } from "next/font/google";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

import InnerWhiteHeader from "./components/LayoutItems/components/Header/InnerWhiteHeader";

export default function Home() {

  return (
    <div className={`${montserrat.variable}`}>
      <InnerWhiteHeader />
    </div>
  );
}
