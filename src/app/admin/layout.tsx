import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Console | TaskBridge",
  description: "Internal TaskBridge administrative control panel.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
