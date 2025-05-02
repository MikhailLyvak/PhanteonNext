'use client'

import { Montserrat } from "next/font/google";
import "@/app/globals.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStore } from "@/store/UserData/useUserStore";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-montserrat",
});

import InnerWhiteHeader from "./components/LayoutItems/components/Header/InnerWhiteHeader";

export default function Home() {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    if (user) {
      router.push("/myCabinet/studyPlatform");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className={`${montserrat.variable}`}>
      <InnerWhiteHeader />
    </div>
  );
}
