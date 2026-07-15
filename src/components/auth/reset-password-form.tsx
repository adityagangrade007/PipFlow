"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert } from "@/components/auth/form-alert";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/auth";
import { resetPassword } from "@/server/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setError(null);
    const result = await resetPassword(values);
    if (result.status === "error") {
      setError(result.message);
    } else {
      setSuccess(result.message ?? "Password updated.");
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        description="This password reset link is missing its token."
        footer={{
          text: "Need a new link?",
          linkLabel: "Request one",
          href: "/forgot-password",
        }}
      >
        <FormAlert
          variant="error"
          message="The reset link is invalid or incomplete. Please request a new one."
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Enter a new password for your account."
      footer={{
        text: "Remembered your password?",
        linkLabel: "Sign in",
        href: "/login",
      }}
    >
      {success ? (
        <div className="space-y-5">
          <FormAlert variant="success" message={success} />
          <Button asChild className="w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error ? <FormAlert variant="error" message={error} /> : null}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Update password
            </Button>
          </form>
        </Form>
      )}
    </AuthCard>
  );
}
