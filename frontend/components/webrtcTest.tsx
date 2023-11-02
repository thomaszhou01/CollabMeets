'use client';
import { useState, useRef, useEffect, useContext, useMemo } from 'react';
import { webcamInit, callButton, answerButton } from '../components/webrtc/rtc';
import { AuthContext } from './context';

function WebRTCTest({ roomId }: { roomId: string }) {
	const username = useContext(AuthContext);
	const videoRef = useRef(null);
	const remoteRef = useRef(null);
	const websocket = useRef<WebSocket | null>(null);
	const [localStream, setLocalStream] = useState<any>(null);
	const [callInput, setCallInput] = useState('');

	useEffect(() => {
		const servers = {
			iceServers: [
				{
					urls: [
						'stun:stun1.l.google.com:19302',
						'stun:stun2.l.google.com:19302',
					],
				},
			],
			iceCandidatePoolSize: 10,
		};

		const pc = new RTCPeerConnection(servers);
		setLocalStream(pc);

		const form = new FormData();
		form.append('roomId', roomId);
		const options = {
			method: 'POST',
			body: form,
		};
		fetch('http://localhost:8080/v1/createRoom', options).then((response) => {
			console.log(response);
			if (websocket.current == null) {
				websocket.current = new WebSocket(
					'ws://localhost:8080/ws?roomId=' + roomId,
				);

				websocket.current.addEventListener('error', (event: any) => {
					console.log('WebSocket error: ', event);
				});
				websocket.current.onopen = function () {
					console.log('connected');
					if (response.status == 200) {
						websocket.current!.send('Hello, Server!');
					} else if (response.status == 208) {
						websocket.current!.send('Hello, Server!1');
					}
				};
				websocket.current.onmessage = function (message: any) {
					console.log(message);
					// websocket.current.send('Hello, Server!');
				};
				console.log('websocketing');
			}
		});

		return () => {
			console.log('closing websocket');
			if (websocket.current) websocket.current.close();
		};
	}, []);

	function webcamButtonClicked() {
		webcamInit(videoRef, remoteRef, localStream);
	}

	return (
		<main>
			<h2>1. Start your Webcam</h2>
			<div className="videos">
				<span>
					<h3>Local Stream</h3>
					<video
						id="webcamVideo"
						ref={videoRef}
						autoPlay
						playsInline
						controls
					></video>
				</span>
				<span>
					<h3>Remote Stream</h3>
					<video
						id="remoteVideo"
						ref={remoteRef}
						autoPlay
						playsInline
						controls
					></video>
				</span>
			</div>

			<button id="webcamButton" onClick={webcamButtonClicked}>
				Start webcam
			</button>
			<h2>2. Create a new Call</h2>
			<button
				id="callButton"
				onClick={() => callButton(videoRef, remoteRef, localStream)}
			>
				Create Call (offer)
			</button>

			<h2>3. Join a Call</h2>
			<p>Answer the call from a different browser window or device</p>

			<input
				id="callInput"
				onChange={(e) => {
					setCallInput(e.target.value);
				}}
			/>
			<button
				id="answerButton"
				onClick={() =>
					answerButton(videoRef, remoteRef, callInput, localStream)
				}
			>
				Answer
			</button>

			<h2>4. Hangup</h2>

			<button id="hangupButton">Hangup</button>
			<p>{JSON.stringify(username)}</p>
		</main>
	);
}

export default WebRTCTest;
