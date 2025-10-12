
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppWrapper } from '@/components/app-wrapper';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Memora',
  description: 'Gestiona, preserva y comparte las historias y recuerdos de tu familia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppWrapper>{children}</AppWrapper>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
