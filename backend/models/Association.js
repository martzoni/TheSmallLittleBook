const mongoose = require('mongoose');

const AssociationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  categories: [{
    type: String,
    trim: true
  }],
  fiscalYearStart: {
    type: Date,
    default: function() {
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, 0, 1); // 1er janvier de l'année en cours
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Association', AssociationSchema);
