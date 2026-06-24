"use client"
import BreadcrumbNav from "@/components/others/breadcrumbNav";
import { useTranslations } from "next-intl";
import headerImages from "@/public/assets/kategori/10-3.png"
import Image from "next/image";
import { generatePageMetadata } from "@/components/others/metada";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from "react";
import { BadgePlus } from "lucide-react";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface CheckedItems {
    [category: string]: {
        [subCategory: string]: boolean;
    };
}


export default function NewProductsComp() {

    const t = useTranslations('Header');

    const [checkedItems, setCheckedItems] = useState<CheckedItems>({});
    const [slides, setSlides] = useState(
        Array.from({ length: 500 }).map((_, index) => `LAMPA LED STRADALA ${index + 1}`)
    );

    const handleCheckboxChange = (category: string, subCategory: string) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [category]: {
                ...(prevState[category] || {}),
                [subCategory]: !(prevState[category]?.[subCategory] ?? false)
            }
        }));
    };

    const categories = [
        {
            name: 'BULBI&TUBURI CAPSULATI',
            subCategories: ['BEC LED', 'BEC LED DIMABIL', 'BEC LED CU SENZOR']
        },
        {
            name: 'ILUMINAT INTERIOR',
            subCategories: ['PANOU LED SLIM', 'DOWNLIGHT INCASTRAT', 'LED DOWNLIGHTS']
        },
        {
            name: 'ILUMINAT EXTERIOR',
            subCategories: ['PROIECTOR LED SOLAR', 'PROIECTOR LED']
        },
        {
            name: 'REINCARCABILE',
            subCategories: ['LAMPA EMERGENTA', 'LAMPA LED EMERGENTA EXIT']
        }
    ];

    // Tüm kategori isimlerini içeren bir dizi oluştur
    const allCategoryValues = categories.map(category => category.name);

    return (
        <>

            <div className="flex flex-row space-x-10">
                <div className="w-[400px]">
                    <Accordion type="multiple" defaultValue={allCategoryValues}>
                        {categories.map(category => (
                            <AccordionItem key={category.name} value={category.name}>
                                <AccordionTrigger>{category.name}</AccordionTrigger>
                                <AccordionContent>
                                    <div>
                                        {category.subCategories.map(subCategory => (
                                            <div key={subCategory} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`${category.name}-${subCategory}`}
                                                    checked={checkedItems[category.name]?.[subCategory] || false}
                                                    onChange={() => handleCheckboxChange(category.name, subCategory)}
                                                />
                                                <label htmlFor={`${category.name}-${subCategory}`}>{subCategory}</label>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div className="w-full">
                    <div className="flex justify-end mb-5">
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sıralama" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Sıralama</SelectLabel>
                                    <SelectItem value="apple">En son eklenenler</SelectItem>
                                    <SelectItem value="banana">En çok satılanlar</SelectItem>
                                    <SelectItem value="blueberry">En çok beğenilenler</SelectItem>
                                    <SelectItem value="grapes">En yeni eklenenler</SelectItem>
                                    <SelectItem value="pineapple">En yeni eklenenler</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full grid grid-cols-5 gap-4">

                        {slides.map((slideContent, index) => (
                            <Link href={`/product-detail/${slideContent}`} key={index}>
                                <div className='border h-96 bg-gray-50 relative rounded-lg'>
                                    <div className='absolute left-0 top-0 bg-red-400 p-2 text-white text-xs rounded-br-lg flex flex-row space-x-2 items-center z-10'><BadgePlus /> <span>Produse Noi</span></div>
                                    <div className='relative w-full h-[320px]'>
                                        <Image
                                            src={headerImages}
                                            alt="kat1"
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className='p-4 text-sm'>
                                        {slideContent}
                                    </div>
                                </div>
                            </Link>

                        ))}

                    </div>
                </div>
            </div>
        </>
    )
}