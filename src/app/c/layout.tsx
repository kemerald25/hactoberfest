import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Assistant",
  description: "Chat with us",
};

export default function StandaloneChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Clean layout without standard app headers
    <div className="min-h-screen bg-gray-50 dark:bg-black antialiased">
      {children}
    </div>
  );
}
