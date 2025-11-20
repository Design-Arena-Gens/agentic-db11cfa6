export const metadata = {
  title: "Rooftop Moment",
  description:
    "A peaceful rooftop scene under a clear blue sky. Natural daylight, smooth camera motion, realistic colors.",
};

import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

