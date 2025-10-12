
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

    const familyDocRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
    const { data: familyData, isLoading: familyLoading } = useDoc(familyDocRef);

    const isPremium = familyData?.subscriptionTier === 'premium';
    
    // Mock usage data, in a real app this would also come from Firestore
    const storiesUsage = 3;
    const photosUsage = 15;


    const freePlanFeatures = [
        "5 stories limit",
        "20 photos limit",
        "Standard audio transcription",
    ];

    const premiumPlanFeatures = [
        "Unlimited stories",
        "Unlimited photos",
        "AI-powered animated photos",
        "Link physical Memora Boxes",
        "Priority support",
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">
                    Subscription Plan
                </h1>
                <p className="text-muted-foreground mb-8">
                    Manage your plan and explore premium features to enhance your family's legacy.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className={`flex flex-col ${isPremium ? 'border-muted' : 'border-primary border-2'}`}>
                        <CardHeader>
                            <CardTitle className="font-headline">Free Plan</CardTitle>
                            <CardDescription>For getting started with preserving memories.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
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
                                            <span>Stories</span>
                                            <span className="text-muted-foreground">{storiesUsage} / 5</span>
                                        </div>
                                        <Progress value={(storiesUsage / 5) * 100} />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Photos</span>
                                            <span className="text-muted-foreground">{photosUsage} / 20</span>
                                        </div>
                                        <Progress value={(photosUsage / 20) * 100} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" disabled={!isPremium}>
                                {isPremium ? 'Downgrade' : 'Current Plan'}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className={`flex flex-col relative overflow-hidden ${isPremium ? 'border-primary border-2' : ''}`}>
                         <div className="absolute top-0 right-0 p-2 bg-primary rounded-bl-lg">
                            <Star className="h-5 w-5 text-primary-foreground fill-current" />
                         </div>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Gem className="h-5 w-5 text-primary"/> Premium Plan
                            </CardTitle>
                            <CardDescription>Unlock the full potential of Memora.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                             <p className="text-3xl font-bold">$9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
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
                             <Button className="w-full" disabled={isPremium}>
                                {isPremium ? 'Current Plan' : 'Upgrade to Premium'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
