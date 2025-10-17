const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const ssoLogin = async (req, res, { userModel }) => {
  try {
    const UserPasswordModel = mongoose.model(userModel + 'Password');
    const UserModel = mongoose.model(userModel);
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'SSO token is required',
      });
    }

    console.log('🎫 [IDURAR-SSO] Processing SSO token...');
    console.log('🔑 [IDURAR-SSO] JWT_SECRET available:', !!process.env.JWT_SECRET);
    console.log('🎫 [IDURAR-SSO] Token preview:', token.substring(0, 50) + '...');

    // Verify the JWT token (assuming it contains user email)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'JWT_SECRET');
      console.log('✅ [IDURAR-SSO] Token verified successfully for email:', decoded.email);
      console.log('📝 [IDURAR-SSO] Decoded payload:', decoded);
    } catch (jwtError) {
      console.error('❌ [IDURAR-SSO] Token verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        result: null,
        message: 'Invalid SSO token',
      });
    }

    const { email } = decoded;
    if (!email) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Invalid token payload - email missing',
      });
    }

    // Find user by email
    console.log('🔍 [IDURAR-SSO] Looking for user with email:', email);
    const user = await UserModel.findOne({ email: email, removed: false });
    
    // Also check all users to see what emails exist
    const allUsers = await UserModel.find({ removed: false }).select('email name surname');
    console.log('📊 [IDURAR-SSO] All users in database:', allUsers.map(u => u.email));

    if (!user) {
      console.error('❌ [IDURAR-SSO] User not found:', email);
      console.error('📊 [IDURAR-SSO] Available users:', allUsers.length);
      return res.status(404).json({
        success: false,
        result: null,
        message: `No account with email '${email}' has been registered. Available users: ${allUsers.length}`,
      });
    }

    if (!user.enabled) {
      console.error('❌ [IDURAR-SSO] User account disabled:', email);
      return res.status(409).json({
        success: false,
        result: null,
        message: 'Your account is disabled, contact your account administrator',
      });
    }

    // Get user password record
    const databasePassword = await UserPasswordModel.findOne({ user: user._id, removed: false });

    if (!databasePassword) {
      console.error('❌ [IDURAR-SSO] Password record not found for user:', email);
      return res.status(404).json({
        success: false,
        result: null,
        message: 'User password record not found',
      });
    }

    // Generate new JWT token for IDURAR session
    const authToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET || 'JWT_SECRET',
      { expiresIn: '24h' }
    );

    // Add token to logged sessions
    await UserPasswordModel.findOneAndUpdate(
      { user: user._id },
      { $push: { loggedSessions: authToken } },
      { new: true }
    );

    const result = {
      _id: user._id,
      enabled: user.enabled,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    };

    console.log('✅ [IDURAR-SSO] SSO login successful for user:', email);
    console.log('🎫 [IDURAR-SSO] Generated auth token:', authToken ? 'Present' : 'Missing');
    console.log('👤 [IDURAR-SSO] User result:', JSON.stringify(result, null, 2));

    const response = {
      success: true,
      result: {
        user: result,
        token: authToken,
      },
      message: 'SSO login successful',
    };
    
    console.log('📤 [IDURAR-SSO] Sending response:', JSON.stringify(response, null, 2));
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ [IDURAR-SSO] SSO login error:', error);
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Internal server error during SSO login',
    });
  }
};

module.exports = ssoLogin;