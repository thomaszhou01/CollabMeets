'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { Popover } from '@mui/material';

import { AuthContext } from '../contexts/authContext';
function UserSignin() {
	let username = useContext(AuthContext);

	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
		null,
	);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	return (
		<div className="absolute right-0 top-0 m-2">
			<button
				className="rounded-lg p-2 bg-slate-900 hover:bg-slate-800"
				onClick={handleClick}
				aria-describedby={id}
			>
				{username == '' ? 'Sign In' : username}
			</button>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
			>
				<div className="flex flex-col bg-slate-900 text-white p-2">
					<button onClick={() => Auth.federatedSignIn()}>Sign In</button>
					{/* <button
						onClick={() =>
							Auth.federatedSignIn({
								provider: CognitoHostedUIIdentityProvider.Google,
							})
						}
					>
						Open Google
					</button> */}
					<button onClick={() => Auth.signOut()}>Sign Out</button>
				</div>
			</Popover>
		</div>
	);
}

export default UserSignin;
