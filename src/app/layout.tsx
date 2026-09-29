import type { Metadata } from "next";
import { fontDisplay, fontSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ember & Bun Kiosk",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
