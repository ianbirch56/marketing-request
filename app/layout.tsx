import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YMCA Trinity Group | Marketing Requests",
  description: "Submit a marketing request to the YMCA Trinity Group Marketing team.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
