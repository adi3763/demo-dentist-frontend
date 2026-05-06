import { AuthProvider } from '@/context/AuthContext';
import Header from '@/app/header/header';
import Footer from '@/app/footer/footer';
import './globals.css';

export const metadata = {
  title: "Dr. Priya Sharma | Expert Dental Care",
  description: "Noida's top-rated dental clinic for a perfect smile.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Header />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}