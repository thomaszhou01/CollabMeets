'use client';
import { chatGetUserMessages } from '@/components/api/chatAPI';
import { AuthContext } from '@/components/contexts/authContext';
import ChatHistoryDisplay from '@/components/profile/chatHistoryDisplay';
import ChatSelect from '@/components/profile/chatSelect';
import { ChatHistory } from '@/components/types/types';
import { useContext, useEffect, useState } from 'react';
import { Providers } from '../providers';

export default function Page() {
	let username = useContext(AuthContext);
	const [messages, setMessages] = useState<Array<ChatHistory>>([]);
	const [chatId, setChatId] = useState<number>(0);
	const [openChat, setOpenChat] = useState<boolean>(false);

	useEffect(() => {
		console.log(username.user);
		chatGetUserMessages(username.user).then(async (response) => {
			const data: ChatHistory[] = await response.json();
			setMessages(data);
			console.log(data);
		});
	}, [username]);

	function toggleChat(index: number) {
		setOpenChat(true);
		setChatId(index);
		console.log(openChat);
	}

	return (
		<Providers>
			<div className="flex flex-row w-full h-[100vh]">
				<ChatSelect
					messages={messages}
					openChat={openChat}
					toggleChat={toggleChat}
				/>
				<ChatHistoryDisplay
					messages={messages[chatId]}
					openChat={openChat}
					toggleChat={toggleChat}
				/>
			</div>
		</Providers>
	);
}
