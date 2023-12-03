'use client';
import React, { useEffect, useState, createContext } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { AuthProvider } from '../contexts/authContext';
import awsConfig from '../../app/aws-exports';
import { userIsUser, userRegisterUser } from '../api/userAPI';
import { Connection } from '../types/types';

function AuthListener({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<Connection>({ user: '', username: '' });

	useEffect(() => {
		awsConfig.oauth.redirectSignIn = `${window.location.origin}/`;
		awsConfig.oauth.redirectSignOut = `${window.location.origin}/`;
		Amplify.configure(awsConfig);

		const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
			switch (event) {
				case 'signIn':
					break;
				case 'signOut':
					setUser({ user: '', username: '' });
					break;
			}
		});

		getUser();

		return unsubscribe;
	}, []);

	const getUser = async (): Promise<void> => {
		try {
			const currentUser = await Auth.currentAuthenticatedUser();
			userIsUser(currentUser.username).then((response) => {
				if (response.status != 208) {
					userRegisterUser(currentUser.username, currentUser.attributes.email);
				}
			});
			setUser({
				user: currentUser.username,
				username: currentUser.attributes.email,
			});
		} catch (error) {}
	};
	return <AuthProvider value={user}>{children}</AuthProvider>;
}

export default AuthListener;
