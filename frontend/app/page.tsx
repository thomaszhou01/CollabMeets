import WebRTCTest from '@/components/webrtcTest';
import AuthTest from '@/components/authTest';
import AuthListener from '@/components/authListener';

export default function Home() {
	return (
		<div>
			<AuthListener>
				<p>This is part of serverside</p>
				<WebRTCTest />
				<AuthTest />
			</AuthListener>
		</div>
	);
}
