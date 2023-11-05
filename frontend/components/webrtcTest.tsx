'use client';
import { useState, useRef, useEffect, useContext, useMemo, use } from 'react';
import {
	WebsocketMessage,
	IceMessage,
	Stream,
	LastEdited,
	StreamMedia,
} from './types/types';
import {
	webcamInit,
	callButton,
	answerButton,
	iceServers,
} from '../components/webrtc/rtc';
import {
	startLocal,
	hostAddPlayer,
	recieverAddPlayerAndRespond,
	addIceCandidate,
	hostReceivePlayer,
} from '../components/webrtc/rtcMultiConnect';
import { AuthContext } from './contexts/authContext';
import StreamPlayer from './streamPlayer';
const { v4: uuidv4 } = require('uuid');

function WebRTCTest({ roomId }: { roomId: string }) {
	const username = useContext(AuthContext);

	//replaced
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const remoteRef = useRef<HTMLVideoElement>(null);
	const [localStream, setLocalStream] = useState<RTCPeerConnection>();
	const [testVar, setTestVar] = useState(false);

	//using
	const websocket = useRef<WebSocket>();
	const lastEdited = useRef<Array<LastEdited>>([]);
	const localMedia = useRef<StreamMedia>({
		user: '',
		videoElement: null,
		mediaStream: null,
	});

	const mediaStreams = useRef<Map<string, StreamMedia>>(new Map());
	const connections = useRef<Map<string, RTCPeerConnection>>(new Map());
	const [connectionUsers, setConnectionUsers] = useState<Array<string>>([]);
	const [inSetup, setInSetup] = useState(true);
	const [userId, setUserId] = useState('');
	const [callInput, setCallInput] = useState('');

	// useEffect(() => {
	// 	setupConnections();
	// }, []);

	function setupConnections() {
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
			if (!websocket.current) {
				const user = uuidv4();
				setUserId(user);

				websocket.current = new WebSocket(
					'ws://localhost:8080/ws?roomId=' + roomId + '&userId=' + user,
				);

				websocket.current.addEventListener('error', (event: any) => {
					console.log('WebSocket error: ', event);
				});

				websocket.current.onopen = function () {
					const newUser: WebsocketMessage = {
						User: user,
						ActionCode: 'new',
						Target: '',
					};
					if (response.status == 208) {
						websocket.current!.send(JSON.stringify(newUser));
					}
				};

				websocket.current.onmessage = function (message: MessageEvent) {
					const parsedMessage: WebsocketMessage = JSON.parse(message.data);
					const thisCon = connections.current.get(parsedMessage.User);
					switch (parsedMessage.ActionCode) {
						case 'pcOffer':
						case 'new':
							//remove to test: iceServers
							let pcTemp = new RTCPeerConnection(iceServers);
							connections.current.set(parsedMessage.User, pcTemp);
							lastEdited.current.push({
								user: parsedMessage.User,
								command: parsedMessage.ActionCode,
								misc: parsedMessage.PCOffer,
							});
							setConnectionUsers((prev) => [...prev, parsedMessage.User]);
							console.log(parsedMessage.ActionCode);
							break;
						case 'ice':
							if (thisCon && parsedMessage.IceCandidates) {
								addIceCandidate(parsedMessage.IceCandidates, thisCon);
							}
							break;
						case 'pcAnswer':
							if (thisCon && parsedMessage.PCOffer) {
								hostReceivePlayer(thisCon, parsedMessage.PCOffer);
							}
							break;
						case 'leave':
							connections.current.delete(parsedMessage.User);
							lastEdited.current.push({
								user: parsedMessage.User,
								command: 'delete',
							});
							setConnectionUsers((prev) =>
								prev.filter((userId) => userId !== parsedMessage.User),
							);
							break;
					}
					// console.log(parsedMessage.User, parsedMessage);
				};
			}
		});

		window.onbeforeunload = function () {
			const leave: WebsocketMessage = {
				User: userId,
				ActionCode: 'leave',
				Target: '',
			};
			console.log('closing websocket', userId);
			websocket.current!.send(JSON.stringify(leave));
			websocket.current!.close();
			pc.close();
		};
		return () => {
			if (websocket.current) {
				const leave: WebsocketMessage = {
					User: userId,
					ActionCode: 'leave',
					Target: '',
				};
				console.log('closing websocket123');
				websocket.current!.send(JSON.stringify(leave));
				websocket.current!.close();
			}
		};
	}

	useEffect(() => {
		if (!inSetup) {
			const localStream = localMedia.current.videoElement;
			if (localStream && localMedia.current.mediaStream) {
				localStream.srcObject = localMedia.current.mediaStream;
				localStream.play();
			}
		}
	}, [inSetup]);

	//create iceCandidate/remove IceCandidate
	useEffect(() => {
		if (lastEdited.current.length > 0) {
			const length = lastEdited.current.length;
			for (let i = 0; i < length; i++) {
				let editCommand = lastEdited.current.pop();
				if (!editCommand) {
					break;
				}
				const streamMedia = mediaStreams.current.get(editCommand.user);
				const connection = connections.current.get(editCommand.user);
				if (editCommand.command == 'new') {
					if (streamMedia && connection) {
						hostAddPlayer(
							userId,
							editCommand.user,
							localMedia.current,
							streamMedia,
							connection,
							websocket.current!,
						);
					}
				} else if (editCommand.command == 'pcOffer') {
					if (streamMedia && connection) {
						recieverAddPlayerAndRespond(
							userId,
							editCommand.user,
							localMedia.current,
							streamMedia,
							connection,
							websocket.current!,
							editCommand.misc,
						);
					}
				} else if (editCommand.command == 'delete') {
					mediaStreams.current.delete(editCommand.user);
				}
			}
		}
	}, [connectionUsers]);

	function setupComplete() {
		if (localMedia.current.mediaStream) {
			setInSetup((prev) => !prev);
			setupConnections();
		} else {
			console.log('no local media');
		}
	}

	function hostStart() {
		callButton(localStream);
	}

	async function startLocalStream() {
		const localStream = localMedia.current.videoElement;
		if (localStream) {
			localMedia.current.mediaStream = await startLocal(localStream, false);
			// await new Promise((r) => setTimeout(r, 5000));
			// console.log('after pause');
			// localStream.srcObject = null;
		}
	}

	async function test() {
		console.log(connections.current, mediaStreams.current);
	}

	if (inSetup)
		return (
			<div>
				<div className="flex flex-wrap align-center justify-center">
					<span>
						<video
							className="w-[40vw]	h-[30vw] m-2 bg-[#2c3e50]"
							ref={(element) => {
								localMedia.current.videoElement = element!;
							}}
							autoPlay
							playsInline
							controls
						></video>
					</span>
				</div>
				<button onClick={startLocalStream}>Start Cam</button>
				<p></p>
				<button onClick={setupComplete}>Finalize</button>
			</div>
		);

	return (
		<div>
			<h2>1. Start your Webcam</h2>
			<p>{connectionUsers}</p>
			<div className="flex flex-wrap align-center justify-center">
				<span>
					<video
						className="w-[40vw]	h-[30vw] m-2 bg-[#2c3e50]"
						ref={(element) => {
							localMedia.current.videoElement = element!;
						}}
						autoPlay
						playsInline
						controls
					></video>
				</span>
				<span>
					<h3>Local Stream</h3>
					<video
						className="w-[40vw]	h-[30vw] m-2 bg-[#2c3e50]"
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
						className="w-[40vw]	h-[30vw] m-2 bg-[#2c3e50]"
						id="remoteVideo"
						ref={remoteRef}
						autoPlay
						playsInline
						controls
					></video>
				</span>
				{connectionUsers.map((key, value) => {
					return (
						<StreamPlayer
							mediaStreams={mediaStreams.current}
							streamId={key}
							key={key}
						/>
					);
				})}
			</div>
			<p>{userId}</p>

			<button onClick={test}>Test</button>
			<p></p>
			<button
				onClick={() => {
					if (videoRef.current && remoteRef.current) {
						webcamInit(
							videoRef.current,
							remoteRef.current,
							localStream,
							testVar,
						);
					}
				}}
			>
				Webcam Init
			</button>
			<p></p>

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
		</div>
	);
}

export default WebRTCTest;
