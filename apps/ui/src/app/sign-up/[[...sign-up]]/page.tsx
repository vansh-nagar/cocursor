"use client";

import Logo from "@/components/mine/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    if (!isLoaded) return;

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-up/sso-callback",
        redirectUrlComplete: "/main",
      });
    } catch (err: unknown) {
      const error = err as { errors?: { message: string }[] };
      setError(error.errors?.[0]?.message || "An error occurred");
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      const error = err as { errors?: { message: string }[] };
      setError(error.errors?.[0]?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/main");
      }
    } catch (err: unknown) {
      const error = err as { errors?: { message: string }[] };
      setError(error.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen bg-zinc-950 px-4 py-16 md:py-32">
      <div className="max-w-sm m-auto h-fit w-full">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
          <div>
            <Link href="/" aria-label="go home">
              <Logo />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold text-white">
              Create your account
            </h1>
            <p className="text-zinc-400">Get started with Cocursor</p>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {!pendingVerification ? (
            <>
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
                  onClick={handleGoogleSignUp}
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
                  <span>Continue with Google</span>
                </Button>
              </div>

              <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <hr className="border-zinc-700 border-dashed" />
                <span className="text-zinc-500 text-xs">Or continue with</span>
                <hr className="border-zinc-700 border-dashed" />
              </div>

              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="block text-sm text-zinc-300"
                  >
                    Email
                  </Label>
                  <Input
                    type="email"
                    required
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                    placeholder="you@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerification} className="mt-6 space-y-6">
              <p className="text-zinc-400 text-sm">
                We sent a verification code to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="code" className="block text-sm text-zinc-300">
                  Verification Code
                </Label>
                <Input
                  type="text"
                  required
                  name="code"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  placeholder="Enter code"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-zinc-400 hover:text-white"
                onClick={() => {
                  setPendingVerification(false);
                  setCode("");
                  setError("");
                }}
              >
                Use a different email
              </Button>
            </form>
          )}

          <p className="text-zinc-400 text-center text-sm mt-6">
            Already have an account?
            <Button asChild variant="link" className="px-2 text-orange-400">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
