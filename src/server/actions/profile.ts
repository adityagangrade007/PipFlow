"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/server/auth";
import { db } from "@/server/db";

export type ProfileActionResult =
  { status: "success"; message: string } | { status: "error"; message: string };

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be at most 60 characters");

export async function updateProfileName(name: string): Promise<ProfileActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "You must be signed in." };
  }

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid name.",
    };
  }

  // Demo accounts live outside the database and are intentionally read-only.
  if (session.user.id.startsWith("usr-demo")) {
    return {
      status: "error",
      message:
        "The demo account is read-only. Create a real account to edit your profile.",
    };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data },
    });
    revalidatePath("/profile");
    return { status: "success", message: "Profile updated." };
  } catch (error) {
    console.error("[profile:update]", error);
    return { status: "error", message: "Could not update profile. Please try again." };
  }
}
