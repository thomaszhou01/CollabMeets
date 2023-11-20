'use client';
import React, { useContext } from 'react';
import { Auth } from 'aws-amplify';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import Link from 'next/link';
import { AuthContext } from '../contexts/authContext';

function UserSignin() {
	let username = useContext(AuthContext);

	return (
		<Popover placement="bottom-end">
			<PopoverTrigger>
				<button className="rounded-lg p-2 bg-slate-900 hover:bg-slate-950">
					{username.username == '' ? 'Sign In' : username.username}
				</button>
			</PopoverTrigger>
			<PopoverContent className="bg-slate-900">
				<div className="flex flex-col p-3">
					<Link href="/profile">Profile</Link>
					<button onClick={() => Auth.signOut()}>Sign Out</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default UserSignin;
