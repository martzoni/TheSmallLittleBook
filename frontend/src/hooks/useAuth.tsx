// frontend/src/contexts/AuthContext.tsx
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
