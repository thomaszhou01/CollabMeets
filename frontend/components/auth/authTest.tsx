'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { AuthContext } from '../contexts/authContext';

function AuthTest() {
	return (
		<div className="absolute right-0 top-0 m-2">
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
