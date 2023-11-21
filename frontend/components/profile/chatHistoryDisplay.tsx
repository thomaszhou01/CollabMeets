import { ChatHistory } from '../types/types';

function ChatHistoryDisplay({
	messages,
	toggleChat,
}: {
	messages: ChatHistory;
	toggleChat: any;
}) {
	return (
		<div className="flex flex-col grow p-4 mt-4 sm:mt-0 overflow-hidden hover:overflow-auto">
			<div className="fixed sm:hidden top-0 left-0 w-full bg-slate-900">
				<button onClick={() => toggleChat(true)}>View Chats</button>
			</div>
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
