"use server";

import { createHash, randomBytes } from "crypto";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { safeCallbackUrl } from "@/lib/routes";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/validators/auth";
import { signIn } from "@/server/auth";
import { db } from "@/server/db";
import { sendPasswordResetEmail } from "@/server/services/email";

export type ActionResult =
  { status: "success"; message?: string } | { status: "error"; message: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function loginUser(
  values: LoginInput,
  callbackUrl?: string | null
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: safeCallbackUrl(callbackUrl),
    });
    return { status: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : GENERIC_ERROR,
      };
    }
    // Successful sign-in redirects by throwing — let Next.js handle it.
    throw error;
  }
}

export async function registerUser(
  values: RegisterInput,
  callbackUrl?: string | null
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return {
        status: "error",
        message: "An account with this email already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.create({ data: { name, email, passwordHash } });
  } catch (error) {
    console.error("[auth:register]", error);
    return { status: "error", message: GENERIC_ERROR };
  }

  // Sign the new user in. Redirects on success (throws NEXT_REDIRECT).
  return loginUser({ email, password }, callbackUrl);
}

export async function requestPasswordReset(
  values: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  // Always the same response, so the form can't be used to probe for accounts.
  const neutralResult: ActionResult = {
    status: "success",
    message:
      "If an account exists for that email, we've sent a password reset link. Check your inbox.",
  };

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return neutralResult;

    const token = randomBytes(32).toString("hex");
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      }),
    ]);

    const baseUrl =
      process.env.AUTH_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    await sendPasswordResetEmail(email, `${baseUrl}/reset-password?token=${token}`);

    return neutralResult;
  } catch (error) {
    console.error("[auth:forgot-password]", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}

export async function resetPassword(values: ResetPasswordInput): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(parsed.data.token) },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return {
        status: "error",
        message: "This reset link is invalid or has expired. Please request a new one.",
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      db.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return {
      status: "success",
      message: "Password updated. You can now sign in with your new password.",
    };
  } catch (error) {
    console.error("[auth:reset-password]", error);
    return { status: "error", message: GENERIC_ERROR };
  }
}
