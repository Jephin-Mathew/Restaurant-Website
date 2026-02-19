import "./globals.css";
import SiteNav from "../components/SiteNav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
