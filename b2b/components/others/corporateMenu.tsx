'use client'
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function CorporateMenu() {
    const pathname = usePathname();


    const t = useTranslations('Header');
    return (
        <ul className="flex flex-col gap-4 w-96 mt-10 mr-5">
            <li className={`border-b border-dashed rounded-lg p-2 ${pathname === '/corporate' ? 'bg-gray-100' : ''}`}>
                <Link href="/corporate">
                  {t('corporate')}
                </Link>
            </li>
            <li className={`border-b border-dashed rounded-lg p-2 ${pathname === '/terms-of-use' ? 'bg-gray-100' : ''}`}>
                <Link href="/terms-of-use">
                    {t('termsOfUse')}
                </Link>
            </li>
            <li className={`border-b border-dashed rounded-lg p-2 ${pathname === '/lighting-text' ? 'bg-gray-100' : ''}`}>
                <Link href="/lighting-text">
                    {t('aydinlatmaMetni')}
                </Link>
            </li>
            
        </ul>
    )
}