import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="max-w-md text-center">
        <LogoMark className="mx-auto size-10" />
        <p className="mt-8 text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or may have moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/book-appointment">Book appointment</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
