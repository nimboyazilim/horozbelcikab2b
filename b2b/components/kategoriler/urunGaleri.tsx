"use client"
import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from 'next/image';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { API_BASE_URL_RESIM } from '@/services/api';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/lib/styles.min.css';

export default function UrunGaleri({data}:{data:any}) {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

 
  if(data.length == 0){
    data = [{resim: 'urun-gorsel.webp'}];
  }


  return (
    <>
    <div className="w-full px-10 border rounded-lg">
      <Swiper
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mb-3 border-b pb-2"
      >
        {data.map((item:any,index:number)=>(
          <SwiperSlide key={index}>
            <div className="flex items-center justify-center w-full h-auto relative overflow-hidden">
              <InnerImageZoom 
                src={`${API_BASE_URL_RESIM}/${item.resim}`} 
                zoomScale={1.2}
                zoomType="hover"
                className="innerZoom"
                width={400}
                height={400}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={6}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
      >
        {data.map((item:any,index:number)=>(
          <SwiperSlide key={index}>
            <Image 
              src={API_BASE_URL_RESIM+'/'+item.resim} 
              width={75} 
              height={75} 
              alt={`Ürün resmi ${index + 1}`}
              className="cursor-pointer"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </>
  );
}
