import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface TransactionFormProps {
  onTransactionAdded: () => void;
  editTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

interface Transaction {
  _id?: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  paymentMethod: 'cash' | 'bank' | 'other';
  reference?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onTransactionAdded,
  editTransaction = null,
  onCancelEdit
}) => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<Transaction>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: 'expense',
    category: '',
    paymentMethod: 'bank',
    reference: ''
  });

  // Charger les catégories existantes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/associations/${associationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setCategories(response.data.data.categories || []);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories :', error);
      }
    };

    fetchCategories();
  }, [associationId, token]);

  // Charger les données si en mode édition
  useEffect(() => {
    if (editTransaction) {
      const formattedDate = editTransaction.date
        ? new Date(editTransaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        ...editTransaction,
        date: formattedDate
      });
    }
  }, [editTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Conversion spéciale pour le montant
    if (name === 'amount') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // URL et méthode en fonction du mode (ajout ou édition)
      const url = editTransaction
        ? `${API_URL}/transactions/association/${associationId}/${editTransaction._id}`
        : `${API_URL}/transactions/association/${associationId}`;

      const method = editTransaction ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Réinitialiser le formulaire si c'est un ajout
        if (!editTransaction) {
          setFormData({
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: 0,
            type: 'expense',
            category: '',
            paymentMethod: 'bank',
            reference: ''
          });
        }

        // Informer le parent que la transaction a été ajoutée/modifiée
        onTransactionAdded();

        // Si en mode édition, annuler le mode édition
        if (editTransaction && onCancelEdit) {
          onCancelEdit();
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la transaction :', error);
    }
  };

  // Gérer l'ajout d'une nouvelle catégorie
  const handleNewCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      // Mettre à jour l'association avec la nouvelle catégorie
      const updateAssociation = async () => {
        try {
          await axios.put(
            `${API_URL}/associations/${associationId}/categories`,
            { category },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );

          // Mettre à jour la liste des catégories
          setCategories([...categories, category]);
        } catch (error) {
          console.error('Erreur lors de l\'ajout de la catégorie :', error);
        }
      };

      updateAssociation();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">
        {editTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Type (Recette/Dépense) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="income">Recette</option>
              <option value="expense">Dépense</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (CHF)
            </label>
            <input
              type="number"
              name="amount"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              list="categories"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
              onBlur={(e) => handleNewCategory(e.target.value)}
            />
            <datalist id="categories">
              {categories.map((category, index) => (
                <option key={index} value={category} />
              ))}
            </datalist>
          </div>

          {/* Méthode de paiement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de paiement
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value="cash">Espèces</option>
              <option value="bank">Banque</option>
              <option value="other">Autre</option>
            </select>
          </div>

          {/* Référence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Référence (optionnel)
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="mt-6 flex justify-end">
          {editTransaction && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
          )}

          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {editTransaction ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
