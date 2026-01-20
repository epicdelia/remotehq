import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remote Jobs",
  description: "Find your next remote job opportunity",
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
