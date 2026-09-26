import { Construction } from "lucide-react";

export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">{title}</h1>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-sm text-center">
          <Construction className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
