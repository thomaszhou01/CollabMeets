import StartRoom from './startRoom';

function Hero() {
	return (
		<div className="flex flex-col h-full w-full items-center justify-center">
			<h1 className="text-6xl sm:text-8xl mb-2">CollabMeets</h1>
			<p className="mb-8">Create video meeting spaces with one click</p>

			<StartRoom />
		</div>
	);
}

export default Hero;
