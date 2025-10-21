'use client'
import { PricingTier } from "@/constatnts/paddle-prices";
import { usePaddle } from "@/hooks/usePaddle";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import FormlyticsForm from "@/components/FormEmbded";

export default function Home() {
  const { paddle,loading } = usePaddle(); 
  const { data:session } = authClient.useSession();
  return (
   <div>
    <FormlyticsForm />
   </div>
  );
}

