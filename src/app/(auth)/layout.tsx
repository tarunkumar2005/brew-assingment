import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth - Task Tracker",
  description: "Authentication layout for Task Tracker",
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
