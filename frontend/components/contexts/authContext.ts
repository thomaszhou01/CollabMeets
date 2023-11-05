'use client';
import { createContext } from 'react';

const AuthContext = createContext(null);
const AuthProvider = AuthContext.Provider;

export { AuthContext, AuthProvider };
