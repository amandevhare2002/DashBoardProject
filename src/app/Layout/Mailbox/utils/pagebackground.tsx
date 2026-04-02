import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface BackgroundContextType {
  pageBackgroundColor: string | undefined;
  pageBackgroundImage: string | undefined;
  setBackground: (color: string | undefined, image: string | undefined) => void;
}

// Creating the context with a default value
const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

// provider component
export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [pageBackgroundColor, setPageBackgroundColor] = useState<string | undefined>(undefined);
  const [pageBackgroundImage, setPageBackgroundImage] = useState<string | undefined>(undefined);

  const setBackground = (color: string | undefined, image: string | undefined) => {
    setPageBackgroundColor(color);
    setPageBackgroundImage(image);
  };

  return (
    <BackgroundContext.Provider value={{ pageBackgroundColor, pageBackgroundImage, setBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};

// hook to use the context
export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};