'use client'
import React, { useEffect, useState } from 'react';
import { getEnCokSatanlar } from '@/services/kategoriSevices';
import { useTranslations } from 'next-intl';
import SwiperUrun from './swiperUrun';
export default function HomeCokSatanlar() {
  const [slides, setSlides] = useState<any[]>([]);
  const t = useTranslations('Header');

  useEffect(() => {
    enCokSatanlarGetir();
  }, []);

  const enCokSatanlarGetir = async () => {
    try {
      const data = await getEnCokSatanlar();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching most sold products:', error);
      setSlides([]);
    }
  }


  return (
   <SwiperUrun data={slides} title={t('cokSatanlar')} />
  )
}