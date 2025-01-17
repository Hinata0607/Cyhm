'use client';
import { useContext } from 'react';
import { Context } from '../../provider';
import { axiosFetch } from '../../libs';
import { generateCUID } from '../../utils';
import {
	AddColumnConstraintRequest,
	AddColumnRequest,
	AddColumnResponse,
	AddTableResponse,
	ColumnChannelPayloadProps,
	ColumnConstraintResponse,
	ColumnsChannelPayloadProps,
	ColumnsStateProps,
	ColumnStatePropsExtended,
	CreateProjectRequest,
	CreateProjectResponse,
	DeleteColumnConstraintRequest,
	FetchAllContentsResponse,
	FetchProjectResponse,
	FetchUserProjectsResponse,
	handleAddColumnProps,
	handleAddConstraintProps,
	handleAddTableProps,
	handleChangeProjectDBTypeProps,
	handleChangeProjectNameProps,
	handleColumnNameChangeProps,
	handleColumnNameUpdateProps,
	handleCreateProjectProps,
	handleDeleteConstraintProps,
	handleFetchUserProjectsProps,
	handleNodeDragStopProps,
	handleOpenTableExpansionProps,
	handleStartProjectProps,
	handleTableColorChangeProps,
	handleTableColorUpdateProps,
	handleTableEditProps,
	handleTableNameChangeProps,
	handleTableNameUpdateProps,
	handleUpdateColumnTypeProps,
	ProjectChannelPayloadProps,
	ProjectsResponse,
	TableChannelPayloadProps,
	UpdateColumnNameRequest,
	UpdateColumnTypeRequest,
	UpdateProjectDBTypeRequest,
	UpdateProjectDBTypeResponse,
	UpdateProjectNameRequest,
	UpdateTableColorRequest,
	UpdateTableExpandRequest,
	UpdateTableLockRequest,
	UpdateTableNameRequest,
	UpdateTablePositionResponse,
	UseProjectProps,
} from '../../interfaces';
import { usePalette } from '../common';

export const useProject = (): UseProjectProps => {
	const palette = usePalette();
	const context = useContext(Context);
	if (!context) {
		throw new Error('Context is not provided');
	}

	const {
		tables,
		setTables,
		columns,
		setColumns,
		columnConstraintEditInfo,
		setColumnConstraintEditInfo,
		addConstraintColumnId,
		setAddConstraintColumnId,
		setIsTableAddMode,
		setAddColumnIndex,
		setWindowMode,
		userProjects,
		setUserProjects,
		currentProject,
		setCurrentProject,
		setIsPreparingProject,
		tableEditInfo,
		setTableEditInfo,
		columnEditInfo,
		setColumnEditInfo,
		setInvitedUsers,
		channel,
		setChannel,
		setIsConstraintDeleting,
		projectSettingInfo,
		setProjectSettingInfo,
		projectSettingChanging,
		setProjectSettingChanging,
	} = context;

	const handleCreateProject = async ({
		userId,
		dbType,
	}: handleCreateProjectProps): Promise<void> => {
		try {
			setIsPreparingProject('プロジェクトの作成中...');
			const newProject = await axiosFetch.post<CreateProjectResponse>(
				`/api/supabase/project`,
				{
					name: `プロジェクト_${generateCUID()}`,
					dbType: dbType,
				} as CreateProjectRequest
			);
			await axiosFetch.post(`/api/supabase/member`, {
				userId: userId,
				projectId: newProject.id,
				role: 'owner',
			});
			const newCurrentProject = await axiosFetch.get<FetchProjectResponse>(
				`/api/supabase/project/${newProject.id}`
			);
			setCurrentProject(newCurrentProject);

			setProjectSettingInfo({
				projectName: newCurrentProject.name,
				dbType: newCurrentProject.dbType,
			});

			if (typeof window !== 'undefined' && window.ipc) {
				window.ipc.send('project-start');
			} else {
				console.error('IPC is not available');
			}
			setWindowMode('edit');
			setIsPreparingProject(null);
		} catch (error) {
			console.error(error);
			setIsPreparingProject(null);
		}
	};

	const handleFetchUserProjects = async ({
		userId,
	}: handleFetchUserProjectsProps): Promise<void> => {
		try {
			const userProjects = await axiosFetch.get<FetchUserProjectsResponse[]>(
				`/api/supabase/project/user/${userId}`
			);
			setUserProjects(userProjects);
		} catch (error) {
			console.error(error);
		}
	};

	const handleStartProject = async ({
		project,
	}: handleStartProjectProps): Promise<void> => {
		try {
			setIsPreparingProject('プロジェクトを起動中...');
			const allProjectContents = await axiosFetch.get<FetchAllContentsResponse>(
				`/api/supabase/project/allContents/${project.id}`
			);
			setTables(allProjectContents.tables);

			const extendedColumns = Object.keys(allProjectContents.columns).reduce(
				(acc, tableId) => {
					acc[tableId] = allProjectContents.columns[tableId].map((column) => ({
						...column,

						// 以下相手と共有しないフィールドを拡張追加
						isConstraintExpand: true,
					}));
					return acc;
				},
				{} as ColumnsStateProps
			);
			setColumns(extendedColumns);

			setInvitedUsers(allProjectContents.invitedUsers);
			setCurrentProject(project);
			setWindowMode('edit');

			setProjectSettingInfo({
				projectName: project.name,
				dbType: project.dbType,
			});

			setTableEditInfo((prevState) => {
				const updatedTableInfo = { ...prevState };
				Object.keys(allProjectContents.tables).forEach((tableId) => {
					const tableData = allProjectContents.tables[tableId];
					updatedTableInfo[tableId] = {
						name: tableData.name,
						color: tableData.color,
						projectId: tableData.projectId,
						position: tableData.position,
						id: tableData.id,
						isExpanded: tableData.isExpanded,
						isEditing: tableData.isEditing,
						createdAt: tableData.createdAt,
						updatedAt: tableData.updatedAt,
					};
				});
				return updatedTableInfo;
			});

			setColumnEditInfo((prevState) => {
				const updatedColumnInfo = { ...prevState };
				Object.keys(allProjectContents.columns).forEach((tableId) => {
					const columns = allProjectContents.columns[tableId];
					// 新しくオブジェクトを生成しないとなぜかcolumnEditInfoとcolumnsの内容が同期する模様
					// 原因不明
					// ChatGPTによると「setColumnEditInfo の中で、状態を更新する際にオブジェクトの参照が共有されてしまう問題は、JavaScriptのオブジェクトが参照型であることに起因しています。具体的には、元のオブジェクトを直接コピーすると、両者が同じ参照を持つため、一方の変更が他方に影響を及ぼすことがあります。」
					updatedColumnInfo[tableId] = columns.map((column) => ({
						id: column.id,
						name: column.name,
						tableId: column.tableId,
						projectId: column.projectId,
						sqliteType: column.sqliteType,
						supabaseType: column.supabaseType,
						createdAt: column.createdAt,
						updatedAt: column.updatedAt,
						columnConstraints: column.columnConstraints,

						// 以下拡張分。相手と共有しない、保存しないフィールド
						isConstraintExpand: true,
					}));
				});
				return updatedColumnInfo;
			});

			if (typeof window !== 'undefined' && window.ipc) {
				window.ipc.send('project-start');
			} else {
				console.error('IPC is not available');
			}
			setIsPreparingProject(null);
		} catch (error) {
			console.error(error);
			setIsPreparingProject(null);
		}
	};

	const handleEndProject = (): void => {
		window.location.reload();
		if (typeof window !== 'undefined' && window.ipc) {
			window.ipc.send('project-end');
		} else {
			console.error('IPC is not available');
		}
	};

	const handleAddTable = async ({
		projectId,
		tableName,
	}: handleAddTableProps): Promise<void> => {
		if (!channel) return;
		setIsTableAddMode(false);

		const tempCUID = generateCUID();

		setTables((prevTables) => {
			const tempTable: AddTableResponse = {
				id: tempCUID,
				projectId: projectId,
				color: palette.components.edit.reactFlow.tableHeader.default,
				name: tableName,
				position: {
					x: 0,
					y: 0,
				},
				isEditing: false,
				isExpanded: true,
			};
			return {
				...(prevTables || {}),
				[tempCUID]: tempTable,
			};
		});
		setTableEditInfo((prevInfo) => {
			const tempInfo: AddTableResponse = {
				id: tempCUID,
				projectId: projectId,
				color: palette.components.edit.reactFlow.tableHeader.default,
				name: tableName,
				position: {
					x: 0,
					y: 0,
				},
				isEditing: false,
				isExpanded: true,
			};
			return {
				...(prevInfo || {}),
				[tempCUID]: tempInfo,
			};
		});

		const newTable = await axiosFetch.post<AddTableResponse>(
			`/api/supabase/table`,
			{
				projectId: projectId,
				tableName: tableName,
				color: palette.components.edit.reactFlow.tableHeader.default,
				position: {
					x: 0,
					y: 0,
				},
			}
		);

		setTables((prevTables) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [tempCUID]: _, ...restTables } = prevTables || {};
			return {
				...restTables,
				[newTable.id]: newTable,
			};
		});
		setTableEditInfo((prevInfo) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [tempCUID]: _, ...restTables } = prevInfo || {};
			return {
				...restTables,
				[newTable.id]: newTable,
			};
		});

		channel.send({
			type: 'broadcast',
			event: 'table_add',
			payload: {
				newTable: newTable,
			} as TableChannelPayloadProps,
		});
	};

	const handleAddColumn = async ({
		name,
		tableId,
		dbType,
		projectId,
	}: handleAddColumnProps): Promise<void> => {
		try {
			if (!channel || !tables[tableId]?.isEditing) return;
			setAddColumnIndex(null);

			const tempCUID = generateCUID();
			setColumns((prevColumns) => {
				const newColumn: ColumnStatePropsExtended = {
					id: tempCUID,
					name: name,
					tableId: tableId,
					projectId: projectId,
					sqliteType: 'INTEGER',
					supabaseType: 'INT',
					columnConstraints: [],

					// 以下拡張分。
					isConstraintExpand: true,
				};
				if (!prevColumns) {
					return {
						...prevColumns,
						[tableId]: [newColumn],
					};
				}
				const prevTableColumns = prevColumns[tableId] || [];
				return {
					...prevColumns,
					[tableId]: [...prevTableColumns, newColumn],
				};
			});
			setColumnEditInfo((prevInfo) => {
				const newInfo: ColumnStatePropsExtended = {
					id: tempCUID,
					name: name,
					tableId: tableId,
					projectId: projectId,
					sqliteType: 'INTEGER',
					supabaseType: 'INT',
					columnConstraints: [],

					// 以下拡張分。
					isConstraintExpand: true,
				};
				if (!prevInfo) {
					return {
						...prevInfo,
						[tableId]: [newInfo],
					};
				}
				const prevColumnEditInfo = prevInfo[tableId] || [];
				return {
					...prevInfo,
					[tableId]: [...prevColumnEditInfo, newInfo],
				};
			});

			const newColumn = await axiosFetch.post<AddColumnResponse>(
				`/api/supabase/column`,
				{
					name: name,
					tableId: tableId,
					dbType: dbType,
					projectId: projectId,
				} as AddColumnRequest
			);

			// state用に型拡張
			const extendedNewColumn: ColumnStatePropsExtended = {
				...newColumn,
				isConstraintExpand: true,
			};

			handleOpenTableExpansion({ tableId: tableId });

			setColumns((prevColumns) => ({
				...prevColumns,
				[tableId]: prevColumns[tableId].map((col) =>
					col.id === tempCUID ? extendedNewColumn : col
				),
			}));
			setColumnEditInfo((prevInfo) => ({
				...prevInfo,
				[tableId]: prevInfo[tableId].map((col) =>
					col.id === tempCUID
						? {
								...extendedNewColumn,
							}
						: col
				),
			}));

			channel.send({
				type: 'broadcast',
				event: 'column_add',
				payload: {
					newColumn: newColumn,
				} as ColumnChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleOpenTableExpansion = ({
		tableId,
	}: handleOpenTableExpansionProps): void => {
		setTables((prevTables) => {
			if (!prevTables || !prevTables[tableId]) return prevTables;
			return {
				...prevTables,
				[tableId]: {
					...prevTables[tableId],
					isExpanded: true,
				},
			};
		});
	};

	const handleTableExpansion = async ({
		tableId,
	}: handleOpenTableExpansionProps): Promise<void> => {
		try {
			if (!tables || !tables[tableId] || !tables[tableId].isEditing || !channel)
				return;
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
			const updatedTable = await axiosFetch.put<AddTableResponse>(
				`/api/supabase/table/expand`,
				{
					tableId: tableId,
					isExpand: !tables[tableId].isExpanded,
				} as UpdateTableExpandRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'table_update',
				payload: {
					newTable: updatedTable,
				} as TableChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleTableEditMode = async ({
		tableId,
	}: handleTableEditProps): Promise<void> => {
		try {
			if (!tables || !tables[tableId] || !channel) return;
			setTables((prevTables) => {
				if (!prevTables || !prevTables[tableId]) return prevTables;
				return {
					...prevTables,
					[tableId]: {
						...prevTables[tableId],
						isEditing: !prevTables[tableId].isEditing,
					},
				};
			});
			const updatedTable = await axiosFetch.put<AddTableResponse>(
				`/api/supabase/table/lock`,
				{
					tableId: tableId,
					isEdit: !tables[tableId].isEditing,
				} as UpdateTableLockRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'table_update',
				payload: {
					newTable: updatedTable,
				} as TableChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleTableNameChange = ({
		tableId,
		event,
	}: handleTableNameChangeProps) => {
		setTableEditInfo((prevState) => ({
			...prevState,
			[tableId]: {
				...prevState[tableId],
				name: event.target.value,
			},
		}));
	};

	const handleTableNameUpdate = async ({
		tableId,
		name,
	}: handleTableNameUpdateProps): Promise<void> => {
		try {
			if (tables[tableId].name === tableEditInfo[tableId].name || !channel)
				return;
			setTables((prevTables) => {
				if (!prevTables || !prevTables[tableId]) return prevTables;
				return {
					...prevTables,
					[tableId]: {
						...prevTables[tableId],
						name: name,
					},
				};
			});
			const updatedTable = await axiosFetch.put<AddTableResponse>(
				`/api/supabase/table/name`,
				{
					tableId: tableId,
					name: name,
				} as UpdateTableNameRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'table_update',
				payload: {
					newTable: updatedTable,
				} as TableChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleTableColorChange = ({
		tableId,
		color,
	}: handleTableColorChangeProps) => {
		setTableEditInfo((prevState) => ({
			...prevState,
			[tableId]: {
				...prevState[tableId],
				color: color,
			},
		}));
	};

	const handleTableColorUpdate = async ({
		tableId,
		color,
	}: handleTableColorUpdateProps): Promise<void> => {
		try {
			if (tables[tableId].color === tableEditInfo[tableId].color || !channel)
				return;
			setTables((prevTables) => {
				if (!prevTables || !prevTables[tableId]) return prevTables;
				return {
					...prevTables,
					[tableId]: {
						...prevTables[tableId],
						color: color,
					},
				};
			});
			const updatedTable = await axiosFetch.put<AddTableResponse>(
				`/api/supabase/table/color`,
				{
					tableId: tableId,
					color: color,
				} as UpdateTableColorRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'table_update',
				payload: {
					newTable: updatedTable,
				} as TableChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleColumnNameChange = ({
		tableId,
		columnId,
		name,
	}: handleColumnNameChangeProps) => {
		setColumnEditInfo((prevState) => {
			const updatedState = { ...prevState };
			const columnArray = updatedState[tableId];
			const columnToUpdate = columnArray.find(
				(column) => column.id === columnId
			);
			if (columnToUpdate) {
				columnToUpdate.name = name;
			}
			return updatedState;
		});
	};

	const handleColumnNameUpdate = async ({
		tableId,
		columnId,
		name,
	}: handleColumnNameUpdateProps): Promise<void> => {
		try {
			if (!channel) return;

			const currentColumn = columns[tableId]?.find(
				(column) => column.id === columnId
			);
			if (!currentColumn || currentColumn.name === name) return;

			setColumns((prevState) => {
				const updatedState = { ...prevState };
				const columnArray = updatedState[tableId];
				const columnToUpdate = columnArray.find(
					(column) => column.id === columnId
				);
				if (columnToUpdate) {
					columnToUpdate.name = name;
				}
				return updatedState;
			});
			const updatedColumn = await axiosFetch.put<AddColumnResponse>(
				`/api/supabase/column/name`,
				{
					columnId: columnId,
					name: name,
				} as UpdateColumnNameRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'column_update',
				payload: {
					newColumn: updatedColumn,
				} as ColumnChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpdateColumnType = async ({
		tableId,
		columnId,
		dbType,
		sqliteType,
		supabaseType,
	}: handleUpdateColumnTypeProps): Promise<void> => {
		try {
			if (!channel) return;

			const currentColumn = columns[tableId]?.find(
				(column) => column.id === columnId
			);
			if (
				!currentColumn ||
				(dbType === 'SQLITE' && !sqliteType) ||
				(dbType === 'SUPABASE' && !supabaseType) ||
				(dbType === 'SQLITE' && currentColumn.sqliteType === sqliteType) ||
				(dbType === 'SUPABASE' && currentColumn.supabaseType === supabaseType)
			) {
				return;
			}

			setColumns((prevState) => {
				const updatedState = { ...prevState };
				const columnIndex = updatedState[tableId].findIndex(
					(col) => col.id === columnId
				);
				if (columnIndex !== -1) {
					if (dbType === 'SQLITE') {
						updatedState[tableId][columnIndex].sqliteType = sqliteType;
					} else if (dbType === 'SUPABASE') {
						updatedState[tableId][columnIndex].supabaseType = supabaseType;
					}
				}
				return updatedState;
			});

			const updatedColumn = await axiosFetch.put<AddColumnResponse>(
				`/api/supabase/column/type`,
				{
					columnId: columnId,
					dbType: dbType,
					sqliteType: sqliteType,
					supabaseType: supabaseType,
				} as UpdateColumnTypeRequest
			);

			channel.send({
				type: 'broadcast',
				event: 'column_update',
				payload: {
					newColumn: updatedColumn,
				} as ColumnChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddConstraint = async ({
		columnId,
		type,
		value,
		projectId,
		sqliteClauseType,
		primaryKeyId,
	}: handleAddConstraintProps): Promise<void> => {
		try {
			if (!channel) return;

			setColumnConstraintEditInfo({
				columnId: null,
				columnConstraintType: null,
				clauseType: null,
				primaryKeyId: null,
				value: null,
				errorText: null,
			});

			await axiosFetch.post<ColumnConstraintResponse>(
				`/api/supabase/constraint/sqlite`,
				{
					columnId: columnId,
					type: type,
					value: value,
					sqliteClauseType: sqliteClauseType,
					primaryKeyId: primaryKeyId,
				} as AddColumnConstraintRequest
			);

			// 制約の追加は複数のカラムの更新を伴うので、全カラムを取得し以下で更新する。
			const updatedColumns = await axiosFetch.get<AddColumnResponse[]>(
				`/api/supabase/column/project/${projectId}`
			);

			setColumns((prevColumns) => {
				// updatedColumnsをテーブルIDごとにグループ分け
				const updatedColumnsByTableId = updatedColumns.reduce(
					(acc, updatedColumn) => {
						// 該当するテーブルIDがaccに存在しない場合は新しく作成
						if (!acc[updatedColumn.tableId]) {
							acc[updatedColumn.tableId] = [];
						}

						// 該当するカラム情報を更新する
						const existingColumn = prevColumns[updatedColumn.tableId]?.find(
							(column) => column.id === updatedColumn.id
						);

						// 既存のカラムがあれば、拡張分は元の値を保持し、それ以外は新しい値で更新
						const updatedColumnState: ColumnStatePropsExtended = {
							...existingColumn, // 既存のカラムの情報をベースにする
							...updatedColumn, // 新しいカラムの情報を上書き
							isConstraintExpand: existingColumn?.isConstraintExpand ?? false, // 拡張分は元の値を保持
						};

						// 該当するテーブルIDにカラムを追加
						acc[updatedColumn.tableId].push(updatedColumnState);

						return acc;
					},
					{} as { [key: string]: ColumnStatePropsExtended[] }
				);

				// グループ分けされた結果を元にstateを更新
				return {
					...prevColumns,
					...updatedColumnsByTableId, // テーブルIDごとのカラム配列を更新
				};
			});

			channel.send({
				type: 'broadcast',
				event: 'columns_update',
				payload: {
					newColumns: updatedColumns,
				} as ColumnsChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteConstraint = async ({
		id,
		type,
		projectId,
	}: handleDeleteConstraintProps): Promise<void> => {
		try {
			if (!channel) return;
			setIsConstraintDeleting(true);

			setColumnConstraintEditInfo({
				columnId: null,
				columnConstraintType: null,
				clauseType: null,
				primaryKeyId: null,
				value: null,
				errorText: null,
			});

			await axiosFetch.delete<ColumnConstraintResponse>(
				`/api/supabase/constraint/sqlite`,
				{
					id: id,
					type: type,
				} as DeleteColumnConstraintRequest
			);

			// 制約の削除は複数のカラムの更新を伴うので、全カラムを取得し以下で更新する。
			const updatedColumns = await axiosFetch.get<AddColumnResponse[]>(
				`/api/supabase/column/project/${projectId}`
			);

			setColumns((prevColumns) => {
				// updatedColumnsをテーブルIDごとにグループ分け
				const updatedColumnsByTableId = updatedColumns.reduce(
					(acc, updatedColumn) => {
						// 該当するテーブルIDがaccに存在しない場合は新しく作成
						if (!acc[updatedColumn.tableId]) {
							acc[updatedColumn.tableId] = [];
						}

						// 該当するカラム情報を更新する
						const existingColumn = prevColumns[updatedColumn.tableId]?.find(
							(column) => column.id === updatedColumn.id
						);

						// 既存のカラムがあれば、拡張分は元の値を保持し、それ以外は新しい値で更新
						const updatedColumnState: ColumnStatePropsExtended = {
							...existingColumn, // 既存のカラムの情報をベースにする
							...updatedColumn, // 新しいカラムの情報を上書き
							isConstraintExpand: existingColumn?.isConstraintExpand ?? false, // 拡張分は元の値を保持
						};

						// 該当するテーブルIDにカラムを追加
						acc[updatedColumn.tableId].push(updatedColumnState);

						return acc;
					},
					{} as { [key: string]: ColumnStatePropsExtended[] }
				);

				// グループ分けされた結果を元にstateを更新
				return {
					...prevColumns,
					...updatedColumnsByTableId, // テーブルIDごとのカラム配列を更新
				};
			});

			channel.send({
				type: 'broadcast',
				event: 'columns_update',
				payload: {
					newColumns: updatedColumns,
				} as ColumnsChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsConstraintDeleting(false);
		}
	};

	const handleChangeProjectName = async ({
		name,
	}: handleChangeProjectNameProps) => {
		try {
			if (!currentProject || projectSettingInfo.projectName.length === 0)
				return;
			setProjectSettingChanging('name');
			const newProject = await axiosFetch.patch<ProjectsResponse>(
				`/api/supabase/project/name`,
				{
					id: currentProject.id,
					name: name,
				} as UpdateProjectNameRequest
			);
			setCurrentProject((prev) => ({
				...prev,
				name: newProject.name,
			}));
			channel.send({
				type: 'broadcast',
				event: 'project_update',
				payload: {
					newProject: newProject,
				} as ProjectChannelPayloadProps,
			});
		} catch (error) {
			console.log(error);
		} finally {
			setProjectSettingChanging(null);
		}
	};

	const handleChangeProjectDBType = async ({
		type,
	}: handleChangeProjectDBTypeProps) => {
		try {
			if (
				!currentProject ||
				projectSettingInfo.dbType === currentProject.dbType
			)
				return;
			setProjectSettingChanging('dbType');
			const newProjectInfo =
				await axiosFetch.patch<UpdateProjectDBTypeResponse>(
					`/api/supabase/project/dbType`,
					{
						id: currentProject.id,
						type: type,
					} as UpdateProjectDBTypeRequest
				);

			setColumns((prevColumns) => {
				// updatedColumnsをテーブルIDごとにグループ分け
				const updatedColumnsByTableId = newProjectInfo.columns.reduce(
					(acc, updatedColumn) => {
						// 該当するテーブルIDがaccに存在しない場合は新しく作成
						if (!acc[updatedColumn.tableId]) {
							acc[updatedColumn.tableId] = [];
						}

						// 該当するカラム情報を更新する
						const existingColumn = prevColumns[updatedColumn.tableId]?.find(
							(column) => column.id === updatedColumn.id
						);

						// 既存のカラムがあれば、拡張分は元の値を保持し、それ以外は新しい値で更新
						const updatedColumnState: ColumnStatePropsExtended = {
							...existingColumn, // 既存のカラムの情報をベースにする
							...updatedColumn, // 新しいカラムの情報を上書き
							isConstraintExpand: existingColumn?.isConstraintExpand ?? false, // 拡張分は元の値を保持
						};

						// 該当するテーブルIDにカラムを追加
						acc[updatedColumn.tableId].push(updatedColumnState);

						return acc;
					},
					{} as { [key: string]: ColumnStatePropsExtended[] }
				);

				// グループ分けされた結果を元にstateを更新
				return {
					...prevColumns,
					...updatedColumnsByTableId, // テーブルIDごとのカラム配列を更新
				};
			});
			setCurrentProject((prev) => ({
				...prev,
				dbType: newProjectInfo.project.dbType,
			}));
			channel.send({
				type: 'broadcast',
				event: 'project_update',
				payload: {
					newProject: newProjectInfo.project,
				} as ProjectChannelPayloadProps,
			});
		} catch (error) {
			console.log(error);
		} finally {
			setProjectSettingChanging(null);
		}
	};

	const handleNodeDragStop = async ({ node }: handleNodeDragStopProps) => {
		try {
			if (!channel) return;
			const { id, position } = node;
			setTables((prevTables) => {
				if (!prevTables || !prevTables[id]) return prevTables;
				return {
					...prevTables,
					[id]: {
						...prevTables[id],
						position: position,
					},
				};
			});
			const updatedTable = await axiosFetch.put<UpdateTablePositionResponse>(
				'/api/supabase/table/position',
				{
					tableId: id,
					position: position,
				}
			);

			channel.send({
				type: 'broadcast',
				event: 'table_update',
				payload: {
					newTable: updatedTable,
				} as TableChannelPayloadProps,
			});
		} catch (error) {
			console.error(error);
		}
	};

	return {
		userProjects,
		setUserProjects,
		currentProject,
		setCurrentProject,
		addConstraintColumnId,
		setAddConstraintColumnId,
		tableEditInfo,
		setTableEditInfo,
		columnEditInfo,
		setColumnEditInfo,
		columnConstraintEditInfo,
		setColumnConstraintEditInfo,
		channel,
		setChannel,
		projectSettingInfo,
		setProjectSettingInfo,
		projectSettingChanging,
		setProjectSettingChanging,

		handleCreateProject,
		handleFetchUserProjects,
		handleStartProject,
		handleEndProject,
		handleAddTable,
		handleAddColumn,
		handleOpenTableExpansion,
		handleTableEditMode,
		handleTableExpansion,
		handleTableNameChange,
		handleTableNameUpdate,
		handleTableColorChange,
		handleTableColorUpdate,
		handleColumnNameChange,
		handleColumnNameUpdate,
		handleUpdateColumnType,
		handleAddConstraint,
		handleDeleteConstraint,
		handleChangeProjectName,
		handleChangeProjectDBType,
		handleNodeDragStop,
	};
};
