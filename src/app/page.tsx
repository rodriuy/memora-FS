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
            Login
          </Link>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
               <Image
                src={storyImage('story-1')}
                alt="Family Photo"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                data-ai-hint="family photo"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Preserve Your Family's Legacy, One Story at a Time
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Memora helps you capture, store, and relive your family's most precious moments. Turn audio recordings into timeless stories, animate photos, and bring your history to life.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">
                      Start Your Free Archive
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
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">How Memora Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From a simple audio recording to an interactive family heirloom. Our technology makes it easy to safeguard your memories for generations to come.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader className="text-center">
                  <BookOpen className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">Record & Upload</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Easily upload audio files of your family members sharing their stories and memories. Or record directly in the app.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="text-center">
                  <Bot className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">AI-Powered Transcription</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Our advanced AI automatically transcribes the audio, turning spoken words into a beautifully formatted and editable story.
                </CardContent>
              </Card>
               <Card>
                <CardHeader className="text-center">
                  <Clapperboard className="h-10 w-10 mx-auto text-primary" />
                  <CardTitle className="font-headline mt-4">Animate Photos</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  Bring still photos to life. Our premium AI feature animates faces in your old pictures, adding a magical touch to your stories.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to start building your family's digital legacy?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Create an account today and get started for free. Preserve your first stories and see your family's history in a new light.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-x-2">
                <Button asChild size="lg">
                    <Link href="/signup">
                        Sign Up Now
                    </Link>
                </Button>
                 <Button asChild size="lg" variant="outline">
                    <Link href="/login">
                        Login
                    </Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Memora. All rights reserved.</p>
      </footer>
    </div>
  );
}
