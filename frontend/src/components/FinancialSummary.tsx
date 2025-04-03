import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface SummaryData {
  summary: {
    income: number;
    expense: number;
    balance: number;
    incomeCount: number;
    expenseCount: number;
  };
  byCategory: Array<{
    _id: {
      type: string;
      category: string;
    };
    total: number;
    count: number;
  }>;
}

interface FilterDates {
  startDate: string;
  endDate: string;
}

const FinancialSummary: React.FC = () => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token } = useAuth();
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État pour les filtres de date
  const [filterDates, setFilterDates] = useState<FilterDates>({
    startDate: '',
    endDate: ''
  });

  // Couleurs pour les graphiques
  const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#607d8b'];

  // Charger les données de résumé financier
  const fetchSummaryData = async () => {
    try {
      setLoading(true);

      // Construire l'URL avec les filtres
      let url = `${API_URL}/transactions/association/${associationId}/summary`;
      const queryParams = [];

      if (filterDates.startDate) {
        queryParams.push(`startDate=${filterDates.startDate}`);
      }

      if (filterDates.endDate) {
        queryParams.push(`endDate=${filterDates.endDate}`);
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
        setSummaryData(response.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé financier :', error);
      setError('Impossible de charger les données financières. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  // Charger les données au chargement du composant et lorsque les filtres changent
  useEffect(() => {
    fetchSummaryData();
  }, [associationId, token, filterDates]);

  // Gérer les changements de filtre de date
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterDates({
      ...filterDates,
      [name]: value
    });
  };

  // Formater un montant en CHF
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('fr-CH', {
      style: 'currency',
      currency: 'CHF'
    });
  };

  // Préparer les données pour le graphique en barres (recettes/dépenses)
  const prepareBalanceData = () => {
    if (!summaryData) return [];

    return [
      {
        name: 'Recettes',
        montant: summaryData.summary.income
      },
      {
        name: 'Dépenses',
        montant: summaryData.summary.expense
      },
      {
        name: 'Solde',
        montant: summaryData.summary.balance
      }
    ];
  };

  // Préparer les données pour le graphique circulaire des dépenses par catégorie
  const prepareExpenseCategoryData = () => {
    if (!summaryData) return [];

    return summaryData.byCategory
      .filter(item => item._id.type === 'expense')
      .map(item => ({
        name: item._id.category,
        value: item.total
      }));
  };

  // Préparer les données pour le graphique circulaire des recettes par catégorie
  const prepareIncomeCategoryData = () => {
    if (!summaryData) return [];

    return summaryData.byCategory
      .filter(item => item._id.type === 'income')
      .map(item => ({
        name: item._id.category,
        value: item.total
      }));
  };

  // Afficher un message de chargement
  if (loading) {
    return <div className="text-center py-10">Chargement des données financières...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  // Si aucune donnée n'est disponible
  if (!summaryData) {
    return <div className="text-center py-10">Aucune donnée financière disponible.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Résumé financier</h2>

      {/* Filtres de date */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            name="startDate"
            value={filterDates.startDate}
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
            value={filterDates.endDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Cartes de résumé */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-green-800">Recettes</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(summaryData.summary.income)}
          </p>
          <p className="text-sm text-green-800">
            {summaryData.summary.incomeCount} transactions
          </p>
        </div>

        <div className="bg-red-100 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800">Dépenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatAmount(summaryData.summary.expense)}
          </p>
          <p className="text-sm text-red-800">
            {summaryData.summary.expenseCount} transactions
          </p>
        </div>

        <div className={`${summaryData.summary.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg p-4`}>
          <h3 className="text-lg font-medium">Solde</h3>
          <p className={`text-2xl font-bold ${summaryData.summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            {formatAmount(summaryData.summary.balance)}
          </p>
        </div>
      </div>

      {/* Graphique en barres - Vue d'ensemble */}
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4">Vue d'ensemble</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={prepareBalanceData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatAmount(value as number)} />
              <Legend />
              <Bar dataKey="montant" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques circulaires - Catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dépenses par catégorie */}
        <div>
          <h3 className="text-xl font-medium mb-4">Dépenses par catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareExpenseCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareExpenseCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recettes par catégorie */}
        <div>
          <h3 className="text-xl font-medium mb-4">Recettes par catégorie</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareIncomeCategoryData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepareIncomeCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatAmount(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tableau détaillé par catégorie */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">Détail par catégorie</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summaryData.byCategory.map((category, index) => (
                <tr key={index} className={category._id.type === 'income' ? 'bg-green-50' : 'bg-red-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category._id.type === 'income' ? 'Recette' : 'Dépense'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category._id.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={category._id.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(category.total)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
