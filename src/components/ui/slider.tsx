import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

function Slider({
	className,
	trackClassName,
	indicatorClassName,
	trackStyle,
	...props
}: SliderPrimitive.Root.Props<number> & {
	trackClassName?: string;
	indicatorClassName?: string;
	trackStyle?: React.CSSProperties;
}) {
	return (
		<SliderPrimitive.Root
			data-slot="slider"
			className={cn("w-full touch-none select-none", className)}
			{...props}
		>
			<SliderPrimitive.Control className="flex h-8 w-full items-center">
				<SliderPrimitive.Track
					data-slot="slider-track"
					className={cn(
						"relative h-3 w-full rounded-full bg-muted",
						trackClassName,
					)}
					style={trackStyle}
				>
					<SliderPrimitive.Indicator
						data-slot="slider-indicator"
						className={cn("rounded-full bg-primary", indicatorClassName)}
					/>
					<SliderPrimitive.Thumb
						data-slot="slider-thumb"
						className="size-6 rounded-full bg-white shadow-md ring-1 ring-foreground/20 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
					/>
				</SliderPrimitive.Track>
			</SliderPrimitive.Control>
		</SliderPrimitive.Root>
	);
}

export { Slider };
