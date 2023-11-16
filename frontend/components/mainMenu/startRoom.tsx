'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const { v4: uuidv4 } = require('uuid');

function StartRoom() {
	const router = useRouter();
	const [room, setRoom] = useState('');
	return (
		<div>
			<div className="flex flex-row">
				<button
					onClick={() => {
						router.push('/room/' + uuidv4());
					}}
					className="p-2 bg-blue-600 rounded-lg mr-2"
				>
					Create Room
				</button>
				<input
					className="rounded-lg w-[140px] text-black"
					placeholder="Join Room"
					value={room}
					onChange={(e) => setRoom(e.target.value)}
				/>
				<Link
					href={'/room/' + room}
					className="p-2 rounded-lg bg-opacity-10 hover:bg-slate-700"
				>
					Join
				</Link>
			</div>
		</div>
	);
}

export default StartRoom;
