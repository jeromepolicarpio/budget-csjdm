import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center text-center">
      <div className="bg-muted border rounded-full p-4 mb-6">
        <FileQuestion size={32} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist. You might have followed an old link.
      </p>
      <Link
        href="/"
        className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Go to homepage
      </Link>
    </div>
  );
}
