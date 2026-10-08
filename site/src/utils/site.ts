const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Builds an internal URL from a docs slug (`topics/cache`) or returns absolute URLs unchanged. */
export function href(target: string): string {
	if (/^[a-z]+:\/\//i.test(target)) return target;
	const [path = '', hash] = target.split('#');
	const clean = path.replace(/^\/+|\/+$/g, '');
	const url = clean ? `${base}/${clean}/` : `${base}/`;
	return hash ? `${url}#${hash}` : url;
}

export const isExternal = (target: string) => /^[a-z]+:\/\//i.test(target);

/**
 * Rough reading time for mixed Korean/English technical prose.
 * Code blocks, HTML and Markdown syntax are excluded; ~450 visible characters per minute.
 */
export function readingMinutes(body: string | undefined): number {
	if (!body) return 1;
	const text = body
		.replace(/^---[\s\S]*?---/, '')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/^import .*$/gm, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_`|:-]/g, ' ')
		.replace(/\s+/g, '');
	return Math.max(1, Math.round(text.length / 450));
}

/** Splits `캐시 (Cache)` into its Korean title and trailing English gloss. */
export function splitTitle(title: string): { main: string; en?: string } {
	const match = title.match(/^(.+?)\s*\(([^()]*[A-Za-z][^()]*)\)$/);
	return match ? { main: match[1]!, en: match[2] } : { main: title };
}

/** Content pages get reading time and the "mark as studied" toggle; landing pages do not. */
export function isTrackable(id: string, override?: boolean): boolean {
	return override ?? (id.includes('/') && !id.startsWith('guide/'));
}
