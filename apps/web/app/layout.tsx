import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SirfNaya",
  description: "Your one-stop shop for quality products",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
