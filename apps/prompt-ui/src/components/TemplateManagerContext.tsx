import React, { createContext, useContext, ReactNode } from 'react';

interface TemplateManagerContextType {
  openTemplateManager: () => void;
  openTemplateManagerForCreate: () => void;
}

const TemplateManagerContext = createContext<TemplateManagerContextType | undefined>(undefined);

export const useTemplateManager = () => {
  const context = useContext(TemplateManagerContext);
  if (context === undefined) {
    throw new Error('useTemplateManager must be used within a TemplateManagerProvider');
  }
  return context;
};

interface TemplateManagerProviderProps {
  children: ReactNode;
  openTemplateManager: () => void;
  openTemplateManagerForCreate: () => void;
}

export const TemplateManagerProvider: React.FC<TemplateManagerProviderProps> = ({
  children,
  openTemplateManager,
  openTemplateManagerForCreate
}) => {
  return (
    <TemplateManagerContext.Provider value={{
      openTemplateManager,
      openTemplateManagerForCreate
    }}>
      {children}
    </TemplateManagerContext.Provider>
  );
};
