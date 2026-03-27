import { cn } from "@/lib/utils";

type AppContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AppContainer({
  children,
  className,
}: AppContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 py-10", className)}>
      {children}
    </div>
  );
}