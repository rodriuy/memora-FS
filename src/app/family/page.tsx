
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, UserX } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, documentId } from 'firebase/firestore';
import type { User as MemoraUser } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";

export default function FamilyPage() {
    const { userData } = useUser();
    const firestore = useFirestore();

    const familyId = userData?.familyId;

    const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
    const { data: familyData, isLoading: familyLoading } = useDoc(familyDocRef);

    const memberIds = familyData?.memberIds;

    const familyMembersQuery = useMemoFirebase(
      () =>
        firestore && memberIds && memberIds.length > 0
          ? query(collection(firestore, 'users'), where(documentId(), 'in', memberIds))
          : null,
      [firestore, memberIds]
    );

    const { data: familyMembers, isLoading: familyMembersLoading } = useCollection<MemoraUser>(familyMembersQuery);

    const userImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

    const isLoading = familyLoading || familyMembersLoading;

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">{familyData?.familyName || "Family Circle"}</CardTitle>
                        <CardDescription>Manage who is part of your family's Memora account.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Card key={i} className="text-center flex flex-col items-center p-6">
                                    <Skeleton className="w-24 h-24 rounded-full mb-4" />
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-5 w-1/4" />
                                </Card>
                            ))}
                         </div>
                    )}
                    {!isLoading && familyMembers && familyMembers.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {familyMembers.map(member => (
                                <Card key={member.id} className="text-center flex flex-col items-center p-6">
                                    <Avatar className="w-24 h-24 mb-4 border-4 border-secondary">
                                        <AvatarImage src={userImage(member.avatarId || 'user-1')} alt={member.displayName} />
                                        <AvatarFallback>{member.displayName?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold text-lg">{member.displayName}</p>
                                    <Badge variant={familyData?.adminId === member.userId ? 'default' : 'secondary'} className="mt-1">
                                        {familyData?.adminId === member.userId ? 'Admin' : 'Member'}
                                    </Badge>
                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm">View Stories</Button>
                                        <Button variant="ghost" size="sm">Remove</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                     {!isLoading && (!familyMembers || familyMembers.length === 0) && (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserX className="h-12 w-12 mx-auto mb-4" />
                            <p className="font-semibold">No Family Members Found</p>
                            <p className="text-sm">Use the "Invite Member" button to add people to your family circle.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
