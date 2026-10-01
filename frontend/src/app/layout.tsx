import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rasa Nusantara | Menu Dapur",
  description: "Temukan masakan Nusantara yang dimasak segar dari dapur Rasa Nusantara.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
