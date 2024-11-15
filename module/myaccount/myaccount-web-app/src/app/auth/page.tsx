"use client"
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { signIn, useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: session, status } = useSession();

  const handleLogin = (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUrl = window.location.href;
      sessionStorage.setItem("authReferrer", currentUrl);

      signIn("eartho", { redirect: true, redirectTo: '/' }, { access_id: "" });
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please contact support.",
      });
    }
  };

  useEffect(() => {
    if (window && window.sessionStorage) {
      const errorStorageParam = sessionStorage.getItem("authError");
      if (errorStorageParam && !searchParams?.get("error")) {
        sessionStorage.removeItem("authError");
        setErrorMessage(errorStorageParam);
      }
    }
  }, [searchParams]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid credentials, please try again.";
      case "OAuthAccountNotLinked":
        return "Account already exists with another provider. Use the same account to link.";
      case "EmailSignin":
        return "Issue sending the email.";
      case "Configuration":
        return "This provider is restricted in your country.";
      default:
        return "Please contact support.";
    }
  };

  return (
    <div className="dark relative h-screen min-h-screen flex flex-col items-center justify-center md:grid md:max-w-none md:grid-cols-2 md:px-0">
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 hidden top-4 md:right-8 md:top-8"
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          Eartho.
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              {/* Optional quote or info */}
            </p>
          </blockquote>
        </div>
      </div>
      <div className="flex-1 w-full h-full p-4 bg-black ml-auto flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome to Eartho
            </h1>
            <p className="text-sm text-muted-foreground">
              Click on the button below to connect and start
            </p>
          </div>
          <Button
            disabled={loading}
            className="ml-auto w-full"
            onClick={handleLogin}
          >
            {loading ? (
              <Loader2 size="small" className="animate-spin" />
            ) : (
              "Continue With Eartho account"
            )}
          </Button>
          {errorMessage && (
            <div className="flex justify-center items-center mt-4 text-red-500 text-sm font-medium text-center content-center">
              {getErrorMessage(errorMessage)}
            </div>
          )}
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <Link
              href="https://www.eartho.io/legal/terms-of-service"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="https://www.eartho.io/legal/privacy-policy"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
