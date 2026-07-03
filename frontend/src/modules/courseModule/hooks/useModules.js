import useModuleStore from '../store/moduleStore';

/**
 * useModules – Custom hook for the Module module.
 *
 * Acts as the single integration point between UI components and the
 * Zustand module store.
 */
const useModules = () => {
  const {
    modules,
    loading,
    error,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    clearModules,
  } = useModuleStore();

  return {
    // State
    modules,
    loading,
    error,
    // Actions
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    clearModules,
  };
};

export default useModules;
