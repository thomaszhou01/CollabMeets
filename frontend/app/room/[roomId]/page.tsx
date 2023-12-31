'use client';
import { useState, useRef, useEffect, useContext } from 'react';
import {
	CameraVideo,
	CameraVideoOff,
	Display,
	DisplayFill,
	Mic,
	MicMute,
} from 'react-bootstrap-icons';
import { useRouter } from 'next/navigation';
import {
	WebsocketMessage,
	LastEdited,
	StreamMedia,
	Connection,
} from '@/components/types/types';
import {
	iceServers,
	startLocal,
	hostAddPlayer,
	recieverAddPlayerAndRespond,
	addIceCandidate,
	hostReceivePlayer,
	toggleScreenshare,
} from '@/components/webrtc/rtcMultiConnect';
import { AuthContext } from '@/components/contexts/authContext';
import StreamPlayer from '@/components/meeting/streamPlayer';
import MeetingRoom from '@/components/meeting/meetingRoom';
import MeetingControls from '@/components/meeting/meetingControls';
import Chat from '@/components/meeting/chat';

import MediaButtons from '@/components/meeting/mediaButtons';
import {
	signalingGetRoom,
	signalingWebsocket,
} from '@/components/api/signalingAPI';
import { chatQueryRoom } from '@/components/api/chatAPI';
const { v4: uuidv4 } = require('uuid');

function Page({ params }: { params: { roomId: string } }) {
	const router = useRouter();
	let username = useContext(AuthContext);
	const signalingSocket = useRef<WebSocket>();
	const lastEdited = useRef<Array<LastEdited>>([]);
	const localMedia = useRef<StreamMedia>({
		user: 'local',
		username: 'You',
		videoElement: null,
		mediaStream: null,
	});
	const mediaStreams = useRef<Map<string, StreamMedia>>(new Map());
	const connections = useRef<Map<string, RTCPeerConnection>>(new Map());
	const [connectionUsers, setConnectionUsers] = useState<Array<Connection>>([]);
	const [inSetup, setInSetup] = useState(true);
	const [available, setAvailable] = useState(false);
	const [userId, setUserId] = useState('');
	const [audio, setAudio] = useState(false);
	const [video, setVideo] = useState(false);
	const [chat, setChat] = useState(false);
	const [streaming, setStreaming] = useState(false);

	useEffect(() => {
		if (!inSetup) {
			const localStream = localMedia.current.videoElement;
			if (localStream && localMedia.current.mediaStream) {
				localStream.srcObject = localMedia.current.mediaStream;
				localStream.play();
			}
		}
	}, [inSetup]);

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
							username.username,
							editCommand.user,
							localMedia.current,
							streamMedia,
							connection,
							signalingSocket.current!,
						);
					}
				} else if (editCommand.command == 'pcOffer') {
					if (streamMedia && connection) {
						recieverAddPlayerAndRespond(
							userId,
							username.username,
							editCommand.user,
							localMedia.current,
							streamMedia,
							connection,
							signalingSocket.current!,
							editCommand.misc,
						);
					} else {
						lastEdited.current.push(editCommand);
					}
				} else if (editCommand.command == 'delete') {
					mediaStreams.current.delete(editCommand.user);
				}
			}
		}
	}, [connectionUsers]);

	useEffect(() => {
		startLocalStream();
		chatQueryRoom(params.roomId).then(async (response) => {
			const data: boolean = await response.json();
			setAvailable(data);
		});

		return () => {
			if (signalingSocket.current) {
				const leave: WebsocketMessage = {
					User: userId,
					Username: username.username,
					ActionCode: 'leave',
					Target: '',
				};
				console.log('closing websocket123');
				signalingSocket.current!.send(JSON.stringify(leave));
				signalingSocket.current!.close();
			}
			if (localMedia.current.mediaStream) {
				localMedia.current.mediaStream.getTracks().forEach(function (track) {
					track.stop();
				});
			}
		};
	}, []);

	function setupConnections() {
		signalingGetRoom(params.roomId).then((response) => {
			const user = uuidv4();
			setUserId(user);

			if (!signalingSocket.current) {
				signalingSocket.current = signalingWebsocket(params.roomId, user);
				signalingSocket.current.addEventListener('error', (event: any) => {
					console.log('WebSocket error: ', event);
				});

				signalingSocket.current.onopen = function () {
					const newUser: WebsocketMessage = {
						User: user,
						Username: username.username,
						ActionCode: 'new',
						Target: '',
					};
					if (response.status == 208) {
						signalingSocket.current!.send(JSON.stringify(newUser));
					}
				};

				signalingSocket.current.onmessage = function (message: MessageEvent) {
					const parsedMessage: WebsocketMessage = JSON.parse(message.data);
					const thisCon = connections.current.get(parsedMessage.User);

					switch (parsedMessage.ActionCode) {
						case 'pcOffer':
						case 'new':
							let pcTemp = new RTCPeerConnection(iceServers);
							connections.current.set(parsedMessage.User, pcTemp);
							lastEdited.current.push({
								user: parsedMessage.User,
								command: parsedMessage.ActionCode,
								misc: parsedMessage.PCOffer,
							});
							setConnectionUsers((prev) => [
								...prev,
								{ user: parsedMessage.User, username: parsedMessage.Username },
							]);
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
								prev.filter((userId) => userId.user !== parsedMessage.User),
							);
							break;
					}
				};
			}
		});

		window.onbeforeunload = function () {
			const leave: WebsocketMessage = {
				User: userId,
				Username: username.username,
				ActionCode: 'leave',
				Target: '',
			};
			console.log('closing websocket WINDOW', userId);
			signalingSocket.current!.send(JSON.stringify(leave));
			signalingSocket.current!.close();
		};
	}

	function setupComplete() {
		if (localMedia.current.mediaStream) {
			setInSetup((prev) => !prev);
			setupConnections();
		} else {
		}
	}

	async function startLocalStream() {
		const localStream = localMedia.current.videoElement;
		if (localStream) {
			const newStream = await startLocal(localStream);
			localMedia.current.mediaStream = newStream;
		}
	}

	function toggleMute() {
		if (localMedia.current.mediaStream && !streaming) {
			localMedia.current.mediaStream.getAudioTracks()[0].enabled =
				!localMedia.current.mediaStream.getAudioTracks()[0].enabled;
			setAudio(localMedia.current.mediaStream.getAudioTracks()[0].enabled);
		}
	}

	function toggleVideo() {
		if (localMedia.current.mediaStream && !streaming) {
			localMedia.current.mediaStream.getVideoTracks()[0].enabled =
				!localMedia.current.mediaStream.getVideoTracks()[0].enabled;
			setVideo(localMedia.current.mediaStream.getVideoTracks()[0].enabled);
		}
	}

	async function toggleStreaming() {
		if (localMedia.current.mediaStream && !streaming) {
			localMedia.current.mediaStream = await toggleScreenshare(
				localMedia.current,
				connections.current,
				true,
			);
			setStreaming(true);
		} else {
			localMedia.current.mediaStream = await toggleScreenshare(
				localMedia.current,
				connections.current,
				false,
			);
			if (localMedia.current.mediaStream) {
				localMedia.current.mediaStream.getVideoTracks()[0].enabled = video;
				localMedia.current.mediaStream.getAudioTracks()[0].enabled = audio;
			}
			setStreaming(false);
		}
	}

	function leaveRoom() {
		router.push('/');
	}

	if (inSetup)
		return (
			<div className="h-[100vh] bg-gray-800 flex flex-col justify-center items-center">
				<div className="h-3/5 w-3/5">
					<StreamPlayer
						manual={true}
						streamId={{
							user: localMedia.current.user,
							username: localMedia.current.username,
						}}
						reference={localMedia}
						muted={true}
					/>
				</div>

				<div className="flex my-2">
					<MediaButtons
						toggle={audio}
						setToggle={() => {
							toggleMute();
						}}
						iconEnabled={<Mic size={20} />}
						iconDisabled={<MicMute size={20} />}
						enabled={!streaming}
					/>
					<MediaButtons
						toggle={video}
						setToggle={() => {
							toggleVideo();
						}}
						iconEnabled={<CameraVideo size={20} />}
						iconDisabled={<CameraVideoOff size={20} />}
						enabled={!streaming}
					/>
					<MediaButtons
						toggle={streaming}
						setToggle={() => toggleStreaming()}
						iconEnabled={<Display size={20} />}
						iconDisabled={<DisplayFill size={20} />}
						text="Screenshare"
						enabled={true}
					/>
				</div>
				{available && (
					<button
						className="p-2 rounded-lg bg-slate-900 hover:bg-slate-700 "
						onClick={setupComplete}
					>
						Enter Room
					</button>
				)}
			</div>
		);

	return (
		<div className="h-[100vh] bg-gray-800">
			<div className="flex flex-row h-[90%]">
				<MeetingRoom
					connectionUsers={connectionUsers}
					localMedia={localMedia}
					mediaStreams={mediaStreams}
				/>
				<Chat roomId={params.roomId} username={username} openChat={chat} />
			</div>
			<div className="h-[10%] bg-slate-900">
				<MeetingControls
					audio={audio}
					video={video}
					streaming={streaming}
					toggleMute={toggleMute}
					toggleVideo={toggleVideo}
					toggleStreaming={toggleStreaming}
					leaveRoom={leaveRoom}
					toggleChat={() => setChat((prev) => !prev)}
					roomID={params.roomId}
				/>
			</div>
		</div>
	);
}

export default Page;
