import { useState } from 'react';
import { Send } from 'react-bootstrap-icons';

function Chat() {
	const [chat, setChat] = useState('');

	function submitChat() {
		console.log(chat, 'SUBMITTED');
		setChat('');
	}

	return (
		<div className="flex flex-col grow shrink basis-1/5 h-full min-w-[200px] p-4 bg-slate-400 rounded-lg">
			<div className="flex flex-col-reverse overflow-auto grow">
				<p>Top</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Bot</p>
				<p>Top</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Bot</p>
				<p>Top</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Chat</p>
				<p>Bot</p>
			</div>
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
					value={chat}
					onChange={(e) => setChat(e.target.value)}
				/>
				<button className="p-2">
					<Send color="grey" size={20} />
				</button>
			</form>
		</div>
	);
}

export default Chat;
