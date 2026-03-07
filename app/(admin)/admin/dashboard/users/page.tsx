import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import { ensureUserFromClerkId } from "../../../../lib/user";

export default async function AdminUsersPage() {
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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
              Users List
            </h1>
            <Link
              href="/admin/dashboard"
              className="rounded border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-[#1a1a1a]"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-solid border-black/[.08] bg-white dark:border-white/[.145] dark:bg-[#1a1a1a]">
            <table className="w-full min-w-[780px]">
              <thead>
                <tr className="border-b border-black/[.08] bg-zinc-50 text-left dark:border-white/[.145] dark:bg-[#2a2a2a]">
                  <th className="px-4 py-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Role
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Clerk ID
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-black/[.08] dark:border-white/[.145]"
                  >
                    <td className="px-4 py-3 text-sm text-black dark:text-zinc-50">
                      {item.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {item.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-black dark:text-zinc-50">
                      {item.isAdmin ? "Admin" : "User"}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="inline-block max-w-[260px] truncate align-bottom">
                        {item.clerkId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
