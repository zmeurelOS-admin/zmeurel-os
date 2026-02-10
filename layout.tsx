import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase/client';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zmeurel OS - ERP pentru Fermieri",
  description: "Aplicație de management pentru plantații zmeură și mure",
};

// ATENȚIE: Această funcție rulează pe SERVER
// Nu putem folosi client Supabase direct aici
// Vom muta logica în Navbar (client component)
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        {/* Navbar va verifica singur dacă e logat */}
        <Navbar />
        
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
