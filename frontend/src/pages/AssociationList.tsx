import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaBuilding, FaPlus, FaUsers, FaRegCalendarAlt } from 'react-icons/fa';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface Association {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  email?: string;
  phone?: string;
  members: Array<{
    userId: string;
    role: 'admin' | 'member' | 'treasurer';
  }>;
  createdAt: string;
}

const AssociationList: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [associations, setAssociations] = useState<Association[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les associations de l'utilisateur
  useEffect(() => {
    const fetchAssociations = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/associations`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAssociations(response.data.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des associations :', error);
        setError('Impossible de charger vos associations. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchAssociations();
  }, [token]);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Obtenir le rôle de l'utilisateur dans l'association
  const getUserRole = (association: Association) => {
    const member = association.members.find(m => m.userId === user?.id);
    if (!member) return 'inconnu';

    // Traduire les rôles en français
    const roleTranslations = {
      'admin': 'Administrateur',
      'member': 'Membre',
      'treasurer': 'Trésorier'
    };

    return roleTranslations[member.role] || member.role;
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Chargement des associations...</div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Mes associations</h1>
            <button
              onClick={() => navigate('/associations/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" /> Créer une association
            </button>
          </div>
        </div>

        {/* Liste des associations */}
        {associations.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FaBuilding className="mx-auto text-gray-400 text-5xl mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune association</h2>
            <p className="text-gray-600 mb-6">
              Vous n'êtes membre d'aucune association pour le moment.
            </p>
            <button
              onClick={() => navigate('/associations/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Créer une association
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associations.map((association) => (
              <Link
                key={association._id}
                to={`/associations/${association._id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{association.name}</h2>

                  {association.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">{association.description}</p>
                  )}

                  <div className="flex items-center text-gray-500 mb-2">
                    <FaUsers className="mr-2" />
                    <span>Rôle: {getUserRole(association)}</span>
                  </div>

                  <div className="flex items-center text-gray-500">
                    <FaRegCalendarAlt className="mr-2" />
                    <span>Créée le {formatDate(association.createdAt)}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Accéder à la comptabilité
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationList;
