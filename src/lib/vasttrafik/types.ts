export interface Departures {
	results: Result[];
	pagination: Pagination;
	links: Links;
}

export interface Result {
	detailsReference: string;
	serviceJourney: ServiceJourney;
	stopPoint: StopPoint;
	plannedTime: string;
	estimatedTime: string;
	estimatedOtherwisePlannedTime: string;
	isCancelled: boolean;
	isPartCancelled: boolean;
}

export interface ServiceJourney {
	gid: string;
	direction: string;
	directionDetails: DirectionDetails;
	line: Line;
}

export interface DirectionDetails {
	fullDirection: string;
	shortDirection: string;
	via?: string;
}

export interface Line {
	gid: string;
	name: string;
	shortName: string;
	designation: string;
	backgroundColor: string;
	foregroundColor: string;
	borderColor: string;
	transportMode: string;
	transportSubMode: string;
	isWheelchairAccessible: boolean;
	isRealtimeJourney: boolean;
	operator: string;
}

export interface StopPoint {
	gid: string;
	name: string;
	platform: string;
	latitude: number;
	longitude: number;
	stopPointType: string;
}

export interface Pagination {
	limit: number;
	offset: number;
	size: number;
}

export interface Links {
	next: string;
	current: string;
}

export interface Locations {
	results: Location[];
	pagination: Pagination;
	links: Links;
}

export interface Location {
	gid: string;
	name: string;
	locationType: string;
	latitude: number;
	longitude: number;
	platform?: string;
	straightLineDistanceInMeters?: number;
	hasLocalService?: boolean;
}
