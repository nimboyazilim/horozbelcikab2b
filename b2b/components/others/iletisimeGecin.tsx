import Image from "next/image";

import Resim from "../../public/assets/testimonials-map.png"
import Ampul from "../../public/assets/form_01-blink.png"

export default function IletisimeGecin() {
    return (
        <>
            <div className="w-full bg-gray-50 pt-10">
                <div className="max-w-screen-2xl mx-auto px-4">
                <div className="font-bold text-xl">HOROZ ELECTRIC CONTACTE</div>
                <div className="flex flex-row justify-between items-center">

                    

                    <div className="w-1/2 flex flex-col relative">
                        <div className="text-3xl absolute"></div>
                    <Image src={Ampul} alt="ampul"/>
                    </div>

                    <div className="w-1/2 flex flex-col items-center justify-center space-y-4">
                        <div className="w-96 text-center rounded bg-red-600 text-white p-2">Contactati-ne</div>
                        <div className="w-96 text-center rounded bg-[#15457b] text-white p-2">B2B</div>
                    </div>
            </div>
                </div>
            </div>
        </>
    )
}