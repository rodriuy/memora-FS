
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gem, RadioTower } from "lucide-react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDocs, updateDoc, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Device } from '@/lib/types';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function DevicesPage() {
    const { userData, isUserLoading } = useUser();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [pairingCode, setPairingCode] = useState('');
    const [isPairing, setIsPairing] = useState(false);

    const familyId = userData?.familyId;
    
    const devicesQuery = useMemoFirebase(() => {
        if (isUserLoading || !firestore || !familyId) return null;
        return collection(firestore, 'families', familyId, 'memoraBoxes');
    }, [isUserLoading, firestore, familyId]);
    const { data: devices, isLoading: devicesLoading } = useCollection<Device>(devicesQuery);

    const handlePairDevice = async () => {
        if (!pairingCode || !familyId || !firestore) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, introduce un código de emparejamiento.' });
            return;
        }

        setIsPairing(true);
        try {
            // In a real scenario, this would query a central 'pendingMemoraBoxes' collection.
            // For this demo, we'll simulate finding a box and creating it directly.
            const batch = writeBatch(firestore);
            
            const newBoxRef = doc(collection(firestore, 'families', familyId, 'memoraBoxes'));
            
            batch.set(newBoxRef, {
                familyId: familyId,
                status: 'active',
                boxId: `Box-${pairingCode}`,
                pairedAt: serverTimestamp()
            });

            await batch.commit();

            toast({ title: '¡Dispositivo Vinculado!', description: `Tu Memora Box ahora está conectado a tu familia.` });
            setPairingCode('');

        } catch (error) {
            console.error("Pairing error:", error);
            toast({ variant: 'destructive', title: 'Vinculación Fallida', description: 'Ocurrió un error. Por favor, inténtalo de nuevo.' });
        } finally {
            setIsPairing(false);
        }
    };


    return (
        <div className="p-4 md:p-8 grid gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">
                    Mis Dispositivos
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Cajas Memora Vinculadas</CardTitle>
                        <CardDescription>Una lista de todas las cajas Memora conectadas a tu cuenta familiar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Dispositivo</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {devicesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={2}>
                                            <div className="space-y-2">
                                                <Skeleton className="h-6 w-full" />
                                                <Skeleton className="h-6 w-full" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : devices && devices.length > 0 ? (
                                    devices.map(device => (
                                        <TableRow key={device.id}>
                                            <TableCell className="font-medium">{device.boxId}</TableCell>
                                            <TableCell>
                                                <Badge variant={device.status === 'active' ? 'default' : 'outline'}>
                                                    {device.status === 'active' ? 'Activo' : 'Pendiente'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">Aún no hay dispositivos vinculados.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <RadioTower className="h-5 w-5 text-primary" />
                            Vincular una nueva Caja Memora
                        </CardTitle>
                        <CardDescription>
                            Enciende tu Caja Memora para obtener un código de 6 dígitos en su pantalla e introdúcelo aquí.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="_ _ _ - _ _ _"
                            className="text-center text-2xl font-mono tracking-widest h-16"
                            value={pairingCode}
                            onChange={(e) => setPairingCode(e.target.value.replace(/\s/g, ''))}
                            disabled={isPairing}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" disabled={isPairing || !pairingCode} onClick={handlePairDevice}>
                            {isPairing ? 'Vinculando...' : 'Vincular Dispositivo'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

    