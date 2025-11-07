"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient, signInWithGoogle } from "@/lib/auth-client";
import { toast } from "sonner";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError(context) {
          console.log("Error signing up:", context);
          toast.error(
            context?.error?.message || "Error signing up. Please try again."
          );
        },
      }
    );
  };

  return (
    <section className="flex flex-col items-center justify-center  min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent  ">
      <div className="p-6  max-w-md w-full">
        <div>
          <Image
            className=" invert dark:block hidden"
            src="/logo/only-logo.svg"
            alt="ORHCA"
            width={120}
            height={40}
          />
          <Image
            className="dark:hidden block"
            src="/logo/only-logo.svg"
            alt="ORHCA"
            width={120}
            height={40}
          />
          <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to ORCHA</h1>
          <p>Welcome back! Sign in to continue</p>
        </div>

        <div className="mt-6">
          <Button
            onClick={signInWithGoogle}
            type="button"
            variant="outline"
            className="w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="0.98em"
              height="1em"
              viewBox="0 0 256 262"
            >
              <path
                fill="#4285f4"
                d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
              ></path>
              <path
                fill="#34a853"
                d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
              ></path>
              <path
                fill="#fbbc05"
                d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
              ></path>
              <path
                fill="#eb4335"
                d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
              ></path>
            </svg>
            <span>Google</span>
          </Button>
        </div>

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <hr className="border-dashed" />
          <span className="text-muted-foreground text-xs">
            Or continue With
          </span>
          <hr className="border-dashed" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email" className="block text-sm mt-2">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" required id="email" />
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
                  <FormLabel htmlFor="password" className="block text-sm mt-2">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" required id="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full mt-4 ">
              Continue
            </Button>
          </form>
        </Form>
      </div>

      <p className="text-accent-foreground text-center text-sm">
        Don't have an account ?
        <Button asChild variant="link" className="px-2">
          <Link href="/sign-up">Create account</Link>
        </Button>
      </p>
    </section>
  );
}
