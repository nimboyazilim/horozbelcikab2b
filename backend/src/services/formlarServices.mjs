import puppeteer from 'puppeteer';
import { createMysqlConnection } from '../config/firmaMysql.mjs';
import conMain from '../config/database.mjs';
class FormlarServices {

    async formlarServisFormu(req, res) {    
        try {
            const con = createMysqlConnection(req.locals.firma);
            const teknikServis = await con('teknikServis')
                .where('teknikServis.id', req.params.id)
                .leftOuterJoin('musteriler', 'teknikServis.musteri', 'musteriler.id')
                .leftOuterJoin('teknikServisDurum', 'teknikServis.durum', 'teknikServisDurum.id')
                .leftOuterJoin('teknikServisTip', 'teknikServis.tip', 'teknikServisTip.id')
                .leftOuterJoin('teknikServisTur', 'teknikServis.tur', 'teknikServisTur.id')
                .leftOuterJoin('teknikServisCagriTur', 'teknikServis.cagri_tur', 'teknikServisCagriTur.id')
                .leftOuterJoin('musterilerAdres', 'teknikServis.musteri', 'musterilerAdres.musteri_id')
                .select(
                    'teknikServis.*',
                    con.raw('CONCAT(musteriler.unvan_ad, " ", musteriler.unvan_soyad) as unvan_ad'),
                    'teknikServisDurum.ad as durum_ad',
                    'teknikServisTip.ad as tip_ad',
                    'teknikServisTur.ad as tur_ad',
                    'teknikServisCagriTur.ad as cagri_tur_ad',
                    'musterilerAdres.adres as adres',
                    'musterilerAdres.ilce as ilce',
                    'musterilerAdres.il as il',
                    'musterilerAdres.telefon as telefon',
                    'musterilerAdres.eposta as eposta'
                );

                const atananlar = teknikServis[0].atananlar ? JSON.parse(teknikServis[0].atananlar) : [];
                const user = await conMain('users')
                    .whereIn('users.id', atananlar)
                    .select('users.ad as ad', 'users.soyad as soyad');

            if (!teknikServis[0]) {
                throw new Error('Servis kaydı bulunamadı');
            }

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Servis Formu</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="font-sans text-xs m-0">
                    <div class="max-w-full mx-auto">

                        <div class="text-black text-lg p-1 border border-gray-100 text-center mb-2 rounded">
                            Servis Formu
                        </div>

                        <div class="flex flex-row justify-between items-center w-full h-auto mb-2 bg-gray-100 p-2 rounded">
                            <div>
                                <img src="https://nimboyazilim.com/assets/Nimbo_Logotype.png" class="max-w-[200px]" alt="Nimbo Yazılım">
                            </div>
                          
                                    <div>
                                        <table>
                                            <tr>
                                                <td class="pr-4">Talep Tarihi</td>
                                                <td>:</td>
                                                <td class="pr-8">${new Date(teknikServis[0].talep_tarih).toLocaleString('tr-TR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }).replace(',', '')}</td>
                                                <td class="pr-4">Servis No</td>
                                                <td>:</td>
                                                <td class="text-right">${teknikServis[0].id}</td>
                                            </tr>
                                            <tr>
                                                <td class="pr-4">Teslim Tarihi</td>
                                                <td>:</td>
                                                <td class="pr-8">${teknikServis[0].bitis_tarih ? new Date(teknikServis[0].bitis_tarih).toLocaleString('tr-TR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }).replace(',', '') : '-'}</td>
                                                <td class="pr-4">Hizmet Tipi</td>
                                                <td>:</td>
                                                <td class="text-right">${teknikServis[0].tip_ad}</td>
                                            </tr>
                                        </table>
                                    </div>
                               
                        </div>

                

                        <div class="border border-black p-4 mb-2.5 rounded-lg">
                            <h3 class="mt-0 font-bold">MÜŞTERİ BİLGİLERİ</h3>
                            <div class="my-1.5"><span class="inline-block w-[70px]">Ünvan :</span>${teknikServis[0].unvan_ad}</div>
                            <div class="my-1.5"><span class="inline-block w-[70px]">Tel :</span>${teknikServis[0].telefon}</div>
                            <div class="my-1.5"><span class="inline-block w-[70px]">E-mail :</span>${teknikServis[0].eposta}</div>
                            <div class="my-1.5"><span class="inline-block w-[70px]">Adres :</span>${teknikServis[0].adres} ${teknikServis[0].ilce} / ${teknikServis[0].il}</div>
                        </div>

                        <div class="border border-black p-4 my-2.5 rounded-lg">
                            <h3 class="mt-0 font-bold">MÜŞTERİ TALEBİ</h3>
                            <div>${teknikServis[0].yapilacak_is}</div>
                        </div>

                        <div class="border border-black p-4 my-2.5 rounded-lg">
                            <h3 class="mt-0 font-bold">İŞLEM SONUCU</h3>
                            <div>${teknikServis[0].sonuc}</div>
                        </div>

                        <div class="my-1.5 border border-black p-4 rounded-lg">
                            <span class="inline-block w-[100px]">Servis Ücreti :</span>0,00
                        </div>

                        <div class="mt-[100px]">
                            <div class="float-left w-[45%] text-center">
                                <div class="font-bold">Personel</div>
                                <div>${user.map(item => `${item.ad} ${item.soyad}`).join(', ')}</div>
                            </div>
                            <div class="float-right w-[45%] text-center">
                                <div class="font-bold">Müşteri: Talep Eden / İşlemi Yapılan</div>
                                <div>${teknikServis[0].talep_eden} / ${teknikServis[0].islem_yapilan_kisi}</div>
                            </div>
                        </div>

                        <div class="text-center mt-8 absolute bottom-0 left-0 right-0 bg-gray-100 p-4 rounded-lg">
                            Nimbo Yazılım<br>
                            Barbaros Hayrettin Paşa, Vetro City, 1992. Sk No:16 B Blok D:22, 34000 <br/>Esenyurt/İstanbul<br/>
                            nimboyazilim.com | info@nimboyazilim.com
                        </div>
                    </div>
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
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px'
                }
            });

            await browser.close();
            await con.destroy();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename=servis-formu.pdf');
            res.setHeader('Content-Length', pdfBuffer.length);
            return res.end(pdfBuffer);

        } catch (error) {
            console.error('PDF oluşturma hatası:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new FormlarServices;