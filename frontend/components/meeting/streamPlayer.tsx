import { StreamMedia, Connections } from '../types/types';

function StreamPlayer({
	mediaStreams,
	streamId,
	manual,
	reference,
	muted,
}: {
	mediaStreams?: React.MutableRefObject<Map<string, StreamMedia>>;
	streamId: Connections;
	manual?: boolean;
	reference?: React.MutableRefObject<StreamMedia>;
	muted?: boolean;
}) {
	return (
		<div className="relative w-full h-full max-w-[1200px] my-auto mx-auto">
			<div className="flex w-full h-full box-border rounded-lg justify-center items-center">
				<video
					className="relative w-full h-full rounded-lg bg-black"
					ref={(element) => {
						if (!manual && mediaStreams) {
							let streamMedia: StreamMedia = {
								user: streamId.user,
								username: streamId.username,
								videoElement: element!,
								mediaStream: null,
							};
							if (mediaStreams.current.has(streamId.user)) {
								streamMedia['mediaStream'] = mediaStreams.current.get(
									streamId.user,
								)!.mediaStream;
							}
							mediaStreams.current.set(streamId.user, streamMedia);
						} else if (reference) {
							reference.current = {
								...reference.current,
								videoElement: element!,
							};
						}
					}}
					autoPlay
					playsInline
					muted={muted}
				></video>
				{/* <div className="absolute"> Status </div> */}
			</div>
			<div className="absolute left-4 bottom-2">
				{reference ? reference.current.username : streamId.username}
			</div>
		</div>
	);
}

export default StreamPlayer;
