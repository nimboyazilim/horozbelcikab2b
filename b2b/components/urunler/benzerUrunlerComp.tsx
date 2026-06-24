'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Virtual, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { BadgePlus } from 'lucide-react';
import kat1 from "../../public/assets/kategori/10.jpg"
import Image from 'next/image';
import { getBenzerUrunler } from '@/services/kategoriSevices';
import { API_BASE_URL_RESIM } from '@/services/api';
import { useTranslations } from 'next-intl';
import UrunDetayPopup from './urunDetayPopup';

export default function BenzerUrunlerComp({kategori_seo}: {kategori_seo: string}) {
  const [swiperRef, setSwiperRef] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [selectedUrunSeo, setSelectedUrunSeo] = useState<string>('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);



  const t = useTranslations('Header');
  useEffect(() => {
    yeniUrunGetir();
  }, []);

  const yeniUrunGetir = async () => {
    try {
      const data = await getBenzerUrunler(kategori_seo);
      setSlides(data);
    } catch (error) {
      console.error('Error fetching new products:', error);
      setSlides([]);
    }
  }

      // Stok kodunu formatlayan yardımcı fonksiyon
      const formatStokKodu = (kod: string) => {
        const parts = kod.split('-');
        if (parts.length >= 4) {
            return parts.slice(1, 4).join('-');
        }
        return kod;
    };

  const handleProductClick = (urunSeo: string) => {
    setSelectedUrunSeo(urunSeo);
    setIsPopupOpen(true);
  };

  return (
    <>
      <div className="max-w-screen-2xl mx-auto mt-10 px-4 h-96">
        <div className='font-bold text-xl mb-5'>{t('benzerUrunler')}</div>
        <Swiper
          modules={[Virtual, Navigation, Pagination]}
          onSwiper={setSwiperRef}
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
                  slidesPerView: 4,
                  spaceBetween: 10,
              },
              1280: {
                  slidesPerView: 6,
                  spaceBetween: 10,
              },
          }}
          navigation={true}
          virtual
          className='h-auto'
        >
          {slides.map((slideContent, index) => (
            <SwiperSlide key={slideContent.id} virtualIndex={index} className='h-full border rounded-lg'>
              <div 
                onClick={() => handleProductClick(slideContent.urun_seo)}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className='h-48 relative'>
                  <Image src={slideContent.resim ? API_BASE_URL_RESIM + '/' + slideContent.resim : API_BASE_URL_RESIM + 'urun-gorsel.webp'}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    alt={slideContent.urun_adi} />
                </div>
                <div className='text-sm flex-1 flex flex-col'>
                  <div className="p-1 px-2 mb-2 bg-gray-100">{formatStokKodu(slideContent.stok_kodu)}</div>
                  <div className="p-2">{slideContent.urun_adi}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

      {isPopupOpen && (
        <UrunDetayPopup 
          urunSeo={selectedUrunSeo}
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      )}

    </>
  )
}