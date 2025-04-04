const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  // Référence optionnelle à un utilisateur du système
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Informations de base du membre
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Rôle dans l'association
  role: {
    type: String,
    enum: ['admin', 'member', 'treasurer'],
    default: 'member'
  },
  // Association à laquelle le membre appartient
  association: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association',
    required: true
  },
  // Statut du membre
  status: {
    type: String,
    enum: ['active', 'invited', 'inactive'],
    default: 'active'
  },
  // Date de dernière activité
  lastActive: {
    type: Date,
    default: Date.now
  },
  // Invité par (si pertinent)
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Validation - si pas d'userId, le nom est requis
MemberSchema.pre('validate', function(next) {
  if (!this.userId && !this.name) {
    this.invalidate('name', 'Le nom est requis si aucun utilisateur n\'est associé');
  }
  next();
});

// Validation d'email unique par association
MemberSchema.index({ email: 1, association: 1 }, { unique: true });

module.exports = mongoose.model('Member', MemberSchema);
