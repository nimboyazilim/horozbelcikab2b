import conMain from "../config/database.mjs";
import nodemailer from 'nodemailer';
import axios from 'axios';
import xml2js from 'xml2js';
import puppeteer from 'puppeteer';
import conMainMssql from "../config/databaseMssql.mjs";
import conMainMssql2 from "../config/databaseMssql2.mjs";
import formidable from "formidable";
import fs from "fs";
import path from "path";

class OtherServices {



    async bildirimEkle(baslik, siparisId, icerik) {
        try {


            const bildirimInsert = await conMain('bildirimler').insert({
                bildirim_id: siparisId,
                baslik: baslik,
                icerik: icerik
            });


            return {
                status: 'success',
                message: 'Bildirim başarıyla eklendi'
            }
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async epostaGonder(baslik, icerik, eposta) {
        try {

            //const baslik = 'test';
            //const icerik = 'test';
            let html = '';
            if (baslik == 'Bayi Onay') {
                html = `
            <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
                <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #333333; margin-bottom: 20px;">${baslik}</h1>
                    <p style="color: #666666; line-height: 1.6; margin-bottom: 30px;">${icerik}</p>
                    <a href="https://b2b.horozelektrik.com" 
                      style="display: inline-block; 
                             background-color: #007bff; 
                             color: #ffffff; 
                             padding: 12px 24px; 
                             text-decoration: none; 
                             border-radius: 5px; 
                             font-weight: bold;">
                       B2B Sistemine giriş yapınız
                   </a>
                </div>
            </div>
            `;
            } else {
                html = `
           <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
               <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                   <h1 style="color: #333333; margin-bottom: 20px;">${baslik}</h1>
                   <p style="color: #666666; line-height: 1.6; margin-bottom: 30px;">${icerik}</p>
                   <a href="https://cms.horozelektrik.com" 
                      style="display: inline-block; 
                             background-color: #007bff; 
                             color: #ffffff; 
                             padding: 12px 24px; 
                             text-decoration: none; 
                             border-radius: 5px; 
                             font-weight: bold;">
                       CMS üzerinden işlemlere göz atınız
                   </a>
               </div>
           </div>
           `;
            }

            let html2 = `
           <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
               <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                   <h1 style="color: #333333; margin-bottom: 20px;">${baslik}</h1>
                   <p style="color: #666666; line-height: 1.6; margin-bottom: 30px;">${icerik}</p>
                   <a href="https://b2b.horozelektrik.com" 
                      style="display: inline-block; 
                             background-color: #007bff; 
                             color: #ffffff; 
                             padding: 12px 24px; 
                             text-decoration: none; 
                             border-radius: 5px; 
                             font-weight: bold;">
                       B2B Sistemine giriş yapınız
                   </a>
               </div>
           </div>
           `;




            const transporter = nodemailer.createTransport({
                host: 'mail.kurumsaleposta.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'b2b@horozelektrik.com',
                    pass: 'NimBoo1026..!'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            let mailOptions = {};

            if (baslik == 'Sipariş' && eposta != '') {

                mailOptions = {
                    from: 'b2b@horozelektrik.com',
                    to: eposta,
                    // cc: 'developer@nimboyazilim.com',
                    subject: 'Horoz Europe - B2B Sistem Bildirim',
                    html: html2
                };

                await transporter.sendMail(mailOptions);
            }

            if (baslik == 'Sipariş' && eposta != '') {

                mailOptions = {
                    from: 'b2b@horozelektrik.com',
                    to: 'b2b@horozelektrik.com',
                    //cc: 'developer@nimboyazilim.com',
                    subject: 'Horoz Europe - B2B Sistem Bildirim',
                    html: html
                };

                await transporter.sendMail(mailOptions);
            }


            if (baslik == 'Bayi Onay' && eposta != '') {

                mailOptions = {
                    from: 'b2b@horozelektrik.com',
                    to: eposta,
                    //cc: 'developer@nimboyazilim.com',
                    subject: 'Horoz Europe - B2B Sistem Bildirim',
                    html: html
                };

                await transporter.sendMail(mailOptions);

            }

            if ((baslik == 'Yeni bayi başvurusu' || baslik == 'Sipariş') && eposta == '') {

                mailOptions = {
                    from: 'b2b@horozelektrik.com',
                    to: 'b2b@horozelektrik.com',
                    //cc: 'developer@nimboyazilim.com',
                    subject: 'Horoz Europe - B2B Sistem Bildirim',
                    html: html
                };

                await transporter.sendMail(mailOptions);

            }

            return {
                status: 'success',
                message: 'E-posta başarıyla gönderildi'
            };

        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async bildirimListele(req) {
        try {
            const bildirimler = await conMain('bildirimler').select('*').orderBy('id', 'desc');
            return {
                status: 'success',
                message: 'Bildirimler başarıyla listelendi',
                data: bildirimler
            };
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async tcmbKurlar() {
        let kurData = {
            tarih: null,
            dolar_satis: 0,
            euro_satis: 0
        };

        try {
            const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml');
            const xmlData = response.data;
            const parser = new xml2js.Parser({ attrkey: 'attr' });
            const result = await parser.parseStringPromise(xmlData);

            const tarihParts = result.Tarih_Date.attr.Tarih.split('.');
            const formattedTarih = `${tarihParts[2]}-${tarihParts[1]}-${tarihParts[0]}`;

            kurData = {
                tarih: formattedTarih,
                dolar_alis: parseFloat(result.Tarih_Date.Currency[0].BanknoteBuying[0]),
                dolar_satis: parseFloat(result.Tarih_Date.Currency[0].BanknoteSelling[0]),
                euro_alis: parseFloat(result.Tarih_Date.Currency[3].BanknoteBuying[0]),
                euro_satis: parseFloat(result.Tarih_Date.Currency[3].BanknoteSelling[0])
            };

            // Veritabanına kaydet
            const existingRecord = await conMain('tcmb_kurlar')
                .where('tarih', kurData.tarih)
                .first();

            if (existingRecord) {
                await conMain('tcmb_kurlar').where('tarih', kurData.tarih).update(kurData);
            } else {
                await conMain('tcmb_kurlar').insert(kurData);
            }
        } catch (error) {
            console.error('TCMB API bağlantı hatası:', error);
        }

        return kurData.dolar_satis;
    }

    async orderPdf(req, res) {
        try {

            const fiyatFormat = (fiyat) => {
                const num = fiyat.toFixed(2);
                const parts = num.split('.');
                if (parts[0].length > 3) {
                    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + parts[1];
                }
                return parts[0] + "," + parts[1];
            }




            const siparisBilgileri = await conMainMssql('PROFORMA_SIPARISLER')
                .select(
                    'pro_mustkodu', 'pro_stokkodu', 'pro_belge_tarihi', 'pro_bfiyati', 'pro_miktar', 'pro_tutari',
                    'sto_isim', 'sto_kisa_ismi',
                    conMainMssql.raw('abs(sto_birim2_katsayi) as sto_birim2_katsayi'),
                    conMainMssql.raw('(pro_miktar / abs(sto_birim2_katsayi)) as koli_adeti'),
                    conMainMssql.raw('(sto_birim2_agirlik + sto_birim2_dara) * (pro_miktar / abs(sto_birim2_katsayi)) as brut_agirlik'),
                    conMainMssql.raw('(sto_birim2_agirlik) * (pro_miktar / abs(sto_birim2_katsayi)) as net_agirlik'),
                    conMainMssql.raw('((sto_birim2_en * sto_birim2_boy * sto_birim2_yukseklik) / 1000000000 ) * (pro_miktar / abs(sto_birim2_katsayi)) as mt3')
                )
                .leftOuterJoin('STOKLAR', 'STOKLAR.sto_kod', 'PROFORMA_SIPARISLER.pro_stokkodu')
                .where('pro_belge_no', req.params.id)
                .orderBy('pro_satirno', 'asc');

            const cariBilgileri = await conMainMssql2('CARI_HESAPLAR')
                .select('cari_unvan1', 'cari_unvan2', 'odp_adi', 'adr_cadde', 'adr_sokak', 'adr_Semt', 'adr_Daire_No', 'adr_il', 'adr_ilce', 'adr_mahalle', 'adr_posta_kodu', 'adr_ulke', 'adr_tel_no1', 'adr_tel_no2')
                .leftOuterJoin('CARI_HESAP_ADRESLERI', 'CARI_HESAP_ADRESLERI.adr_cari_kod', 'CARI_HESAPLAR.cari_kod')
                .leftOuterJoin('ODEME_PLANLARI', 'ODEME_PLANLARI.odp_no', 'CARI_HESAPLAR.cari_odemeplan_no')
                .where('CARI_HESAPLAR.cari_kod', siparisBilgileri[0].pro_mustkodu)
                .where('CARI_HESAP_ADRESLERI.adr_adres_no', 1)
                .first();

            cariBilgileri.cari_odeme_sekli = cariBilgileri.odp_adi || 'PEŞİN';



            let urunResimleriData = [];
            for (let i = 0; i < siparisBilgileri.length; i++) {

                const stokAlternatifleri = await conMainMssql('STOK_ALTERNATIFLERI')
                    .where('sa_kod', siparisBilgileri[i].pro_stokkodu)
                    .select('sa_alternatifkod');

                let alternatifStokKodu = '';

                if (stokAlternatifleri.length > 0) {
                    alternatifStokKodu = stokAlternatifleri[0].sa_alternatifkod;
                } else {
                    alternatifStokKodu = siparisBilgileri[i].pro_stokkodu;
                }

                const urunResimleri = await conMain('urun_resimleri')
                    .leftOuterJoin('urun_varyant', function () {
                        this.on('urun_varyant.id', '=', 'urun_resimleri.varyant_id')
                            .andOn('urun_varyant.urun_id', '=', 'urun_resimleri.urun_id');
                    })
                    .where('urun_varyant.stok_kodu', alternatifStokKodu)
                    .select('urun_resimleri.resim')
                    .first();

                if (urunResimleri) {
                    urunResimleriData.push(urunResimleri.resim);
                } else {
                    urunResimleriData.push('urun-gorsel.webp');
                }
                //console.log(urunResimleriData);
            }



            let header = `
            <div class="flex flex-row justify-between mb-5 w-full">

                <div class="flex flex-col w-1/2  p-2 bg-yellow-50">
                <div class="font-bold">SELLER</div>
                <div>Horoz Europe VE ELEKTRONIK TIC.KOLLEKTIF STI. HUSEYIN KACMAZ VE ORTAGI</div>
                <div>Istanbul Trakya Serbest Bolgesi Ferhatpasa S.B.</div>
                <div>Mah. Ali Riza Efendi Cad. Dis Kapi : 12 Ic Kapi</div>
                <div>No: 51 CATALCA /ISTANBUL /TURKIYE</div>
                </div>

                <div class="flex flex-col w-1/2 p-2 bg-gray-100">
                <div class="font-bold">BUYER / CONSIGNEE</div>
                <div>COMPANY NAME: ${cariBilgileri.cari_unvan1 + ' ' + cariBilgileri.cari_unvan2}</div>
                <div>ADDRESS: ${cariBilgileri.adr_mahalle + ' ' + cariBilgileri.adr_cadde + ' ' + cariBilgileri.adr_sokak + ' ' + cariBilgileri.adr_Semt + ' ' + cariBilgileri.adr_Daire_No + ' ' + cariBilgileri.adr_il + ' ' + cariBilgileri.adr_ilce + ' ' + cariBilgileri.adr_posta_kodu + ' ' + cariBilgileri.adr_ulke}</div>
                <div>Phone Number: ${cariBilgileri.adr_tel_no1}</div>
                </div>
            </div>


            <div class="flex flex-row justify-between mb-5 w-full items-center">
               <div><img src="https://api.horozelektrik.com/uploads/horoz-electric-logo.png" alt="Horoz Electric" class="w-40 h-10"></div>
               <div class="font-bold text-xl">ORDER FORM</div>
               <div class="flex flex-col  p-2">
               <table>
               <tr><td>DATE</td><td>:</td><td>${new Date(siparisBilgileri[0].pro_belge_tarihi).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
               <tr><td>ORDER NO</td><td>:</td><td>${req.params.id}</td></tr>
               </table>
               </div>
            </div>
            `;

            let htmlTableBody = '';
            siparisBilgileri.forEach((siparis, i) => {
                htmlTableBody += `
                <tr class="text-center p-1">
                    <td class="text-left border border-gray-300">${i + 1}</td>
                    <td class="text-left border border-gray-300">${siparis.pro_stokkodu}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_isim}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_kisa_ismi}</td>
                    <td class="border border-gray-300 text-center"><img src="https://api.horozelektrik.com/uploads/products/${urunResimleriData[i]}" alt="Urun Resmi" class="w-10 h-10 text-center mx-auto"></td>
                    <td class="border border-gray-300">${siparis.sto_birim2_katsayi}</td>
                    <td class="border border-gray-300">${siparis.pro_miktar}</td>
                    <td class="border border-gray-300">${siparis.koli_adeti}</td>
                    <td class="border border-gray-300">PRC</td>
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.brut_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.net_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.mt3)}</td>-->
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_bfiyati)}</td>
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_tutari)}</td>
                </tr>
                `
            });

            let totalPieces = 0;
            let totalCartons = 0;
            let totalGrossWeight = 0;
            let totalNetWeight = 0;
            let totalM3 = 0;
            let totalAmount = 0;

            siparisBilgileri.forEach(siparis => {

                totalPieces += siparis.pro_miktar;
                totalCartons += siparis.koli_adeti;
                totalGrossWeight += siparis.brut_agirlik;
                totalNetWeight += siparis.net_agirlik;
                totalM3 += siparis.mt3;
                totalAmount += siparis.pro_tutari;
            });



            let footer = `
            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">Total Pieces / Meters</td><td class="border border-gray-300 text-right">${fiyatFormat(totalPieces)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Cartons</td><td class="border border-gray-300 text-right">${fiyatFormat(totalCartons)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Gross Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalGrossWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Net Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalNetWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total m³</td><td class="border border-gray-300 text-right">${fiyatFormat(totalM3)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Amount $</td><td class="border border-gray-300 text-right">${fiyatFormat(totalAmount)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Payment Term</td><td class="border border-gray-300 text-right">${cariBilgileri.cari_odeme_sekli}</td></tr>
            </table>
            </div>

            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">ACCOUNT NAME</td><td class="border border-gray-300 text-right">HOROZ ELEKTRİK VE ELEKTRONİK TİC. KOLL. ŞTİ. HÜSEYİN KAÇMAZ VE ORTAĞI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">NAME OF THE BANK</td><td class="border border-gray-300 text-right">GARANTİ BANKASI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">BRANCH NAME</td><td class="border border-gray-300 text-right">EGE SERBEST BÖLGE</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">IBAN NUMBER</td><td class="border border-gray-300 text-right">TR23 0006 2000 4890 0009 0797 78</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">ACCOUNT NUMBER</td><td class="border border-gray-300 text-right">489/9079778</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">CURRENCY</td><td class="border border-gray-300 text-right">USD</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">SWIFT CODE</td><td class="border border-gray-300 text-right">TGBATRISXXX</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">DETAILS OF CHARGES</td><td class="border border-gray-300 text-right">OUR</td></tr>
            </table>
            </div>
            `;

            const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Proforma Fatura</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="font-sans  m-0 p-0" style="font-size: 10px;">
                ${header}
                <table class="w-full ">
                    <thead class="font-bold">
                     <tr class="bg-gray-200 text-center p-1">
                        <td class="border border-gray-300">No</td>
                        <td class="border border-gray-300">Stock Code</td>
                        <td class="border border-gray-300">Description</td>
                        <td class="border border-gray-300">Family Name</td>
                        <td class="border border-gray-300">Image of Goods</td>
                        <td class="border border-gray-300">Quantity in Box</td>
                        <td class="border border-gray-300">Order Quantity</td>
                        <td class="border border-gray-300">Quantity of Carton</td>
                        <td class="border border-gray-300">Origin</td>
                        <!--<td class="border border-gray-300">Gross Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Net Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Total m³</td>-->
                        <td class="border border-gray-300">Unit Price $ (USD)</td>
                        <td class="border border-gray-300">Total Amount $ (USD)</td>
                    </tr>
                    </thead>
                    <tbody>
                    ${htmlTableBody}
                    </tbody>
                </table>
                ${footer}
                </body>
            </html>
            `;

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setViewport({
                width: 1024,
                height: 1440,
                deviceScaleFactor: 1,
            });

            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async proformaFaturaPdf(req, res) {
        try {

            const fiyatFormat = (fiyat) => {
                const num = fiyat.toFixed(2);
                const parts = num.split('.');
                if (parts[0].length > 3) {
                    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + parts[1];
                }
                return parts[0] + "," + parts[1];
            }




            // Önce proforma siparişlerin GUID'lerini alalım
            const proformaGuids = await conMainMssql('PROFORMA_SIPARISLER')
                .select('pro_Guid')
                .where('pro_belge_no', req.params.id);


            // Bu GUID'ler ile siparişlerin GUID'lerini alalım
            const proGuids = proformaGuids.map(item => item.pro_Guid);
            const siparisGuids = await conMainMssql('SIPARISLER')
                .select('sip_Guid')
                .whereIn('sip_prosip_uid', proGuids);

            //console.log(siparisGuids);

            // Sipariş GUID'leri ile stok hareketlerinden evrak bilgilerini alalım - Önce conMainMssql2'de ara
            const sipGuids = siparisGuids.map(item => item.sip_Guid);
            let stokHareketleri = await conMainMssql('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .whereIn('sth_sip_uid', sipGuids);

            // Şimdi bu evrak bilgileri ile tüm stok hareketlerini alalım
            const evrakKosullari = stokHareketleri.map(item => ({
                sth_evrakno_seri: item.sth_evrakno_seri,
                sth_evrakno_sira: item.sth_evrakno_sira
            }));

            let siparisBilgileri = [];

            if (evrakKosullari.length > 0) {
                // Evrak koşulları varsa, bu koşullarla stok hareketlerini alalım - Önce conMainMssql2'de ara
                const whereConditions = evrakKosullari.map(item =>
                    `(sth_evrakno_seri = '${item.sth_evrakno_seri}' AND sth_evrakno_sira = '${item.sth_evrakno_sira}')`
                ).join(' OR ');

                siparisBilgileri = await conMainMssql.raw(`
                        SELECT 
                            sth_cari_kodu as pro_mustkodu,
                            sth_stok_kod as pro_stokkodu,
                            sth_tarih as pro_belge_tarihi,
                            sth_tutar / sth_miktar as pro_bfiyati,
                            sth_miktar as pro_miktar,
                            sth_tutar - sth_iskonto1 as pro_tutari,
                            sto_isim,
                            sto_kisa_ismi,
                            ABS(sto_birim2_katsayi) as sto_birim2_katsayi,
                            (sth_miktar / ABS(sto_birim2_katsayi)) as koli_adeti,
                            (sto_birim2_agirlik + sto_birim2_dara) * (sth_miktar / ABS(sto_birim2_katsayi)) as brut_agirlik,
                            (sto_birim2_agirlik) * (sth_miktar / ABS(sto_birim2_katsayi)) as net_agirlik,
                            ((sto_birim2_en * sto_birim2_boy * sto_birim2_yukseklik) / 1000000000) * (sth_miktar / ABS(sto_birim2_katsayi)) as mt3,
                            sth_satirno as pro_satirno
                        FROM STOK_HAREKETLERI
                        LEFT OUTER JOIN STOKLAR ON STOKLAR.sto_kod = STOK_HAREKETLERI.sth_stok_kod
                        WHERE ${whereConditions}
                        ORDER BY sth_satirno ASC
                    `);



                /* siparisBilgileri = siparisBilgileri[0]; // Raw query sonucu array içinde gelir */
            } else {
                // Eğer bağlantılı evrak yoksa, orijinal proforma siparişleri kullanalım
                /*  siparisBilgileri = await conMainMssql('PROFORMA_SIPARISLER')
                      .select(
                          'pro_mustkodu', 'pro_stokkodu', 'pro_belge_tarihi', 'pro_bfiyati', 'pro_miktar', 'pro_tutari',
                          'sto_isim', 'sto_kisa_ismi',
                          conMainMssql.raw('abs(sto_birim2_katsayi) as sto_birim2_katsayi'),
                          conMainMssql.raw('(pro_miktar / abs(sto_birim2_katsayi)) as koli_adeti'),
                          conMainMssql.raw('(sto_birim2_agirlik + sto_birim2_dara) * (pro_miktar / abs(sto_birim2_katsayi)) as brut_agirlik'),
                          conMainMssql.raw('(sto_birim2_agirlik) * (pro_miktar / abs(sto_birim2_katsayi)) as net_agirlik'),
                          conMainMssql.raw('((sto_birim2_en * sto_birim2_boy * sto_birim2_yukseklik) / 1000000000 ) * (pro_miktar / abs(sto_birim2_katsayi)) as mt3')
                      )
                      .leftOuterJoin('STOKLAR', 'STOKLAR.sto_kod', 'PROFORMA_SIPARISLER.pro_stokkodu')
                      .where('pro_belge_no', req.params.id)
                      .orderBy('pro_satirno','asc');
                      */
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
                res.setHeader('Content-Length', 0);
                return res.send(null);
            }

            const cariBilgileri = await conMainMssql2('CARI_HESAPLAR')
                .select('cari_unvan1', 'cari_unvan2', 'odp_adi', 'adr_cadde', 'adr_sokak', 'adr_Semt', 'adr_Daire_No', 'adr_il', 'adr_ilce', 'adr_mahalle', 'adr_posta_kodu', 'adr_ulke', 'adr_tel_no1', 'adr_tel_no2')
                .leftOuterJoin('CARI_HESAP_ADRESLERI', 'CARI_HESAP_ADRESLERI.adr_cari_kod', 'CARI_HESAPLAR.cari_kod')
                .leftOuterJoin('ODEME_PLANLARI', 'ODEME_PLANLARI.odp_no', 'CARI_HESAPLAR.cari_odemeplan_no')
                .where('CARI_HESAPLAR.cari_kod', siparisBilgileri[0].pro_mustkodu)
                .where('CARI_HESAP_ADRESLERI.adr_adres_no', 1)
                .first();

            cariBilgileri.cari_odeme_sekli = cariBilgileri.odp_adi || 'PEŞİN';


            let urunResimleriData = [];
            for (let i = 0; i < siparisBilgileri.length; i++) {

                const urunResimleri = await conMain('urun_resimleri')
                    .leftOuterJoin('urun_varyant', function () {
                        this.on('urun_varyant.id', '=', 'urun_resimleri.varyant_id')
                            .andOn('urun_varyant.urun_id', '=', 'urun_resimleri.urun_id');
                    })
                    .where('urun_varyant.stok_kodu', siparisBilgileri[i].pro_stokkodu)
                    .select('urun_resimleri.resim')
                    .first();

                if (urunResimleri) {
                    urunResimleriData.push(urunResimleri.resim);
                } else {
                    urunResimleriData.push('urun-gorsel.webp');
                }
                //console.log(urunResimleriData);
            }



            let header = `
            <div class="flex flex-row justify-between mb-5 w-full">

                <div class="flex flex-col w-1/2  p-2 bg-yellow-50">
                <div class="font-bold">SELLER</div>
                <div>Horoz Europe VE ELEKTRONIK TIC.KOLLEKTIF STI. HUSEYIN KACMAZ VE ORTAGI</div>
                <div>Istanbul Trakya Serbest Bolgesi Ferhatpasa S.B.</div>
                <div>Mah. Ali Riza Efendi Cad. Dis Kapi : 12 Ic Kapi</div>
                <div>No: 51 CATALCA /ISTANBUL /TURKIYE</div>
                </div>

                <div class="flex flex-col w-1/2 p-2 bg-gray-100">
                <div class="font-bold">BUYER / CONSIGNEE</div>
                <div>COMPANY NAME: ${cariBilgileri.cari_unvan1 + ' ' + cariBilgileri.cari_unvan2}</div>
                <div>ADDRESS: ${cariBilgileri.adr_mahalle + ' ' + cariBilgileri.adr_cadde + ' ' + cariBilgileri.adr_sokak + ' ' + cariBilgileri.adr_Semt + ' ' + cariBilgileri.adr_Daire_No + ' ' + cariBilgileri.adr_il + ' ' + cariBilgileri.adr_ilce + ' ' + cariBilgileri.adr_posta_kodu + ' ' + cariBilgileri.adr_ulke}</div>
                <div>Phone Number: ${cariBilgileri.adr_tel_no1}</div>
                </div>
            </div>


            <div class="flex flex-row justify-between mb-5 w-full items-center">
               <div><img src="https://api.horozelektrik.com/uploads/horoz-electric-logo.png" alt="Horoz Electric" class="w-40 h-10"></div>
               <div class="font-bold text-xl">PROFORMA INVOICE</div>
               <div class="flex flex-col  p-2">
               <table>
               <tr><td>DATE</td><td>:</td><td>${new Date(siparisBilgileri[0].pro_belge_tarihi).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
               <tr><td>PROFORMA NO</td><td>:</td><td>${req.params.id}</td></tr>
               </table>
               </div>
            </div>
            `;

            let htmlTableBody = '';
            siparisBilgileri.forEach((siparis, i) => {
                htmlTableBody += `
                <tr class="text-center p-1">
                    <td class="text-left border border-gray-300">${i + 1}</td>
                    <td class="text-left border border-gray-300">${siparis.pro_stokkodu}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_isim}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_kisa_ismi}</td>
                    <td class="border border-gray-300 text-center"><img src="https://api.horozelektrik.com/uploads/products/${urunResimleriData[i]}" alt="Urun Resmi" class="w-10 h-10 text-center mx-auto"></td>
                    <td class="border border-gray-300">${siparis.sto_birim2_katsayi}</td>
                    <td class="border border-gray-300">${siparis.pro_miktar}</td>
                    <td class="border border-gray-300">${siparis.koli_adeti}</td>
                    <td class="border border-gray-300">PRC</td>
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.brut_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.net_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.mt3)}</td>-->
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_bfiyati)}</td>
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_tutari)}</td>
                </tr>
                `
            });

            let totalPieces = 0;
            let totalCartons = 0;
            let totalGrossWeight = 0;
            let totalNetWeight = 0;
            let totalM3 = 0;
            let totalAmount = 0;

            siparisBilgileri.forEach(siparis => {

                totalPieces += siparis.pro_miktar;
                totalCartons += siparis.koli_adeti;
                totalGrossWeight += siparis.brut_agirlik;
                totalNetWeight += siparis.net_agirlik;
                totalM3 += siparis.mt3;
                totalAmount += siparis.pro_tutari;
            });



            let footer = `
            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">Total Pieces / Meters</td><td class="border border-gray-300 text-right">${fiyatFormat(totalPieces)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Cartons</td><td class="border border-gray-300 text-right">${fiyatFormat(totalCartons)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Gross Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalGrossWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Net Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalNetWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total m³</td><td class="border border-gray-300 text-right">${fiyatFormat(totalM3)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Amount $</td><td class="border border-gray-300 text-right">${fiyatFormat(totalAmount)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Payment Term</td><td class="border border-gray-300 text-right">${cariBilgileri.cari_odeme_sekli}</td></tr>
            </table>
            </div>

            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">ACCOUNT NAME</td><td class="border border-gray-300 text-right">HOROZ ELEKTRİK VE ELEKTRONİK TİC. KOLL. ŞTİ. HÜSEYİN KAÇMAZ VE ORTAĞI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">NAME OF THE BANK</td><td class="border border-gray-300 text-right">GARANTİ BANKASI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">BRANCH NAME</td><td class="border border-gray-300 text-right">EGE SERBEST BÖLGE</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">IBAN NUMBER</td><td class="border border-gray-300 text-right">TR23 0006 2000 4890 0009 0797 78</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">ACCOUNT NUMBER</td><td class="border border-gray-300 text-right">489/9079778</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">CURRENCY</td><td class="border border-gray-300 text-right">USD</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">SWIFT CODE</td><td class="border border-gray-300 text-right">TGBATRISXXX</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">DETAILS OF CHARGES</td><td class="border border-gray-300 text-right">OUR</td></tr>
            </table>
            </div>
            `;

            const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Proforma Fatura</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="font-sans  m-0 p-0" style="font-size: 10px;">
                ${header}
                <table class="w-full ">
                    <thead class="font-bold">
                     <tr class="bg-gray-200 text-center p-1">
                        <td class="border border-gray-300">No</td>
                        <td class="border border-gray-300">Stock Code</td>
                        <td class="border border-gray-300">Description</td>
                        <td class="border border-gray-300">Family Name</td>
                        <td class="border border-gray-300">Image of Goods</td>
                        <td class="border border-gray-300">Quantity in Box</td>
                        <td class="border border-gray-300">Order Quantity</td>
                        <td class="border border-gray-300">Quantity of Carton</td>
                        <td class="border border-gray-300">Origin</td>
                        <!--<td class="border border-gray-300">Gross Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Net Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Total m³</td>-->
                        <td class="border border-gray-300">Unit Price $ (USD)</td>
                        <td class="border border-gray-300">Total Amount $ (USD)</td>
                    </tr>
                    </thead>
                    <tbody>
                    ${htmlTableBody}
                    </tbody>
                </table>
                ${footer}
                </body>
            </html>
            `;

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setViewport({
                width: 1024,
                height: 1440,
                deviceScaleFactor: 1,
            });

            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async faturaPdf(req, res) {
        try {

            const fiyatFormat = (fiyat) => {
                const num = fiyat.toFixed(2);
                const parts = num.split('.');
                if (parts[0].length > 3) {
                    return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + parts[1];
                }
                return parts[0] + "," + parts[1];
            }




            // Önce proforma siparişlerin GUID'lerini alalım
            const proformaGuids = await conMainMssql('PROFORMA_SIPARISLER')
                .select('pro_Guid')
                .where('pro_belge_no', req.params.id);

            // Bu GUID'ler ile siparişlerin GUID'lerini alalım
            const proGuids = proformaGuids.map(item => item.pro_Guid);
            const siparisGuids = await conMainMssql('SIPARISLER')
                .select('sip_Guid')
                .whereIn('sip_prosip_uid', proGuids);

            // Sipariş GUID'leri ile stok hareketlerinden evrak bilgilerini alalım - Önce conMainMssql2'de ara
            const sipGuids = siparisGuids.map(item => item.sip_Guid);
            let stokHareketleri = await conMainMssql('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .whereIn('sth_sip_uid', sipGuids)
                .first();


            let stokHareketleri2 = await conMainMssql2('STOK_HAREKETLERI')
                .select('sth_evrakno_seri', 'sth_evrakno_sira')
                .where({
                    'sth_evrakno_seri': stokHareketleri.sth_evrakno_seri,
                    'sth_evrakno_sira': stokHareketleri.sth_evrakno_sira
                });



            // Şimdi bu evrak bilgileri ile tüm stok hareketlerini alalım
            const evrakKosullari = stokHareketleri2.map(item => ({
                sth_evrakno_seri: item.sth_evrakno_seri,
                sth_evrakno_sira: item.sth_evrakno_sira
            }));

            let siparisBilgileri = [];

            if (evrakKosullari.length > 0) {
                // Evrak koşulları varsa, bu koşullarla stok hareketlerini alalım - Önce conMainMssql2'de ara
                const whereConditions = evrakKosullari.map(item =>
                    `(sth_evrakno_seri = '${item.sth_evrakno_seri}' AND sth_evrakno_sira = '${item.sth_evrakno_sira}')`
                ).join(' OR ');

                siparisBilgileri = await conMainMssql2.raw(`
                    SELECT 
                        sth_cari_kodu as pro_mustkodu,
                        sth_stok_kod as pro_stokkodu,
                        sth_tarih as pro_belge_tarihi,
                        sth_tutar / sth_miktar as pro_bfiyati,
                        sth_miktar as pro_miktar,
                        sth_tutar - sth_iskonto1 as pro_tutari,
                        sto_isim,
                        sto_kisa_ismi,
                        ABS(sto_birim2_katsayi) as sto_birim2_katsayi,
                        (sth_miktar / ABS(sto_birim2_katsayi)) as koli_adeti,
                        (sto_birim2_agirlik + sto_birim2_dara) * (sth_miktar / ABS(sto_birim2_katsayi)) as brut_agirlik,
                        (sto_birim2_agirlik) * (sth_miktar / ABS(sto_birim2_katsayi)) as net_agirlik,
                        ((sto_birim2_en * sto_birim2_boy * sto_birim2_yukseklik) / 1000000000) * (sth_miktar / ABS(sto_birim2_katsayi)) as mt3,
                        sth_satirno as pro_satirno,
                        sth_odeme_op
                    FROM STOK_HAREKETLERI
                    LEFT OUTER JOIN STOKLAR ON STOKLAR.sto_kod = STOK_HAREKETLERI.sth_stok_kod
                    WHERE ${whereConditions}
                    ORDER BY sth_satirno ASC
                `);

                /* siparisBilgileri = siparisBilgileri[0]; // Raw query sonucu array içinde gelir */
            } else {
                // Eğer bağlantılı evrak yoksa, orijinal proforma siparişleri kullanalım
                /*  siparisBilgileri = await conMainMssql('PROFORMA_SIPARISLER')
                      .select(
                          'pro_mustkodu', 'pro_stokkodu', 'pro_belge_tarihi', 'pro_bfiyati', 'pro_miktar', 'pro_tutari',
                          'sto_isim', 'sto_kisa_ismi',
                          conMainMssql.raw('abs(sto_birim2_katsayi) as sto_birim2_katsayi'),
                          conMainMssql.raw('(pro_miktar / abs(sto_birim2_katsayi)) as koli_adeti'),
                          conMainMssql.raw('(sto_birim2_agirlik + sto_birim2_dara) * (pro_miktar / abs(sto_birim2_katsayi)) as brut_agirlik'),
                          conMainMssql.raw('(sto_birim2_agirlik) * (pro_miktar / abs(sto_birim2_katsayi)) as net_agirlik'),
                          conMainMssql.raw('((sto_birim2_en * sto_birim2_boy * sto_birim2_yukseklik) / 1000000000 ) * (pro_miktar / abs(sto_birim2_katsayi)) as mt3')
                      )
                      .leftOuterJoin('STOKLAR', 'STOKLAR.sto_kod', 'PROFORMA_SIPARISLER.pro_stokkodu')
                      .where('pro_belge_no', req.params.id)
                      .orderBy('pro_satirno','asc');
                      */
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
                res.setHeader('Content-Length', 0);
                return res.send(null);
            }

            const cariBilgileri = await conMainMssql2('CARI_HESAPLAR')
                .select('cari_unvan1', 'cari_unvan2', 'odp_adi', 'adr_cadde', 'adr_sokak', 'adr_Semt', 'adr_Daire_No', 'adr_il', 'adr_ilce', 'adr_mahalle', 'adr_posta_kodu', 'adr_ulke', 'adr_tel_no1', 'adr_tel_no2')
                .leftOuterJoin('CARI_HESAP_ADRESLERI', 'CARI_HESAP_ADRESLERI.adr_cari_kod', 'CARI_HESAPLAR.cari_kod')
                .leftOuterJoin('ODEME_PLANLARI', 'ODEME_PLANLARI.odp_no', 'CARI_HESAPLAR.cari_odemeplan_no')
                .where('CARI_HESAPLAR.cari_kod', siparisBilgileri[0].pro_mustkodu)
                .where('CARI_HESAP_ADRESLERI.adr_adres_no', 1)
                .first();

            const odemePlanlari = await conMainMssql2('ODEME_PLANLARI')
                .select('odp_adi')
                .where('odp_no', siparisBilgileri[0].sth_odeme_op)
                .first();

            cariBilgileri.cari_odeme_sekli = odemePlanlari.odp_adi || cariBilgileri.odp_adi || 'PEŞİN';



            let urunResimleriData = [];
            for (let i = 0; i < siparisBilgileri.length; i++) {

                const urunResimleri = await conMain('urun_resimleri')
                    .leftOuterJoin('urun_varyant', function () {
                        this.on('urun_varyant.id', '=', 'urun_resimleri.varyant_id')
                            .andOn('urun_varyant.urun_id', '=', 'urun_resimleri.urun_id');
                    })
                    .where('urun_varyant.stok_kodu', siparisBilgileri[i].pro_stokkodu)
                    .select('urun_resimleri.resim')
                    .first();

                if (urunResimleri) {
                    urunResimleriData.push(urunResimleri.resim);
                } else {
                    urunResimleriData.push('urun-gorsel.webp');
                }
                //console.log(urunResimleriData);
            }



            let header = `
            <div class="flex flex-row justify-between mb-5 w-full">

                <div class="flex flex-col w-1/2  p-2 bg-yellow-50">
                <div class="font-bold">SELLER</div>
                <div>Horoz Europe VE ELEKTRONIK TIC.KOLLEKTIF STI. HUSEYIN KACMAZ VE ORTAGI</div>
                <div>Istanbul Trakya Serbest Bolgesi Ferhatpasa S.B.</div>
                <div>Mah. Ali Riza Efendi Cad. Dis Kapi : 12 Ic Kapi</div>
                <div>No: 51 CATALCA /ISTANBUL /TURKIYE</div>
                </div>

                <div class="flex flex-col w-1/2 p-2 bg-gray-100">
                <div class="font-bold">BUYER / CONSIGNEE</div>
                <div>COMPANY NAME: ${cariBilgileri.cari_unvan1 + ' ' + cariBilgileri.cari_unvan2}</div>
                <div>ADDRESS: ${cariBilgileri.adr_mahalle + ' ' + cariBilgileri.adr_cadde + ' ' + cariBilgileri.adr_sokak + ' ' + cariBilgileri.adr_Semt + ' ' + cariBilgileri.adr_Daire_No + ' ' + cariBilgileri.adr_il + ' ' + cariBilgileri.adr_ilce + ' ' + cariBilgileri.adr_posta_kodu + ' ' + cariBilgileri.adr_ulke}</div>
                <div>Phone Number: ${cariBilgileri.adr_tel_no1}</div>
                </div>
            </div>


            <div class="flex flex-row justify-between mb-5 w-full items-center">
               <div><img src="https://api.horozelektrik.com/uploads/horoz-electric-logo.png" alt="Horoz Electric" class="w-40 h-10"></div>
               <div class="font-bold text-xl">COMMERCIAL INVOICE</div>
               <div class="flex flex-col  p-2">
               <table>
               <tr><td>DATE</td><td>:</td><td>${new Date(siparisBilgileri[0].pro_belge_tarihi).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td></tr>
               <tr><td>PROFORMA NO</td><td>:</td><td>${req.params.id}</td></tr>
               </table>
               </div>
            </div>
            `;

            let htmlTableBody = '';
            siparisBilgileri.forEach((siparis, i) => {
                htmlTableBody += `
                <tr class="text-center p-1">
                    <td class="text-left border border-gray-300">${i + 1}</td>
                    <td class="text-left border border-gray-300">${siparis.pro_stokkodu}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_isim}</td>
                    <td class="text-left border border-gray-300">${siparis.sto_kisa_ismi}</td>
                    <td class="border border-gray-300 text-center"><img src="https://api.horozelektrik.com/uploads/products/${urunResimleriData[i]}" alt="Urun Resmi" class="w-10 h-10 text-center mx-auto"></td>
                    <td class="border border-gray-300">${siparis.sto_birim2_katsayi}</td>
                    <td class="border border-gray-300">${siparis.pro_miktar}</td>
                    <td class="border border-gray-300">${siparis.koli_adeti}</td>
                    <td class="border border-gray-300">PRC</td>
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.brut_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.net_agirlik)}</td>-->
                    <!--<td class="border border-gray-300">${fiyatFormat(siparis.mt3)}</td>-->
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_bfiyati)}</td>
                    <td class="border border-gray-300">${fiyatFormat(siparis.pro_tutari)}</td>
                </tr>
                `
            });

            let totalPieces = 0;
            let totalCartons = 0;
            let totalGrossWeight = 0;
            let totalNetWeight = 0;
            let totalM3 = 0;
            let totalAmount = 0;

            siparisBilgileri.forEach(siparis => {

                totalPieces += siparis.pro_miktar;
                totalCartons += siparis.koli_adeti;
                totalGrossWeight += siparis.brut_agirlik;
                totalNetWeight += siparis.net_agirlik;
                totalM3 += siparis.mt3;
                totalAmount += siparis.pro_tutari;
            });



            let footer = `
            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">Total Pieces / Meters</td><td class="border border-gray-300 text-right">${fiyatFormat(totalPieces)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Cartons</td><td class="border border-gray-300 text-right">${fiyatFormat(totalCartons)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Gross Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalGrossWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Net Weight</td><td class="border border-gray-300 text-right">${fiyatFormat(totalNetWeight)}KG</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total m³</td><td class="border border-gray-300 text-right">${fiyatFormat(totalM3)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Total Amount $</td><td class="border border-gray-300 text-right">${fiyatFormat(totalAmount)}</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">Payment Term</td><td class="border border-gray-300 text-right">${cariBilgileri.cari_odeme_sekli}</td></tr>
            </table>
            </div>

            <div class="w-1/2 mt-5">
            <table class="w-full ">
            <tr><td class="bg-gray-100 border border-gray-300 w-56">ACCOUNT NAME</td><td class="border border-gray-300 text-right">HOROZ ELEKTRİK VE ELEKTRONİK TİC. KOLL. ŞTİ. HÜSEYİN KAÇMAZ VE ORTAĞI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">NAME OF THE BANK</td><td class="border border-gray-300 text-right">GARANTİ BANKASI</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">BRANCH NAME</td><td class="border border-gray-300 text-right">EGE SERBEST BÖLGE</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">IBAN NUMBER</td><td class="border border-gray-300 text-right">TR23 0006 2000 4890 0009 0797 78</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">ACCOUNT NUMBER</td><td class="border border-gray-300 text-right">489/9079778</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">CURRENCY</td><td class="border border-gray-300 text-right">USD</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">SWIFT CODE</td><td class="border border-gray-300 text-right">TGBATRISXXX</td></tr>
            <tr><td class="bg-gray-100 border border-gray-300">DETAILS OF CHARGES</td><td class="border border-gray-300 text-right">OUR</td></tr>
            </table>
            </div>
            `;

            const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Proforma Fatura</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="font-sans  m-0 p-0" style="font-size: 10px;">
                ${header}
                <table class="w-full ">
                    <thead class="font-bold">
                     <tr class="bg-gray-200 text-center p-1">
                        <td class="border border-gray-300">No</td>
                        <td class="border border-gray-300">Stock Code</td>
                        <td class="border border-gray-300">Description</td>
                        <td class="border border-gray-300">Family Name</td>
                        <td class="border border-gray-300">Image of Goods</td>
                        <td class="border border-gray-300">Quantity in Box</td>
                        <td class="border border-gray-300">Order Quantity</td>
                        <td class="border border-gray-300">Quantity of Carton</td>
                        <td class="border border-gray-300">Origin</td>
                        <!--<td class="border border-gray-300">Gross Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Net Weight (kg)</td>-->
                        <!--<td class="border border-gray-300">Total m³</td>-->
                        <td class="border border-gray-300">Unit Price $ (USD)</td>
                        <td class="border border-gray-300">Total Amount $ (USD)</td>
                    </tr>
                    </thead>
                    <tbody>
                    ${htmlTableBody}
                    </tbody>
                </table>
                ${footer}
                </body>
            </html>
            `;

            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setViewport({
                width: 1024,
                height: 1440,
                deviceScaleFactor: 1,
            });

            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape: false,
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);
        } catch (error) {
            console.log(error);
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }

    async iletisimFormuGonder({ ad_soyad, email, telefon, konu, mesaj }) {
        try {
            // Veritabanına kaydet
            await conMain('iletisim_formu').insert({
                ad_soyad,
                email,
                telefon,
                konu,
                mesaj
            });

            // E-posta gönder
            const transporter = nodemailer.createTransport({
                host: 'mail.kurumsaleposta.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'b2b@horozelektrik.com',
                    pass: 'FwIH4_84cDb@1_.a'
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const html = `
            <div style="font-family: Arial, sans-serif; font-size: 15px;">
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><b>Ad Soyad:</b> ${ad_soyad}</p>
                <p><b>E-posta:</b> ${email}</p>
                <p><b>Telefon:</b> ${telefon}</p>
                <p><b>Konu:</b> ${konu}</p>
                <p><b>Mesaj:</b><br/>${mesaj}</p>
            </div>
        `;

            await transporter.sendMail({
                from: 'info@horozelektrik.com',
                to: 'secretary@horozelektrik.com',
                subject: 'Horoz Europe - Yeni İletişim Formu Mesajı',
                html
            });

            return {
                status: 'success',
                message: 'İletişim formu başarıyla gönderildi'
            };
        } catch (error) {
            return {
                status: 'error',
                message: 'Bir hata oluştu: ' + error.message
            };
        }
    }


    async kariyerBasvuruGonder(req) {
        return new Promise((resolve, reject) => {
            const form = formidable({ multiples: false, maxFileSize: 5 * 1024 * 1024 });
            form.parse(req, async (err, fields, files) => {
                if (err) return resolve({ status: "error", message: "Dosya yüklenemedi" });

                let cv_url = "";
                let file = files.cv;

                if (Array.isArray(file)) file = file[0];

                if (file && file.originalFilename) {
                    const uploadFolder = path.join(process.cwd(), "public", "uploads", "cv");
                    if (!fs.existsSync(uploadFolder)) {
                        fs.mkdirSync(uploadFolder, { recursive: true });
                    }
                    const uploadDir = path.join(uploadFolder, file.originalFilename);
                    fs.copyFileSync(file.filepath, uploadDir);
                    cv_url = `/uploads/cv/${file.originalFilename}`;
                }

                await conMain('kariyer_basvuru').insert({
                    ad_soyad: fields.ad_soyad,
                    email: fields.email,
                    telefon: fields.telefon,
                    departman: fields.departman,
                    mesaj: fields.mesaj,
                    cv_url,
                    kvkk: fields.kvkk
                });

                const transporter = nodemailer.createTransport({
                    host: 'mail.kurumsaleposta.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'b2b@horozelektrik.com',
                        pass: 'FwIH4_84cDb@1_.a'
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                const html = `
    <div style="font-family: Arial, sans-serif; font-size: 15px; background: #f8f8f8; padding: 32px;">
        <div style="max-width: 520px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 32px;">
            <h2 style="color: #d61d25; margin-bottom: 24px;">Yeni Kariyer Başvurusu</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                    <td style="font-weight: bold; padding: 8px 0; width: 140px;">Ad Soyad:</td>
                    <td style="padding: 8px 0;">${fields.ad_soyad}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="font-weight: bold; padding: 8px 0;">E-posta:</td>
                    <td style="padding: 8px 0;">${fields.email}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 8px 0;">Telefon:</td>
                    <td style="padding: 8px 0;">${fields.telefon}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                    <td style="font-weight: bold; padding: 8px 0;">Departman:</td>
                    <td style="padding: 8px 0;">${fields.departman}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold; padding: 8px 0; vertical-align: top;">Mesaj:</td>
                    <td style="padding: 8px 0; white-space: pre-line;">${fields.mesaj}</td>
                </tr>
                ${cv_url ? `
                <tr style="background: #f5f5f5;">
                    <td style="font-weight: bold; padding: 8px 0;">CV:</td>
                    <td style="padding: 8px 0;">
                        <a href="https://api.horozelektrik.com${cv_url}" style="color: #d61d25; text-decoration: underline;" target="_blank">Dosyayı indir</a>
                    </td>
                </tr>
                ` : ""}
            </table>
            <div style="font-size: 13px; color: #888;">
                Bu başvuru Horoz Europe web sitesi üzerinden iletilmiştir.
            </div>
        </div>
    </div>
`;

                await transporter.sendMail({
                    from: 'info@horozelektrik.com',
                    to: 'ik@horozelektrik.com',
                    subject: 'Horoz Europe - Yeni Kariyer Başvurusu',
                    html
                });

                resolve({
                    status: 'success',
                    message: 'Başvurunuz başarıyla gönderildi'
                });
            });
        });
    }

}

export default new OtherServices;