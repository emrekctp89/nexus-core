import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import Header from '@/components/Header'
import { Toaster } from 'react-hot-toast';



const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'NexusCore App', // Başlığı da güzelleştirelim
  description: 'A modern and scalable project built in 3 days.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* 1. body etiketine flexbox class'ları ekledik */}
      <body className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>
        <Header />
        {/* 2. children'ı bir <main> etiketi içine alıp flex-grow verdik */}
        <main className="flex-grow">
          {children}
        </main>
        <Toaster position="top-center" /> {/* YENİ EKLENEN SATIR */}
      </body>
    </html>
  )
}
