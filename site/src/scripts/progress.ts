/**
 * Client-side study progress, persisted in localStorage.
 * Ids are docs slugs (`topics/cache`) for pages and `<plan>:<task>` for custom tasks.
 */
const KEY = 'sdp:progress:v1';
const EVENT = 'sdp:progress';

type ProgressMap = Record<string, number>;

function read(): ProgressMap {
	try {
		const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

export function isDone(id: string): boolean {
	return Boolean(read()[id]);
}

export function doneIds(): Set<string> {
	return new Set(Object.keys(read()));
}

export function setDone(id: string, done: boolean): void {
	const map = read();
	if (done) map[id] = Date.now();
	else delete map[id];
	try {
		localStorage.setItem(KEY, JSON.stringify(map));
	} catch {
		// Storage can be unavailable (private mode, quota); progress just won't persist.
	}
	window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, done } }));
}

export function resetAll(ids?: string[]): void {
	if (!ids) {
		localStorage.removeItem(KEY);
	} else {
		const map = read();
		for (const id of ids) delete map[id];
		localStorage.setItem(KEY, JSON.stringify(map));
	}
	window.dispatchEvent(new CustomEvent(EVENT, { detail: {} }));
}

/** Runs `callback` now and whenever progress changes in this tab or another one. */
export function subscribe(callback: () => void): void {
	callback();
	window.addEventListener(EVENT, callback);
	window.addEventListener('storage', (event) => {
		if (event.key === KEY) callback();
	});
}

/** Maps an in-site URL to its progress id (docs slug). */
export function idFromPath(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
	const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
	return path.replace(/^\/+|\/+$/g, '').replace(/#.*$/, '');
}
