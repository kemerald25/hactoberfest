import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Chat",
  description: "Chat with us",
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We render a clean body specifically for the widget, without standard app headers
    <div className="min-h-screen bg-transparent antialiased">
      {children}
    </div>
  );
}
