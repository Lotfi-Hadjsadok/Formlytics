'use client'
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  return (
    <Button 
      onClick={() => {
        authClient.signOut().then(() => {
          router.replace('/login');
        });
      }}
      variant="outline"
      className="w-full"
    >
      Sign Out
    </Button>
  );
}
