'use client';
import { useContext } from 'react';
import { Context } from '../../provider';
import {
	ColumnProps,
	EditReactFlowCustomNodeDataProps,
	handleAddColumnProps,
	handleAddTableProps,
	handleTableExpansionProps,
	TableProps,
	TablesStateProps,
	UseLayoutProps,
} from '../../interfaces';
import { usePalette } from '../common';
import { Node } from '@xyflow/react';

export const useLayout = (): UseLayoutProps => {
	const palette = usePalette();
	const context = useContext(Context);
	if (!context) {
		throw new Error('Context is not provided');
	}

	const {
		windowMode,
		setWindowMode,
		tables,
		setTables,
		columns,
		setColumns,
		isTableAddMode,
		setIsTableAddMode,
		addColumnIndex,
		setAddColumnIndex,
	} = context;

	const handleStartProject = (): void => {
		if (typeof window !== 'undefined' && window.ipc) {
			window.ipc.send('project-start');
		} else {
			console.error('IPC is not available');
		}
		setWindowMode('edit');
	};

	const handleEndProject = (): void => {
		if (typeof window !== 'undefined' && window.ipc) {
			window.ipc.send('project-end');
		} else {
			console.error('IPC is not available');
		}
		setWindowMode('top');
	};

	const handleAddTable = ({ tableName }: handleAddTableProps): void => {
		const newTable: TableProps = {
			id: Date.now().toString(),
			name: tableName,
			columns: [],
			color: palette.components.edit.reactFlow.tableHeader.default,
			isExpanded: true,
			position: { x: 200, y: 300 },
		};

		setTables((prevTables) => {
			if (prevTables === null) {
				return { [newTable.id]: newTable };
			}

			return {
				...prevTables,
				[newTable.id]: newTable,
			};
		});

		setIsTableAddMode(false);
	};

	const handleTableExpansion = ({
		tableId,
	}: handleTableExpansionProps): void => {
		setTables((prevTables) => {
			if (!prevTables || !prevTables[tableId]) return prevTables;
			return {
				...prevTables,
				[tableId]: {
					...prevTables[tableId],
					isExpanded: !prevTables[tableId].isExpanded,
				},
			};
		});
	};

	const handleAllTableExpansion = (expand: boolean): void => {
		setTables((prevTables) => {
			if (!prevTables) return prevTables;
			const updatedTables = Object.keys(prevTables).reduce((acc, tableId) => {
				acc[tableId] = {
					...prevTables[tableId],
					isExpanded: expand,
				};
				return acc;
			}, {} as TablesStateProps);

			return updatedTables;
		});
	};

	const handleAddColumn = ({
		tableId,
		columnName,
	}: handleAddColumnProps): void => {
		setColumns((prevColumns) => {
			const newColumn: ColumnProps = {
				id: 'fixed-id',
				name: columnName,
				type: undefined,
				constraints: [],
				defaultValue: null,
			};

			if (!prevColumns || !prevColumns[tableId]) {
				return {
					...prevColumns,
					[tableId]: [newColumn],
				};
			}

			return {
				...prevColumns,
				[tableId]: [...prevColumns[tableId], newColumn],
			};
		});

		setAddColumnIndex(null);
	};

	const handleGetNodesFromTables = (): Node[] => {
		if (!tables) return [];

		return Object.values(tables).map((table) => ({
			id: table.id,
			type: 'editRectFlowCustomNode',
			data: {
				title: table.name,
				color: table.color,
			} as EditReactFlowCustomNodeDataProps,
			position: table.position,
		}));
	};

	return {
		windowMode,
		setWindowMode,
		tables,
		setTables,
		columns,
		setColumns,
		isTableAddMode,
		setIsTableAddMode,
		addColumnIndex,
		setAddColumnIndex,

		handleStartProject,
		handleEndProject,
		handleAddTable,
		handleTableExpansion,
		handleAllTableExpansion,
		handleAddColumn,
		handleGetNodesFromTables,
	};
};