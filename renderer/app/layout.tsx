import { CssBaseline, ThemeProvider } from '@mui/material';
import type { Metadata } from 'next';
import { darkTheme } from '../themes';
import { ContextProvider, NextAuthProvider } from '../provider';
import { SwitchingLayoutUi } from '../ui';

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="jp">
			<ThemeProvider theme={darkTheme}>
				<body>
					<NextAuthProvider>
						<ContextProvider>
							<SwitchingLayoutUi>
								<CssBaseline />
								{children}
							</SwitchingLayoutUi>
						</ContextProvider>
					</NextAuthProvider>
				</body>
			</ThemeProvider>
		</html>
	);
}
