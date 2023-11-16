function MediaButtons({
	toggle,
	setToggle,
	iconEnabled,
	iconDisabled,
	text,
	enabled,
}: {
	toggle: boolean;
	setToggle: any;
	iconEnabled: any;
	iconDisabled: any;
	text?: string;
	enabled?: boolean;
}) {
	return (
		<button
			className={`flex gap-2 items-center mx-2 p-4 border rounded-full hover:bg-opacity-50 ${
				toggle ? 'bg-slate-400 bg-opacity-0' : 'bg-red-600'
			} ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
			onClick={setToggle}
		>
			{toggle ? iconEnabled : iconDisabled}
			{text}
		</button>
	);
}

export default MediaButtons;
