import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaChevronLeft, FaSave } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface AssociationFormData {
  name: string;
  description: string;
  address: string;
  email: string;
  phone: string;
  fiscalYearStart: string;
}

const EditAssociation: React.FC = () => {
  const { associationId } = useParams<{ associationId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  // État du formulaire
  const [formData, setFormData] = useState<AssociationFormData>({
    name: '',
    description: '',
    address: '',
    email: '',
    phone: '',
    fiscalYearStart: ''
  });

  // États pour la validation et le chargement
  const [errors, setErrors] = useState<Partial<AssociationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les données de l'association
  useEffect(() => {
    const fetchAssociation = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/associations/${associationId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const association = response.data.data;

          // Formater la date pour le champ date
          const fiscalYearStart = association.fiscalYearStart
            ? new Date(association.fiscalYearStart).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          setFormData({
            name: association.name || '',
            description: association.description || '',
            address: association.address || '',
            email: association.email || '',
            phone: association.phone || '',
            fiscalYearStart
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'association :', error);
        setSubmitError('Impossible de récupérer les détails de l\'association.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssociation();
  }, [associationId, token]);

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
      const response = await axios.put(
        `${API_URL}/associations/${associationId}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Rediriger vers la page de l'association
        navigate(`/associations/${associationId}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'association :', error);
      setSubmitError(
        error.response?.data?.message ||
        'Une erreur est survenue lors de la mise à jour de l\'association.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Chargement des détails de l'association...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/associations/${associationId}`)}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <FaChevronLeft className="mr-2" /> Retour à l'association
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Modifier l'association</h1>
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
                onClick={() => navigate(`/associations/${associationId}`)}
                className="mr-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
              >
                <FaSave className="mr-2" />
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAssociation;
