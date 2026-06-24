'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function isYoutubeEmbedUrl(url: string) {
    return /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/.test(url);
}

function VideoFormContent() {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();
    const id = params.get("id");

    useEffect(() => {
        if (id) {
            api.get(`${API_ENDPOINTS.mediaVideoCreate}/${id}`).then(res => {
                setTitle(res.data.title);
                setUrl(res.data.url);
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !url) return;
        if (!isYoutubeEmbedUrl(url)) {
            toast({
                title: "Hatalı URL",
                description: "Sadece https://www.youtube.com/embed/... formatında YouTube embed linki ekleyebilirsiniz.",
                variant: "destructive"
            });
            return;
        }
        setIsLoading(true);
        try {
            if (id) {
                await api.put(`${API_ENDPOINTS.mediaVideoCreate}/${id}`, { title, url });
                toast({ title: "Başarılı", description: "Video güncellendi.", variant: "default" });
            } else {
                await api.post(API_ENDPOINTS.mediaVideoCreate, { title, url });
                toast({ title: "Başarılı", description: "Video eklendi.", variant: "default" });
            }
            setTimeout(() => {
                router.push('/media/video-liste');
            }, 1000);
        } catch {
            toast({ title: "Hata", description: "Kayıt işlemi başarısız.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg rounded shadow p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">{id ? "Video Düzenle" : "Yeni Video Ekle"}</h2>
            <div className="flex flex-col gap-2">
                <Label>Başlık</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Video Embed URL</Label>
                <Input value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://www.youtube.com/embed/..." />
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : id ? "Güncelle" : "Kaydet"}
            </Button>
        </form>
    );
}

export default function VideoEklePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <VideoFormContent />
        </Suspense>
    );
}