import HomeKategori from "@/components/kategoriler/homeKategori";
import HomeKategori2 from "@/components/kategoriler/homeKategori2";
import HomeAraKatalog from "@/components/others/homeAraKatalog";
import IletisimeGecin from "@/components/others/iletisimeGecin";
import Ulkeler from "@/components/others/ulkeler";
import Slider from "@/components/slider/slider";
import HomeCokSatanlar from "@/components/urunler/homeCokSatanlar";
import HomeOneCikanlar from "@/components/urunler/homeOneCikanlar";
import HomeYeniUrunler from "@/components/urunler/homeYeniUrunler";
import Image from "next/image";

export default function Home() {
  return (
    <>
     <Slider/>
    <HomeKategori2/>
   
     {/* <HomeKategori/> */}
    <HomeYeniUrunler/>
    <HomeAraKatalog/>
    <HomeCokSatanlar/>  
    <HomeOneCikanlar/>
    {/* <Ulkeler/> */}
    </>
  );
}
