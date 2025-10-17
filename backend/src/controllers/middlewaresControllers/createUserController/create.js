const mongoose = require('mongoose');
const { generate: uniqueId } = require('shortid');

const create = async (userModel, req, res) => {
  try {
    const Model = mongoose.model(userModel);
    const { name, surname, email, password, role = 'owner', enabled = true } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await Model.findOne({ email: email, removed: false });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        result: null,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const userData = {
      name,
      surname: surname || '',
      email,
      role,
      enabled,
      removed: false,
    };

    const result = await new Model(userData).save();

    // Create password for Admin model
    if (userModel === 'Admin') {
      const AdminPassword = require('@/models/coreModels/AdminPassword');
      const salt = uniqueId();
      const newAdminPassword = new AdminPassword();
      const passwordHash = newAdminPassword.generateHash(salt, password);

      const AdminPasswordData = {
        password: passwordHash,
        emailVerified: true,
        salt: salt,
        user: result._id,
      };
      await new AdminPassword(AdminPasswordData).save();
    }

    return res.status(200).json({
      success: true,
      result: {
        _id: result._id,
        name: result.name,
        surname: result.surname,
        email: result.email,
        role: result.role,
        enabled: result.enabled,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      result: null,
      message: error.message,
    });
  }
};

module.exports = create;