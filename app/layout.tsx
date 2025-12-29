import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const headingFont = localFont({
  src: "./fonts/MapRoman-Normal-BF64dc3d4ab530e.otf",
  variable: "--font-map-roman",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "./fonts/MuseoSansRounded300.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/MuseoSansRounded500.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MuseoSansRounded500.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/MuseoSansRounded700.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/MuseoSansRounded700.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-museo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kingdom Restoration Conference 2026",
  description:
    "Join us July 9-12, 2026 at the Hilton Knoxville Airport for the Second Annual Kingdom Restoration Conference. Gather and equip patriarchs and their families as building blocks for the Kingdom.",
  openGraph: {
    title: "Kingdom Restoration Conference 2026",
    description:
      "July 9-12, 2026 - Hilton Knoxville Airport, Alcoa, TN. Seating limited to 200.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable} antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
