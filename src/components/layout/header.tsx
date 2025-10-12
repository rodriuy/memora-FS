
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { LogOut, Settings, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

function getPageTitle(pathname: string): string {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Welcome';
    
    // Handle dynamic routes like /stories/[id]
    if (segments[0] === 'stories' && segments.length > 1) {
        if (segments[1] === 'new') return 'Add New Story';
        if (segments[2] === 'edit') return 'Edit Story';
        return 'Story Details';
    }
    
    const title = segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    return title;
}

export function Header() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '..';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold md:text-xl font-headline">{pageTitle}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/u1/100/100"} alt={user?.displayName || "User"} data-ai-hint="person portrait" />
              <AvatarFallback>{isUserLoading ? '..' : getInitials(user?.displayName)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className='flex flex-col space-y-1'>
                <p className="text-sm font-medium leading-none">{user?.displayName || "Guest"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
