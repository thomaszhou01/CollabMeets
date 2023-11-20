import { MutableRefObject } from 'react';
import StreamPlayer from './streamPlayer';
import { StreamMedia, Connection } from '../types/types';

function MeetingRoom({
	connectionUsers,
	localMedia,
	mediaStreams,
}: {
	connectionUsers: Connection[];
	localMedia: MutableRefObject<StreamMedia>;
	mediaStreams: MutableRefObject<Map<string, StreamMedia>>;
}) {
	return (
		<div className="flex grow shrink basis-4/5">
			<div
				className={`grid gap-3 p-2 h-full w-full ${
					connectionUsers.length == 0
						? 'grid-cols-1 grid-rows-1'
						: connectionUsers.length == 1
						? 'grid-cols-1 grid-rows-2 sm:grid-rows-1 sm:grid-cols-2'
						: connectionUsers.length <= 3
						? 'grid-cols-2 grid-rows-2'
						: 'grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2'
				}`}
			>
				<StreamPlayer
					manual={true}
					streamId={{
						user: localMedia.current.user,
						username: localMedia.current.username,
					}}
					reference={localMedia}
					muted={true}
				/>
				{connectionUsers.map((key, value) => {
					return (
						<StreamPlayer
							mediaStreams={mediaStreams}
							streamId={key}
							key={key.user}
						/>
					);
				})}
			</div>
		</div>
	);
}

export default MeetingRoom;
