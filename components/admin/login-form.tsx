"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Info, Loader2, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { errorMessage } from "@/lib/api/client";
import { useLogin } from "@/lib/query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const login = useLogin();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values: LoginInput) {
    setError(null);
    try {
      await login.mutateAsync(values);
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin/dashboard");
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="username" placeholder="you@smilecare.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input type={show ? "text" : "password"} autoComplete="current-password" className="pr-10" {...field} />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <LogIn />}
          {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
        </Button>

        <Alert variant="info">
          <Info />
          <AlertDescription>
            <p>
              Demo credentials: <strong>admin@smilecare.com</strong> / <strong>admin123</strong>
            </p>
            <button
              type="button"
              className="text-xs font-medium underline underline-offset-2"
              onClick={() => {
                form.setValue("email", "admin@smilecare.com");
                form.setValue("password", "admin123");
              }}
            >
              Fill demo credentials
            </button>
          </AlertDescription>
        </Alert>
      </form>
    </Form>
  );
}
