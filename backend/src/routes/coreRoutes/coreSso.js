const express = require('express');
const router = express.Router();
const { catchErrors } = require('@/handlers/errorHandlers');

// SSO redirect handler for SaaS integration
const ssoRedirect = async (req, res) => {
  try {
    const { sso_token, redirect_url } = req.query;
    
    console.log('🔄 [IDURAR-SSO] SSO redirect request received');
    console.log('🎫 [IDURAR-SSO] Token present:', !!sso_token);
    console.log('🔗 [IDURAR-SSO] Redirect URL:', redirect_url);
    
    if (!sso_token) {
      console.error('❌ [IDURAR-SSO] No SSO token provided');
      return res.status(400).json({
        success: false,
        message: "SSO token is required"
      });
    }

    // Redirect to the frontend SSO login page with the token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3005';
    const appPath = process.env.APP_PATH || '';
    const redirectTo = `${frontendUrl}${appPath}/sso?token=${sso_token}&redirect_url=${encodeURIComponent(redirect_url || '')}`;
    
    console.log('✅ [IDURAR-SSO] Redirecting to frontend SSO page:', redirectTo);
    res.redirect(redirectTo);
    
  } catch (error) {
    console.error('❌ [IDURAR-SSO] SSO redirect error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error during SSO redirect"
    });
  }
};

router.route('/sso').get(catchErrors(ssoRedirect));

module.exports = router;