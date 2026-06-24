import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {useTranslations} from 'next-intl';
import { useState } from "react";
import api from "@/services/apiaxios";
import { API_ENDPOINTS,API_BASE_URL_RESIM } from "@/services/api";
import Link from "next/link";
import Image from "next/image";
export default function SearchComp() {

    const [ara,setAra] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [kategori, setKategori] = useState<any[]>([]);

    const t = useTranslations('Header');

    const handleSearch = async (searchTerm: string) => {
        if (searchTerm.length > 2) {  // En az 3 karakter yazıldığında ara
            const response = await api.get(API_ENDPOINTS.urunAra + searchTerm);
            setSearchResults(response.data.urunler || []);
            setKategori(response.data.kategori || []);
        } else {
            setSearchResults([]);
            setKategori([]);
        }
    }

    return (
        <div className="relative w-full lg:w-auto">
            <div className="flex items-center border rounded-md px-2 bg-gray-50">
                <SearchIcon className="h-4 w-4 text-muted-foreground mr-2" />
                <Input 
                    type="search"
                    placeholder={t('searchPlaceholder')}
                    className="w-full lg:w-[350px] xl:w-[450px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-gray-50"
                    value={ara}
                    onChange={(e) => {
                        setAra(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>
            
            {(searchResults.length > 0 || kategori.length > 0) && (
                <div className="absolute w-full mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="flex">
                        {/* Sol taraf - Ürünler */}
                        <div className="flex-1">
                            {searchResults.length > 0 && (
                                <div>
                                    <div className="p-2 text-xs text-gray-500 font-semibold border-b">{t('products')}</div>
                                    {searchResults.map((urun: any, index: number) => (
                                        <a href={`/product-detail/${urun.urun_seo}`} key={index} onClick={() => {setSearchResults([]); setAra(''); setKategori([]);}}>
                                            <div className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex flex-row items-center gap-2">
                                                <Image src={ urun.resim ? API_BASE_URL_RESIM + urun.resim : API_BASE_URL_RESIM + 'urun-gorsel.webp'} alt={urun.urun_adi} width={30} height={30} />
                                                {urun.urun_adi}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Sağ taraf - Kategoriler */}
                        <div className="flex-1 border-l">
                            {kategori.length > 0 && (
                                <div>
                                    <div className="p-2 text-xs text-gray-500 font-semibold border-b">{t('categories')}</div>
                                    {kategori.map((kat, index) => (
                                        <Link href={`/products/${kat.kategori_seo}`} key={index} onClick={() => {setSearchResults([]); setKategori([]); setAra('');}}>
                                            <div className="p-2 hover:bg-gray-100 cursor-pointer text-sm flex flex-row items-center gap-2">
                                                {kat.kategori_adi}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}