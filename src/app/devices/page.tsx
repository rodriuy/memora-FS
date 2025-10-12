
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gem, RadioTower } from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDocs, updateDoc } from 'firebase/firestore';
import type { Device } from '@/lib/types';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export default function DevicesPage() {
    const { userData } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [pairingCode, setPairingCode] = useState('');
    const [isPairing, setIsPairing] = useState(false);

    const familyId = userData?.familyId;
    
    const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
    const { data: familyData } = useDoc(familyDocRef);
    const isPremium = familyData?.subscriptionTier === 'premium';

    const devicesQuery = useMemoFirebase(() => familyId ? query(collection(firestore, 'memoraBoxes'), where('familyId', '==', familyId)) : null, [firestore, familyId]);
    const { data: devices, isLoading: devicesLoading } = useCollection<Device>(devicesQuery);

    const handlePairDevice = async () => {
        if (!pairingCode || !familyId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a pairing code.' });
            return;
        }

        setIsPairing(true);
        try {
            const boxesRef = collection(firestore, 'memoraBoxes');
            const q = query(boxesRef, where('pairingCode', '==', pairingCode), where('status', '==', 'pending_pairing'));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                toast({ variant: 'destructive', title: 'Pairing Failed', description: 'Invalid or already used pairing code.' });
                setIsPairing(false);
                return;
            }

            const boxDoc = querySnapshot.docs[0];
            
            // Using await here as this is a user-initiated action where feedback is immediate.
            await updateDoc(boxDoc.ref, {
                familyId: familyId,
                status: 'active'
            });

            toast({ title: 'Device Paired!', description: `Your Memora Box is now linked to ${familyData?.familyName}.` });
            setPairingCode('');

        } catch (error) {
            console.error("Pairing error:", error);
            toast({ variant: 'destructive', title: 'Pairing Failed', description: 'An error occurred. Please try again.' });
        } finally {
            setIsPairing(false);
        }
    };


    return (
        <div className="p-4 md:p-8 grid gap-8 md:grid-cols-2">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
                    My Devices
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Linked Memora Boxes</CardTitle>
                        <CardDescription>A list of all Memora boxes linked to your family account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device Name</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devicesLoading && <TableRow><TableCell colSpan={2}>Loading devices...</TableCell></TableRow>}
                                {!devicesLoading && devices?.map(device => (
                                    <TableRow key={device.id}>
                                        <TableCell className="font-medium">{device.boxId}</TableCell>
                                        <TableCell>
                                            <Badge variant={device.status === 'active' ? 'default' : 'outline'}>
                                                {device.status === 'active' ? 'Active' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!devicesLoading && devices?.length === 0 && <TableRow><TableCell colSpan={2} className="text-center">No devices linked yet.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card className="mt-16">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <RadioTower className="h-5 w-5 text-primary" />
                            Pair a New Memora Box
                        </CardTitle>
                        <CardDescription>
                            Turn on your Memora Box to get a 6-digit pairing code from its screen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="_ _ _ - _ _ _"
                            className="text-center text-2xl font-mono tracking-widest h-16"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value.replace(/\s/g, ''))}
                            disabled={!isPremium || isPairing}
                        />
                         {!isPremium && (
                            <div className="mt-4 text-center text-sm text-amber-400/80 p-3 rounded-md bg-amber-400/10 border border-amber-400/20 flex items-center gap-2">
                                <Gem className="h-4 w-4" />
                                <div>
                                    <p><span className="font-semibold">This is a Premium Feature.</span></p>
                                    <p>Please upgrade your plan to link a Memora Box.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled={!isPremium || isPairing || !pairingCode} onClick={handlePairDevice}>
                            {isPairing ? 'Pairing...' : 'Pair Device'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

    