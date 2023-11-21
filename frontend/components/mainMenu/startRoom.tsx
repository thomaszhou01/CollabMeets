'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { chatCreateRoom } from '../api/chatAPI';
import { Alert, Snackbar } from '@mui/material';
const { v4: uuidv4 } = require('uuid');

function StartRoom() {
	const router = useRouter();
	const [room, setRoom] = useState('');
	const [open, setOpen] = useState(false);

	const handleClick = () => {
		setOpen(true);
	};

	const handleClose = (
		event: React.SyntheticEvent | Event,
		reason?: string,
	) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

	function startRoom(roomId: string) {
		if (roomId === '') {
			return;
		}
		chatCreateRoom(roomId)
			.then((response) => {
				if (response.status === 200) {
					router.push('/room/' + roomId);
				} else {
					handleClick();
				}
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<div>
			<div className="flex flex-row">
				{/* <button onClick={startRoom} className="p-2 bg-blue-600 rounded-lg mr-2">
					Create Room
				</button> */}
				<Popover placement="bottom">
					<PopoverTrigger>
						<button className="p-2 bg-blue-800 hover:bg-blue-700 rounded-lg">
							Create Room
						</button>
					</PopoverTrigger>
					<PopoverContent className="bg-slate-900">
						<div className="flex flex-col">
							<button
								onClick={() => startRoom(uuidv4())}
								className="p-2  hover:bg-slate-700 rounded-lg"
							>
								Create Instant Meeting
							</button>
							<button
								onClick={() => startRoom(room)}
								className="p-2  hover:bg-slate-700 rounded-lg"
							>
								Create Meeting with Room ID
							</button>
						</div>
					</PopoverContent>
				</Popover>
				<input
					className="rounded-lg w-[140px] text-black mx-2"
					placeholder="Room ID"
					value={room}
					onChange={(e) => setRoom(e.target.value)}
				/>
				<Link
					href={'/room/' + room}
					className="p-2 rounded-lg bg-opacity-10 hover:bg-slate-700 flex items-center"
				>
					Join
				</Link>
			</div>
			<Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
				<Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
					Unable to create room, Room ID already in use
				</Alert>
			</Snackbar>
		</div>
	);
}

export default StartRoom;
