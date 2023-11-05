import { StreamMedia } from './types/types';

function StreamPlayer({
	mediaStreams,
	streamId,
}: {
	mediaStreams: Map<string, StreamMedia>;
	streamId: string;
}) {
	return (
		<span>
			<video
				className="w-[40vw]	h-[30vw] m-2 bg-[#2c3e50]"
				ref={(element) => {
					const streamMedia = {
						user: streamId,
						videoElement: element!,
						mediaStream: null,
					};
					mediaStreams.set(streamId, streamMedia);
				}}
				autoPlay
				playsInline
				controls
			></video>
		</span>
	);
}

export default StreamPlayer;
