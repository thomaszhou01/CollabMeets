import WebRTCTest from '@/components/webrtcTest';
import React from 'react';
function Page({ params }: { params: { roomId: string } }) {
	return (
		<div>
			<p>My Post: {params.roomId}</p>
			<WebRTCTest roomId={params.roomId} />
		</div>
	);
}

export default Page;
