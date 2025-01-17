import { Box } from '@mui/material';
import { useLayout } from '../../../hooks';
import { EditColumnConstraintLeftBarItemProps } from '../../../interfaces';

export const EditColumnConstraintLeftBarItem = ({
	constraintType,
}: EditColumnConstraintLeftBarItemProps) => {
	const { handleGetConstraintIcon } = useLayout();

	return (
		<>
			<Box
				display="flex"
				justifyContent="start"
				alignItems="center"
				gap="10px"
				width="100%"
				minHeight="25px"
				padding="0 5px 0 20px"
				sx={{
					cursor: 'pointer',
				}}
			>
				{handleGetConstraintIcon(constraintType, true, '0.9rem', '0.6rem')}
			</Box>
		</>
	);
};
