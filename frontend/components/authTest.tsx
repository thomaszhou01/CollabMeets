'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import awsConfig from '../app/aws-exports';
import { AuthContext } from './context';

function AuthTest() {
	const username = useContext(AuthContext);

	useEffect(() => {
		awsConfig.oauth.redirectSignIn = `${window.location.origin}/`;
		awsConfig.oauth.redirectSignOut = `${window.location.origin}/`;
		Amplify.configure(awsConfig);
	}, []);
	return (
		<div className="App">
			<button onClick={() => Auth.federatedSignIn()}>Open Hosted UI</button>
			<button
				onClick={() =>
					Auth.federatedSignIn({
						provider: CognitoHostedUIIdentityProvider.Google,
					})
				}
			>
				Open Google
			</button>
			<button onClick={() => Auth.signOut()}>Sign Out</button>
			<p>{JSON.stringify(username)}</p>
		</div>
	);
}

export default AuthTest;
