'use client'

import { Montserrat } from "next/font/google";
import "@/app/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = "/myCabinet/studyPlatform";
  }, []);
  return;
}
