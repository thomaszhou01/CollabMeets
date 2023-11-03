'use client';
import { useState, useRef, useEffect, useContext, useMemo } from 'react';
import {
	webcamInit,
	callButton,
	answerButton,
	iceServers,
	callButtonBack,
} from '../components/webrtc/rtc';
import '../components/webrtc/rtcMultiConnect';
import { AuthContext } from './context';
const { v4: uuidv4 } = require('uuid');

function WebRTCTest({ roomId }: { roomId: string }) {
	const username = useContext(AuthContext);
	const videoRef = useRef(null);
	const remoteRef = useRef(null);
	const websocket = useRef<WebSocket | null>(null);
	const [localStream, setLocalStream] = useState<any>(null);
	const [userId, setUserId] = useState('');
	const [callInput, setCallInput] = useState('');

	useEffect(() => {
		const pc = new RTCPeerConnection(iceServers);
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
				const user = uuidv4();
				setUserId(user);
				websocket.current = new WebSocket(
					'ws://localhost:8080/ws?roomId=' + roomId + '&userId=' + user,
				);

				websocket.current.addEventListener('error', (event: any) => {
					console.log('WebSocket error: ', event);
				});

				websocket.current.onopen = function () {
					console.log('connected');
					if (response.status == 200) {
						websocket.current!.send(user);
					} else if (response.status == 208) {
						websocket.current!.send(user);
					}
				};

				websocket.current.onmessage = function (message: MessageEvent) {
					console.log(message.data);
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

	function hostStart() {
		callButton(localStream);
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
			<p>{userId}</p>

			<button
				onClick={() => callButtonBack(localStream, websocket.current, roomId)}
			>
				Test
			</button>
			<button onClick={() => webcamInit(videoRef, remoteRef, localStream)}>
				Webcam Init
			</button>

			<button id="callButton" onClick={hostStart}>
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
