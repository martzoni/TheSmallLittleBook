const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense'],
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'bank', 'other']
  },
  reference: {
    type: String,
    trim: true
  },
  associationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Association',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
TransactionSchema.index({ associationId: 1, date: -1 });
TransactionSchema.index({ type: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
