import { AuthProvider } from '@/context/AuthContext';
import { ContactModalProvider } from '@/context/ContactModalContext';
import AppContent from '@/app/AppContent';
import './globals.css';

export const metadata = {
  title: "Dr. Priya Sharma | Expert Dental Care",
  description: "Noida's top-rated dental clinic for a perfect smile.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <ContactModalProvider>
            <AppContent>{children}</AppContent>
          </ContactModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
