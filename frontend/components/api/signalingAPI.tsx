export async function signalingGetRoom(roomId: string) {
	const form = new FormData();
	form.append('roomId', roomId);
	const options = {
		method: 'POST',
		body: form,
	};
	return await fetch(
		'https://' + process.env.NEXT_PUBLIC_GATEWAY + '/signaling/createRoom',
		options,
	);
}

export function signalingWebsocket(roomId: string, user: string) {
	return new WebSocket(
		'wss://' +
			process.env.NEXT_PUBLIC_GATEWAY +
			'/signaling/ws?roomId=' +
			roomId +
			'&userId=' +
			user,
	);
}
