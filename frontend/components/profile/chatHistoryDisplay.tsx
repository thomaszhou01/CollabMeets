import { ChatHistory } from '../types/types';

function ChatHistoryDisplay({
	messages,
	openChat,
	toggleChat,
}: {
	messages: ChatHistory;
	openChat: boolean;
	toggleChat: any;
}) {
	return (
		<div className="flex flex-col grow h-[100vh] p-4 overflow-auto">
			<button className="flex" onClick={() => toggleChat(true)}>
				View Chats
			</button>
			{messages &&
				messages.Messages.map((message, index) => {
					return (
						<div key={messages.RoomId + index} className="mb-2">
							<p className="font-bold">{message.From}</p>
							<p>{message.Message}</p>
						</div>
					);
				})}
		</div>
	);
}

export default ChatHistoryDisplay;
