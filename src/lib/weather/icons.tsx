import {
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudHail,
	CloudLightning,
	CloudRain,
	CloudRainWind,
	CloudSnow,
	CloudSun,
	type LucideIcon,
	type LucideProps,
	Sun,
} from "lucide-react";

export const WEATHER_ICONS: Record<number, LucideIcon> = {
	0: Sun, // Klart
	1: CloudSun, // Mest klart
	2: CloudSun, // Delvis molnigt
	3: Cloud, // Mulet
	45: CloudFog, // Dimma
	48: CloudFog, // Rimfrost
	51: CloudDrizzle, // Lätt duggregn
	53: CloudDrizzle, // Duggregn
	55: CloudDrizzle, // Kraftigt duggregn
	61: CloudRain, // Lätt regn
	63: CloudRain, // Regn
	65: CloudRain, // Kraftigt regn
	71: CloudSnow, // Lätt snö
	73: CloudSnow, // Snö
	75: CloudSnow, // Kraftig snö
	80: CloudRainWind, // Regnskurar
	81: CloudRainWind, // Kraftiga regnskurar
	82: CloudRainWind, // Kraftiga skurar
	95: CloudLightning, // Åska
	96: CloudHail, // Åska med hagel
	99: CloudHail, // Åska med hagel
};

export function WeatherIcon({
	condition,
	className,
	...props
}: {
	condition: number;
	className?: string;
} & LucideProps) {
	const Icon = WEATHER_ICONS[condition] ?? Cloud; // sensible fallback
	return <Icon {...props} className={className} />;
}
