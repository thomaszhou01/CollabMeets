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

let localStream: MediaStream;
let remoteStream: MediaStream;

export async function webcamInit(videoRef: any, remoteRef: any, pc: any) {
	//getDisplayMedia
	localStream = await navigator.mediaDevices.getDisplayMedia({
		video: true,
		audio: true,
	});
	remoteStream = new MediaStream();
	// Push tracks from local stream to peer connection
	localStream.getTracks().forEach((track: any) => {
		pc.addTrack(track, localStream);
	});

	// Pull tracks from remote stream, add to video stream
	pc.ontrack = (event: any) => {
		event.streams[0].getTracks().forEach((track: any) => {
			remoteStream.addTrack(track);
		});
		console.log(pc);
	};
	let video = videoRef.current;
	video.srcObject = localStream;
	video.play();

	let remote = remoteRef.current;
	remote.srcObject = remoteStream;
	remote.play();
	// setRemote(remoteStream);
}

export async function callButton(pc: any) {
	// webcamInit(videoRef, remoteRef, pc);
	// Reference Firestore collections for signaling
	const callDoc = doc(collection(firestore, 'calls'));
	const offerCandidates = collection(callDoc, 'offerCandidates');
	const answerCandidates = collection(callDoc, 'answerCandidates');

	// let callInput.value = callDoc.id;
	console.log(callDoc.id);
	alert(callDoc.id);

	// Get candidates for caller, save to db
	pc.onicecandidate = (event: any) => {
		event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
		console.log(JSON.stringify(event.candidate.toJSON()));
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

export async function callButtonBack(pc: any, websocket: any, roomId: string) {
	// Reference Firestore collections for signaling
	const offerCandidates = roomId + ':offerCandidates';
	const answerCandidates = roomId + ':answerCandidates';

	// Get candidates for caller, save to db
	pc.onicecandidate = (event: any) => {
		event.candidate && websocket.send(JSON.stringify(event.candidate.toJSON()));
		console.log(JSON.stringify(event.candidate.toJSON()));
	};

	// Create offer
	const offerDescription = await pc.createOffer();
	await pc.setLocalDescription(offerDescription);

	const offer = {
		sdp: offerDescription.sdp,
		type: offerDescription.type,
	};

	// await setDoc(callDoc, { offer });

	// // Listen for remote answer
	// onSnapshot(callDoc, (snapshot: any) => {
	// 	const data = snapshot.data();
	// 	if (!pc.currentRemoteDescription && data?.answer) {
	// 		const answerDescription = new RTCSessionDescription(data.answer);
	// 		pc.setRemoteDescription(answerDescription);
	// 	}
	// });

	// // When answered, add candidate to peer connection
	// onSnapshot(answerCandidates, (snapshot: any) => {
	// 	snapshot.docChanges().forEach((change: any) => {
	// 		if (change.type === 'added') {
	// 			const candidate = new RTCIceCandidate(change.doc.data());
	// 			pc.addIceCandidate(candidate);
	// 			console.log('answering candidates');
	// 		}
	// 	});
	// });
}

// // 3. Answer the call with the unique ID
export async function answerButton(
	videoRef: any,
	remoteRef: any,
	id: any,
	pc: any,
) {
	// webcamInit(videoRef, remoteRef, pc);
	const callId = id;
	const callDoc = doc(collection(firestore, 'calls'), callId);
	const answerCandidates = collection(callDoc, 'answerCandidates');
	const offerCandidates = collection(callDoc, 'offerCandidates');

	// pc.onicecandidate = (event: any) => {
	// 	event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
	// };

	console.log('no answer candidates');

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
			console.log(change);
			if (change.type === 'added') {
				let data = change.doc.data();
				pc.addIceCandidate(new RTCIceCandidate(data));
			}
		});
	});
}
