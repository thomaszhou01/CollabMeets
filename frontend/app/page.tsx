'use client';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { webcamInit, callButton, answerButton } from './components/webrtc/rtc';

export default function Home() {
	const videoRef = useRef(null);
	const remoteRef = useRef(null);
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
	}, []);

	function webcamButtonClicked() {
		webcamInit(videoRef, remoteRef, localStream);
	}

	return (
		<main className="">
			<h2>1. Start your Webcam</h2>
			<div className="videos">
				<span>
					<h3>Local Stream</h3>
					<video id="webcamVideo" ref={videoRef} autoPlay playsInline></video>
				</span>
				<span>
					<h3>Remote Stream</h3>
					<video id="remoteVideo" ref={remoteRef} autoPlay playsInline></video>
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
		</main>
	);
}
