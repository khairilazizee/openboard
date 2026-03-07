import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { adId?: string };
    const adId = body?.adId?.trim();

    if (!adId) {
      return NextResponse.json({ error: "adId is required" }, { status: 400 });
    }

    const now = new Date();
    const ad = await prisma.ads.findFirst({
      where: {
        id: adId,
        status: "ACTIVE",
        OR: [{ endDate: null }, { endDate: { gt: now } }],
      },
      select: { id: true },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    const { userId: clerkId } = await auth();
    let userId: string | null = null;

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });
      userId = user?.id || null;
    }

    await prisma.adsViews.create({
      data: {
        adsId: adId,
        userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to track ad view" }, { status: 500 });
  }
}
