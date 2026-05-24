import { useContext } from 'react';
import { AcademicContext } from '../context/AcademicContext.jsx';

export function useAcademicData() {
  const context = useContext(AcademicContext);

  if (!context) {
    throw new Error('useAcademicData must be used within AcademicProvider');
  }

  return context;
}
