"use client"
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleLogin = async () => {
    setLoading(true);
    try {
      signIn("eartho");
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please contact support.",
      });
    } finally {
      setLoading(false);
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
              {/* &ldquo;We replaced 37,000 lines of code with ~50 lines of @Eartho integration and can’t imagine working without it.&rdquo; */}
            </p>
            {/* <footer className="text-sm">Ilya K</footer> */}
          </blockquote>
        </div>
      </div>
      <div className="flex-1 w-full h-full p-4 bg-black ml-auto flex items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Welcome to Eartho Memebers
            </h1>
            <p className="text-sm text-muted-foreground">
              Click on the button below to connect and start
            </p>
          </div>
          <Button
            disabled={loading}
            className="ml-auto w-full"
            type="submit"
            onClick={handleLogin}
          >
            {loading ? (
              <Loader2 size="small" className="animate-spin" />
            ) : (
              "Continue With Eartho account"
            )}
          </Button>
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
