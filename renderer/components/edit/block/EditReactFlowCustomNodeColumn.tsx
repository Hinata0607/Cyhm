'use client';
import { Box, Typography } from '@mui/material';
import { EditReactFlowCustomNodeColumnProps } from '../../../interfaces';
import { useLayout, useProject } from '../../../hooks';

export const EditReactFlowCustomNodeColumn = ({
	color,
	column,
}: EditReactFlowCustomNodeColumnProps) => {
	const { currentProject } = useProject();
	const {
		handleGetColumnTypeTextWithSQlite,
		handleGetColumnTypeTextWithSupabase,
	} = useLayout();

	return (
		<Box
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			gap="5px"
			width="100%"
			height="40px"
			padding="0 10px"
			bgcolor={color}
		>
			<Typography
				variant="body2"
				fontSize="0.8rem"
				color="text.secondary"
				noWrap
			>
				{column.name}
			</Typography>
			{currentProject.dbType === 'SQLITE' ? (
				handleGetColumnTypeTextWithSQlite(
					column.sqliteType,
					true,
					'1rem',
					'0.6rem'
				)
			) : currentProject.dbType === 'SUPABASE' ? (
				handleGetColumnTypeTextWithSupabase(
					column.supabaseType,
					true,
					'1rem',
					'0.6rem'
				)
			) : (
				<></>
			)}
		</Box>
	);
};
