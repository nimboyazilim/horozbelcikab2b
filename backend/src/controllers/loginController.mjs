import conMain from '../config/database.mjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
class LoginController {
  
    async login(req, res) {
        try {
            const { eposta, sifre, cfTurnstileResponse } = req.body;

            // Verify Cloudflare Turnstile
            const formData = new URLSearchParams();
            formData.append('secret', process.env.CF_TURNSTILE_SECRET_KEY);
            formData.append('response', cfTurnstileResponse);

            const turnstileVerification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
            });

            const turnstileResult = await turnstileVerification.json();


            if (!turnstileResult.success) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Turnstile verification failed'
                });
            }

            // Check if eposta and sifre are provided
            if (!eposta || !sifre) {
                return res.status(400).json({ message: 'eposta and sifre are required' });
            }

            // Check if user exists
            const user = await conMain('users')
                .where({ eposta: eposta, sifre: crypto.createHash('md5').update(sifre).digest('hex') })
                .first();

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, bayi_id: user.bayi_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta },
                process.env.JWT_SECRET,
                { expiresIn: '5h' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: user.id, bayi_id: user.bayi_id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' } // Refresh token expiration
            );

            const tokenUpdate = await conMain('tokens')
            .where({ user_id: user.id })
            .update({
                durum: 0
            });

            const tokenInsert = await conMain('tokens')
            .insert({
                user_id: user.id,
                token: token,
                refresh_token: refreshToken,
                durum: 1,
                end_date: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
            });
            
           

            res.status(200).json({
                message: 'Login successful',
                token: token,
                refreshToken: refreshToken // Include refresh token in response
            });

        } catch (error) {
            res.status(500).json({ message: 'Server error during login' });
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ message: 'refreshToken is required' });
            }

            // Verify the refresh token
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            } catch (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // Get user from database using decoded information
            const user = await conMain('users')
                .where({ bayi_id: decoded.bayi_id, eposta: decoded.eposta })
                .first();

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Generate new JWT token
            const token = jwt.sign(
                { id: user.id, firma_id: user.firma_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta },
                process.env.JWT_SECRET,
                { expiresIn: '5h' }
            );

            // Generate new refresh token
            const newRefreshToken = jwt.sign(
                { id: user.id, firma_id: user.firma_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            res.status(200).json({
                message: 'Refresh token successful',
                accessToken: token,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({ message: 'Server error during refresh token' });
        }
    }

    async b2bLogin(req, res) {
        try {
            const { eposta, sifre, cfTurnstileResponse } = req.body;

            // Verify Cloudflare Turnstile
            const formData = new URLSearchParams();
            formData.append('secret', process.env.CF_TURNSTILE_SECRET_KEY);
            formData.append('response', cfTurnstileResponse);

            const turnstileVerification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: formData,
            });

            const turnstileResult = await turnstileVerification.json();


            if (!turnstileResult.success) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Turnstile verification failed'
                });
            }

            // Check if eposta and sifre are provided
            if (!eposta || !sifre) {
                return res.status(400).json({ 
                    status: 'error',
                    message: 'eposta and sifre are required' 
                });
            }

            // Check if user exists
            const user = await conMain('musteriler')
                .where({ eposta: eposta, sifre: crypto.createHash('md5').update(sifre).digest('hex'), durum: 1 })
                .first();

                if (!user) {
                    return res.status(401).json({ 
                        status: 'error',
                        message: 'Invalid credentials' 
                    });
                }

                let cartId = '';
                const sepet = await conMain('sepet')
                    .where({ musteri_id: user.id })
                    .first();
                
                if (sepet) {
                    cartId = sepet.cartId || '';
                }

            

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, musteri_id: user.musteri_ust_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta, cari_ekstre_yetki: user.cari_ekstre_yetki },
                process.env.JWT_SECRET,
                { expiresIn: '5h' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: user.id, musteri_id: user.musteri_ust_id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' } // Refresh token expiration
            );

            const tokenUpdate = await conMain('tokens')
            .where({ user_id: user.id })
            .update({
                durum: 0
            });

            const tokenInsert = await conMain('musteriler_tokens')
            .insert({
                musteri_id: user.id,
                token: token,
                refresh_token: refreshToken,
                durum: 1,
                end_date: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now
            });
            
           

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                token: token,
                refreshToken: refreshToken, // Include refresh token in response
                cartId: cartId
            });

        } catch (error) {
            res.status(500).json({ 
                status: 'error',
                message: error.message,
            });
        }
    }

    async b2bRefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ message: 'refreshToken is required' });
            }

            // Verify the refresh token
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            } catch (err) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            // Get user from database using decoded information
            const user = await conMain('users')
                .where({ bayi_id: decoded.bayi_id, eposta: decoded.eposta })
                .first();

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Generate new JWT token
            const token = jwt.sign(
                { id: user.id, firma_id: user.firma_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta },
                process.env.JWT_SECRET,
                { expiresIn: '5h' }
            );

            // Generate new refresh token
            const newRefreshToken = jwt.sign(
                { id: user.id, firma_id: user.firma_id, adsoyad: user.ad+' '+user.soyad, eposta: user.eposta },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );

            res.status(200).json({
                message: 'Refresh token successful',
                accessToken: token,
                refreshToken: newRefreshToken
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({ message: 'Server error during refresh token' });
        }
    }


}

export default new LoginController();