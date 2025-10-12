
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSubscription } from "@/hooks/use-subscription";
import { devices } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Gem, RadioTower } from "lucide-react";

export default function DevicesPage() {
    const { isPremium } = useSubscription();

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
                                {devices.map(device => (
                                    <TableRow key={device.id}>
                                        <TableCell className="font-medium">{device.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={device.status === 'active' ? 'default' : 'outline'}>
                                                {device.status === 'active' ? 'Active' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
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
                            disabled={!isPremium}
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
                        <Button className="w-full" disabled={!isPremium}>
                            Pair Device
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
