import { Box } from '@mui/material';
import { EditReactFlowCustomNodeHeader } from '../atom';
import {
	EditReactFlowCustomNodeDataProps,
	EditReactFlowCustomNodeProps,
} from '../../../interfaces';
import { EditReactFlowCustomNodeColumn } from './EditReactFlowCustomNodeColumn';
import { useLayout, usePalette } from '../../../hooks';

export const EditReactFlowCustomNode = ({
	data,
}: EditReactFlowCustomNodeProps) => {
	const { tableData }: EditReactFlowCustomNodeDataProps = data;
	const { name, color, id } = tableData;
	const palette = usePalette();
	const { tables, columns } = useLayout();
	const isTableSelected: boolean = tables[id].isSelected;

	return (
		<Box
			display="flex"
			justifyContent="center"
			alignItems="center"
			flexDirection="column"
			width="300px"
			border={isTableSelected ? `solid 2px ${palette.primary.main}` : 'none'}
			borderRadius="10px"
			overflow="hidden"
		>
			<EditReactFlowCustomNodeHeader title={name} color={color} />
			{columns &&
				columns[id]?.map((column, index) => (
					<EditReactFlowCustomNodeColumn
						key={column.id}
						color={
							index % 2 == 0
								? palette.components.edit.reactFlow.tableColumn.odd
								: palette.components.edit.reactFlow.tableColumn.even
						}
						name={column.name}
						type={column.type}
					/>
				))}
		</Box>
	);
};
