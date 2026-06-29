import { useRouter } from "next/navigation";
import { useState } from "react";

import { useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Cookies from 'js-cookie';
import Link from "next/link";
import { useTranslations } from "next-intl";
import MusteriServices from "@/services/musteriServices";
export default function HeaderUserInfo() {

    const t = useTranslations('Header');

    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [eposta, setEposta] = useState<string>('');
    const [cariEkstreYetki, setCariEkstreYetki] = useState<boolean>(false);

    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];

        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                setCariEkstreYetki(Number(decodedToken.cari_ekstre_yetki) === 1);
                const musteriId = decodedToken.musteri_id || decodedToken.id;

                if (musteriId) {
                    MusteriServices.getProfil(musteriId)
                        .then((response: any) => {
                            const profile = response?.data || {};

                            const unvan1 = profile.unvan1 || profile.unvan_ad || profile.cari_unvan1 || profile.ad || '';
                            const unvan2 = profile.unvan2 || profile.unvan_soyad || profile.cari_unvan2 || profile.soyad || '';
                            const fullName = `${unvan1} ${unvan2}`.trim();

                            setUsername(fullName || decodedToken.adsoyad || '');
                            setEposta(profile.eposta || decodedToken.eposta || '');
                        })
                        .catch(() => {
                            setUsername(decodedToken.adsoyad || '');
                            setEposta(decodedToken.eposta || '');
                        });
                } else {
                    setUsername(decodedToken.adsoyad || '');
                    setEposta(decodedToken.eposta || '');
                }
            }
        }
    }, []);

    const handleLogout = () => {
        document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        Cookies.remove('cartId');
        
        router.push('/login');
    };


// JWT'den payload'ı decode eden yardımcı fonksiyon
function decodeJWT(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Türkçe karakterler için decode işlemi
            payload.adsoyad = payload.adsoyad ? decodeURIComponent(escape(payload.adsoyad)) : '';
            payload.eposta = payload.eposta ? decodeURIComponent(escape(payload.eposta)) : '';
      return payload;
    } catch (e) {
      return null;
    }
  }


    return (
        <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Avatar>
                            <AvatarFallback> {username ? username.split(' ')
                                    .map(name => name[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 1) : 'HRZ'}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel className="text-xs">
                            <div className="font-bold">{username}</div>
                        <div className="text-gray-500">{eposta}</div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profil"><DropdownMenuItem>{t('profil')}</DropdownMenuItem></Link>
                        {cariEkstreYetki && <Link href="/account-statement"><DropdownMenuItem>{t('cariEkstre')}</DropdownMenuItem></Link>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>{t('oturumKapat')}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
    )
}