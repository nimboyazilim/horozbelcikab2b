'use client'
import React, { useEffect, useState } from 'react';
import { getYeniUrunler } from '@/services/kategoriSevices';
import { useTranslations } from 'next-intl';
import SwiperUrun from './swiperUrun';
export default function HomeYeniUrunler() {
  const [slides, setSlides] = useState<any[]>([]);
  const t = useTranslations('Header');

  useEffect(() => {
    yeniUrunGetir();
  }, []);

  const yeniUrunGetir = async () => {
    try {
      const data = await getYeniUrunler();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching new products:', error);
      setSlides([]);
    }
  }


  return (
   <SwiperUrun data={slides} title={t('newproducts')} />
  )
}