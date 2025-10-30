import localFont from "next/font/local";
import PageShell from "../components/PageShell"
import MuiProvider from "../components/MuiProvider"
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
// App Router uses the `metadata` export for head tags; avoid `next/head` here.
config.autoAddCss = false;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Steve Kaschimer - Tech Notes",
  description: "Personal Site for Steve Kaschimer (Slalom)",
  // use the real public path for the favicon
  icons: {
    icon: '/assets/images/logo/favicon.png',
    shortcut: '/assets/images/logo/favicon.png',
    apple: '/assets/images/logo/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <MuiProvider>
          <PageShell>
            {children}
          </PageShell>
        </MuiProvider>
      </body>
    </html>
  );
}
