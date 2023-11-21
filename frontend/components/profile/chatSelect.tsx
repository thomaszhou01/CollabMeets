import { ChatHistory } from '../types/types';

function ChatSelect({
	messages,
	openChat,
	toggleChat,
}: {
	messages: Array<ChatHistory>;
	openChat: boolean;
	toggleChat: any;
}) {
	return (
		<>
			<div className="sm:flex flex-col hidden w-[300px] p-2 bg-slate-900 overflow-hidden hover:overflow-auto z-10">
				<p className="px-4 font-bold">Chat History:</p>
				{messages.map((room, index) => {
					return (
						<div
							key={room.RoomId}
							className="hover:bg-slate-800 p-2 rounded-lg"
						>
							<button
								onClick={() => {
									toggleChat(index);
								}}
								className="text-left flex"
							>
								<p className="mr-2">#</p> <p>{room.RoomId}</p>
							</button>
						</div>
					);
				})}
			</div>
			{!openChat && (
				<div className="absolute sm:hidden w-full p-4 h-[100vh] bg-slate-900 overflow-hidden hover:overflow-auto z-10">
					<p className="px-4 font-bold">Chat History:</p>
					{messages.map((room, index) => {
						return (
							<div
								key={room.RoomId}
								className="hover:bg-slate-800 p-2 rounded-lg"
							>
								<button
									onClick={() => {
										toggleChat(index);
									}}
									className="text-left flex"
								>
									<p className="mr-2">#</p> <p>{room.RoomId}</p>
								</button>
							</div>
						);
					})}
				</div>
			)}
		</>
	);
}

export default ChatSelect;
