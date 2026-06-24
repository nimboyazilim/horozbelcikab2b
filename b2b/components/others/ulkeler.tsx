import Image from "next/image";

import Resim from "../../public/assets/earth1.png"
import { useTranslations } from 'next-intl';
export default function Ulkeler() {
    const t = useTranslations('HomeUlkeler');
    return (
        <>
        <div className="w-full  mt-10 py-10">
            <div className="max-w-screen-2xl mx-auto px-4">
                <div className="font-bold text-xl">{t('title')}</div>
                <div>{t('description')}</div>
                <div className="flex flex-row justify-between items-center">

                    <div className="flex flex-col w-full lg:w-1/2">

                    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
                        <div className="border rounded p-2 text-center">TURKEY</div>
                        <div className="border rounded p-2 text-center">KAZAKISTAN</div>
                        <div className="border rounded p-2 text-center">UZBEKISTAN</div>
                        <div className="border rounded p-2 text-center">KYRGYZSTAN</div>
                        <div className="border rounded p-2 text-center">IRAQ</div>
                        <div className="border rounded p-2 text-center">AZERBAYCAN</div>
                        <div className="border rounded p-2 text-center">RUSSIA</div>
                        <div className="border rounded p-2 text-center">ROMANIA</div>
                        <div className="border rounded p-2 text-center">UKRAINE</div>
                        <div className="border rounded p-2 text-center">BELGIUM</div>
                        <div className="border rounded p-2 text-center">HONGKONG</div>
                    </div>

                    <div className="p-2 w-52 text-center mt-10 bg-[#15457b] text-white rounded-md">
                        {t('button')}
                    </div>

                    </div>

                    <div className="w-full lg:w-1/2 lg:block hidden">
                        <Image src={Resim} alt="resim" />
                    </div>

                 </div>
                </div>
            </div>
        </>
    )
}