import { useSession } from 'next-auth/react';
import { useLayout } from '../hooks';
import { LoginContents, TopContents } from '../contents';

export const SwitchingContentsUi = () => {
	const { windowMode } = useLayout();
	const { data: session } = useSession();

	return (
		<>
			{!session || !session.user ? (
				<LoginContents />
			) : windowMode === 'top' ? (
				<TopContents />
			) : (
				<></>
			)}
		</>
	);
};
