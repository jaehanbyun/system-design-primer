import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { splitTitle } from '~/utils/site';

type SidebarEntry = StarlightRouteData['sidebar'][number];

// Page titles carry an English gloss, e.g. `캐시 (Cache)`. The sidebar and prev/next links
// are narrow, so they show only the Korean part; the full title stays on the page itself.
function shorten(entries: SidebarEntry[]): void {
	for (const entry of entries) {
		if (entry.type === 'group') shorten(entry.entries);
		else entry.label = splitTitle(entry.label).main;
	}
}

export const onRequest = defineRouteMiddleware((context) => {
	const route = context.locals.starlightRoute;
	shorten(route.sidebar);
	for (const link of [route.pagination.prev, route.pagination.next]) {
		if (link) link.label = splitTitle(link.label).main;
	}
});
