'use client';
import React, { useEffect, useState } from 'react';
import { Amplify, Auth, Hub } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import awsConfig from '../app/aws-exports';

Amplify.configure(awsConfig);

function AuthTest() {
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
		</div>
	);
}

export default AuthTest;
