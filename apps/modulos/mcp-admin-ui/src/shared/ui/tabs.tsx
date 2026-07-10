import { createContext, useContext, useState, type HTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

export function Tabs({ defaultValue, value: controlled, onValueChange, className, children, ...props }: TabsProps) {
  const [interno, setInterno] = useState(defaultValue);
  const value = controlled ?? interno;
  const setValue = (v: string) => {
    setInterno(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("", className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex h-11 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground gap-1 flex-wrap", className)}
      {...props}
    />
  );
}

interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const ativo = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={() => ctx?.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        ativo ? "bg-primary text-primary-foreground shadow-sm" : "hover:text-foreground hover:bg-card/60",
        className
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div role="tabpanel" className={cn("mt-4 ring-offset-background", className)} {...props} />;
}
