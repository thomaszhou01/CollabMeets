import {
	CameraVideo,
	CameraVideoOff,
	Display,
	DisplayFill,
	Mic,
	MicMute,
} from 'react-bootstrap-icons';
import MediaButtons from './mediaButtons';

function MeetingControls({
	audio,
	video,
	streaming,
	toggleMute,
	toggleVideo,
	toggleStreaming,
	toggleChat,
	roomID,
}: {
	audio: boolean;
	video: boolean;
	streaming: boolean;
	toggleMute: any;
	toggleVideo: any;
	toggleStreaming: any;
	toggleChat: any;
	roomID: string;
}) {
	return (
		<div className="flex h-full items-center">
			<div className="flex grow shrink basis-1/3 ml-4 justify-start max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
				<p>Room: {roomID} asdasdasd</p>
			</div>
			<div className="flex grow shrink basis-1/3 justify-center">
				<MediaButtons
					toggle={audio}
					setToggle={() => {
						toggleMute();
					}}
					iconEnabled={<Mic size={20} />}
					iconDisabled={<MicMute size={20} />}
				/>
				<MediaButtons
					toggle={video}
					setToggle={() => {
						toggleVideo();
					}}
					iconEnabled={<CameraVideo size={20} />}
					iconDisabled={<CameraVideoOff size={20} />}
				/>
				<MediaButtons
					toggle={streaming}
					setToggle={() => toggleStreaming()}
					iconEnabled={<Display size={20} />}
					iconDisabled={<DisplayFill size={20} />}
					text="Screenshare"
				/>
			</div>
			<div className="flex grow shrink basis-1/3 mr-4 justify-end max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
				<button onClick={toggleChat}>Open Chat</button>
			</div>
		</div>
	);
}

export default MeetingControls;
