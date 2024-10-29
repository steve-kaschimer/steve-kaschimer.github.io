import localFont from "next/font/local";
import "./tailwind.css";
import Footer from "../components/footer"
import NavBar from "../components/navBar"

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
  title: "Steve Kaschimer",
  description: "Personal Site for Steve Kaschimer (Slalom)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
         <div className="w-5/6 m-auto">
          <NavBar />
            {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
