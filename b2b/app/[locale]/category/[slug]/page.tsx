"use client"
import Image from "next/image";
import { useLocale } from 'next-intl';
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useEffect, useState } from "react";
import { getKategori } from "@/services/kategoriSevices";
import { API_BASE_URL_RESIM_KATEGORI } from "@/services/api";

interface Category {
    kategori_adi: string;
    kategori_adi_en: string;
    kategori_adi_tr: string;
    kategori_seo: string;
    kategori_ikon: string;
    kategori_resim: string;
    altKategoriler?: Category[];
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    
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

    const locale = useLocale();
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [subCategories, setSubCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const allCategories = await getKategori();
                
                // Find the category that matches the slug
                const findCategory = (categories: Category[]): Category | null => {
                    for (const category of categories) {
                        if (category.kategori_seo === slug) {
                            return category;
                        }
                        if (category.altKategoriler) {
                            const found = findCategory(category.altKategoriler);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const category = findCategory(allCategories);
                
                if (category) {
                    setCurrentCategory(category);
                    if (category.altKategoriler && category.altKategoriler.length > 0) {
                        setSubCategories(category.altKategoriler);
                    } else {
                        // If no subcategories, redirect to products page
                        router.push(`/products/${category.kategori_seo}`);
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [slug, router]);

    const getCategoryName = (category: Category) => {
        switch(locale) {
            case 'ru':
                return category.kategori_adi_en;
            case 'tr':
                return category.kategori_adi_tr;
            default:
                return category.kategori_adi;
        }
    };

    if (!currentCategory || !subCategories.length) {
        return null; // Or a loading state
    }

    return (
        <div className="max-w-screen-xl mx-auto p-2 my-10">
            <h1 className="text-2xl font-bold mb-5">{getCategoryName(currentCategory)}</h1>
            <div className="bg-white">
                <div className="grid lg:grid-cols-3 grid-cols-2 gap-2">
                    {subCategories.map((category, index) => (
                        <Link 
                            key={index}
                            href={category.altKategoriler?.length ? `/category/${category.kategori_seo}` : `/products/${category.kategori_seo}`}
                            className={`w-full flex flex-row text-sm p-2 items-center justify-center cursor-pointer border-b hover:bg-red-600 hover:text-white bg-gray-100 rounded-lg ${gradients[index % gradients.length]}`}
                        >
                            <div className="flex flex-col items-center justify-center space-x-2">
                                <Image 
                                    src={category.kategori_ikon ? API_BASE_URL_RESIM_KATEGORI+category.kategori_ikon : API_BASE_URL_RESIM_KATEGORI+'category.svg'} 
                                    alt={getCategoryName(category)} 
                                    width={100} 
                                    height={100} 
                                />
                                <span className="text-sm text-white">{getCategoryName(category)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}