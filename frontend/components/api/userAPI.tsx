export async function userRegisterUser(user: string, username: string) {
	const options = {
		method: 'POST',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/users/registerUser?user=' +
			user +
			'&username=' +
			username,
		options,
	);
}

export async function userIsUser(user: string) {
	const options = {
		method: 'GET',
	};
	return await fetch(
		'https://' + process.env.NEXT_PUBLIC_GATEWAY + '/users/isUser?user=' + user,
		options,
	);
}
