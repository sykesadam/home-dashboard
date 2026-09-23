//  --- Shared calendar (Apple/iCloud) ---
//  In the Calendar app on Mac: right-click a calendar in the sidebar ->
//  "Share Calendar" -> turn on "Public Calendar" -> "Copy Link".
//  It starts with "webcal://" -- change that prefix to "https://" below.
//  Add one entry per person so both calendars merge into one "Today" widget.
export const CALENDARS = [
	{
		name: "Adam",
		url: "https://p68-caldav.icloud.com/published/2/MTEzNTQwNTM5MjIxMTM1NBBnHolon0gnMfKALQyhN8-AxriqXTHiynjqax1pc-a-",
		color: "#7FA8D9",
	},
	{
		name: "Chloe",
		url: "https://p159-caldav.icloud.com/published/2/MTE1MTUxMDMzNjcxMTUxNT72J9eGWHd7Qq8Zv8tCz7hIJKnLr_DqOjWQ0N3o-Odt",
		color: "#DD4EF0",
	},
];

// How many days ahead the "Today" widget should look (1 = today only, 2 = today + tomorrow)
export const CALENDAR_LOOKAHEAD_DAYS = 3;
