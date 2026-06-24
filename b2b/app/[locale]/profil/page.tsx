'use client'
import { Input } from "@/components/ui/input";
import { useEffect, useState, useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { useLocale } from "next-intl";
import { buildCountryOptions } from "@/lib/countryLocale";
import { Button } from "@/components/ui/button";
import MusteriServices from "@/services/musteriServices";
import { toast } from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ProfilPage() {

    const router = useRouter();
    const locale = useLocale();
    const countryOptions = useMemo(() => buildCountryOptions(locale), [locale]);


    const [formData, setFormData] = useState({
        ad: "",
        soyad: "",
        vkntckn: "",
        eposta: "",
        telefon: "",
        sifre: "",
        sifre1: ""
    });

    const [adresFormData, setAdresFormData] = useState({
        musteri_id: "",
        adres_turu: "1",
        il: "",
        ilce: "",
        ulke: "",
        posta_kodu: "",
        tel: "",
        adres: "",
        varsayilan: 0
    });

      const [isEditMode, setIsEditMode] = useState(false);
      const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [adresCountryCode, setAdresCountryCode] = useState('');
      const [adresStateCode, setAdresStateCode] = useState('');

      const adresStates = adresCountryCode ? State.getStatesOfCountry(adresCountryCode) : [];
      const adresCities = adresCountryCode && adresStateCode ? City.getCitiesOfState(adresCountryCode, adresStateCode) : [];

      const handleAdresCountryChange = (isoCode: string) => {
        const country = Country.getCountryByCode(isoCode);
        setAdresCountryCode(isoCode);
        setAdresStateCode('');
        setAdresFormData(prev => ({ ...prev, ulke: country?.name || '', il: '', ilce: '' }));
      };

      const handleAdresStateChange = (isoCode: string) => {
        const state = State.getStatesOfCountry(adresCountryCode).find(s => s.isoCode === isoCode);
        setAdresStateCode(isoCode);
        setAdresFormData(prev => ({ ...prev, il: state?.name || '', ilce: '' }));
      };

      const handleAdresCityChange = (cityName: string) => {
        setAdresFormData(prev => ({ ...prev, ilce: cityName }));
      };

    const [musteriId, setMusteriId] = useState("");
    const [adreslerData, setAdreslerData] = useState([]);

    useEffect(() => {
        const accessToken = document.cookie
            .split('; ')
            .find(row => row.startsWith('accessToken='))
            ?.split('=')[1];

        if (accessToken) {
            const decodedToken = decodeJWT(accessToken);
            if (decodedToken) {
                setMusteriId(decodedToken.musteri_id);
            }
        }
    }, []);


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


    useEffect(() => {
        musteri(musteriId);
        adresler(musteriId);
    }, [musteriId]);

    const musteri = async (musteriId: string) => {
        try {
            if (!musteriId) return; // musteriId boşsa işlemi durdur
            const musteri = await MusteriServices.getProfil(musteriId);
            if (musteri && musteri.data) {
                setFormData(musteri.data);
            }
        } catch (error) {
            console.error('Profil bilgileri alınamadı:', error);
            toast.error('Profil bilgileri alınamadı');
        }
    }

    const adresler = async (musteriId: string) => {
        try {
            if (!musteriId) return; // musteriId boşsa işlemi durdur
            const adresler = await MusteriServices.musteriAdresleri(musteriId);
            if (adresler) {
                setAdreslerData(adresler);
            }
        } catch (error) {
            console.error('Adresler alınamadı:', error);
            toast.error('Adresler alınamadı');
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleAdresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdresFormData({ ...adresFormData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        try {
            const response = await MusteriServices.updateProfil(musteriId, formData);
            if (response.status === 'success') {
                toast.success('Profil bilgileri güncellendi');
                if (formData.sifre1 != "") {
                    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    Cookies.remove('cartId');
                    
                    router.push('/login');
                }
            } else {
                toast.error('Profil bilgileri güncellenemedi');
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    }


    const handleAdresSubmit = async () => {
        adresFormData.musteri_id = musteriId;

        try {
            let response;

            if (isEditMode && editingAddressId) {
                response = await MusteriServices.updateAdres(editingAddressId, adresFormData);
            } else {
                response = await MusteriServices.createAdres(adresFormData);
            }

            if (response.status === 'success') {
                toast.success(isEditMode ? 'Adres güncellendi' : 'Adres eklendi');
                setIsDialogOpen(false);
                setIsEditMode(false);
                setEditingAddressId(null);
                setAdresCountryCode('');
                setAdresStateCode('');
                setAdresFormData({
                    musteri_id: "",
                    adres_turu: "1",
                    il: "",
                    ilce: "",
                    ulke: "",
                    posta_kodu: "",
                    tel: "",
                    adres: "",
                    varsayilan: 0
                });
                adresler(musteriId);
            } else {
                toast.error(isEditMode ? 'Adres güncellenemedi' : 'Adres eklenemedi');
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    }

    const handleAdresDelete = async (id: string) => {
        try {
            const response = await MusteriServices.deleteAdres(id);
            if (response.status === 'success') {
                toast.success('Adres silindi');
                adresler(musteriId);
            } else {
                toast.error('Adres silinemedi');
            }
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    }

    const handleAdresEditClick = (adres: any) => {
        setIsEditMode(true);
        setEditingAddressId(adres.id);

        const foundCountry = Country.getAllCountries().find(c => c.name === adres.ulke);
        const newCountryCode = foundCountry?.isoCode || '';
        setAdresCountryCode(newCountryCode);

        if (newCountryCode) {
            const foundState = State.getStatesOfCountry(newCountryCode).find(s => s.name === adres.il);
            setAdresStateCode(foundState?.isoCode || '');
        } else {
            setAdresStateCode('');
        }

        setAdresFormData({
            musteri_id: adres.musteri_id,
            adres_turu: adres.adres_turu.toString(),
            il: adres.il,
            ilce: adres.ilce,
            ulke: adres.ulke,
            posta_kodu: adres.posta_kodu,
            tel: adres.tel,
            adres: adres.adres,
            varsayilan: adres.varsayilan
        });
        setIsDialogOpen(true);
    }




    return (
        <div className="max-w-screen-lg mx-auto px-4 my-10">
            <h1 className="text-2xl font-bold mb-5">Profil</h1>


            <div className="flex flex-col gap-4">
                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="ad" className="text-sm font-medium w-32">Ad</label>
                    <Input type="text" id="ad" name="ad" className="w-full" value={formData.ad} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="soyad" className="text-sm font-medium w-32">Soyad</label>
                    <Input type="text" id="soyad" name="soyad" className="w-full" value={formData.soyad} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="vkntckn" className="text-sm font-medium w-32">VKN/TCKN</label>
                    <Input type="text" id="vkntckn" name="vkntckn" className="w-full" value={formData.vkntckn} onChange={handleChange} />
                </div>


                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="eposta" className="text-sm font-medium w-32">Email</label>
                    <Input type="email" id="eposta" name="eposta" readOnly className="w-full" value={formData.eposta} onChange={handleChange} />
                </div>
                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="telefon" className="text-sm font-medium w-32">Telefon</label>
                    <Input type="tel" id="telefon" name="telefon" className="w-full" value={formData.telefon} onChange={handleChange} />
                </div>

                <div className="flex flex-row items-center gap-2">
                    <label htmlFor="sifre1" className="text-sm font-medium w-32">Şifre</label>
                    <Input type="password" id="sifre1" name="sifre1" autoComplete="new-password" className="w-full" value={formData.sifre1} onChange={handleChange} />
                </div>
                <div className="flex flex-row items-center gap-2">
                    
                </div>

                <Button type="submit" className="w-full" onClick={handleSubmit}>Güncelle</Button>
            </div>

            <div className="flex flex-col gap-4 my-10">
                <h1 className="text-2xl font-bold mb-5">Adresler</h1>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setIsEditMode(false);
                        setEditingAddressId(null);
                        setAdresCountryCode('');
                        setAdresStateCode('');
                        setAdresFormData({
                            musteri_id: "",
                            adres_turu: "1",
                            il: "",
                            ilce: "",
                            ulke: "",
                            posta_kodu: "",
                            tel: "",
                            adres: "",
                            varsayilan: 0
                        });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Yeni Adres</Button>
                    </DialogTrigger>
                    <DialogContent className="w-[780px]">
                        <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Adres Düzenle' : 'Yeni Adres'}</DialogTitle>
                            <DialogDescription>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="adres_turu" className="text-right">
                                    Adres Türü
                                </Label>
                                <Select value={adresFormData.adres_turu} onValueChange={(value) => setAdresFormData({ ...adresFormData, adres_turu: value })}>
                                    <SelectTrigger className="w-80">
                                        <SelectValue placeholder="Adres Türü" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Adres Türü</SelectLabel>
                                            <SelectItem value="1">Gönderim Adresi</SelectItem>
                                            <SelectItem value="2">Fatura Adresi</SelectItem>
                                            <SelectItem value="3">Gönderim + Fatura Adresi</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ulke" className="text-right">Ülke</Label>
                                <div className="col-span-3">
                                    <SearchableSelect
                                        id="ulke"
                                        options={countryOptions}
                                        value={adresCountryCode}
                                        onChange={handleAdresCountryChange}
                                        placeholder="Ülke seçin"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="il" className="text-right">İl / Eyalet</Label>
                                <div className="col-span-3">
                                    {adresStates.length > 0 ? (
                                        <SearchableSelect
                                            id="il"
                                            options={adresStates.map(s => ({ value: s.isoCode, label: s.name }))}
                                            value={adresStateCode}
                                            onChange={handleAdresStateChange}
                                            placeholder="İl / Eyalet seçin"
                                            disabled={!adresCountryCode}
                                        />
                                    ) : (
                                        <Input id="il" name="il" value={adresFormData.il} disabled={!adresCountryCode} onChange={handleAdresChange} />
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ilce" className="text-right">İlçe / Şehir</Label>
                                <div className="col-span-3">
                                    {adresCities.length > 0 ? (
                                        <SearchableSelect
                                            id="ilce"
                                            options={Array.from(new Map(adresCities.map(c => [c.name, { value: c.name, label: c.name }])).values())}
                                            value={adresFormData.ilce}
                                            onChange={handleAdresCityChange}
                                            placeholder="İlçe / Şehir seçin"
                                            disabled={!adresStateCode}
                                        />
                                    ) : (
                                        <Input id="ilce" name="ilce" value={adresFormData.ilce} disabled={!adresFormData.il} onChange={handleAdresChange} />
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="adres" className="text-right">
                                    Adres
                                </Label>
                                <Input id="adres" name="adres" className="col-span-3" value={adresFormData.adres} onChange={handleAdresChange} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="posta_kodu" className="text-right">
                                    Posta Kodu
                                </Label>
                                <Input id="posta_kodu" name="posta_kodu" className="col-span-3" value={adresFormData.posta_kodu} onChange={handleAdresChange} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tel" className="text-right">
                                    Telefon
                                </Label>
                                <Input id="tel" name="tel" className="col-span-3" value={adresFormData.tel} onChange={handleAdresChange} />
                            </div>

                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleAdresSubmit}>Kaydet</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {adreslerData.length > 0 && adreslerData.map((adres: any) => (
                    <div key={adres.id}
                        className={`bg-gray-50 h-auto flex flex-col p-2 rounded-lg mb-0 text-sm relative`}>

                        <div className="flex flex-row justify-between items-center">

                            
                                <div className="flex flex-col">
                                    <p className="font-bold">{adres.adres_turu == "1" ? "Gönderim Adresi" : adres.adres_turu == "2" ? "Fatura Adresi" : "Gönderim + Fatura Adresi"}</p>
                                    <div>
                                        <p>{adres.adres}</p>


                                        <span> {adres.ilce} </span>
                                        <span className="mr-2"> {adres.il} </span>
                                        <span className="mr-2"> {adres.ulke} </span>
                                        <span className="mr-2"> {adres.posta_kodu} </span>
                                        <p>{adres.tel}</p>

                                    </div>

                                </div>
                                <div className="flex flex-row">
                                <Button variant="outline" onClick={() => handleAdresEditClick(adres)}>Düzenle</Button>
                                    <Button variant="outline" onClick={() => handleAdresDelete(adres.id)}>Sil</Button>
                                </div>
                            </div>
                        </div>
                    
                ))}

                    </div>

        </div>

            )
}