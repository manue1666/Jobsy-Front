import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SearchRangeContextProps {
  searchRange: number;
  setSearchRange: (value: number) => void;
}

const SearchRangeContext = createContext<SearchRangeContextProps | undefined>(undefined);

export const SearchRangeProvider = ({ children }: { children: ReactNode }) => {
  const [searchRange, setSearchRange] = useState(10); // valor inicial 10 km
  return (
    <SearchRangeContext.Provider value={{ searchRange, setSearchRange }}>
      {children}
    </SearchRangeContext.Provider>
  );
};

export const useSearchRange = () => {
  const context = useContext(SearchRangeContext);
  if (!context) throw new Error('useSearchRange debe usarse dentro de SearchRangeProvider');
  return context;
};
