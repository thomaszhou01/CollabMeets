export interface WebsocketMessage {
	User: string;
	Username: string;
	Target: string;
	ActionCode: string;
	IceCandidates?: IceMessage;
	PCOffer?: PCOffer;
}

export interface PCOffer {
	Sdp: string;
	Type: string;
}

export interface IceMessage {
	Candidate: string;
	SdpMid: string;
	SdpMLineIndex: number;
	UsernameFragment: string;
}

export interface Stream {
	user: string;
	connectionType: string;
	connection: RTCPeerConnection;
}

export interface StreamMedia {
	user: string;
	username: string;
	videoElement: HTMLVideoElement | null;
	mediaStream: MediaStream | null;
}

export interface LastEdited {
	command: string;
	user: string;
	misc?: any;
}

export interface Connection {
	user: string;
	username: string;
}

export interface ChatMessage {
	UserId: string;
	Username: string;
	Message: string;
}

export interface ChatHistory {
	RoomId: string;
	Messages: ChatHistoryMessage[];
}

export interface ChatHistoryMessage {
	From: string;
	Message: string;
}
