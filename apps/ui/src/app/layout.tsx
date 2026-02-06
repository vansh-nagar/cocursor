import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/provider/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cocursor",
  description: "Cocursor – Collaborative Coding Platform",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Cocursor",
    description: "Cocursor – Collaborative Coding Platform",
    images: [
      {
        url: "https://res.cloudinary.com/dz12pywzs/image/upload/v1770130073/Copy_of_Webinar_Keynote_Presentation_1_g0bs5i.png",
        width: 1200,
        height: 630,
        alt: "Cocursor Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cocursor",
    description: "Cocursor – Collaborative Coding Platform",
    images: [
      "https://res.cloudinary.com/dz12pywzs/image/upload/v1770130073/Copy_of_Webinar_Keynote_Presentation_1_g0bs5i.png",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="application-name" content="Cocursor" />
        <meta property="og:image" content="https://res.cloudinary.com/dz12pywzs/image/upload/v1770130073/Copy_of_Webinar_Keynote_Presentation_1_g0bs5i.png" />
        <meta property="og:title" content="Cocursor" />
        <meta
          property="og:description"
          content="Cocursor – Collaborative Coding Platform"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Cocursor" />
        <meta
          name="twitter:description"
          content="Cocursor – Collaborative Coding Platform"
        />
        <meta name="twitter:image" content="https://res.cloudinary.com/dz12pywzs/image/upload/v1770130073/Copy_of_Webinar_Keynote_Presentation_1_g0bs5i.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
