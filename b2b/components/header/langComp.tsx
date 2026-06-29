'use client'
import roFlag from "../../public/assets/ro-flag.png"
import enFlag from "../../public/assets/en-flag.png"
import trFlag from "../../public/assets/tr-flag.png"
import ruFlag from "../../public/assets/ru-flag.png"
import frFlag from "../../public/assets/fr-flag.png"
import nlFlag from "../../public/assets/bl-flag.png"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useLocale } from 'next-intl' // next-intl'den useLocale'i import edelim

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

export default function LangComp(){
    const router = useRouter()
    const locale = useLocale() // Mevcut dili next-intl'den alalım
    const pathname = usePathname()
    const isLoginPage = pathname === '/login' || /^\/[a-z]{2}\/login$/.test(pathname)

    const handleLanguageChange = (lang: string) => {
        if(isLoginPage){
            router.push(`/${lang}/login`)
        }else{
            router.push(`/${lang}`)
        }
    }

    return(
        <Select onValueChange={handleLanguageChange} defaultValue={locale}>
            <SelectTrigger className="lg:w-[140px] w-full">
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                {/*  <SelectItem value="ro">
                        <div className="flex items-center gap-2">
                            <Image src={roFlag} width={20} height={20} alt="ro-flag" />
                            Romanian
                        </div>
                    </SelectItem>
                    */}
                    <SelectItem value="en">
                        <div className="flex items-center gap-2">
                            <Image src={enFlag} width={20} height={20} alt="en-flag" />
                            English
                        </div>
                    </SelectItem>
                    <SelectItem value="tr">
                        <div className="flex items-center gap-2">
                            <Image src={trFlag} width={20} height={20} alt="tr-flag" />
                            Türkçe
                        </div>
                    </SelectItem>
                    <SelectItem value="fr">
                        <div className="flex items-center gap-2">
                            <Image src={frFlag} width={20} height={20} alt="fr-flag" />
                            Français
                        </div>
                    </SelectItem>
                    <SelectItem value="nl">
                        <div className="flex items-center gap-2">
                            <Image src={nlFlag} width={20} height={20} alt="nl-flag" />
                            Vlaams
                        </div>
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}