const Association = require('../models/Association');

// Récupérer toutes les associations de l'utilisateur
exports.getAssociations = async (req, res) => {
  try {
    const associations = await Association.find({
      'members.userId': req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: associations.length,
      data: associations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des associations :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Récupérer une association par son ID
exports.getAssociationById = async (req, res) => {
  try {
    const association = await Association.findOne({
      _id: req.params.id,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    res.json({
      success: true,
      data: association
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'association :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Créer une nouvelle association
exports.createAssociation = async (req, res) => {
  try {
    // Vérifier si une association avec ce nom existe déjà
    const existingAssociation = await Association.findOne({ name: req.body.name });

    if (existingAssociation) {
      return res.status(400).json({
        success: false,
        message: 'Une association avec ce nom existe déjà'
      });
    }

    // Créer l'association avec l'utilisateur comme admin
    const association = new Association({
      ...req.body,
      members: [{ userId: req.user.id, role: 'admin' }],
      createdBy: req.user.id
    });

    await association.save();

    res.status(201).json({
      success: true,
      data: association
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'association :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Mettre à jour une association
exports.updateAssociation = async (req, res) => {
  try {
    // Vérifier si l'utilisateur est admin de l'association
    const association = await Association.findOne({
      _id: req.params.id,
      'members.userId': req.user.id,
      'members.role': 'admin'
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les droits pour modifier cette association'
      });
    }

    // Éviter de modifier directement les membres via cette route
    const { members, ...updateData } = req.body;

    // Mettre à jour l'association
    const updatedAssociation = await Association.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedAssociation
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'association :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Ajouter une catégorie à une association
exports.addCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'La catégorie est requise'
      });
    }

    // Vérifier si l'utilisateur est membre de l'association
    const association = await Association.findOne({
      _id: id,
      'members.userId': req.user.id
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas accès à cette association'
      });
    }

    // Vérifier si la catégorie existe déjà
    if (association.categories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Cette catégorie existe déjà'
      });
    }

    // Ajouter la catégorie
    association.categories.push(category);
    await association.save();

    res.json({
      success: true,
      data: association
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la catégorie :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Gérer les membres d'une association
exports.manageMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, userId, role } = req.body;

    // Vérifier si l'utilisateur est admin de l'association
    const association = await Association.findOne({
      _id: id,
      'members.userId': req.user.id,
      'members.role': 'admin'
    });

    if (!association) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les droits pour gérer les membres de cette association'
      });
    }

    if (action === 'add') {
      // Vérifier si l'utilisateur est déjà membre
      const isMember = association.members.some(member =>
        member.userId.toString() === userId
      );

      if (isMember) {
        return res.status(400).json({
          success: false,
          message: 'Cet utilisateur est déjà membre de l\'association'
        });
      }

      // Ajouter le membre
      association.members.push({ userId, role: role || 'member' });
    } else if (action === 'update') {
      // Mettre à jour le rôle du membre
      const memberIndex = association.members.findIndex(member =>
        member.userId.toString() === userId
      );

      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Cet utilisateur n\'est pas membre de l\'association'
        });
      }

      association.members[memberIndex].role = role;
    } else if (action === 'remove') {
      // Empêcher de supprimer le dernier admin
      const adminCount = association.members.filter(member =>
        member.role === 'admin'
      ).length;

      const memberToRemove = association.members.find(member =>
        member.userId.toString() === userId
      );

      if (memberToRemove && memberToRemove.role === 'admin' && adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer le dernier administrateur'
        });
      }

      // Supprimer le membre
      association.members = association.members.filter(member =>
        member.userId.toString() !== userId
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action non valide'
      });
    }

    await association.save();

    res.json({
      success: true,
      data: association
    });
  } catch (error) {
    console.error('Erreur lors de la gestion des membres :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
