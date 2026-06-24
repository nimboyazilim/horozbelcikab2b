import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import loginRoutes from './src/routes/loginRoutes.mjs';
import userRoutes from './src/routes/userRoutes.mjs';
import teknikServisRoutes from './src/routes/teknikServisRoutes.mjs';
import musterilerRoutes from './src/routes/musterilerRoutes.mjs';
import menulerRoutes from './src/routes/menulerRoutes.mjs';
//import formlarRoutes from './src/routes/formlarRoutes.mjs';
import kategorilerRoutes from './src/routes/kategorilerRoutes.mjs';
import urunlerRoutes from './src/routes/urunlerRoutes.mjs';
import sliderRoutes from './src/routes/sliderRoutes.mjs';
import sayfalarRoutes from './src/routes/sayfalarRoutes.mjs';
import mikroRoutes from './src/routes/mikroRoutes.mjs';
import sepetRoutes from './src/routes/sepetRoutes.mjs';
import siparislerRoutes from './src/routes/siparislerRoutes.mjs';
import dashboardRoutes from './src/routes/dashboardRoutes.mjs';
import otherRoutes from './src/routes/otherRoutes.mjs';
import newsletterRoutes from './src/routes/newsletterRoutes.mjs';
import bannerRoutes from './src/routes/bannerRoutes.mjs';
import mediaRoutes from './src/routes/mediaRoutes.mjs';
import referenceRoutes from './src/routes/referenceRoutes.mjs';
import certificateRoutes from './src/routes/certificateRoutes.mjs';
import corporateTimelineRoutes from './src/routes/corporateTimelineRoutes.mjs';
import popupRoutes from './src/routes/popupRoutes.mjs';
import activityLogRoutes from './src/routes/activityLogRoutes.mjs';
// Environment variables 
dotenv.config();

// Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/login', loginRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teknik-servis', teknikServisRoutes);
app.use('/api/musteriler', musterilerRoutes);
app.use('/api/menuler', menulerRoutes);
//app.use('/api/formlar', formlarRoutes);
app.use('/api/kategoriler', kategorilerRoutes);
app.use('/api/urunler', urunlerRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/sayfalar', sayfalarRoutes);
app.use('/api/mikro', mikroRoutes);
app.use('/api/sepet', sepetRoutes);
app.use('/api/siparisler', siparislerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/other', otherRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api', referenceRoutes);
app.use('/api', certificateRoutes);
app.use('/api', corporateTimelineRoutes);
app.use('/api/popup', popupRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});