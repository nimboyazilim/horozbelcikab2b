import Image from "next/image"
import Logo from "../../public/assets/horoz-europe.png"
import { Facebook, InstagramIcon, Linkedin, Mail, MapPin, Phone } from "lucide-react"
import {useTranslations} from 'next-intl';
import Link from "next/link";
export default function Footer() {
    const t = useTranslations('Footer');
    const tHeader = useTranslations('Header');
    return (
        <>
            <div className="w-full bg-gray-100 text-gray-700 text-sm p-4 py-10">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex lg:flex-row flex-col justify-between">

                        <div className="flex flex-col space-y-4">
                            <div className="w-[230px] h-[65px]"><Image src={Logo} width={230} height={65} quality={100} alt="Horoz Europe Logo" priority /></div>
                            <div className="font-bold">Horoz Europe BV / SRL</div>
                            <div className="flex flex-row space-x-2 items-center">
                                <MapPin /> <span>Gustave Demeurslaan 73. 1654 (Hulzingen)
Beersel Belgium</span>
                            </div>
                            <div className="flex flex-row space-x-2 items-center">
                                <span>TVA / BTW : Be05988908484</span>
                            </div>
                            <div className="flex flex-row space-x-2 items-center">
                                <Phone /> <a href="tel:+3267212432" className="hover:underline">+32 67 212 432</a>
                            </div>
                            <div className="flex flex-row space-x-2 items-center">
                                <Mail /> <a href="mailto:info@horozeurope.com" className="hover:underline">info@horozeurope.com</a>
                            </div>
                            <div className="flex flex-row items-center space-x-2">
                                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-gray-100 text-black p-2 hover:text-red-600 transition"><Facebook /></a>
                                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="rounded-full bg-gray-100 text-black p-2 hover:text-red-600 transition"><Linkedin /></a>
                                <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X" className="rounded-full bg-gray-100 text-black p-2 hover:text-red-600 transition">
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                       {/* <div className="flex flex-col space-y-2">
                            <div className="font-bold">Categorii</div>
                            <div>LAMPA LED STRADALA & SOLAR</div>
                            <div>PRIZE & INTRERUPATOARE</div>
                            <div>BULBI&TUBURI CAPSULATI</div>
                            <div>ILUMINAT INTERIOR</div>
                            <div>TAMBURI</div>
                        </div> */}

                        <div className="flex flex-col space-y-2">
                            <div className="font-bold">{t('pages')}</div>
                            <div><Link href="/products">{tHeader('products')}</Link></div>
                            <div><Link href="/new-products">{tHeader('newproducts')}</Link></div>
                            <div><Link href="/catalog">{tHeader('catalog')}</Link></div>
                            <div><Link href="/news">{tHeader('news')}</Link></div>
                            <div><Link href="/corporate">{tHeader('corporate')}</Link></div>
                            <div><Link href="/terms-of-use">{tHeader('termsOfUse')}</Link></div>
                            <div><Link href="/contact">{tHeader('contact')}</Link></div>
                        </div>

                    </div>

                    <div className="mt-10 border-t pt-4 text-center">© {t('poweredBy')}</div>

                </div>
            </div>
        </>
    )
}