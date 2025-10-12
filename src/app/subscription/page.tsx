
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Gem, Star } from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function SubscriptionPage() {
    const { userData } = useUser();
    const firestore = useFirestore();

    const familyId = userData?.familyId;

    const familyDocRef = useMemoFirebase(() => familyId && firestore ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
    const { data: familyData, isLoading: familyLoading } = useDoc(familyDocRef);
    
    // For demo purposes, we are making Premium features available to all.
    const isPremium = true; 
    
    // Mock usage data, in a real app this would also come from Firestore
    const storiesUsage = 3;
    const photosUsage = 15;


    const freePlanFeatures = [
        "Límite de 5 historias",
        "Límite de 20 fotos",
        "Transcripción de audio estándar",
    ];

    const premiumPlanFeatures = [
        "Historias ilimitadas",
        "Fotos ilimitadas",
        "Fotos animadas con IA",
        "Vincular Cajas Memora físicas",
        "Soporte prioritario",
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
                    Plan de Suscripción
                </h1>
                <p className="text-muted-foreground mb-8">
                    Actualmente, todas las funciones premium están habilitadas para esta demostración.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className={`flex flex-col border-muted`}>
                        <CardHeader>
                            <CardTitle className="font-headline">Plan Gratuito</CardTitle>
                            <CardDescription>Para empezar a preservar recuerdos.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                            <ul className="space-y-2 text-sm">
                                {freePlanFeatures.map(feat => (
                                     <li key={feat} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                        <span>{feat}</span>
                                     </li>
                                ))}
                            </ul>
                            {!isPremium && !familyLoading && (
                                <div className="space-y-4 pt-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Historias</span>
                                            <span className="text-muted-foreground">{storiesUsage} / 5</span>
                                        </div>
                                        <Progress value={(storiesUsage / 5) * 100} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Fotos</span>
                                            <span className="text-muted-foreground">{photosUsage} / 20</span>
                                        </div>
                                        <Progress value={(photosUsage / 20) * 100} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" disabled={true}>
                                Bajar de plan no disponible
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className={`flex flex-col relative overflow-hidden border-primary border-2`}>
                         <div className="absolute top-0 right-0 p-2 bg-primary rounded-bl-lg">
                            <Star className="h-5 w-5 text-primary-foreground fill-current" />
                         </div>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Gem className="h-5 w-5 text-primary"/> Plan Premium
                            </CardTitle>
                            <CardDescription>Desbloquea todo el potencial de Memora.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <p className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                            <ul className="space-y-2 text-sm">
                                {premiumPlanFeatures.map(feat => (
                                     <li key={feat} className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                        <span>{feat}</span>
                                     </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                             <Button className="w-full" disabled={true}>
                                Plan Actual (Demo)
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
