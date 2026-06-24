"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import Image from "next/image";
//import operator from "@/public/assets/operator.webp";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Loader2, UserPlus } from "lucide-react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/services/api";
import api from "@/services/apiaxios";
import ampul from "@/public/assets/horoz-europe.png";
import logo from "@/public/assets/horoz-europe.png"
import NimboLogo from "@/public/assets/nimbo-ikon.png";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LangComp from "@/components/header/langComp";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Login() {


    const t = useTranslations('loginPage');
    const tFooter = useTranslations('Footer');


    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const [form, setForm] = useState({
        eposta: "",
        sifre: ""
    });

    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setForm(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!turnstileToken) {
            toast.error(t('lutfenRobotOlmadiginiziDogrulayin'));
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post(API_ENDPOINTS.login, {
                ...form,
                cfTurnstileResponse: turnstileToken
            });

            if (response.data.status === 'success') {
                Cookies.set('accessToken', response.data.token, { expires: 5 / 24 });
                Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
                if (response.data.cartId !== '') {
                    Cookies.set('cartId', response.data.cartId);
                }

                toast.success(response.data.message);
                router.push('/');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            const errorData = error.response?.data;

            toast.error(errorData?.message || 'Kullanıcı adı veya şifre hatalı');
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <div className="flex h-screen">
            {/* Left side - Image */}
            <div className="hidden lg:flex w-1/2 bg-red-600 items-center justify-center">
                <Image
                    priority
                    src={ampul}
                    alt="Login"
                    className="object-contain h-auto w-48"
                />
            </div>

            {/* Right side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8">
                <div className="w-full max-w-md space-y-8">

                    <div className="flex justify-center w-[160px] mx-auto">
                        <Image
                            src={logo}
                            alt="Logo"
                            className="object-contain h-full w-full"
                        />
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">{t('hosgeldiniz')}</h2>
                        <p className="mt-2 text-gray-600">{t('hesapGiris')}</p>
                    </div>
                    <div className="flex justify-center">
                        <LangComp />
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="eposta">{t('kullaniciAdi')}</Label>
                                <Input type="text" id="eposta" required placeholder="" onChange={handleInputChange} />
                            </div>
                            <div className="grid w-fullitems-center gap-1.5">
                                <Label htmlFor="sifre">{t('sifre')}</Label>
                                <Input type="password" id="sifre" required placeholder="" onChange={handleInputChange} />
                            </div>
                            <div className="flex justify-center">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY as string}
                                    onSuccess={(token) => setTurnstileToken(token)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <Button className="w-full" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Lütfen bekleyiniz...
                            </Button>
                        ) : (
                            <Button className="w-full" type="submit">
                                {t('girisYap')}
                            </Button>
                        )}


                        <div className="flex justify-center">
                            <Link href="/new-dealer" className="flex items-center text-blue-600 font-bold">
                                <UserPlus className="mr-2 h-4 w-4" /> <span>{t('yeniBayiKayit')}</span>
                            </Link>
                        </div>
                    </form>
                    <div className="mt-10 border-t pt-4 text-center">
                        © {tFooter('poweredBy')} | Horoz Europe
                    </div>
                </div>
            </div>
            <Link href="https://nimboyazilim.com" target="_blank" rel="noopener noreferrer" className="hover:underline">

                <div className="fixed bottom-4 right-4 lg:right-4 lg:bottom-4 lg:flex lg:justify-end w-full px-4 z-50">
                    <div className="flex items-center justify-center lg:justify-end gap-1 mx-auto lg:mx-0 text-md text-gray-600">
                        <Image
                            src={NimboLogo}
                            alt="Nimbo Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="text-sm text-gray-700 font-medium">
                            E-Ticaret Çözümleri
                        </span>
                    </div>
                </div>
            </Link>

        </div>
    )
}
