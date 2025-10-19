'use client'
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
export default function DashboardPage() {
  const router = useRouter();
  const { data:session, isPending } = authClient.useSession();
  return (
    <div>
        <h1>Dashboard</h1>
        {isPending ? <p>Loading...</p> : <p>{session?.user?.email}</p>}
    <Button onClick={()=>{
       authClient.signOut().then(()=>{
        router.replace('/login');
       });
    }}>Sign Out</Button>
    </div>
  );
}