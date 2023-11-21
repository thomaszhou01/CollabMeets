import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthListener from '@/components/auth/authListener';

import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'CollabMeets',
	description: 'Create video meeting spaces with one click',
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
