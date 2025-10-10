// src/contexts/profile-context.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';

interface ProfileContextType {
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ 
  children, 
  refreshProfile 
}: { 
  children: ReactNode;
  refreshProfile: () => Promise<void>;
}) {
  return (
    <ProfileContext.Provider value={{ refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
