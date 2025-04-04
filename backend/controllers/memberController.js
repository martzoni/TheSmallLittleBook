const Member = require('../models/Member');
const Association = require('../models/Association');
const User = require('../models/User');

// Récupérer tous les membres d'une association
exports.getMembers = async (req, res) => {
  try {
    const { associationId } = req.params;

    // Vérifier si l'utilisateur est membre de cette association
    const userMembership = await Member.findOne({
      association: associationId,
      userId: req.user.id
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas accès à cette association"
      });
    }

    // Récupérer tous les membres de l'association
    const members = await Member.find({ association: associationId })
      .populate('userId', 'name email')
      .populate('invitedBy', 'name email')
      .sort({ role: 1, name: 1 });

    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des membres :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Ajouter un membre à une association
exports.addMember = async (req, res) => {
  try {
    const { associationId } = req.params;
    const { email, name, phone, role, isUser = false } = req.body;

    // Vérifier si l'utilisateur est admin de cette association
    const userMembership = await Member.findOne({
      association: associationId,
      userId: req.user.id,
      role: 'admin'
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas les droits pour ajouter des membres"
      });
    }

    // Vérifier si l'association existe
    const association = await Association.findById(associationId);

    if (!association) {
      return res.status(404).json({
        success: false,
        message: "Association non trouvée"
      });
    }

    // Vérifier si un membre avec cet email existe déjà dans cette association
    const existingMember = await Member.findOne({
      email,
      association: associationId
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "Un membre avec cet email existe déjà dans cette association"
      });
    }

    let userId = null;

    // Si isUser est vrai, rechercher l'utilisateur par email
    if (isUser) {
      const user = await User.findOne({ email });

      if (user) {
        userId = user._id;
      } else {
        return res.status(404).json({
          success: false,
          message: "Aucun utilisateur n'a été trouvé avec cet email"
        });
      }
    }

    // Créer le nouveau membre
    const newMember = new Member({
      email,
      name: name || (userId ? null : email.split('@')[0]), // Utiliser une partie de l'email comme nom par défaut
      phone,
      role: role || 'member',
      association: associationId,
      userId,
      status: userId ? 'active' : 'invited',
      invitedBy: req.user.id
    });

    await newMember.save();

    // Si c'est un utilisateur existant, aucune invitation n'est nécessaire
    if (userId) {
      res.status(201).json({
        success: true,
        data: newMember
      });
    } else {
      // TODO: Envoyer un email d'invitation
      // Pour l'instant, nous simulons simplement l'envoi d'une invitation

      res.status(201).json({
        success: true,
        message: "Invitation envoyée",
        data: newMember
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un membre :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Mettre à jour un membre
exports.updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { name, phone, role, status } = req.body;

    // Récupérer le membre
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Vérifier si l'utilisateur est admin de cette association
    const userMembership = await Member.findOne({
      association: member.association,
      userId: req.user.id,
      role: 'admin'
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas les droits pour modifier ce membre"
      });
    }

    // Empêcher la modification du dernier administrateur
    if (member.role === 'admin' && role !== 'admin') {
      const adminCount = await Member.countDocuments({
        association: member.association,
        role: 'admin'
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Impossible de modifier le rôle du dernier administrateur"
        });
      }
    }

    // Mettre à jour les champs
    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (role) member.role = role;
    if (status) member.status = status;

    await member.save();

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'un membre :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Supprimer un membre
exports.deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    // Récupérer le membre
    const member = await Member.findById(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Membre non trouvé"
      });
    }

    // Vérifier si l'utilisateur est admin de cette association
    const userMembership = await Member.findOne({
      association: member.association,
      userId: req.user.id,
      role: 'admin'
    });

    if (!userMembership) {
      return res.status(403).json({
        success: false,
        message: "Vous n'avez pas les droits pour supprimer ce membre"
      });
    }

    // Empêcher la suppression du dernier administrateur
    if (member.role === 'admin') {
      const adminCount = await Member.countDocuments({
        association: member.association,
        role: 'admin'
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Impossible de supprimer le dernier administrateur"
        });
      }
    }

    await Member.findByIdAndDelete(memberId);

    res.json({
      success: true,
      message: "Membre supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'un membre :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Accepter une invitation (pour les membres non-utilisateurs)
exports.acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, password } = req.body;

    // TODO: Implémenter la logique de vérification du token d'invitation
    // Pour l'instant, nous simulons simplement l'acceptation d'une invitation

    res.json({
      success: true,
      message: "Invitation acceptée avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
