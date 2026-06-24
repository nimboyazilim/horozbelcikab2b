'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api from "@/services/api";
import { API_ENDPOINTS, API_BASE_URL_TIMELINE } from "@/config/api";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

function TimelineFormContent() {
    const [year, setYear] = useState('');
    const [title_tr, setTitleTr] = useState('');
    const [title_en, setTitleEn] = useState('');
    const [title_ru, setTitleRu] = useState('');
    const [description_tr, setDescriptionTr] = useState('');
    const [description_en, setDescriptionEn] = useState('');
    const [description_ru, setDescriptionRu] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const params = useSearchParams();
    const { toast } = useToast();
    const id = params.get("id");

    useEffect(() => {
        if (id) {
            api.get(`${API_ENDPOINTS.corporateTimeline}/${id}`).then(res => {
                setYear(res.data.year ? String(res.data.year) : '');
                setTitleTr(res.data.title_tr || '');
                setTitleEn(res.data.title_en || '');
                setTitleRu(res.data.title_ru || '');
                setDescriptionTr(res.data.description_tr || '');
                setDescriptionEn(res.data.description_en || '');
                setDescriptionRu(res.data.description_ru || '');
                setPreview(res.data.image ? `${API_BASE_URL_TIMELINE}/${res.data.image}` : null);
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
        if (
            !year ||
            !title_tr || !title_en || !title_ru ||
            !description_tr || !description_en || !description_ru ||
            (!file && !id)
        ) return; setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('year', year);
            formData.append('title_tr', title_tr);
            formData.append('title_en', title_en);
            formData.append('title_ru', title_ru);
            formData.append('description_tr', description_tr);
            formData.append('description_en', description_en);
            formData.append('description_ru', description_ru);
            if (file) formData.append('image', file);
            if (id) {
                await api.put(`${API_ENDPOINTS.corporateTimeline}/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Kayıt güncellendi.", variant: "default" });
            } else {
                await api.post(API_ENDPOINTS.corporateTimeline, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                toast({ title: "Başarılı", description: "Kayıt eklendi.", variant: "default" });
            }
            setTimeout(() => {
                router.push('/corporate-timeline/liste');
            }, 1000);
        } catch {
            toast({ title: "Hata", description: "Kayıt işlemi başarısız.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg rounded shadow p-8 flex flex-col gap-6">
            <h2 className="text-xl font-bold mb-2">{id ? "Kayıt Düzenle" : "Yeni Kayıt Ekle"}</h2>
            <div className="flex flex-col gap-2">
                <label>Yıl</label>
                <Input type="number" value={year} onChange={e => setYear(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
                <label>Başlık (Türkçe)</label>
                <Input value={title_tr} onChange={e => setTitleTr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Başlık (İngilizce)</label>
                <Input value={title_en} onChange={e => setTitleEn(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Başlık (Rusça)</label>
                <Input value={title_ru} onChange={e => setTitleRu(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Açıklama (Türkçe)</label>
                <Textarea value={description_tr} onChange={e => setDescriptionTr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Açıklama (İngilizce)</label>
                <Textarea value={description_en} onChange={e => setDescriptionEn(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Açıklama (Rusça)</label>
                <Textarea value={description_ru} onChange={e => setDescriptionRu(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
                <label>Görsel</label>
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

export default function TimelineEklePage() {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <TimelineFormContent />
        </Suspense>
    );
}