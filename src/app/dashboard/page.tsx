
'use client';

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
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, documentId } from 'firebase/firestore';
import type { Story } from '@/lib/types';
import type { User as MemoraUser, Family } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, userData, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const familyId = userData?.familyId;

  const storiesQuery = useMemoFirebase(() => familyId ? query(collection(firestore, 'families', familyId, 'stories')) : null, [firestore, familyId]);
  const { data: stories, isLoading: storiesLoading } = useCollection<Story>(storiesQuery);

  const devicesQuery = useMemoFirebase(() => familyId ? query(collection(firestore, 'families', familyId, 'memoraBoxes')) : null, [firestore, familyId]);
  const { data: devices, isLoading: devicesLoading } = useCollection<Device>(devicesQuery);

  const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData, isLoading: familyLoading } = useDoc<Family>(familyDocRef);
  
  const memberIds = familyData?.memberIds;

  const familyMembersQuery = useMemoFirebase(
    () =>
      firestore && memberIds && memberIds.length > 0
        ? query(collection(firestore, 'users'), where(documentId(), 'in', memberIds))
        : null,
    [firestore, memberIds]
  );
  const { data: familyMembers, isLoading: familyMembersLoading } = useCollection<MemoraUser>(familyMembersQuery);

  const recentStories = stories ? stories.slice(0, 3) : [];
  const storyImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

  const getAvatar = (member: MemoraUser) => {
    return member.avatarUrl || PlaceHolderImages.find(p => p.id === member.avatarId)?.imageUrl || `https://i.pravatar.cc/150?u=${member.id}`;
  }


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const isLoading = isUserLoading || familyLoading;

  if (isLoading) {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></CardContent></Card>
          </div>
        </div>
      )
  }

  if (!user) {
    return null;
  }

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
            {storiesLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{stories?.length || 0}</div>}
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
            {familyMembersLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{familyMembers?.length || 0}</div>}
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
            {devicesLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{devices?.length || 0}</div>}
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
            {storiesLoading ? (
                 <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                 </div>
            ) : recentStories.length > 0 ? (
              recentStories.map((story, index) => (
              <div key={story.id}>
                <div className="flex items-center space-x-4">
                  <div className="relative h-24 w-24 md:h-28 md:w-40 flex-shrink-0">
                    <Image
                      src={storyImage(story.imageId || 'story-1')}
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
            ))
            ) : (
                <p className="text-center text-muted-foreground">No stories yet. Add one!</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Family Circle</CardTitle>
            <CardDescription>
              Everyone connected to your family story.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
           {familyMembersLoading && (!familyMembers || familyMembers.length === 0) ? (
                <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
           ) : familyMembers && familyMembers.length > 0 ? (
                familyMembers.map((member, index) => (
                    <div key={member.id}>
                        <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-4">
                            <Avatar>
                            <AvatarImage src={getAvatar(member)} />
                            <AvatarFallback>
                                {member.displayName?.charAt(0)}
                            </AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="text-sm font-medium leading-none">
                                {member.displayName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {familyData?.adminId === member.id ? 'Admin' : 'Member'}
                            </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">
                            View
                        </Button>
                        </div>
                        {index < (familyMembers?.length || 0) - 1 && (
                        <Separator className="my-4" />
                        )}
                    </div>
                    ))
            ) : (
                <p className="text-center text-muted-foreground">No family members found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    