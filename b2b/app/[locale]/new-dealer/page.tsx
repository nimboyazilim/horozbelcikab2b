'use client'
import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import Logo from "@/public/assets/horoz-electric-logo.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import MusteriServices from "@/services/musteriServices";
import { useTranslations, useLocale } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";
import { Country, State, City } from "country-state-city";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { buildCountryOptions } from "@/lib/countryLocale";
interface FormData {
  id: number;
  kodu: string;
  ad: string;
  soyad: string;
  vkntckn: string;
  eposta: string;
  telefon: string;
  iskonto_yuzde: number;
  fiyat_grup_id: number;
  durum: number;
  adres_turu: number;
  il: string;
  ilce: string;
  ulke: string;
  adres: string;
  posta_kodu: string;
  sifre: string;
  sifre_tekrar: string;
}

export default function NewDealer() {

  const t = useTranslations('newDealerPage');
  const locale = useLocale();
  const [formData, setFormData] = useState<Partial<FormData>>({
    kodu: '',
    ad: '',
    soyad: '',
    vkntckn: '',
    eposta: '',
    telefon: '',
    iskonto_yuzde: 0,
    fiyat_grup_id: 0,
    durum: 0,
    adres_turu:3,
    il: '',
    ilce: '',
    ulke: '',
    adres: '',
    posta_kodu: '',
    sifre: '',
    sifre_tekrar: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileRef, setTurnstileRef] = useState<any>(null);
  const [countryCode, setCountryCode] = useState('');
  const [stateCode, setStateCode] = useState('');

  const countryOptions = useMemo(() => buildCountryOptions(locale), [locale]);
  const states = countryCode ? State.getStatesOfCountry(countryCode) : [];
  const cities = countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : [];

  const handleCountryChange = (isoCode: string) => {
    const country = Country.getCountryByCode(isoCode);
    setCountryCode(isoCode);
    setStateCode('');
    setFormData(prev => ({ ...prev, ulke: country?.name || '', il: '', ilce: '' }));
  };

  const handleStateChange = (isoCode: string) => {
    const state = State.getStatesOfCountry(countryCode).find(s => s.isoCode === isoCode);
    setStateCode(isoCode);
    setFormData(prev => ({ ...prev, il: state?.name || '', ilce: '' }));
  };

  const handleCityChange = (cityName: string) => {
    setFormData(prev => ({ ...prev, ilce: cityName }));
  };

  const turnstileRefCallback = useCallback((ref: any) => {
    setTurnstileRef(ref);
  }, []);

  // Token yenileme için yeni fonksiyon
  const refreshTurnstile = () => {
    if (turnstileRef) {
      turnstileRef.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!turnstileToken) {
      refreshTurnstile();
      toast.error(t('lutfenRobotOlmadiginiziDogrulayin'));
      setIsLoading(false);
      return;
    }

    if(formData.sifre !== formData.sifre_tekrar) {
      toast.error(t('sifreTekrarHatasi'));
      setIsLoading(false);
      return;
    }

    try {
        const response = await MusteriServices.musteriBasvuru({
          ...formData,
          cfTurnstileResponse: turnstileToken
        });
        if (response.status === 'success') {
            setIsSuccess(true);
            toast.success(t('basvurunuzBasarili'),{
                duration: 5000,
            });
        } else {
            toast.error(response.message);
        }
    } catch (error: any) {
        toast.error(error.response.data.message);
    } finally {
        setIsLoading(false);
    }
}


  return (
    <>
    {isSuccess && (
      <div className="container mx-auto max-w-2xl bg-white py-8 mt-10 border shadow-md rounded-md px-8">
        {t('basvurunuzBasarili')}
      </div>
    )}
    <div className="absolute top-0 left-0 w-full h-1/2 bg-red-600 z-[-1] shadow-md rounded-b-3xl"></div>
    <div className="container mx-auto max-w-2xl bg-white py-8 mt-10 border shadow-md rounded-md px-8">
      <div className="flex flex-col items-center mb-8">
        {/* Logo placeholder - replace with your actual logo */}
        <div className="w-48 h-24 flex items-center justify-center mb-6">
          <Image src={Logo} alt="Logo" width={192} height={72} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Ad - Soyad */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="ad">{t('ad')}</Label>
            <Input 
              id="ad" 
              name="ad" 
              value={formData.ad} 
              required
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })} 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="soyad">{t('soyad')}</Label>
            <Input 
              id="soyad" 
              name="soyad" 
              value={formData.soyad} 
              required
              onChange={(e) => setFormData({ ...formData, soyad: e.target.value })} 
            />
          </div>

          {/* VKNTCKN - Eposta */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="vkntckn">{t('vknTckn')}</Label>
            <Input 
              id="vkntckn" 
              name="vkntckn" 
              value={formData.vkntckn} 
              required
              onChange={(e) => setFormData({ ...formData, vkntckn: e.target.value })} 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="eposta">{t('eposta')}</Label>
            <Input 
              id="eposta" 
              type="email" 
              name="eposta" 
              value={formData.eposta} 
              required
              onChange={(e) => setFormData({ ...formData, eposta: e.target.value })} 
            />
          </div>

          {/* Telefon - Posta Kodu */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="telefon">{t('telefon')}</Label>
            <Input 
              id="telefon" 
              name="telefon" 
              value={formData.telefon} 
              required
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} 
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="posta_kodu">{t('postaKodu')}</Label>
            <Input 
              id="posta_kodu" 
              name="posta_kodu" 
              value={formData.posta_kodu} 
              required
              onChange={(e) => setFormData({ ...formData, posta_kodu: e.target.value })} 
            />
          </div>
        </div>

        {/* Ülke - İl - İlçe */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="ulke">{t('ulke')}</Label>
            <SearchableSelect
              id="ulke"
              options={countryOptions}
              value={countryCode}
              onChange={handleCountryChange}
              placeholder={t('ulke')}
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="il">{t('il')}</Label>
            {states.length > 0 ? (
              <SearchableSelect
                id="il"
                options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                value={stateCode}
                onChange={handleStateChange}
                placeholder={t('il')}
                disabled={!countryCode}
              />
            ) : (
              <Input
                id="il"
                name="il"
                value={formData.il || ''}
                required
                disabled={!countryCode}
                onChange={(e) => setFormData(prev => ({ ...prev, il: e.target.value }))}
              />
            )}
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="ilce">{t('ilce')}</Label>
            {cities.length > 0 ? (
              <SearchableSelect
                id="ilce"
                options={Array.from(new Map(cities.map(c => [c.name, { value: c.name, label: c.name }])).values())}
                value={formData.ilce || ''}
                onChange={handleCityChange}
                placeholder={t('ilce')}
                disabled={!stateCode}
              />
            ) : (
              <Input
                id="ilce"
                name="ilce"
                value={formData.ilce || ''}
                required
                disabled={!formData.il}
                onChange={(e) => setFormData(prev => ({ ...prev, ilce: e.target.value }))}
              />
            )}
          </div>
        </div>

        {/* Adres */}
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="adres">{t('adres')}</Label>
          <Textarea 
            id="adres" 
            name="adres" 
            value={formData.adres} 
            required
            onChange={(e) => setFormData({ ...formData, adres: e.target.value })} 
            className="min-h-[100px]"
          />
        </div>


        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="sifre">{t('sifre')}</Label>
          <Input 
            id="sifre" 
            name="sifre" 
            type="password"
            autoComplete="off"
            value={formData.sifre} 
            required
            onChange={(e) => setFormData({ ...formData, sifre: e.target.value })} 
          />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="sifre">{t('sifreTekrar')}</Label>
          <Input 
            id="sifre_tekrar" 
            name="sifre_tekrar" 
            type="password"
            autoComplete="off"
            value={formData.sifre_tekrar} 
            required
            onChange={(e) => setFormData({ ...formData, sifre_tekrar: e.target.value })} 
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY as string}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => {
                setTurnstileToken(null);
                refreshTurnstile();
              }}
              onExpire={() => {
                setTurnstileToken(null);
                refreshTurnstile();
              }}
              ref={turnstileRefCallback}
            />
          </div>
          <Button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
            disabled={isLoading}
          >
            {isLoading ? t('gonderiliyor') : t('basvuruYap')}
          </Button>
          
          <p className="text-sm text-gray-600">
            {t('zatenUyeMisinsiniz')}
            <Link href="/login" className="text-blue-600 hover:underline">
              {t('girisYap')}
            </Link>
          </p>
        </div>
      </form>
    </div>
    </>
  );
}
