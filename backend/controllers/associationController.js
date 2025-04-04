const Association = require('../models/Association');
const Member = require('../models/Member');
const User = require('../models/User');

// Récupérer toutes les associations de l'utilisateur
exports.getAssociations = async (req, res) => {
  try {
    // Trouver les associations où l'utilisateur est membre
    const memberships = await Member.find({
      userId: req.user.id
    });

    // Extraire les IDs d'associations
    const associationIds = memberships.map(membership => membership.association);

    // Récupérer les associations correspondantes
    const associations = await Association.find({
      _id: { $in: associationIds }
    }).sort({ createdAt: -1 });

    // Ajouter l'information de rôle à chaque association
    const associationsWithRole = associations.map(association => {
      const membership = memberships.find(m =>
        m.association.toString() === association._id.toString()
      );

      return {
        ...association.toObject(),
        userRole: membership ? membership.role : null
      };
    });

    res.json({
      success: true,
      count: associations.length,
      data: associationsWithRole
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
    const { populate } = req.query;
    const associationId = req.params.id;

    // Vérifier si l'utilisateur est membre de cette association
    const membership = await Member.findOne({
      association: associationId,
      userId: req.user.id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    // Récupérer l'association
    const association = await Association.findById(associationId);

    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

    // Si on demande de charger les détails des membres
    let members = [];
    if (populate === 'members') {
      members = await Member.find({ association: associationId })
        .populate('userId', 'name email')
        .sort({ role: 1, name: 1 });
    }

    // Créer une réponse enrichie
    const response = {
      ...association.toObject(),
      userRole: membership.role,
      members: populate === 'members' ? members : undefined
    };

    res.json({
      success: true,
      data: response
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

    // Récupérer les informations complètes de l'utilisateur pour avoir son email
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // S'assurer que l'email existe
    if (!user.email) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur sans email valide'
      });
    }

    // Créer l'association
    const association = new Association({
      ...req.body,
      createdBy: req.user.id
    });

    await association.save();

    // Ajouter l'utilisateur comme admin de l'association avec validation de l'email
    console.log(`Création d'un membre avec email: ${user.email} et nom: ${user.name}`);

    const member = new Member({
      userId: req.user.id,
      email: user.email,
      name: user.name || 'Utilisateur',
      role: 'admin',
      association: association._id,
      status: 'active'
    });

    await member.save();

    res.status(201).json({
      success: true,
      data: association
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'association :', error);
    // Log plus détaillé pour débugger le problème
    if (error.name === 'ValidationError') {
      console.error('Détails de l\'erreur de validation:', JSON.stringify(error.errors));
    }
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
    const associationId = req.params.id;

    // Vérifier si l'utilisateur est admin de l'association
    const membership = await Member.findOne({
      association: associationId,
      userId: req.user.id,
      role: 'admin'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les droits pour modifier cette association'
      });
    }

    // Mettre à jour l'association
    const updatedAssociation = await Association.findByIdAndUpdate(
      associationId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAssociation) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
      });
    }

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
    const associationId = req.params.id;
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'La catégorie est requise'
      });
    }

    // Vérifier si l'utilisateur est membre de l'association
    const membership = await Member.findOne({
      association: associationId,
      userId: req.user.id
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas accès à cette association'
      });
    }

    // Récupérer l'association
    const association = await Association.findById(associationId);

    if (!association) {
      return res.status(404).json({
        success: false,
        message: 'Association non trouvée'
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
