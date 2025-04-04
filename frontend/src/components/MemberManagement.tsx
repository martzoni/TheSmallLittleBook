import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaUserPlus, FaUserEdit, FaUserMinus, FaUserCog, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

// URL de l'API depuis les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || '';

interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'member' | 'treasurer';
  status: 'active' | 'invited' | 'inactive';
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  invitedBy?: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
}

const MemberManagement: React.FC = () => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token, user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État pour l'ajout de membre
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newMemberEmail, setNewMemberEmail] = useState<string>('');
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberPhone, setNewMemberPhone] = useState<string>('');
  const [newMemberRole, setNewMemberRole] = useState<'member' | 'treasurer'>('member');
  const [newMemberIsUser, setNewMemberIsUser] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  // État pour la modification de membre
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editRole, setEditRole] = useState<'admin' | 'treasurer' | 'member'>('member');

  // Charger les membres de l'association
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/members/association/${associationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setMembers(response.data.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des membres :', error);
        setError('Impossible de charger les membres de l\'association.');
        setLoading(false);
      }
    };

    fetchMembers();
  }, [associationId, token]);

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    if (!members.length || !user) return false;

    return members.some(
      member => member.userId?._id === user.id && member.role === 'admin'
    );
  };

  // Gérer l'ajout d'un membre
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMemberEmail.trim()) {
      setAddError('L\'email du membre est requis');
      return;
    }

    try {
      const memberData: any = {
        email: newMemberEmail,
        role: newMemberRole,
        isUser: newMemberIsUser
      };

      // Si ce n'est pas un utilisateur existant, ajouter le nom et le téléphone
      if (!newMemberIsUser) {
        memberData.name = newMemberName;
        if (newMemberPhone) memberData.phone = newMemberPhone;
      }

      const response = await axios.post(
        `${API_URL}/members/association/${associationId}`,
        memberData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Recharger la liste des membres
        const membersResponse = await axios.get(`${API_URL}/members/association/${associationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (membersResponse.data.success) {
          setMembers(membersResponse.data.data);
        }

        // Réinitialiser le formulaire
        setNewMemberEmail('');
        setNewMemberName('');
        setNewMemberPhone('');
        setNewMemberRole('member');
        setNewMemberIsUser(false);
        setShowAddForm(false);
        setAddError(null);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du membre :', error);
      setAddError(
        error.response?.data?.message ||
        'Une erreur est survenue lors de l\'ajout du membre.'
      );
    }
  };

  // Gérer la modification d'un membre
  const handleUpdateMember = async (memberId: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/members/${memberId}`,
        {
          name: editName,
          phone: editPhone,
          role: editRole
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Recharger la liste des membres
        const membersResponse = await axios.get(`${API_URL}/members/association/${associationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (membersResponse.data.success) {
          setMembers(membersResponse.data.data);
        }

        // Réinitialiser l'état d'édition
        setEditingMember(null);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du membre :', error);
    }
  };

  // Gérer la suppression d'un membre
  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/members/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Mettre à jour la liste des membres en supprimant le membre supprimé
        setMembers(members.filter(member => member._id !== memberId));
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du membre :', error);
      alert(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la suppression du membre.'
      );
    }
  };

  // Traduire le rôle en français
  const translateRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'treasurer':
        return 'Trésorier';
      case 'member':
        return 'Membre';
      default:
        return role;
    }
  };

  // Traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'invited':
        return 'Invité';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Afficher un message de chargement
  if (loading) {
    return <div className="text-center py-10">Chargement des membres...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <FaUserCog className="mr-2" /> Gestion des membres
      </h2>

      {isAdmin() && (
        <div className="mb-6">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaUserPlus className="mr-2" /> Ajouter un membre
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Ajouter un nouveau membre</h3>

              <form onSubmit={handleAddMember}>
                {addError && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
                    {addError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={newMemberIsUser}
                      onChange={(e) => setNewMemberIsUser(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Utilisateur existant
                    </span>
                  </label>
                  <p className="text-xs text-gray-500">
                    {newMemberIsUser
                      ? "L'utilisateur doit déjà être inscrit sur la plateforme."
                      : "Une invitation sera envoyée à cette adresse email."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                        placeholder="email@exemple.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle
                    </label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as 'member' | 'treasurer')}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="member">Membre</option>
                      <option value="treasurer">Trésorier</option>
                    </select>
                  </div>
                </div>

                {!newMemberIsUser && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                          placeholder="Nom du membre"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          value={newMemberPhone}
                          onChange={(e) => setNewMemberPhone(e.target.value)}
                          className="w-full pl-10 p-2 border border-gray-300 rounded-md"
                          placeholder="+41 XX XXX XX XX"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setAddError(null);
                    }}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Liste des membres */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              {isAdmin() && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length === 0 ? (
              <tr>
                <td colSpan={isAdmin() ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun membre trouvé
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name || (member.userId?.name || 'Sans nom')}
                        </div>
                        {member.userId && (
                          <div className="text-xs text-gray-500">
                            Utilisateur enregistré
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                    {member.phone && (
                      <div className="text-xs mt-1">
                        Tél: {member.phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {editingMember === member._id ? (
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as 'admin' | 'treasurer' | 'member')}
                        className="p-1 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="treasurer">Trésorier</option>
                        <option value="member">Membre</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : member.role === 'treasurer'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {translateRole(member.role)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : member.status === 'invited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {translateStatus(member.status)}
                    </span>
                  </td>
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingMember === member._id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleUpdateMember(member._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Enregistrer
                          </button>
                          <button
                            onClick={() => setEditingMember(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          {/* Ne pas permettre d'éditer son propre rôle */}
                          {user?.id !== member.userId?._id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMember(member._id);
                                  setEditName(member.name || '');
                                  setEditPhone(member.phone || '');
                                  setEditRole(member.role);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                                title="Modifier"
                              >
                                <FaUserEdit />
                              </button>

                              {/* Supprimer le membre si ce n'est pas un admin ou si ce n'est pas le dernier admin */}
                              <button
                                onClick={() => handleDeleteMember(member._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Supprimer"
                                disabled={member.role === 'admin' && members.filter(m => m.role === 'admin').length <= 1}
                              >
                                <FaUserMinus />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberManagement;
