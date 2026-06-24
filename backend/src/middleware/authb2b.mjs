import jwt from 'jsonwebtoken';
import conMain from '../config/database.mjs';

const authb2b = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header is required' });
    }

    // Get token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token is required' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      //const firma = await conMain('firmalar').where('id', decoded.firma_id).first();
      const user = await conMain('musteriler').where('id', decoded.id).first();
   
      // Add user from payload to request object
      req.locals = {
        //firma: firma,
        user: user
      };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid' });
    }

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export default authb2b;
