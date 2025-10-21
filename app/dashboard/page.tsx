import { getUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { FormsTable } from "@/components/forms/FormsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getUser();

  if (!user?.organizationId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email}</h2>
          <p className="text-gray-600 mt-2">You need to be part of an organization to manage forms.</p>
        </div>
      </div>
    );
  }

  // Fetch forms for the user's organization
  const forms = await prisma.form.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      _count: {
        select: {
          entries: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.email}</h2>
          <p className="text-gray-600 mt-2">Here's what's happening with your forms today.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </Button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Forms</h3>
          <FormsTable forms={forms} />
        </div>
      </div>
    </div>
  );
}