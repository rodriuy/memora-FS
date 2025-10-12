import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  import { stories } from "@/lib/data"
  import { Button } from "@/components/ui/button"
  import Link from "next/link"
  import { ArrowRight, PlusCircle } from "lucide-react"
  import Image from "next/image"
  import { PlaceHolderImages } from "@/lib/placeholder-images"
  
  export default function StoriesPage() {
    const storyImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight font-headline">
                Story Collection
            </h1>
            <Link href="/stories/new">
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Story
                </Button>
            </Link>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Narrator</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={story.title}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={storyImage(story.imageId)}
                      width="64"
                      data-ai-hint="family photo"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.narrator}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={story.status === 'completed' ? 'default' : 'secondary'}>
                      {story.status.charAt(0).toUpperCase() + story.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/stories/${story.id}`}>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                        <span className="sr-only">View story</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }
  