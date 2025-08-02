import React, {createContext, ReactNode, useContext} from 'react';

interface LevelContextType {
    code: string;
    setCode: (code: string) => void;
}

// Create the context with a default value
const LevelContext = createContext<LevelContextType | undefined>(undefined);

// Custom hook to use the context
export function useLevelContext(): LevelContextType {
    const context = useContext(LevelContext);
    if (context === undefined) {
        throw new Error('useLevelContext must be used within a LevelProvider');
    }
    return context;
}

interface LevelProviderProps {
    children: ReactNode;
    code: string;
    setCode: (code: string) => void;
}

// Provider component
export function LevelProvider({children, code, setCode}: LevelProviderProps): React.ReactElement {
    return (
        <LevelContext.Provider value={{code, setCode}}>
            {children}
        </LevelContext.Provider>
    );
}