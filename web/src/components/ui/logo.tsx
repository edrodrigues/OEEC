import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={cn(className)}
    >
      <rect width="512" height="512" rx="128" fill="#ffdf93" />
      <circle cx="256" cy="256" r="144" fill="#765b00" />
      <circle cx="216" cy="216" r="64" fill="#efc13e" />
    </svg>
  );
}
