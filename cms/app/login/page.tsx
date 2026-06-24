"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"
import Image from "next/image";
//import operator from "@/public/assets/operator.webp";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";
import api from "@/services/api";
import ampul from "@/public/assets/pexels-led-supermarket-179772-577528.jpg";
import logo from "@/public/assets/horoz-electric-logo.png";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Login() {
    const { toast } = useToast()
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
            toast({
                title: "Hata",
                description: "Lütfen robot olmadığınızı doğrulayınız.",
            });
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.post(API_ENDPOINTS.login, {
                ...form,
                cfTurnstileResponse: turnstileToken
            }
                
            );
            Cookies.set('accessToken', response.data.token, { expires: 5/24 });
            Cookies.set('refreshToken', response.data.refreshToken, { expires: 7 });
            toast({
                title: "Başarılı",
                description: response.data.message,
            });
            router.push('/');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Hata",
                description: error.response.data.message,
            });
        } finally {
            setIsLoading(false);
        }

    };




    return (
        <div className="flex h-screen">
            {/* Left side - Image */}
            <div className="hidden lg:flex w-1/2 bg-gray-100 items-center justify-center">
              <Image
                    priority
                    src={ampul}
                    alt="Login"
                    className="object-cover h-full w-full"
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
                        <h2 className="text-3xl font-bold">Hoş Geldiniz</h2>
                        <p className="mt-2 text-gray-600">Hesabınıza giriş yapın</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="eposta">Kullanıcı Adı</Label>
                                <Input type="text" id="eposta" required placeholder="" onChange={handleInputChange} />
                            </div>
                            <div className="grid w-fullitems-center gap-1.5">
                                <Label htmlFor="sifre">Şifre</Label>
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
                                Giriş Yap
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
