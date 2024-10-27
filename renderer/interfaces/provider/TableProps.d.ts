export interface TableProps {
	id: string;
	name: string;
	columns: string[];
	color: string;
	isExpanded: boolean;
	position: {
		x: number;
		y: number;
	};
}

export type TablesStateProps = { [key: string]: TableProps } | null;