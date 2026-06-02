import type { Metadata } from "next";
import { Poppins, Outfit } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AirDosa — Smart Drone Dosa Delivery Platform",
  description: "Get piping-hot, crispy dosas delivered straight to your balcony via AirDosa's autonomous delivery drones, featuring LiDAR obstacle avoidance and satellite-tracked active induction pods.",
  keywords: "AirDosa, drone delivery, food tech, instant dosa, smart city, drone flight tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${outfit.variable} dark scroll-smooth`}>
      <body className="font-sans antialiased text-gray-200 bg-bg-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
