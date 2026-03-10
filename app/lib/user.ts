import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

const ADMIN_EMAIL = "khairil114@gmail.com";

function isAdminEmail(email: string | null | undefined): boolean {
  return (email || "").toLowerCase() === ADMIN_EMAIL;
}

export async function ensureUserFromClerkId(clerkId: string) {
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress || null;
  const name =
    clerkUser?.firstName ||
    clerkUser?.username ||
    clerkUser?.fullName ||
    "User";
  const admin = isAdminEmail(email);

  const existing = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existing) {
    const nextEmail = email || existing.email;

    if (existing.isAdmin !== admin || existing.email !== nextEmail) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          email: nextEmail,
          isAdmin: admin,
        },
      });
    }

    return existing;
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: email || `${clerkId}@placeholder.com` },
  });

  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId,
        name,
        isAdmin: admin,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId,
      email: email || `${clerkId}@placeholder.com`,
      name,
      isAdmin: admin,
    },
  });
}
