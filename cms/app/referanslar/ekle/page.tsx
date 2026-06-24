'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { API_ENDPOINTS, API_BASE_URL_RESIM_REFERANS } from "@/config/api";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

function ReferansFormContent() {
    const [title, setTitle] = useState('');
    const [country, setCountry] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();
    const id = params.get("id");

    useEffect(() => {
        if (id) {
            api.get(`${API_ENDPOINTS.referenceById}/${id}`).then(res => {
                setTitle(res.data.title);
                setCountry(res.data.country);
                setPreview(`${API_BASE_URL_RESIM_REFERANS}/${res.data.image}`);
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
        if (!title || !country || (!file && !id)) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('country', country);
            if (file) formData.append('image', file);
            if (id) {
                await api.put(`${API_ENDPOINTS.referenceUpdate}/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Referans güncellendi.", variant: "default" });
            } else {
                await api.post(API_ENDPOINTS.referenceCreate, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Referans eklendi.", variant: "default" });
            }
            setTimeout(() => {
                router.push('/referanslar/liste');
            }, 1000);
        } catch {
            toast({ title: "Hata", description: "Kayıt işlemi başarısız.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg rounded shadow p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">{id ? "Referans Düzenle" : "Yeni Referans Ekle"}</h2>
            <div className="flex flex-col gap-2">
                <Label>Başlık</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Ülke</Label>
                <Input value={country} onChange={e => setCountry(e.target.value)} required />
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

export default function ReferansEklePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <ReferansFormContent />
        </Suspense>
    );
}