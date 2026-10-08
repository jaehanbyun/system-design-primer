// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkCjkFriendly from 'remark-cjk-friendly';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLinksValidator from 'starlight-links-validator';
import baseLinks from './plugins/base-links.mjs';

// CI passes the values reported by `actions/configure-pages`, so forks and custom
// domains work without edits. Local builds default to the GitHub Pages project URL.
const repo = process.env.GITHUB_REPOSITORY || 'jaehanbyun/system-design-primer';
const site = process.env.SITE_URL || `https://${repo.split('/')[0]}.github.io`;
const base = process.env.BASE_PATH ?? `/${repo.split('/')[1]}`;
const branch = process.env.DEFAULT_BRANCH || 'master';

export default defineConfig({
	site,
	base: base || '/',
	trailingSlash: 'always',
	markdown: {
		// CommonMark does not close `**강조(emphasis)**` when a Korean particle follows punctuation;
		// remark-cjk-friendly relaxes that rule so Korean prose renders as written.
		processor: unified({ remarkPlugins: [remarkCjkFriendly] }),
	},
	integrations: [
		starlight({
			title: 'System Design Primer',
			description:
				'대규모 시스템 설계를 배우고 시스템 설계 면접을 준비하는 한국어 학습 사이트. donnemartin/system-design-primer를 학습 가이드 중심으로 재구성했습니다.',
			locales: { root: { label: '한국어', lang: 'ko' } },
			logo: { src: './src/assets/logo.svg' },
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'GitHub', href: `https://github.com/${repo}` }],
			editLink: { baseUrl: `https://github.com/${repo}/edit/${branch}/site/` },
			lastUpdated: true,
			customCss: [
				'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css',
				'./src/styles/theme.css',
			],
			routeMiddleware: './src/routeData.ts',
			components: {
				PageTitle: './src/components/overrides/PageTitle.astro',
				Footer: './src/components/overrides/Footer.astro',
				Hero: './src/components/overrides/Hero.astro',
			},
			head: [
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#0b1020' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/og.png` } },
			],
			plugins: [
				// Keep before the validator so it validates the final, base-prefixed links.
				baseLinks(base),
				starlightImageZoom(),
				starlightLinksValidator({ errorOnRelativeLinks: true }),
			],
			sidebar: [
				{
					label: '학습 가이드',
					items: [
						{ slug: 'guide', label: '어떻게 공부할까?' },
						{ slug: 'guide/short' },
						{ slug: 'guide/medium' },
						{ slug: 'guide/long' },
					],
				},
				{
					label: '면접 준비',
					items: [
						{ slug: 'interview/approach' },
						{ slug: 'interview/estimation' },
						{ slug: 'practice/additional-questions' },
						{ slug: 'practice/flashcards' },
					],
				},
				{
					label: '시스템 설계 주제',
					items: [
						{ slug: 'topics', label: '주제 지도' },
						{ slug: 'topics/start-here', label: '여기서 시작하기' },
						{
							label: '핵심 트레이드오프',
							items: [
								'topics/performance-vs-scalability',
								'topics/latency-vs-throughput',
								'topics/availability-vs-consistency',
								'topics/consistency-patterns',
								'topics/availability-patterns',
							],
						},
						{
							label: '트래픽의 입구',
							items: ['topics/dns', 'topics/cdn', 'topics/load-balancer', 'topics/reverse-proxy'],
						},
						'topics/application-layer',
						{
							label: '데이터베이스',
							items: [
								{ slug: 'topics/database/rdbms', label: '관계형 데이터베이스' },
								'topics/database/nosql',
								'topics/database/sql-or-nosql',
							],
						},
						'topics/cache',
						'topics/asynchronism',
						'topics/communication',
						'topics/security',
					],
				},
				{
					label: '시스템 설계 문제',
					collapsed: true,
					items: [
						{ slug: 'system-design', label: '문제 목록' },
						'system-design/pastebin',
						'system-design/twitter',
						'system-design/web-crawler',
						'system-design/mint',
						'system-design/social-graph',
						'system-design/query-cache',
						'system-design/sales-rank',
						'system-design/scaling-aws',
					],
				},
				{
					label: '객체 지향 설계 문제',
					collapsed: true,
					items: [
						{ slug: 'ood', label: '문제 목록' },
						'ood/hash-map',
						'ood/lru-cache',
						'ood/call-center',
						'ood/deck-of-cards',
						'ood/parking-lot',
						'ood/online-chat',
					],
				},
				{
					label: '실제 사례',
					collapsed: true,
					items: [
						'resources/real-world-architectures',
						'resources/company-architectures',
						'resources/engineering-blogs',
					],
				},
				{
					label: '부록',
					collapsed: true,
					items: ['appendix/powers-of-two', 'appendix/latency-numbers', 'about'],
				},
			],
		}),
	],
});
