'use client';
import React, { useEffect, useState, createContext } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { AuthProvider } from './context';

function AuthListener({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
			switch (event) {
				case 'signIn':
					console.log('signed in', data);
					setUser(data);
					break;
				case 'signOut':
					console.log('signed out');
					setUser(null);
					break;
				case 'customOAuthState':
					console.log('custom oath state: ');
			}
		});

		getUser();

		return unsubscribe;
	}, []);

	const getUser = async (): Promise<void> => {
		try {
			const currentUser = await Auth.currentAuthenticatedUser();
			setUser(currentUser);
		} catch (error) {
			console.error(error);
			console.log('Not signed in');
		}
	};
	return <AuthProvider value={user}>{children}</AuthProvider>;
}

export default AuthListener;
