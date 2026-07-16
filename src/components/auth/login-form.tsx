"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { loginUser } from "@/server/actions/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  // Auth.js redirects here with ?error=… when an OAuth/session error occurs.
  const urlError = searchParams.get("error") ? "Sign-in failed. Please try again." : null;

  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setError(null);
    const result = await loginUser(values, callbackUrl);
    // On success the action redirects; we only ever see error results.
    if (result?.status === "error") setError(result.message);
  }

  const displayError = error ?? urlError;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to manage your bots."
      footer={{
        text: "Don't have an account?",
        linkLabel: "Sign up",
        href: "/register",
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {displayError ? <FormAlert variant="error" message={displayError} /> : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Sign in
          </Button>
        </form>
      </Form>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Demo account</span>
          <br />
          demo@pipflow.app · demo1234
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            form.setValue("email", "demo@pipflow.app");
            form.setValue("password", "demo1234");
          }}
        >
          Fill in
        </Button>
      </div>
    </AuthCard>
  );
}
