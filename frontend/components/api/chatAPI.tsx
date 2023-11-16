export async function chatRegisterUser(user: string, username: string) {
	const options = {
		method: 'POST',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/registerUser?user=' +
			user +
			'&username=' +
			username,
		options,
	);
}

export async function chatIsUser(user: string) {
	const options = {
		method: 'GET',
	};
	return await fetch(
		'https://' + process.env.NEXT_PUBLIC_GATEWAY + '/chat/isUser?user=' + user,
		options,
	);
}

export async function chatQueryRoom(roomId: string) {
	const options = {
		method: 'GET',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/queryRoom?roomId=' +
			roomId,
		options,
	);
}

export async function chatEnterChatRoom(user: string, roomId: string) {
	const options = {
		method: 'POST',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/enterChatRoom?user=' +
			user +
			'&roomId=' +
			roomId,
		options,
	);
}

export function chatWebsocket(roomId: string, username: string) {
	return new WebSocket(
		'wss://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/ws?roomId=' +
			roomId +
			'&userId=' +
			username,
	);
}