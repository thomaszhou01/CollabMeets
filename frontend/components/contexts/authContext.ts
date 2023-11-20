'use client';
import { createContext } from 'react';
import { Connection } from '../types/types';

const AuthContext = createContext<Connection>({ user: '', username: '' });
const AuthProvider = AuthContext.Provider;

export { AuthContext, AuthProvider };
