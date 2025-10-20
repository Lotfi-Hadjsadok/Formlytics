import PlansTable from "@/components/plans/PlansTable";
import { Organization, User } from "@/generated/prisma";
import { getUser } from "@/lib/auth";

export default async function PlansPage() {
   const user = await getUser({ organization: true });
  if (!user) {
    return <div>Please sign in to view pricing plans.</div>;
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="w-full max-w-6xl mx-auto">
      <PlansTable user={user as User & { organization: Organization | null }} />
      </div>
    </div>
  );
}
