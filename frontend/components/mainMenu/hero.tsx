import StartRoom from './startRoom';
import Image from 'next/image';

function Hero() {
	return (
		<div className="flex flex-col md:flex-row h-full w-full items-center justify-center p-16">
			<div className="md:basis-2/3">
				<h1 className="text-5xl sm:text-7xl mb-2">CollabMeets</h1>
				<p className="mb-8">Create video meeting spaces with one click</p>

				<StartRoom />
			</div>
			<Image
				src={'/images/icon.png'}
				alt="image"
				className="hidden md:block basis-1/3 w-auto"
				quality={100}
				width={300}
				height={300}
			/>
		</div>
	);
}

export default Hero;
