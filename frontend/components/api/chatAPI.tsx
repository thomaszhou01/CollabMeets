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

export async function chatCreateRoom(roomId: string) {
	const options = {
		method: 'POST',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/createChatRoom?roomId=' +
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

export async function chatGetUserMessages(user: string) {
	const options = {
		method: 'get',
	};
	return await fetch(
		'https://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/chat/getUserMessages?user=' +
			user,
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
