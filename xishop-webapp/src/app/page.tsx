import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user) {
    // If the user is logged in, redirect them to their dashboard
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4">
        Welcome to <span className="text-primary">xishop</span>
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground mb-8">
        The all-in-one platform to create, manage, and grow your game server's
        item shop. Modern, fast, and intuitive.
      </p>
      <Link href="/api/auth/signin" className={buttonVariants({ size: "lg" })}>
        Get Started with Google
      </Link>
    </div>
  );
} 