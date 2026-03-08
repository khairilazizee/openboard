import { footerYear } from "footer-year";

export function Footer() {
  return (
    <footer className="flex h-16 items-center justify-center border-t border-black/[.08] bg-white dark:border-white/[.145] dark:bg-black">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {footerYear()} OPENBOARD. All rights reserved.
      </p>
    </footer>
  );
}
