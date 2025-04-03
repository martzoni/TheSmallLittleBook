import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import FinancialSummary from '../components/FinancialSummary';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface Association {
  _id: string;
  name: string;
  description?: string;
  categories: string[];
}

const AssociationDashboard: React.FC = () => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'summary' | 'add'>('transactions');

  // Charger les détails de l'association
  useEffect(() => {
    const fetchAssociationDetails = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/associations/${associationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAssociation(response.data.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'association :', error);
        setError('Impossible de charger les détails de l\'association.');
        setLoading(false);
      }
    };

    fetchAssociationDetails();
  }, [associationId, token]);

  // Gérer l'ajout d'une transaction
  const handleTransactionAdded = () => {
    // Revenir à l'onglet des transactions après l'ajout
    setActiveTab('transactions');
  };

  // Afficher un message de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Chargement...</div>
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
            onClick={() => navigate('/associations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à la liste des associations
          </button>
        </div>
      </div>
    );
  }

  // Si l'association n'existe pas
  if (!association) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Association non trouvée</h2>
          <p>Cette association n'existe pas ou vous n'avez pas les droits d'accès.</p>
          <button
            onClick={() => navigate('/associations')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retour à la liste des associations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{association.name}</h1>
              {association.description && (
                <p className="mt-2 text-gray-600">{association.description}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/associations')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Retour à la liste
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'transactions'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Ajouter une transaction
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Résumé financier
            </button>
          </nav>
        </div>

        {/* Contenu en fonction de l'onglet sélectionné */}
        <div>
          {activeTab === 'transactions' && <TransactionList />}

          {activeTab === 'add' && (
            <TransactionForm onTransactionAdded={handleTransactionAdded} />
          )}

          {activeTab === 'summary' && <FinancialSummary />}
        </div>
      </div>
    </div>
  );
};

export default AssociationDashboard;
