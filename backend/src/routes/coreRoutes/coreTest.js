const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Test JWT verification
const testJWT = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required"
      });
    }

    console.log('🧪 [TEST] Testing JWT verification...');
    console.log('🔑 [TEST] JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('🔑 [TEST] JWT_SECRET value:', process.env.JWT_SECRET);
    console.log('🎫 [TEST] Token preview:', token.substring(0, 50) + '...');

    // Verify the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'JWT_SECRET');
      console.log('✅ [TEST] Token verified successfully');
      console.log('📝 [TEST] Decoded payload:', decoded);
    } catch (jwtError) {
      console.error('❌ [TEST] Token verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token: ' + jwtError.message
      });
    }

    // Check if user exists
    const UserModel = mongoose.model('Admin');
    const user = await UserModel.findOne({ email: decoded.email, removed: false });
    
    console.log('👤 [TEST] User lookup result:', user ? 'FOUND' : 'NOT FOUND');
    if (user) {
      console.log('👤 [TEST] User details:', { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        enabled: user.enabled 
      });
    }

    res.json({
      success: true,
      decoded: decoded,
      userExists: !!user,
      userEnabled: user ? user.enabled : false,
      message: 'JWT test completed'
    });
    
  } catch (error) {
    console.error('❌ [TEST] JWT test error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during JWT test"
    });
  }
};

router.route('/test-jwt').post(testJWT);

module.exports = router;