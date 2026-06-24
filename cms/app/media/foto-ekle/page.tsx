'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { API_ENDPOINTS, API_BASE_URL_RESIM_MEDIA } from "@/config/api";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

function FotoFormContent() {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();
    const id = params.get("id");

    useEffect(() => {
        if (id) {
            api.get(`${API_ENDPOINTS.mediaPhotoCreate}/${id}`).then(res => {
                setTitle(res.data.title);
                setPreview(`${API_BASE_URL_RESIM_MEDIA}/${res.data.image}`);
            });
        }
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        setFile(f || null);
        if (f) setPreview(URL.createObjectURL(f));
        else setPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || (!file && !id)) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            if (file) formData.append('image', file);
            if (id) {
                await api.put(`${API_ENDPOINTS.mediaPhotoCreate}/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Fotoğraf güncellendi.", variant: "default" });
            } else {
                await api.post(API_ENDPOINTS.mediaPhotoCreate, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Fotoğraf eklendi.", variant: "default" });
            }
            setTimeout(() => {
                router.push('/media/foto-liste');
            }, 1000);
        } catch {
            toast({ title: "Hata", description: "Kayıt işlemi başarısız.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg rounded shadow p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">{id ? "Fotoğraf Düzenle" : "Yeni Fotoğraf Ekle"}</h2>
            <div className="flex flex-col gap-2">
                <Label>Başlık</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Görsel</Label>
                <Input type="file" accept="image/*" onChange={handleFileChange} required={!id} />
                {preview && (
                    <Image src={preview} alt="Önizleme" width={200} height={200} className="rounded mt-2" />
                )}
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : id ? "Güncelle" : "Kaydet"}
            </Button>
        </form>
    );
}

export default function FotoEklePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <FotoFormContent />
        </Suspense>
    );
}