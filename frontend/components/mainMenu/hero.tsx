import StartRoom from './startRoom';

function Hero() {
	return (
		<div className="flex flex-col h-full w-full items-center justify-center">
			<h1 className="text-4xl">Meets</h1>
			<StartRoom />
		</div>
	);
}

export default Hero;
