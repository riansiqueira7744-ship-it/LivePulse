import { cn } from "@/lib/utils";

// Elegant default avatar with initials fallback. No fictional/generated seed images.
export function Avatar({
  src,
  name,
  size = 40,
  className,
  rounded = "full",
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  rounded?: "full" | "lg" | "md" | "xl" | "2xl";
}) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "•";

  const radius =
    rounded === "full" ? "rounded-full" :
    rounded === "lg" ? "rounded-lg" :
    rounded === "md" ? "rounded-md" :
    rounded === "xl" ? "rounded-xl" : "rounded-2xl";

  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.38)) };

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        style={{ width: size, height: size }}
        className={cn(radius, "object-cover", className)}
      />
    );
  }
  return (
    <div
      aria-label={name ?? "Avatar"}
      style={style}
      className={cn(
        radius,
        "grid place-items-center bg-gradient-to-br from-primary/25 to-chart-2/25 font-semibold text-foreground/80",
        className,
      )}
    >
      {initials}
    </div>
  );
}
