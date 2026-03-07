import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { ensureUserFromClerkId } from "../../../lib/user";

export default async function AdminDashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const user = await ensureUserFromClerkId(clerkId);

  const isAllowedAdmin =
    user.isAdmin && user.email.toLowerCase() === "khairil114@gmail.com";

  if (!isAllowedAdmin) {
    redirect("/");
  }

  const totalUsers = await prisma.user.count();
  const totalAds = await prisma.ads.count();
  const activeAds = await prisma.ads.count({
    where: { status: "ACTIVE" },
  });
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="mb-8 text-3xl font-semibold text-black dark:text-zinc-50">
            Admin Dashboard
          </h1>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Users
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                {totalUsers}
              </p>
            </div>

            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Total Ads
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                {totalAds}
              </p>
            </div>

            <div className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Active Ads
              </p>
              <p className="mt-2 text-3xl font-semibold text-black dark:text-zinc-50">
                {activeAds}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/admin/dashboard/ads"
              className="rounded-lg border border-solid border-black/[.08] bg-white p-6 transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-[#1a1a1a] dark:hover:bg-[#242424]"
            >
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                Manage Ads
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Edit schedule, ranking, and ad status.
              </p>
            </Link>

            <Link
              href="/admin/dashboard/users"
              className="rounded-lg border border-solid border-black/[.08] bg-white p-6 transition-colors hover:bg-zinc-100 dark:border-white/[.145] dark:bg-[#1a1a1a] dark:hover:bg-[#242424]"
            >
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                View Users
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Read-only users list and role visibility.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
