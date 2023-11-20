import Header from '@/components/mainMenu/header';
import Hero from '@/components/mainMenu/hero';
import { Providers } from './providers';

export default function Home() {
	return (
		<Providers>
			<div className="h-[100vh]">
				<Header />
				<Hero />
			</div>
		</Providers>
	);
}
