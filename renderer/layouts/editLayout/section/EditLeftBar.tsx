import { Box } from '@mui/material';
import { useLayout, usePalette } from '../../../hooks';
import {
	EditLeftBarHeader,
	EditLeftBarNewBorn,
	EditLeftBarTableArea,
} from '../block';
import { AddTableResponse } from '../../../interfaces';

export const EditLeftBar = () => {
	const palette = usePalette();
	const { isTableAddMode, tables, EditLeftBarTableAreaRef, isEditLeftBar } =
		useLayout();

	return (
		<Box
			display={isEditLeftBar ? 'flex' : 'none'}
			justifyContent="start"
			alignItems="center"
			flexDirection="column"
			width="250px"
			height="100%"
			borderRight={`solid 1px ${palette.layout.editLayout.header.line}`}
			bgcolor={palette.layout.editLayout.leftBar.bg}
		>
			<EditLeftBarHeader />
			<Box
				display="flex"
				justifyContent="start"
				alignItems="center"
				flexDirection="column"
				width="100%"
				height="calc(100% - 35px)"
				sx={{
					overflowY: 'scroll',
					'&::-webkit-scrollbar': {
						width: '0px',
					},
				}}
			>
				<Box
					ref={EditLeftBarTableAreaRef}
					display="flex"
					justifyContent="start"
					alignItems="center"
					flexDirection="column"
					width="100%"
				>
					{isTableAddMode && <EditLeftBarNewBorn mode="table" />}
					{tables &&
						Object.values(tables).map((table: AddTableResponse) => (
							<EditLeftBarTableArea key={table.id} table={table} />
						))}
				</Box>
			</Box>
		</Box>
	);
};
