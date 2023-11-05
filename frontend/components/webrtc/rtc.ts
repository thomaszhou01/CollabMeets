import { initializeApp } from 'firebase/app';
import {
	getFirestore,
	collection,
	doc,
	addDoc,
	setDoc,
	onSnapshot,
	getDoc,
	updateDoc,
} from 'firebase/firestore';

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDER,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

export const iceServers = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
		},
	],
	iceCandidatePoolSize: 10,
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export async function webcamInit(
	videoRef: HTMLVideoElement,
	remoteRef: HTMLVideoElement,
	pc: any,
	testing: boolean,
) {
	let localStream: MediaStream;
	//getDisplayMedia
	if (testing) {
		localStream = await navigator.mediaDevices.getUserMedia({
			video: false,
			audio: true,
		});
	} else {
		localStream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
			audio: true,
		});
	}

	let remoteStream = new MediaStream();
	// Push tracks from local stream to peer connection
	localStream.getTracks().forEach((track: any) => {
		pc.addTrack(track, localStream);
	});

	// Pull tracks from remote stream, add to video stream
	pc.ontrack = (event: any) => {
		event.streams[0].getTracks().forEach((track: any) => {
			remoteStream.addTrack(track);
		});
		remoteRef.srcObject = remoteStream;
		remoteRef.play();
	};
	videoRef.srcObject = localStream;
	videoRef.play();

	// setRemote(remoteStream);
}

export async function callButton(pc: RTCPeerConnection | undefined) {
	// webcamInit(videoRef, remoteRef, pc);
	// Reference Firestore collections for signaling
	const callDoc = doc(collection(firestore, 'calls'));
	const offerCandidates = collection(callDoc, 'offerCandidates');
	const answerCandidates = collection(callDoc, 'answerCandidates');

	// let callInput.value = callDoc.id;
	console.log(callDoc.id);
	alert(callDoc.id);

	if (pc) {
		// Get candidates for caller, save to db
		pc.onicecandidate = (event: any) => {
			event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
			event.candidate && console.log('host ice');
		};

		// Create offer
		const offerDescription = await pc.createOffer();
		await pc.setLocalDescription(offerDescription);

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type,
		};

		await setDoc(callDoc, { offer });

		// Listen for remote answer
		onSnapshot(callDoc, (snapshot: any) => {
			const data = snapshot.data();
			if (!pc.currentRemoteDescription && data?.answer) {
				const answerDescription = new RTCSessionDescription(data.answer);
				pc.setRemoteDescription(answerDescription);
				console.log('remote answer');
			}
		});

		// When answered, add candidate to peer connection
		onSnapshot(answerCandidates, (snapshot: any) => {
			snapshot.docChanges().forEach((change: any) => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					pc.addIceCandidate(candidate);
					console.log('answering candidates');
				}
			});
		});
	}
}

// // 3. Answer the call with the unique ID
export async function answerButton(
	videoRef: any,
	remoteRef: any,
	id: any,
	pc: RTCPeerConnection | undefined,
) {
	// webcamInit(videoRef, remoteRef, pc);
	const callId = id;
	const callDoc = doc(collection(firestore, 'calls'), callId);
	const answerCandidates = collection(callDoc, 'answerCandidates');
	const offerCandidates = collection(callDoc, 'offerCandidates');
	if (pc) {
		pc.onicecandidate = (event: any) => {
			event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
			console.log('answer ice');
		};

		const callData = (await getDoc(callDoc)).data();

		const offerDescription = callData?.offer;
		await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

		const answerDescription = await pc.createAnswer();
		await pc.setLocalDescription(answerDescription);

		const answer = {
			type: answerDescription.type,
			sdp: answerDescription.sdp,
		};

		await updateDoc(callDoc, { answer });

		onSnapshot(offerCandidates, (snapshot: any) => {
			snapshot.docChanges().forEach((change: any) => {
				if (change.type === 'added') {
					let data = change.doc.data();
					pc.addIceCandidate(new RTCIceCandidate(data));
					console.log('answering offer');
				}
			});
		});
	}
}
