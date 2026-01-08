// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // permet null pour les utilisateurs sans email
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "agent", "admin", "superadmin"],
    default: "user"
  },
  balance: {
    type: Number,
    default: 0
  },
  twofaEnabled: {
    type: Boolean,
    default: false
  },
  twofaSecret: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash du mot de passe avant enregistrement
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);