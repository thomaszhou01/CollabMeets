import {
	WebsocketMessage,
	IceMessage,
	Stream,
	StreamMedia,
	PCOffer,
} from '../types/types';

export const iceServers = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
		},
	],
	iceCandidatePoolSize: 10,
};

export async function startLocal(curMediaStream: HTMLVideoElement) {
	let localStream: MediaStream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: true,
	});
	localStream.getAudioTracks()[0].enabled =
		!localStream.getAudioTracks()[0].enabled;

	localStream.getVideoTracks()[0].enabled =
		!localStream.getVideoTracks()[0].enabled;

	// if (testing) {
	// 	localStream = await navigator.mediaDevices.getUserMedia({
	// 		video: true,
	// 		audio: true,
	// 	});
	// 	// localStream.getAudioTracks()[0].enabled =
	// 	// 	!localStream.getAudioTracks()[0].enabled;

	// 	// localStream.getVideoTracks()[0].enabled =
	// 	// 	!localStream.getVideoTracks()[0].enabled;
	// } else {
	// 	localStream = await navigator.mediaDevices.getDisplayMedia({
	// 		video: true,
	// 		audio: true,
	// 	});
	// }

	curMediaStream.srcObject = localStream;
	curMediaStream.play();

	// to stop stream
	// localStream.getVideoTracks()[0].onended = function () {
	// 	console.log('ended');
	// };

	return localStream;
}

export async function hostAddPlayer(
	userId: string,
	username: string,
	sendToId: string,
	localStream: StreamMedia,
	remoteStream: StreamMedia,
	peerConnection: RTCPeerConnection,
	websocket: WebSocket,
) {
	const remoteMedia: MediaStream = new MediaStream();

	if (localStream.mediaStream) {
		localStream.mediaStream.getTracks().forEach((track: any) => {
			localStream.mediaStream &&
				peerConnection.addTrack(track, localStream.mediaStream);
		});
	}

	peerConnection.ontrack = (event: any) => {
		event.streams[0].getTracks().forEach((track: any) => {
			remoteMedia.addTrack(track);
		});
	};

	if (remoteStream.videoElement) {
		remoteStream.videoElement.srcObject = remoteMedia;
		remoteStream.videoElement.play();
		remoteStream.mediaStream = remoteMedia;
	}

	peerConnection.onicecandidate = (event: any) => {
		if (event.candidate) {
			const candidate = event.candidate.toJSON();
			const iceMessage: WebsocketMessage = {
				User: userId,
				Username: username,
				ActionCode: 'ice',
				Target: sendToId,
				IceCandidates: {
					Candidate: candidate.candidate,
					SdpMid: candidate.sdpMid,
					SdpMLineIndex: candidate.sdpMLineIndex,
					UsernameFragment: candidate.usernameFragment,
				},
			};
			websocket.send(JSON.stringify(iceMessage));
		}
	};

	const offerDescription = await peerConnection.createOffer();
	const offer: PCOffer = {
		Sdp: offerDescription.sdp ? offerDescription.sdp : '',
		Type: offerDescription.type,
	};

	const offerMessage: WebsocketMessage = {
		User: userId,
		Username: username,
		ActionCode: 'pcOffer',
		Target: sendToId,
		PCOffer: offer,
	};
	websocket.send(JSON.stringify(offerMessage));

	await peerConnection.setLocalDescription(offerDescription);
}

export async function recieverAddPlayerAndRespond(
	userId: string,
	username: string,
	sendToId: string,
	localStream: StreamMedia,
	remoteStream: StreamMedia,
	peerConnection: RTCPeerConnection,
	websocket: WebSocket,
	receivedOffer: PCOffer,
) {
	const remoteMedia: MediaStream = new MediaStream();

	if (localStream.mediaStream) {
		localStream.mediaStream.getTracks().forEach((track: any) => {
			localStream.mediaStream &&
				peerConnection.addTrack(track, localStream.mediaStream);
		});
	}

	peerConnection.ontrack = (event: any) => {
		event.streams[0].getTracks().forEach((track: any) => {
			remoteMedia.addTrack(track);
		});
	};

	if (remoteStream.videoElement) {
		remoteStream.videoElement.srcObject = remoteMedia;
		remoteStream.videoElement.play();
		remoteStream.mediaStream = remoteMedia;
	}

	peerConnection.onicecandidate = (event: any) => {
		if (event.candidate) {
			const candidate = event.candidate.toJSON();
			const iceMessage: WebsocketMessage = {
				User: userId,
				Username: username,
				ActionCode: 'ice',
				Target: sendToId,
				IceCandidates: {
					Candidate: candidate.candidate,
					SdpMid: candidate.sdpMid,
					SdpMLineIndex: candidate.sdpMLineIndex,
					UsernameFragment: candidate.usernameFragment,
				},
			};
			websocket.send(JSON.stringify(iceMessage));
		}
	};

	await peerConnection.setRemoteDescription(
		new RTCSessionDescription({
			type: receivedOffer.Type as RTCSdpType,
			sdp: receivedOffer.Sdp,
		}),
	);

	const answerDescription = await peerConnection.createAnswer();

	const answer: PCOffer = {
		Sdp: answerDescription.sdp ? answerDescription.sdp : '',
		Type: answerDescription.type,
	};

	const answerMessage: WebsocketMessage = {
		User: userId,
		Username: username,
		ActionCode: 'pcAnswer',
		Target: sendToId,
		PCOffer: answer,
	};
	websocket.send(JSON.stringify(answerMessage));

	await peerConnection.setLocalDescription(answerDescription);
}

export async function hostReceivePlayer(
	peerConnection: RTCPeerConnection,
	receivedOffer: PCOffer,
) {
	const answerDescription = new RTCSessionDescription({
		type: receivedOffer.Type as RTCSdpType,
		sdp: receivedOffer.Sdp,
	});
	await peerConnection.setRemoteDescription(answerDescription);
}

export async function addIceCandidate(
	candidate: IceMessage,
	peerConnection: RTCPeerConnection,
) {
	const iceCandidateInit: RTCIceCandidateInit = {
		candidate: candidate.Candidate,
		sdpMLineIndex: candidate.SdpMLineIndex,
		sdpMid: candidate.SdpMid,
		usernameFragment: candidate.UsernameFragment,
	};
	const iceCandidate = new RTCIceCandidate(iceCandidateInit);
	let numWait = 0;
	while (peerConnection.remoteDescription === null && numWait < 20) {
		await new Promise((r) => setTimeout(r, 100));
		numWait += 1;
	}
	peerConnection.addIceCandidate(iceCandidate);
}
