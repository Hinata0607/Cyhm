'use client';
import { Box } from '@mui/material';
import { TopLayoutProps } from '../../interfaces';
import { TopHeader, TopMain } from './section';
import { useProject } from '../../hooks';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const TopLayout = ({ children }: TopLayoutProps) => {
	const { handleFetchUserProjects } = useProject();
	const { data: session } = useSession();

	useEffect(() => {
		(async () => {
			if (session && session.user) {
				await handleFetchUserProjects({ userId: session.user.id });
			}
		})();
	}, [session]);

	return (
		<>
			<Box width="100%" height="100vh" maxWidth="800px" margin="0 auto">
				<TopHeader />
				<TopMain>{children}</TopMain>
			</Box>
		</>
	);
};
