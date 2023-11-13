'use client';
import React, { useEffect, useState, createContext } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { AuthProvider } from '../contexts/authContext';
import awsConfig from '../../app/aws-exports';

function AuthListener({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState('');

	useEffect(() => {
		awsConfig.oauth.redirectSignIn = `${window.location.origin}/`;
		awsConfig.oauth.redirectSignOut = `${window.location.origin}/`;
		Amplify.configure(awsConfig);

		const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
			switch (event) {
				case 'signIn':
					setUser(data.attributes.email);
					break;
				case 'signOut':
					setUser('');
					break;
				case 'customOAuthState':
					break;
			}
		});

		getUser();

		return unsubscribe;
	}, []);

	const getUser = async (): Promise<void> => {
		try {
			const currentUser = await Auth.currentAuthenticatedUser();
			setUser(currentUser.attributes.email);
		} catch (error) {}
	};
	return <AuthProvider value={user}>{children}</AuthProvider>;
}

export default AuthListener;
