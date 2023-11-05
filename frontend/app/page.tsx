import WebRTCTest from '@/components/webrtcTest';
import AuthTest from '@/components/auth/authTest';
import Link from 'next/link';
const { v4: uuidv4 } = require('uuid');

export default function Home() {
	return (
		<div>
			<p>This is part of serverside</p>
			<Link href={'/room/' + uuidv4()}>Go to room with id: room1</Link>
			<AuthTest />
		</div>
	);
}
