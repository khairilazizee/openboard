import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-black/8 bg-white/80 px-6 dark:border-white/[.145] dark:bg-black/80">
      <Link
        href="/"
        className="text-xl font-semibold text-black dark:text-zinc-50"
      >
        OPENBOARD
      </Link>
      <div className="flex items-center gap-4">
        <Show when="signed-out">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Login
          </Link>
          <Link href="/register">
            <Button variant="default">Register</Button>
          </Link>
        </Show>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
