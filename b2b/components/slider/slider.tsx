'use client'
import React, { useEffect, useState } from 'react';
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import Image from 'next/image';
import { getSlider } from '@/services/kategoriSevices';
import Link from 'next/link';
import { API_BASE_URL_RESIM_SLIDER } from '@/services/api';
import { useTranslations } from 'next-intl';
export default function Slider(){

  const t = useTranslations('Header');

    const [sliderData, setSliderData] = useState([]);
    

    useEffect(() => {
        const fetchData = async () => {
            const data = await getSlider();
           
            setSliderData(data);
        };
        fetchData();
    }, []);


    return(
        <>
        <div className="w-full lg:mt-5 px-4">
          <div className="max-w-screen-xl mx-auto lg:h-[500px] h-[300px] rounded-lg overflow-hidden">
        <Swiper
        navigation={false}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination, Navigation, Autoplay, EffectFade]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        effect={'fade'}
        fadeEffect={{
          crossFade: true
        }}
        className="lg:h-[500px] h-[300px]"
      >
        {sliderData.map((item: any) => {
            // Renkleri rastgele oluştur
            const colors = [
                'from-indigo-800 via-indigo-500 to-indigo-300',
                'from-purple-800 via-purple-500 to-purple-300',
                'from-blue-800 via-blue-500 to-blue-300'
            ];
            const randomGradient = colors[Math.floor(Math.random() * colors.length)];
            return (
                <SwiperSlide key={item.id} className={`relative h-full bg-gradient-to-r ${randomGradient}`}>
                  <div className="absolute inset-0 bg-black/30 flex items-center">
                    <div className="w-full max-w-screen-xl mx-auto px-4 lg:px-8 flex flex-row justify-between items-center">
                      <div className="max-w-xl absolute lg:relative z-10">
                        <h2 className="text-white lg:text-4xl text-2xl font-bold mb-4">{item.title}</h2>
                        <p className="text-white lg:text-lg text-sm mb-6">{item.description}</p>
                        <Link href={item.url} className="bg-white text-black px-8 py-3 lg:text-lg text-sm rounded-md font-semibold hover:bg-opacity-90 transition-all">
                        {t('sliderButon')}
                        </Link>
                      </div>
                      <div className='absolute inset-0 w-full h-full'>
                        <Image src={API_BASE_URL_RESIM_SLIDER+item.images} fill alt="Slider0" priority className='object-cover' />
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
            )
        })}
      
       
      </Swiper>
      </div>
        </div>
        </>
    )
}