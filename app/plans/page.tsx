import PlansTable from "@/components/plans/PlansTable";
import { Customers, User } from "@/generated/prisma";
import { getUser } from "@/lib/auth";
import { headers } from "next/headers";

export default async function PlansPage() {
   const user = await getUser({ customer: true });
  if (!user) {
    return <div>Please sign in to view pricing plans.</div>;
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-6xl mx-auto">
      <PlansTable user={user as User & { customer: Customers }} />
      </div>
    </div>
  );
}
