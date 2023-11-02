import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthListener from '@/components/authListener';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Screenshare',
	description: 'Easily share your screen with others',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<AuthListener>
				<body className={inter.className}>{children}</body>
			</AuthListener>
		</html>
	);
}
