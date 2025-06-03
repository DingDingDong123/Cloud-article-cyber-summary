import { cn } from "../../utils";

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "secondary"
          ? "bg-gray-100 text-gray-800 border-transparent"
          : "bg-blue-100 text-blue-800 border-transparent",
        className
      )}
      {...props}
    />
  );
}
