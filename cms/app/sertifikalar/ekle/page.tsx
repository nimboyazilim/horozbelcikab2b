'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { API_ENDPOINTS, API_BASE_URL_PDF } from "@/config/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function SertifikaFormContent() {
    const [name, setName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();
    const id = params.get("id");

    useEffect(() => {
        if (id) {
            api.get(`${API_ENDPOINTS.certificateById}/${id}`).then(res => {
                setName(res.data.name);
                setPreview(`${API_BASE_URL_PDF}/${res.data.file}`);
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
        if (!name || (!file && !id)) return;
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (file) formData.append('file', file);
            if (id) {
                await api.put(`${API_ENDPOINTS.certificateUpdate}/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Sertifika güncellendi.", variant: "default" });
            } else {
                await api.post(API_ENDPOINTS.certificateCreate, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Sertifika eklendi.", variant: "default" });
            }
            setTimeout(() => {
                router.push('/sertifikalar/liste');
            }, 1000);
        } catch {
            toast({ title: "Hata", description: "Kayıt işlemi başarısız.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg rounded shadow p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">{id ? "Sertifika Düzenle" : "Yeni Sertifika Ekle"}</h2>
            <div className="flex flex-col gap-2">
                <Label>Adı</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
                <Label>PDF Dosyası</Label>
                <Input type="file" accept="application/pdf" onChange={handleFileChange} required={!id} />
                {preview && (
                    <a href={preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2">
                        Yüklü Dosyayı Görüntüle
                    </a>
                )}
            </div>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Kaydediliyor..." : id ? "Güncelle" : "Kaydet"}
            </Button>
        </form>
    );
}

export default function SertifikaEklePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <SertifikaFormContent />
        </Suspense>
    );
}