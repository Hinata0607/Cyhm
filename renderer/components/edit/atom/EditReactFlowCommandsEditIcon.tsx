import { Edit } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { usePalette, useProject } from '../../../hooks';
import { EditReactFlowCommandsEditIconProps } from '../../../interfaces';

export const EditReactFlowCommandsEditIcon = ({
	table,
}: EditReactFlowCommandsEditIconProps) => {
	const { handleTableEditMode } = useProject();
	const palette = usePalette();

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
		event.stopPropagation();
		handleTableEditMode({ tableId: table.id });
	};

	return (
		<IconButton
			size="small"
			title="メニューを表示"
			disableRipple
			onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
				handleClick(event)
			}
			sx={{
				backgroundColor: table.isEditing ? palette.primary.main : table.color,
			}}
		>
			<Edit
				fontSize="small"
				sx={{
					fontSize: '0.85rem',
				}}
			/>
		</IconButton>
	);
};
