import { windowModeProps } from './windowModeProps';
import { TablesStateProps } from './TableProps';
import { ColumnsStateProps } from './ColumnProps';
import React from 'react';
import {
	FetchNotifyInvitedUserResponse,
	FetchUserProjectsResponse,
	NotifyWithDetail,
} from '../api';
import { UserSearchResultsProps } from './UserSearchResultsProps';
import { UserPopperViewModeProps } from './UserPopperViewModeProps';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ColumnConstraintEditInfoProps } from './ColumnConstraintEditInfoProps';
import { ProjectSettingInfoProps } from './ProjectSettingInfoProps';
import { ProjectSettingChangingProps } from './ProjectSettingChangingProps';

export interface ContextProviderProps {
	EditLeftBarTableAreaRef: React.RefObject<HTMLDivElement | null>;
	EditReactFlowAreaRef: React.RefObject<HTMLDivElement | null>;
	EditFooterAddColumnIconRef: React.RefObject<HTMLDivElement | null>;
	EditRightPopperRef: React.RefObject<HTMLDivElement | null>;

	windowMode: windowModeProps;
	setWindowMode: React.Dispatch<React.SetStateAction<windowModeProps | null>>;
	isMic: boolean;
	setIsMic: React.Dispatch<React.SetStateAction<boolean>>;
	isAudio: boolean;
	setIsAudio: React.Dispatch<React.SetStateAction<boolean>>;
	tables: TablesStateProps | null;
	setTables: React.Dispatch<React.SetStateAction<TablesStateProps | null>>;
	columns: ColumnsStateProps;
	setColumns: React.Dispatch<React.SetStateAction<ColumnsStateProps>>;
	columnConstraintEditInfo: ColumnConstraintEditInfoProps | null;
	setColumnConstraintEditInfo: React.Dispatch<
		React.SetStateAction<ColumnConstraintEditInfoProps | null>
	>;
	addConstraintColumnId: string | null;
	setAddConstraintColumnId: React.Dispatch<React.SetStateAction<string | null>>;
	isTableAddMode: boolean;
	setIsTableAddMode: React.Dispatch<React.SetStateAction<boolean>>;
	addColumnIndex: string | null;
	setAddColumnIndex: React.Dispatch<React.SetStateAction<string | null>>;
	constraintEditingTableId: string | null;
	setConstraintEditingTableId: React.Dispatch<
		React.SetStateAction<string | null>
	>;
	selectedTableId: string | null;
	setSelectedTableId: React.Dispatch<React.SetStateAction<string | null>>;
	lastSelectedTableId: string | null;
	setLastSelectedTableId: React.Dispatch<React.SetStateAction<string | null>>;
	isEditLeftBar: boolean;
	setIsEditLeftBar: React.Dispatch<React.SetStateAction<boolean>>;
	isEditRightPopper: boolean;
	setIsEditRightPopper: React.Dispatch<React.SetStateAction<boolean>>;
	userProjects: FetchUserProjectsResponse[] | null;
	setUserProjects: React.Dispatch<
		React.SetStateAction<FetchUserProjectsResponse[] | null>
	>;
	currentProject: FetchUserProjectsResponse | null;
	setCurrentProject: React.Dispatch<
		React.SetStateAction<FetchUserProjectsResponse | null>
	>;
	isPreparingProject: string | null;
	setIsPreparingProject: React.Dispatch<React.SetStateAction<string | null>>;
	tableEditInfo: TablesStateProps;
	setTableEditInfo: React.Dispatch<React.SetStateAction<TablesStateProps>>;
	columnEditInfo: ColumnsStateProps;
	setColumnEditInfo: React.Dispatch<React.SetStateAction<ColumnsStateProps>>;
	userSearchResults: UserSearchResultsProps;
	setUserSearchResults: React.Dispatch<
		React.SetStateAction<UserSearchResultsProps>
	>;
	userPopperViewMode: UserPopperViewModeProps;
	setUserPopperViewMode: React.Dispatch<
		React.SetStateAction<UserPopperViewModeProps>
	>;
	invitedUsers: FetchNotifyInvitedUserResponse[];
	setInvitedUsers: React.Dispatch<
		React.SetStateAction<FetchNotifyInvitedUserResponse[]>
	>;
	notifies: NotifyWithDetail[];
	setNotifies: React.Dispatch<React.SetStateAction<NotifyWithDetail[]>>;
	channel: RealtimeChannel | null;
	setChannel: React.Dispatch<React.SetStateAction<RealtimeChannel | null>>;
	isConstraintDeleting: boolean;
	setIsConstraintDeleting: React.Dispatch<React.SetStateAction<boolean>>;
	projectSettingInfo: ProjectSettingInfoProps;
	setProjectSettingInfo: React.Dispatch<
		React.SetStateAction<ProjectSettingInfoProps>
	>;
	projectSettingChanging: ProjectSettingChangingProps;
	setProjectSettingChanging: React.Dispatch<
		React.SetStateAction<ProjectSettingChangingProps>
	>;
}
