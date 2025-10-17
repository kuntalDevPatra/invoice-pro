const express = require('express');
const router = express.Router();

// Simple logging endpoint for frontend debugging
const logMessage = async (req, res) => {
  try {
    const { level, message, data } = req.body;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] [FRONTEND-${level.toUpperCase()}] ${message}`);
    if (data) {
      console.log(`[${timestamp}] [FRONTEND-DATA]`, JSON.stringify(data, null, 2));
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Logging endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

router.route('/log').post(logMessage);

module.exports = router;