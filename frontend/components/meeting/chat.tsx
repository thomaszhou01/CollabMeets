import { useEffect, useRef, useState } from 'react';
import { Send } from 'react-bootstrap-icons';
import { ChatMessage } from '../types/types';
import { chatWebsocket } from '../api/chatAPI';

function Chat({
	roomId,
	username,
	openChat,
}: {
	roomId: string;
	username: string;
	openChat: boolean;
}) {
	const [message, setMessage] = useState('');
	const [chat, setChat] = useState<Array<ChatMessage>>([]);
	const chatSocket = useRef<WebSocket>();

	useEffect(() => {
		if (!chatSocket.current) {
			chatSocket.current = chatWebsocket(roomId, username);

			chatSocket.current.onmessage = function (message: MessageEvent) {
				const parsedMessage: ChatMessage = JSON.parse(message.data);
				setChat((chat) => [parsedMessage, ...chat]);
			};
		}
	}, []);

	function submitChat() {
		if (chatSocket.current && message != '') {
			const wsMessage: ChatMessage = {
				UserId: username,
				Username: username,
				Message: message,
			};
			chatSocket.current.send(JSON.stringify(wsMessage));
			setMessage('');
		}
	}

	return (
		<div>
			{openChat && (
				<div className="flex flex-col grow shrink basis-1/5 h-full w-[300px] bg-white rounded-lg">
					<div className="flex flex-col-reverse overflow-auto grow text-black">
						{chat.map((message, index) => {
							return (
								<div key={index} className="mt-2">
									<p className="font-bold">
										{message['Username'] == '' ? 'Anon' : message['Username']}
									</p>
									<p className="w-full break-words">{message['Message']}</p>
								</div>
							);
						})}
					</div>
					<div className="m-2">
						<form
							className="flex rounded-lg w-full text-black bg-white mt-2"
							onSubmit={(e) => {
								e.preventDefault();
								submitChat();
							}}
						>
							<input
								className="rounded-l-lg w-full text-black"
								placeholder="Message ..."
								value={message}
								onChange={(e) => setMessage(e.target.value)}
							/>
							<button className="p-2">
								<Send color="grey" size={20} />
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

export default Chat;
