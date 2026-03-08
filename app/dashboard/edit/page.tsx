import { prisma } from "../../lib/prisma";
import { updateAd, deleteAd } from "../../lib/actions";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ConfirmDeleteButton } from "../../components/ConfirmDeleteButton";

const categories = [
  { value: "MARKETPLACE", label: "Marketplace" },
  { value: "SERVICES", label: "Services" },
  { value: "JOBS", label: "Jobs" },
  { value: "PROPERTY", label: "Property" },
  { value: "VEHICLE", label: "Vehicle" },
  { value: "BUSINESSES", label: "Businesses" },
  { value: "REQUESTS", label: "Requests" },
  { value: "EVENTS", label: "Events" },
  { value: "COMMUNITY", label: "Community" },
  { value: "DEALS", label: "Deals" },
  { value: "NEWS", label: "News" },
];

export default async function EditAdPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { userId: clerkId } = await auth();
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    redirect("/dashboard");
  }

  if (!clerkId) {
    redirect("/");
  }

  const ad = await prisma.ads.findUnique({
    where: { id },
    include: { user: true, tags: true, location: true },
  });

  if (!ad || ad.user.clerkId !== clerkId) {
    redirect("/dashboard");
  }

  const tagsString = ad.tags.map((t) => t.name).join(", ");
  const locationName = ad.location[0]?.name || "";

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <main className="flex flex-1 flex-col bg-zinc-50 px-4 py-24 dark:bg-black md:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Edit Ad
            </h1>
          </div>

          <form
            action={updateAd.bind(null, id)}
            className="rounded-lg border border-solid border-black/[.08] bg-white p-6 dark:border-white/[.145] dark:bg-[#1a1a1a]"
          >
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  defaultValue={ad.title}
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  defaultValue={ad.description}
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={ad.category}
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="imageUrl"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={ad.imageUrl || ""}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contactName"
                    className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Contact Name
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    defaultValue={ad.contactName || ""}
                    className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Contact Number
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    defaultValue={ad.contactNumber || ""}
                    className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Location targeted
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  defaultValue={locationName}
                  placeholder="petaling jaya"
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Tags (comma separated)
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  defaultValue={tagsString}
                  placeholder="sale, urgent, new"
                  className="w-full rounded-md border border-solid border-black/[.08] bg-white px-4 py-2 text-black dark:border-white/[.145] dark:bg-[#2a2a2a] dark:text-zinc-50"
                />
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  type="submit"
                  className="rounded-full bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                >
                  Update Ad
                </button>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-solid border-black/[.08] px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-[#1a1a1a]"
                >
                  Cancel
                </Link>
                <form action={deleteAd.bind(null, id)} className="ml-auto">
                  <ConfirmDeleteButton />
                </form>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
