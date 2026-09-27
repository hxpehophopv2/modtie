import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

// Kanit covers Thai + Latin; its heavy italics carry the maximalist look.
const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["400", "600", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ModTie",
  description:
    "Phone on your forehead. Tilt down = correct, tilt up = pass. Works offline.",
  applicationName: "ModTie",
  appleWebApp: {
    capable: true,
    title: "ModTie",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a0633",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
