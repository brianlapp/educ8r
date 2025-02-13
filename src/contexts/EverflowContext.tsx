
import React, { createContext, useContext, useEffect, useState } from 'react';

interface EverflowContextType {
  isReady: boolean;
  trackClick: (params?: any) => void;
}

const EverflowContext = createContext<EverflowContextType | undefined>(undefined);

export const EverflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create a promise that resolves when Everflow is ready
    const everflowPromise = new Promise<void>((resolve) => {
      // Function to check if EF is initialized
      const checkEF = () => {
        if (window.EF && typeof window.EF.click === 'function') {
          setIsReady(true);
          resolve();
        } else {
          setTimeout(checkEF, 100); // Check again in 100ms
        }
      };

      // Start checking
      checkEF();
    });

    // Add Everflow script
    const script = document.createElement('script');
    script.src = "https://www.eflow.team/scripts/sdk/everflow.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const script = document.querySelector('script[src="https://www.eflow.team/scripts/sdk/everflow.js"]');
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const trackClick = (params?: any) => {
    if (!isReady) {
      console.warn('Everflow SDK not ready');
      return;
    }
    try {
      window.EF.click(params);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  return (
    <EverflowContext.Provider value={{ isReady, trackClick }}>
      {children}
    </EverflowContext.Provider>
  );
};

export const useEverflow = () => {
  const context = useContext(EverflowContext);
  if (context === undefined) {
    throw new Error('useEverflow must be used within an EverflowProvider');
  }
  return context;
};
