import useMaterialStore from '../store/materialStore';

/**
 * useMaterials – Custom hook for the Materials module.
 * Provides a clean interface between components and the Zustand store.
 */
const useMaterials = () => {
  const {
    materials,
    loading,
    error,
    uploading,
    uploadProgress,
    fetchMaterials,
    uploadMaterial,
    removeMaterial,
    clearError,
  } = useMaterialStore();

  return {
    // State
    materials,
    loading,
    error,
    uploading,
    uploadProgress,
    // Actions
    fetchMaterials,
    uploadMaterial,
    removeMaterial,
    clearError,
  };
};

export default useMaterials;
