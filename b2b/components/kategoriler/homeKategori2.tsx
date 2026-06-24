"use client"
import Image from "next/image";
import { useLocale } from 'next-intl';
import Link from "next/link";

import { Virtual, Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import ikon from '../../public/assets/kategori/10-3.png'
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useEffect, useState } from "react";
import { getHomeAnaKategoriler, getKategori, getKategoriBreadcrumb } from "@/services/kategoriSevices";
import { API_BASE_URL_RESIM_KATEGORI } from "@/services/api";
import { ArrowLeft, ChevronRight } from "lucide-react";
interface Category {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    kategori_ikon: string;
    kategori_resim: string;
    altKategoriler?: Category[]; // Changed from alt_kategoriler to altKategoriler
}


export default function HomeKategori2() {

    const gradients = [
        "bg-gradient-to-r from-indigo-800 via-indigo-500 to-indigo-300",
        "bg-gradient-to-r from-purple-800 via-purple-500 to-purple-300",
        "bg-gradient-to-r from-blue-800 via-blue-500 to-blue-300",
        "bg-gradient-to-r from-green-800 via-green-500 to-green-300",
        "bg-gradient-to-r from-red-800 via-red-500 to-red-300",
        "bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-400",
        "bg-gradient-to-r from-pink-800 via-pink-500 to-pink-300",
        "bg-gradient-to-r from-teal-800 via-teal-500 to-teal-300",
        "bg-gradient-to-r from-orange-800 via-orange-500 to-orange-300",
    ];



    const locale = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getKategori();
                setCategories(result);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    const getCategoryName = (category: Category) => {
        switch(locale) {
            case 'en':
                return category.kategori_adi;
            case 'ru':
                return category.kategori_adi_en;
            default:
                return category.kategori_adi_tr;
        }
    };

    return (
        <div className="max-w-screen-xl mx-auto p-2 my-5">
            <div className="bg-white">
                <div className="grid lg:grid-cols-3 grid-cols-2 gap-2">
                    {categories.filter((category, index) => index < 9).map((category, index) => (
                        <Link 
                            key={index}
                            href={`/category/${category.kategori_seo}`}
                            className={`w-full flex flex-row text-sm p-2 items-center justify-center cursor-pointer border-b hover:bg-red-600 hover:text-white bg-gray-100 rounded-lg ${gradients[index]}`}
                        >
                            <div className="flex flex-col items-center justify-center space-x-2">
                                <Image src={category.kategori_ikon ? API_BASE_URL_RESIM_KATEGORI+category.kategori_ikon : API_BASE_URL_RESIM_KATEGORI+'category.svg'} alt={getCategoryName(category)} width={100} height={100} />
                                <span className="text-sm text-white">{getCategoryName(category)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}