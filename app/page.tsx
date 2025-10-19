'use client'
import { PricingTier } from "@/constatnts/paddle-prices";
import { usePaddle } from "@/hooks/usePaddle";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function Home() {
  const { paddle,loading } = usePaddle(); 
  const { data:session } = authClient.useSession();
  return (
    <div>
      <h1>Pricing</h1>

    {loading ? (
      <div>Loading...</div>
    ) : (
      PricingTier.map((tier) => (
        <button onClick={()=>paddle?.Checkout.open({
      
          settings:{
            
            theme: "dark",
            allowLogout: false,
            successUrl: `${window.location.origin}/success`,
          },
          customData:{
            userId: session?.user?.id,
          },
          customer:{
            email: session?.user?.email as string,
          },
          items: [{
            priceId: tier.priceId.month,
            quantity: 1
          }],
        })} key={tier.id}>
          <p>{session?.user?.id}</p>
          <h2>{tier.name}</h2>
          <p>{tier.description}</p>
          <p>{tier.features.join(', ')}</p>
          <p>{tier.priceId.month}</p>
        </button>
      )))}
    </div>
  );
}
