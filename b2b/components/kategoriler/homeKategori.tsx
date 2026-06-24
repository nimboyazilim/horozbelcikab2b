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
import { getHomeAnaKategoriler, getKategoriBreadcrumb } from "@/services/kategoriSevices";
import { API_BASE_URL_RESIM_KATEGORI } from "@/services/api";
interface Category {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    kategori_ikon: string;
    kategori_resim: string;
}


export default function HomeKategori() {
    const locale = useLocale();
    const gradients = [
        "bg-gradient-to-r from-indigo-800 via-indigo-500 to-indigo-300",
        "bg-gradient-to-r from-purple-800 via-purple-500 to-purple-300",
        "bg-gradient-to-r from-blue-800 via-blue-500 to-blue-300",
        "bg-gradient-to-r from-green-800 via-green-500 to-green-300",
        "bg-gradient-to-r from-red-800 via-red-500 to-red-300",
        "bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-400",
        "bg-gradient-to-r from-pink-800 via-pink-500 to-pink-300",
        "bg-gradient-to-r from-teal-800 via-teal-500 to-teal-300",
    ]; 

    /* const gradients = [
        "bg-gradient-to-r from-gray-100 via-gray-100 to-gray-100"
    ]; */

    const [swiperRef, setSwiperRef] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const result = await getHomeAnaKategoriler();
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
                return category.kategori_adi_en;
            case 'tr':
                return category.kategori_adi_tr;
            default:
                return category.kategori_adi;
        }
    };

    return (
        <>
           <div className="max-w-screen-xl mx-auto mt-5 px-4 h-32">
             {/*   <div className="grid grid-cols-6 gap-4">
                {categories.map((category, index) => (
                    <Link 
                        key={index} 
                        href={`/products`} 
                        className={`group w-full h-40 ${gradients[index % gradients.length]} hover:shadow-lg transition-all rounded-lg flex flex-row justify-between items-center`}
                    >
                        <div className="w-1/2 p-4 text-sm text-white">
                        {category.title}
                        </div>
                        <div className="w-1/2 h-[50px] flex flex-col justify-center items-center">
                            <Image 
                                src={category.image} 
                                width={80} 
                                height={50} 
                                alt="kat1" 
                                className="transition-transform duration-300 group-hover:scale-125"
                            />
                        </div>
                    </Link>
                   ))}
                </div> */}

                <Swiper
                    modules={[Virtual, Navigation, Pagination, Autoplay]}
                    onSwiper={setSwiperRef}
                    direction="horizontal"
                    slidesPerView={2}
                    spaceBetween={10}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 10,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 10,
                        },
                        1024: {
                            slidesPerView: 5,
                            spaceBetween: 10,
                        },
                        1280: {
                            slidesPerView: 5,
                            spaceBetween: 10,
                        },
                    }}
                    
                    virtual
                    autoplay={{
                        delay: 2000,
                        disableOnInteraction: false,
                    }}
                    className='h-auto'
                >
                {categories.map((category, index) => (
                    <SwiperSlide key={index} virtualIndex={index}>
                        <Link 
                            href={`/products/${category.kategori_seo}`} 
                            className={`group w-full h-32 ${gradients[index % gradients.length]} hover:shadow-lg transition-all flex flex-row justify-between items-center overflow-hidden relative`}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="w-1/2 p-4 text-sm text-white z-10">
                                {getCategoryName(category)}
                            </div>
                            <div className="absolute inset-0">
                                <Image 
                                    src={`${category.kategori_resim == undefined ? API_BASE_URL_RESIM_KATEGORI+'category.svg' : API_BASE_URL_RESIM_KATEGORI+category.kategori_resim}`} 
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    alt={getCategoryName(category)}
                                    className={`transition-opacity duration-300
                                        ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}
                                />
                                <div className={`absolute inset-0 bg-black transition-opacity duration-300
                                    ${hoveredIndex === index ? 'opacity-50' : 'opacity-0'}`} />
                            </div>
                            <div className="w-1/2 h-[50px] flex flex-col justify-center items-center relative z-10">
                                <Image 
                                    src={`${category.kategori_ikon == undefined ? API_BASE_URL_RESIM_KATEGORI+'category.svg' : API_BASE_URL_RESIM_KATEGORI+category.kategori_ikon}`} 
                                    width={80} 
                                    height={50} 
                                    alt={getCategoryName(category)}
                                    className={`transition-transform duration-300
                                        ${hoveredIndex === index ? 'opacity-0 scale-75' : 'opacity-100 group-hover:scale-125'}`}
                                />
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
                </Swiper>
            </div>
        </>
    )
}