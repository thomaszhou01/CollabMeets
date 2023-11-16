'use client';
import React, { useEffect, useState, createContext } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { AuthProvider } from '../contexts/authContext';
import awsConfig from '../../app/aws-exports';
import { chatIsUser, chatRegisterUser } from '../api/chatAPI';

function AuthListener({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState('');

	useEffect(() => {
		awsConfig.oauth.redirectSignIn = `${window.location.origin}/`;
		awsConfig.oauth.redirectSignOut = `${window.location.origin}/`;
		Amplify.configure(awsConfig);

		const unsubscribe = Hub.listen(
			'auth',
			async ({ payload: { event, data } }) => {
				switch (event) {
					case 'signIn':
						const currentUser = await Auth.currentAuthenticatedUser();
						setUser(currentUser.attributes.email);
						chatIsUser(currentUser.username).then((response) => {
							if (response.status != 208) {
								chatRegisterUser(
									currentUser.username,
									currentUser.attributes.email,
								);
							}
						});
						break;
					case 'signOut':
						setUser('');
						break;
				}
			},
		);

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
