
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Bot, Clapperboard, Radio } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const storyImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <Link href="/" className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
          <span className="ml-2 text-2xl font-bold font-headline text-foreground">Memora</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Iniciar Sesión
          </Link>
          <Button asChild>
            <Link href="/signup">Empezar Gratis</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                src={storyImage('story-1')}
                alt="Foto Familiar"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="family photo"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Preserva el Legado de tu Familia, una Historia a la Vez
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Memora te ayuda a capturar, guardar y revivir los momentos más preciados de tu familia. Convierte grabaciones de audio en historias eternas, anima fotos y da vida a tu historia.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Comienza tu Archivo Gratis
                      <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Funcionalidades Clave</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Cómo Funciona Memora</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Desde una simple grabación de voz a una reliquia familiar interactiva. Nuestra tecnología facilita la protección de tus recuerdos para las generaciones venideras.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">Graba y Sube</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Sube fácilmente archivos de audio de tus familiares compartiendo sus historias y recuerdos. O graba directamente en la app.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <Bot className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">Transcripción con IA</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Nuestra IA avanzada transcribe automáticamente el audio, convirtiendo las palabras habladas en una historia bellamente formateada y editable.
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="text-center">
                  <Clapperboard className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">Anima Fotos</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Da vida a las fotos fijas. Nuestra función premium de IA anima los rostros en tus fotos antiguas, añadiendo un toque mágico a tus historias.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                ¿Listo para construir el legado digital de tu familia?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Crea una cuenta hoy y empieza gratis. Preserva tus primeras historias y ve la historia de tu familia bajo una nueva luz.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-x-2">
                <Button asChild size="lg">
                    <Link href="/signup">
                        Regístrate Ahora
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                        Iniciar Sesión
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Memora. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
