import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-lg">
        <div className="p-8">
          <div className="text-center">
            <FaExclamationTriangle className="mx-auto text-yellow-500 text-6xl mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Page non trouvée</h1>
            <p className="text-gray-600 mb-8">
              La page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaHome className="mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
