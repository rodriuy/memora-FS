
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, UserX, Trash2, Copy } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection, query, where, documentId, arrayRemove } from 'firebase/firestore';
import type { User as MemoraUser, Family } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

function InviteMemberModal({ familyId }: { familyId: string }) {
    const { toast } = useToast();
    const [origin, setOrigin] = useState('');

    useState(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);
    
    const inviteLink = `${origin}/signup?familyId=${familyId}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        toast({ title: 'Enlace copiado', description: 'El enlace de invitación ha sido copiado a tu portapapeles.' });
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline">Invitar a un miembro a tu familia</DialogTitle>
                <DialogDescription>
                    Comparte este enlace con el miembro de tu familia que quieras invitar. Cuando se registren usando este enlace, se unirán automáticamente.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
                <Input value={inviteLink} readOnly />
                <Button type="button" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </DialogContent>
    );
}

function FamilyMembers({ familyData, familyMembers, familyMembersLoading }: { familyData: Family | null, familyMembers: MemoraUser[] | null, familyMembersLoading: boolean }) {
    const { user: currentUser } = useUser();
    const firestore = useFirestore();
    const userImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';
    const { toast } = useToast();

    const handleRemoveMember = (memberId: string) => {
        if (!firestore || !familyData) return;
        const familyDocRef = doc(firestore, 'families', familyData.id);
        updateDocumentNonBlocking(familyDocRef, {
            memberIds: arrayRemove(memberId)
        });
        toast({ title: "Miembro eliminado", description: "El usuario ha sido eliminado de la familia."});
        // Note: In a full app, you would also need to handle re-assigning the user to a new family or deleting them.
    };

    if (familyMembersLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: familyData?.memberIds?.length || 4 }).map((_, i) => (
                    <Card key={i} className="text-center flex flex-col items-center p-6">
                        <Skeleton className="w-24 h-24 rounded-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-5 w-1/4" />
                    </Card>
                ))}
            </div>
        );
    }
    
    if (!familyMembers || familyMembers.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-4" />
                <p className="font-semibold">No se encontraron miembros de la familia</p>
                <p className="text-sm">Usa el botón "Invitar Miembro" para añadir personas a tu círculo familiar.</p>
            </div>
        )
    }

    const isAdmin = familyData?.adminId === currentUser?.uid;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {familyMembers.map(member => (
                <Card key={member.id} className="text-center flex flex-col items-center p-6">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-secondary">
                        <AvatarImage src={userImage(member.avatarId || 'user-1')} alt={member.displayName} />
                        <AvatarFallback>{member.displayName?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-lg">{member.displayName}</p>
                    <Badge variant={familyData?.adminId === member.id ? 'default' : 'secondary'} className="mt-1">
                        {familyData?.adminId === member.id ? 'Admin' : 'Miembro'}
                    </Badge>
                    <div className="mt-4 flex gap-2">
                         {isAdmin && member.id !== currentUser?.uid && (
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveMember(member.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}


export default function FamilyPage() {
    const { userData } = useUser();
    const firestore = useFirestore();

    const familyId = userData?.familyId;

    const familyDocRef = useMemoFirebase(() => familyId && firestore ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
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

    const isLoading = familyLoading || (!familyData && familyMembersLoading);

    return (
        <div className="p-4 md:p-8">
             <Dialog>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                             {isLoading ? <Skeleton className="h-8 w-48 mb-2" /> : <CardTitle className="font-headline text-2xl">{familyData?.familyName}</CardTitle>}
                             {isLoading ? <Skeleton className="h-5 w-64" /> : <CardDescription>Gestiona quién forma parte de la cuenta Memora de tu familia.</CardDescription>}
                        </div>
                        <DialogTrigger asChild>
                            <Button disabled={!familyId}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Invitar Miembro
                            </Button>
                        </DialogTrigger>
                    </CardHeader>
                    <CardContent>
                        <FamilyMembers familyData={familyData} familyMembers={familyMembers} familyMembersLoading={isLoading || (familyData && !familyMembers && familyMembersLoading)} />
                    </CardContent>
                </Card>
                {familyId && <InviteMemberModal familyId={familyId} />}
            </Dialog>
        </div>
    );
}
