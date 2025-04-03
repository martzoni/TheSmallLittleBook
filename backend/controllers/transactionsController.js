const Transaction = require('../models/Transaction');
const Association = require('../models/Association');
const mongoose = require('mongoose');

// Récupérer toutes les transactions d'une association
exports.getTransactions = async (req, res) => {
  try {
    const { associationId } = req.params;
    const { startDate, endDate, type, category } = req.query;

    // Vérifier si l'utilisateur a accès à cette association
    const association = await Association.findOne({
      _id: associationId,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    // Construire la requête avec les filtres
    let query = { associationId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'name');

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des transactions :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Ajouter une transaction
exports.addTransaction = async (req, res) => {
  try {
    const { associationId } = req.params;

    // Vérifier si l'utilisateur a accès à cette association
    const association = await Association.findOne({
      _id: associationId,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    const transaction = new Transaction({
      ...req.body,
      associationId,
      createdBy: req.user.id
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une transaction :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Mettre à jour une transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id, associationId } = req.params;

    // Vérifier si la transaction existe et appartient à cette association
    let transaction = await Transaction.findOne({
      _id: id,
      associationId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Vérifier si l'utilisateur a accès à cette association
    const association = await Association.findOne({
      _id: associationId,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    // Mise à jour de la transaction
    transaction = await Transaction.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une transaction :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Supprimer une transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id, associationId } = req.params;

    // Vérifier si la transaction existe et appartient à cette association
    const transaction = await Transaction.findOne({
      _id: id,
      associationId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    // Vérifier si l'utilisateur a accès à cette association
    const association = await Association.findOne({
      _id: associationId,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    await Transaction.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Transaction supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une transaction :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Obtenir le résumé financier
exports.getFinancialSummary = async (req, res) => {
  try {
    const { associationId } = req.params;
    const { startDate, endDate } = req.query;

    // Vérifier si l'utilisateur a accès à cette association
    const association = await Association.findOne({
      _id: associationId,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    // Construire la requête avec les filtres de date
    let matchStage = { associationId: mongoose.Types.ObjectId(associationId) };

    if (startDate && endDate) {
      matchStage.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Calcul du résumé financier avec agrégation MongoDB
    const summary = await Transaction.aggregate([
      { $match: matchStage },
      { $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Reformater les résultats
    const formattedSummary = {
      income: 0,
      expense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    };

    summary.forEach(item => {
      if (item._id === 'income') {
        formattedSummary.income = item.total;
        formattedSummary.incomeCount = item.count;
      } else if (item._id === 'expense') {
        formattedSummary.expense = item.total;
        formattedSummary.expenseCount = item.count;
      }
    });

    formattedSummary.balance = formattedSummary.income - formattedSummary.expense;

    // Obtenir la répartition par catégorie
    const categorySummary = await Transaction.aggregate([
      { $match: matchStage },
      { $group: {
          _id: { type: "$type", category: "$category" },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.type": 1, "total": -1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: formattedSummary,
        byCategory: categorySummary
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du résumé financier :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
