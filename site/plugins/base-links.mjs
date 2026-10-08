// Prefixes the configured Astro `base` to root-relative links in Markdown/MDX content,
// so authors can write `/topics/cache/` regardless of where the site is deployed.

/** @param {string} base */
function normalizeBase(base) {
	const trimmed = base.replace(/\/+$/, '');
	return trimmed === '' ? '' : trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * @param {string} href
 * @param {string} base normalized base without trailing slash
 */
export function withBase(href, base) {
	if (!base || !href.startsWith('/') || href.startsWith('//')) return href;
	if (href === base || href.startsWith(`${base}/`)) return href;
	return `${base}${href}`;
}

/** @param {string} rawBase */
export function rehypeBaseLinks(rawBase) {
	const base = normalizeBase(rawBase);
	/** @param {any} node */
	const walk = (node) => {
		if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
			node.properties.href = withBase(node.properties.href, base);
		}
		if (node.children) for (const child of node.children) walk(child);
	};
	return () => walk;
}

/**
 * Starlight plugin wrapper. Must be listed before `starlight-links-validator`
 * so the validator sees the final, base-prefixed links.
 * @param {string} base
 * @returns {import('@astrojs/starlight/types').StarlightPlugin}
 */
export default function baseLinks(base) {
	return {
		name: 'sdp-base-links',
		hooks: {
			'config:setup'({ addIntegration }) {
				addIntegration({
					name: 'sdp-base-links',
					hooks: {
						'astro:config:setup'({ config }) {
							const processor = /** @type {any} */ (config.markdown.processor);
							if (processor?.name !== 'unified') {
								throw new Error(
									`sdp-base-links expects the unified markdown processor, got "${processor?.name}".`,
								);
							}
							processor.options.rehypePlugins.push(rehypeBaseLinks(base));
						},
					},
				});
			},
		},
	};
}
