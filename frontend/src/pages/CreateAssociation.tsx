import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaChevronLeft } from 'react-icons/fa';

// Récupérer l'URL de l'API à partir des variables d'environnement
const API_URL = import.meta.env.VITE_API_URL;

interface AssociationFormData {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  fiscalYearStart: string;
}

const CreateAssociation: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // État du formulaire
  const [formData, setFormData] = useState<AssociationFormData>({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    fiscalYearStart: new Date().toISOString().split('T')[0]
  });

  // États pour la validation et le chargement
  const [errors, setErrors] = useState<Partial<AssociationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Réinitialiser l'erreur pour ce champ
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors: Partial<AssociationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'association est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await axios.post(
        `${API_URL}/associations`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Rediriger vers la page de l'association créée
        navigate(`/associations/${response.data.data._id}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'association :', error);
      setSubmitError(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la création de l\'association.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/associations')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaChevronLeft className="mr-2" /> Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Créer une nouvelle association</h1>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Message d'erreur global */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                {submitError}
              </div>
            )}

            <div className="space-y-6">
              {/* Nom de l'association */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'association *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md`}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Début de l'année fiscale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Début de l'année fiscale
                </label>
                <input
                  type="date"
                  name="fiscalYearStart"
                  value={formData.fiscalYearStart}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            {/* Boutons */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/associations')}
                className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Création en cours...' : 'Créer l\'association'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssociation;
