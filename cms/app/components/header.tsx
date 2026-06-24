import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DarkMode } from "./darkMode";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Bildirimler from "./bildirimler";
import Link from 'next/link';
// JWT'den payload'ı decode eden yardımcı fonksiyon
function decodeJWT(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Türkçe karakterler için decode işlemi
    payload.adsoyad = decodeURIComponent(escape(payload.adsoyad));
    payload.eposta = decodeURIComponent(escape(payload.eposta));
    return payload;
  } catch (e) {
    return null;
  }
}

export default function Header() {
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [eposta, setEposta] = useState<string>('');

    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];

        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                setUsername(decodedToken.adsoyad);
                setEposta(decodedToken.eposta);
            }
        }
    }, []);

    const handleLogout = () => {
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        router.push('/login');
    };

    return (
        <header className="flex flex-row justify-between h-14 items-center border-b px-6 sticky top-0 z-50 bg-gray-50 dark:bg-gray-950">

            <SidebarTrigger className="h-7 w-7 [&>svg]:w-full [&>svg]:h-full [&>svg]:scale-125" />
            <div className="flex flex-row items-center space-x-4">



    


          

                <Bildirimler />





                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarFallback> {username ? username.split(' ')
                                    .map(name => name[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 1) : 'CN'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel className="text-xs">
                            <div className="font-bold">{username}</div>
                        <div className="text-gray-500">{eposta}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profil" className="cursor-pointer">
                                Profil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>Oturumu Kapat</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DarkMode />



            </div>


        </header>
    );
}
