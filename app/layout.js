import "./globals.css";

export const metadata = {
  title: "AirDosa — AI-Powered Instant Dosa Delivery Drones",
  description:
    "Get steaming hot, perfectly crispy dosas delivered to your balcony in 5 minutes via AirDosa's AI-navigated, thermal-insulated delivery drones. Experience the future of Indian breakfast today.",
  keywords:
    "AirDosa, drone delivery, instant dosa, AI delivery, food tech India, smart food drone",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
