"use server";

import { prisma } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUserFromClerkId } from "./user";

const allowedCategories = [
  "MARKETPLACE",
  "SERVICES",
  "JOBS",
  "PROPERTY",
  "VEHICLE",
  "BUSINESSES",
  "REQUESTS",
  "EVENTS",
  "COMMUNITY",
  "DEALS",
  "NEWS",
] as const;

function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug;
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  const existing = await prisma.ads.findUnique({
    where: { slug: baseSlug },
  });

  if (!existing) return baseSlug;

  let counter = 1;
  while (true) {
    const newSlug = `${baseSlug}-${counter}`;
    const check = await prisma.ads.findUnique({
      where: { slug: newSlug },
    });
    if (!check) return newSlug;
    counter++;
  }
}

export async function createAd(formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const locationInput = formData.get("location") as string;
  const contactName = formData.get("contactName") as string;
  const contactNumber = formData.get("contactNumber") as string;
  const tagsInput = formData.get("tags") as string;
  const baseSlug = generateSlug(title);
  const slug = baseSlug ? await getUniqueSlug(baseSlug) : null;

  if (
    !allowedCategories.includes(
      category as (typeof allowedCategories)[number],
    )
  ) {
    throw new Error("Invalid ad category");
  }

  const user = await ensureUserFromClerkId(clerkId);
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  const locationName = locationInput?.trim();
  let location = null;

  if (locationName) {
    location = await prisma.adLocation.upsert({
      where: { name: locationName },
      update: {},
      create: { name: locationName },
    });
  }

  // Process tags
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // Create tags if they don't exist
  const createdTags = await Promise.all(
    tagNames.map(async (name) => {
      let tag = await prisma.adsTag.findFirst({
        where: { name },
      });

      if (!tag) {
        tag = await prisma.adsTag.create({
          data: { name },
        });
      }

      return tag;
    }),
  );

  // Create ad with auto-calculated hotness and priority
  await prisma.ads.create({
    data: {
      title,
      slug,
      description,
      category: category as (typeof allowedCategories)[number],
      location: location
        ? {
            connect: [{ id: location.id }],
          }
        : undefined,
      imageUrl: imageUrl || null,
      url: linkUrl || null,
      contactName: contactName || null,
      contactNumber: contactNumber || null,
      userId: user.id,
      status: "ACTIVE",
      startDate,
      endDate,
      hotness: Math.floor(Math.random() * 100),
      priority: Math.floor(Math.random() * 4),
      tags: {
        connect: createdTags.map((t) => ({ id: t.id })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateAd(id: string, formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  // Get ad and verify ownership
  const ad = await prisma.ads.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!ad || ad.user.clerkId !== clerkId) {
    throw new Error("Not authorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const linkUrl = formData.get("linkUrl") as string;
  const locationInput = formData.get("location") as string;
  const contactName = formData.get("contactName") as string;
  const contactNumber = formData.get("contactNumber") as string;
  const tagsInput = formData.get("tags") as string;
  const locationName = locationInput?.trim();
  let location = null;

  if (
    !allowedCategories.includes(
      category as (typeof allowedCategories)[number],
    )
  ) {
    throw new Error("Invalid ad category");
  }

  if (locationName) {
    location = await prisma.adLocation.upsert({
      where: { name: locationName },
      update: {},
      create: { name: locationName },
    });
  }

  // Process tags
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const createdTags = await Promise.all(
    tagNames.map(async (name) => {
      let tag = await prisma.adsTag.findFirst({
        where: { name },
      });

      if (!tag) {
        tag = await prisma.adsTag.create({
          data: { name },
        });
      }

      return tag;
    }),
  );

  await prisma.ads.update({
    where: { id },
    data: {
      title,
      description,
      category: category as (typeof allowedCategories)[number],
      imageUrl: imageUrl || null,
      url: linkUrl || null,
      contactName: contactName || null,
      contactNumber: contactNumber || null,
      location: {
        set: [],
        ...(location ? { connect: [{ id: location.id }] } : {}),
      },
      tags: {
        set: [],
        connect: createdTags.map((t) => ({ id: t.id })),
      },
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteAd(id: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  // Get ad and verify ownership
  const ad = await prisma.ads.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!ad || ad.user.clerkId !== clerkId) {
    throw new Error("Not authorized");
  }

  await prisma.ads.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateAdAdminSettings(id: string, formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await ensureUserFromClerkId(clerkId);
  const isAllowedAdmin =
    user.isAdmin && user.email.toLowerCase() === "khairil114@gmail.com";

  if (!isAllowedAdmin) {
    throw new Error("Not authorized");
  }

  const hotnessValue = Number(formData.get("hotness"));
  const priorityValue = Number(formData.get("priority"));
  const statusInput = String(formData.get("status") || "").toUpperCase();
  const startDateInput = (formData.get("startDate") as string) || "";
  const endDateInput = (formData.get("endDate") as string) || "";
  const allowedStatuses = [
    "ACTIVE",
    "INACTIVE",
    "PRIVATE",
  ] as const;

  if (!allowedStatuses.includes(statusInput as (typeof allowedStatuses)[number])) {
    throw new Error("Invalid ad status");
  }

  if (Number.isNaN(hotnessValue) || Number.isNaN(priorityValue)) {
    throw new Error("Invalid number input");
  }

  const hotness = Math.min(100, Math.max(0, Math.trunc(hotnessValue)));
  const priority = Math.min(3, Math.max(0, Math.trunc(priorityValue)));

  const startDate = startDateInput ? new Date(startDateInput) : null;
  const endDate = endDateInput ? new Date(endDateInput) : null;

  if (startDate && Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid start date");
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid end date");
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("Start date cannot be later than end date");
  }

  await prisma.ads.update({
    where: { id },
    data: {
      hotness,
      priority,
      status: statusInput as
        | "ACTIVE"
        | "INACTIVE"
        | "PRIVATE",
      startDate,
      endDate,
    },
  });

  revalidatePath("/");
  revalidatePath("/(admin)/admin/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/(admin)/admin/dashboard/ads");
  revalidatePath("/admin/dashboard/ads");
}
