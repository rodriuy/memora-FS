import { familyMembers } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

export default function FamilyPage() {
    const userImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="font-headline text-2xl">Family Circle</CardTitle>
                        <CardDescription>Manage who is part of your family's Memora account.</CardDescription>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {familyMembers.map(member => (
                            <Card key={member.id} className="text-center flex flex-col items-center p-6">
                                <Avatar className="w-24 h-24 mb-4 border-4 border-secondary">
                                    <AvatarImage src={userImage(member.avatarId)} alt={member.name} />
                                    <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-lg">{member.name}</p>
                                <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'} className="mt-1">
                                    {member.role}
                                </Badge>
                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm">View Stories</Button>
                                    <Button variant="ghost" size="sm">Remove</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
