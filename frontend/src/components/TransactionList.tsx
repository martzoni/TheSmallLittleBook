import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import { FaEdit, FaTrash, FaFilter } from 'react-icons/fa';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: 'cash' | 'bank' | 'other';
  reference?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface TransactionFilters {
  startDate: string;
  endDate: string;
  type: string;
  category: string;
}

const TransactionList: React.FC = () => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // État pour les filtres
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: '',
    endDate: '',
    type: '',
    category: ''
  });

  // Fonction pour charger les transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Construire l'URL avec les filtres
      let url = `${API_URL}/transactions/association/${associationId}`;
      const queryParams = [];

      if (filters.startDate) {
        queryParams.push(`startDate=${filters.startDate}`);
      }

      if (filters.endDate) {
        queryParams.push(`endDate=${filters.endDate}`);
      }

      if (filters.type) {
        queryParams.push(`type=${filters.type}`);
      }

      if (filters.category) {
        queryParams.push(`category=${encodeURIComponent(filters.category)}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setTransactions(response.data.data);

        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(response.data.data.map((t: Transaction) => t.category))];
        setCategories(uniqueCategories);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions :', error);
      setError('Impossible de charger les transactions. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  // Charger les transactions au chargement du composant
  useEffect(() => {
    fetchTransactions();
  }, [associationId, token, filters]);

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Formater le montant
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    });
  };

  // Modifier une transaction
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Supprimer une transaction
  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        const response = await axios.delete(
          `${API_URL}/transactions/association/${associationId}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          // Mettre à jour la liste des transactions
          setTransactions(transactions.filter(t => t._id !== id));
          alert('Transaction supprimée avec succès.');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la transaction :', error);
        alert('Erreur lors de la suppression de la transaction.');
      }
    }
  };

  // Gérer les changements de filtre
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      category: ''
    });
  };

  // Afficher un message de chargement
  if (loading) {
    return <div className="text-center py-10">Chargement des transactions...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Formulaire d'édition */}
      {editingTransaction && (
        <div className="mb-6">
          <TransactionForm
            onTransactionAdded={fetchTransactions}
            editTransaction={editingTransaction}
            onCancelEdit={() => setEditingTransaction(null)}
          />
        </div>
      )}

      {/* Filtres */}
      <div className="p-4 border-b">
        <button
          onClick={() => setFilters(prevFilters => ({ ...prevFilters, showFilters: !filters.showFilters }))}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaFilter className="mr-2" /> Filtres
        </button>

        {filters.showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Tous</option>
                <option value="income">Recettes</option>
                <option value="expense">Dépenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Toutes</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tableau des transactions */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paiement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucune transaction trouvée
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id} className={transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                    {transaction.reference && (
                      <span className="block text-xs text-gray-500">
                        Réf: {transaction.reference}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(transaction.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.paymentMethod === 'cash' ? 'Espèces' :
                     transaction.paymentMethod === 'bank' ? 'Banque' : 'Autre'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
