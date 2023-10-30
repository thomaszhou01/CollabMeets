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
	apiKey: 'AIzaSyDL9zCMqlEaY_xX7dsmtjQfZLNtn1aifts',
	authDomain: 'screenshare-dea85.firebaseapp.com',
	projectId: 'screenshare-dea85',
	storageBucket: 'screenshare-dea85.appspot.com',
	messagingSenderId: '1066002341166',
	appId: '1:1066002341166:web:2b9d16f2783fe5399baebf',
	measurementId: 'G-RG71QVN2H8',
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

let localStream: any = null;
let remoteStream: any = null;

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

export async function callButton(videoRef: any, remoteRef: any, pc: any) {
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

	pc.onicecandidate = (event: any) => {
		event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
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
			console.log(change);
			if (change.type === 'added') {
				let data = change.doc.data();
				pc.addIceCandidate(new RTCIceCandidate(data));
			}
		});
	});
}
