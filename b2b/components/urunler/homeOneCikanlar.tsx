'use client'
import React, { useEffect, useState } from 'react';
import { getOneCikanlar } from '@/services/kategoriSevices';
import { useTranslations } from 'next-intl';
import SwiperUrun from './swiperUrun';
export default function HomeOneCikanlar(){
  const [slides, setSlides] = useState<any[]>([]);
  const t = useTranslations('Header');
      useEffect(() => {
        oneCikanlarGetir();
      }, []);
    
      const oneCikanlarGetir = async () => {
        try {
          const data = await getOneCikanlar();
          setSlides(data);
        } catch (error) {
          console.error('Error fetching new products:', error);
          setSlides([]);
        }
      }

    

    return(
       <SwiperUrun data={slides} title={t('occasionalProducts')} />
    )
}