import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  BookText,
  Users,
  RadioTower,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { stories, familyMembers, devices } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Dashboard() {
  const recentStories = stories.slice(0, 3);
  const storyImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Family Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Link href="/stories/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Story
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stories.length}</div>
            <p className="text-xs text-muted-foreground">
              Preserving your family's legacy
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Family Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{familyMembers.length}</div>
            <p className="text-xs text-muted-foreground">
              Connected and sharing memories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Linked Devices
            </CardTitle>
            <RadioTower className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              Memora Boxes bringing stories to life
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Recent Stories</CardTitle>
            <CardDescription>
              The latest additions to your family's collection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentStories.map((story, index) => (
              <div key={story.id}>
                <div className="flex items-center space-x-4">
                  <div className="relative h-24 w-24 md:h-28 md:w-40 flex-shrink-0">
                    <Image
                      src={storyImage(story.imageId)}
                      alt={story.title}
                      fill
                      data-ai-hint="family photo"
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/stories/${story.id}`}
                          className="font-semibold hover:underline"
                        >
                          {story.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          Narrated by {story.narrator}
                        </p>
                      </div>
                       <Badge variant={story.isDonated ? 'secondary' : 'outline'}>
                        {story.isDonated ? 'Donated' : 'Private'}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {story.transcription}
                    </p>
                  </div>
                   <Link href={`/stories/${story.id}`}>
                      <Button variant="ghost" size="icon" className="hidden md:flex">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                </div>
                {index < recentStories.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Family Circle</CardTitle>
            <CardDescription>
              Everyone connected to the Perez family story.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {familyMembers.map((member, index) => (
              <div key={member.id}>
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={storyImage(member.avatarId)} />
                      <AvatarFallback>
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                {index < familyMembers.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
