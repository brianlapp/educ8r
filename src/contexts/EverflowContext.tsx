
import React, { createContext, useContext, useEffect, useState } from 'react';

interface EverflowContextType {
  isReady: boolean;
  trackClick: (params?: any) => void;
}

const EverflowContext = createContext<EverflowContextType | undefined>(undefined);

export const EverflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.eflow.team/scripts/sdk/everflow.js";
    script.async = true;
    
    script.onload = () => {
      const checkEF = () => {
        if (window.EF && typeof window.EF.click === 'function') {
          console.log('Everflow initialized successfully');
          setIsReady(true);
        } else {
          console.log('Waiting for Everflow to initialize...');
          setTimeout(checkEF, 100);
        }
      };
      checkEF();
    };

    document.body.appendChild(script);

    return () => {
      const loadedScript = document.querySelector('script[src="https://www.eflow.team/scripts/sdk/everflow.js"]');
      if (loadedScript && document.body.contains(loadedScript)) {
        document.body.removeChild(loadedScript);
      }
    };
  }, []);

  const trackClick = (params?: any) => {
    if (!isReady) {
      console.warn('Everflow SDK not ready');
      return;
    }
    try {
      console.log('Tracking click with params:', params);
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
