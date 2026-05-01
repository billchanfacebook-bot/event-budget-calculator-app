import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Budget Admin",
  description: "Responsive event budget management app with Supabase and Netlify."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
