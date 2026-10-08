/**
 * Study plans derived from the "Study guide" section of the upstream README.
 *
 * The upstream guide only says *what* to cover per timeline (short / medium / long) and
 * how much practice ("Some" / "Many" / "Most"). These plans turn that table into ordered,
 * checkable phases. Page tasks use the docs slug as their id, so marking a page as studied
 * on the page itself also ticks it in every plan that includes it.
 */

export type PlanId = 'short' | 'medium' | 'long';
export type TaskKind = 'read' | 'watch' | 'practice' | 'review';

export interface PageTask {
	/** Docs slug, e.g. `topics/cache`. Title and reading time come from the page itself. */
	page: string;
	kind?: TaskKind;
	note?: string;
}

export interface CustomTask {
	/** Stable progress id. Prefix with the plan id so plans track it independently. */
	id: string;
	label: string;
	kind: TaskKind;
	/** Docs slug (no leading slash) or absolute URL. */
	href?: string;
	note?: string;
}

export type Task = PageTask | CustomTask;

export interface Phase {
	title: string;
	when: string;
	goal: string;
	tasks: Task[];
}

export interface Plan {
	id: PlanId;
	label: string;
	title: string;
	duration: string;
	focus: string;
	practice: 'Some' | 'Many' | 'Most';
	practiceLabel: string;
	summary: string;
	phases: Phase[];
}

export const isPageTask = (task: Task): task is PageTask => 'page' in task;
export const taskId = (task: Task) => (isPageTask(task) ? task.page : task.id);

const tradeoffs: Task[] = [
	{ page: 'topics/performance-vs-scalability' },
	{ page: 'topics/latency-vs-throughput' },
	{ page: 'topics/availability-vs-consistency' },
	{ page: 'topics/consistency-patterns' },
	{ page: 'topics/availability-patterns' },
];

const edge: Task[] = [
	{ page: 'topics/dns' },
	{ page: 'topics/cdn' },
	{ page: 'topics/load-balancer' },
	{ page: 'topics/reverse-proxy' },
];

const dataLayer: Task[] = [
	{ page: 'topics/application-layer' },
	{ page: 'topics/database/rdbms' },
	{ page: 'topics/database/nosql' },
	{ page: 'topics/database/sql-or-nosql' },
	{ page: 'topics/cache' },
	{ page: 'topics/asynchronism' },
	{ page: 'topics/communication' },
	{ page: 'topics/security' },
];

const interviewBasics: Task[] = [
	{ page: 'interview/approach' },
	{ page: 'interview/estimation', kind: 'practice' },
	{ page: 'appendix/latency-numbers', kind: 'review' },
	{ page: 'appendix/powers-of-two', kind: 'review' },
];

const papers = {
	mapreduce: 'http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/mapreduce-osdi04.pdf',
	gfs: 'http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/gfs-sosp2003.pdf',
	bigtable: 'http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf',
	dynamo: 'http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf',
	spanner: 'http://research.google.com/archive/spanner-osdi2012.pdf',
	memcache: 'https://cs.uwaterloo.ca/~brecht/courses/854-Emerging-2014/readings/key-value/fb-memcached-nsdi-2013.pdf',
};

export const plans: Record<PlanId, Plan> = {
	short: {
		id: 'short',
		label: '단기',
		title: '단기 플랜',
		duration: '약 1–2주',
		focus: '넓게',
		practice: 'Some',
		practiceLabel: '일부',
		summary:
			'면접이 코앞이라면 모든 주제를 한 번씩 훑어 큰 그림을 잡고, 대표 문제 몇 개로 면접 흐름을 몸에 익히는 데 집중합니다.',
		phases: [
			{
				title: '시스템 설계의 큰 그림',
				when: '1–2일',
				goal: '확장성 강의와 핵심 트레이드오프로 공통 어휘를 익힙니다.',
				tasks: [{ page: 'topics/start-here', kind: 'watch' }, ...tradeoffs],
			},
			{
				title: '구성 요소 한 바퀴',
				when: '3–4일',
				goal: '요청이 사용자에서 데이터베이스까지 가는 길에 놓인 구성 요소를 모두 한 번씩 봅니다.',
				tasks: [...edge, ...dataLayer],
			},
			{
				title: '면접 진행법 익히기',
				when: '1일',
				goal: '4단계 접근법과 어림 계산을 손에 익힙니다.',
				tasks: interviewBasics,
			},
			{
				title: '문제 풀이 — 일부(Some)',
				when: '3–4일',
				goal: '대표 문제를 먼저 혼자 풀어 본 뒤 해설과 비교합니다.',
				tasks: [
					{ page: 'system-design/pastebin', kind: 'practice' },
					{ page: 'system-design/twitter', kind: 'practice' },
					{ page: 'system-design/scaling-aws', kind: 'practice' },
					{ page: 'ood/lru-cache', kind: 'practice' },
					{ page: 'ood/parking-lot', kind: 'practice' },
					{
						id: 'short:additional-questions',
						label: '추가 면접 질문 2–3개를 골라 4단계 접근법으로 풀어 보기',
						kind: 'practice',
						href: 'practice/additional-questions',
					},
				],
			},
			{
				title: '실제 사례 맛보기',
				when: '1일',
				goal: '지원하는 회사의 도메인과 실제 시스템의 모습을 확인합니다.',
				tasks: [
					{
						id: 'short:company-blogs',
						label: '지원하는 회사의 엔지니어링 블로그 글 2–3편 읽기',
						kind: 'read',
						href: 'resources/engineering-blogs',
					},
					{
						id: 'short:real-world',
						label: '실제 아키텍처 글 2–3편 읽기',
						kind: 'read',
						href: 'resources/real-world-architectures',
					},
					{ page: 'practice/flashcards', kind: 'review' },
				],
			},
		],
	},
	medium: {
		id: 'medium',
		label: '중기',
		title: '중기 플랜',
		duration: '약 3–4주',
		focus: '넓게 + 일부는 깊게',
		practice: 'Many',
		practiceLabel: '많이',
		summary:
			'모든 주제를 다루되 데이터베이스·캐시처럼 면접에 자주 나오는 영역은 더 읽을거리까지 파고들고, 문제를 많이 풀어 봅니다.',
		phases: [
			{
				title: '1주차 — 기초 개념과 트레이드오프',
				when: '1주차',
				goal: '확장성의 기본 어휘와 CAP 정리를 확실히 이해합니다.',
				tasks: [
					{ page: 'topics/start-here', kind: 'watch' },
					...tradeoffs,
					{ page: 'topics/dns' },
					{ page: 'topics/cdn' },
					{
						id: 'medium:cap-deep-dive',
						label: 'CAP 정리의 "출처 및 더 읽을거리" 중 1–2편 읽기',
						kind: 'read',
						href: 'topics/availability-vs-consistency',
					},
				],
			},
			{
				title: '2주차 — 확장의 핵심 구성 요소',
				when: '2주차',
				goal: '로드 밸런서부터 보안까지 핵심 구성 요소를 익히고, 데이터 계층은 깊게 봅니다.',
				tasks: [
					{ page: 'topics/load-balancer' },
					{ page: 'topics/reverse-proxy' },
					...dataLayer,
					{
						id: 'medium:data-deep-dive',
						label: '데이터베이스·캐시 페이지의 "출처 및 더 읽을거리" 중 2–3편 깊게 읽기',
						kind: 'read',
						href: 'topics/database/rdbms',
					},
				],
			},
			{
				title: '3주차 — 면접 접근법과 시스템 설계 문제(Many)',
				when: '3주차',
				goal: '문제마다 45분 타이머를 맞추고 먼저 직접 설계한 뒤 해설과 비교합니다.',
				tasks: [
					...interviewBasics,
					{ page: 'system-design/pastebin', kind: 'practice' },
					{ page: 'system-design/twitter', kind: 'practice' },
					{ page: 'system-design/web-crawler', kind: 'practice' },
					{ page: 'system-design/social-graph', kind: 'practice' },
					{ page: 'system-design/query-cache', kind: 'practice' },
					{ page: 'system-design/scaling-aws', kind: 'practice' },
				],
			},
			{
				title: '4주차 — 객체 지향 설계와 실제 사례',
				when: '4주차',
				goal: '객체 지향 설계 문제와 추가 질문으로 범위를 넓히고 실제 시스템에서 패턴을 찾습니다.',
				tasks: [
					{ page: 'ood/hash-map', kind: 'practice' },
					{ page: 'ood/lru-cache', kind: 'practice' },
					{ page: 'ood/parking-lot', kind: 'practice' },
					{ page: 'ood/online-chat', kind: 'practice' },
					{
						id: 'medium:additional-questions',
						label: '추가 면접 질문 5–6개 풀어 보기',
						kind: 'practice',
						href: 'practice/additional-questions',
					},
					{ page: 'resources/real-world-architectures' },
					{
						id: 'medium:company-architectures',
						label: '지원하는 회사와 비슷한 도메인의 기업 아키텍처 2–3개 읽기',
						kind: 'read',
						href: 'resources/company-architectures',
					},
					{
						id: 'medium:company-blogs',
						label: '지원하는 회사의 엔지니어링 블로그 글 3–5편 읽기',
						kind: 'read',
						href: 'resources/engineering-blogs',
					},
					{ page: 'practice/flashcards', kind: 'review' },
				],
			},
		],
	},
	long: {
		id: 'long',
		label: '장기',
		title: '장기 플랜',
		duration: '약 2–3개월',
		focus: '넓게 + 더 깊게',
		practice: 'Most',
		practiceLabel: '대부분',
		summary:
			'모든 주제를 더 읽을거리와 고전 논문까지 깊게 공부하고, 거의 모든 문제를 직접 풀어 본 뒤 모의 면접으로 마무리합니다.',
		phases: [
			{
				title: '1–2주차 — 모든 주제를 깊게',
				when: '1–2주차',
				goal: '모든 주제를 읽고 주제마다 출처 글을 최소 한 편씩 함께 읽습니다.',
				tasks: [
					{ page: 'topics/start-here', kind: 'watch' },
					...tradeoffs,
					...edge,
					...dataLayer,
					{
						id: 'long:further-reading',
						label: '각 주제의 "출처 및 더 읽을거리"를 주제당 1편 이상 읽기',
						kind: 'read',
						href: 'topics',
					},
				],
			},
			{
				title: '3–4주차 — 고전 논문으로 깊이 더하기',
				when: '3–4주차',
				goal: '오늘날 분산 시스템의 뿌리가 된 논문에서 공통 원리를 찾습니다.',
				tasks: [
					{ page: 'resources/real-world-architectures' },
					{ id: 'long:paper-mapreduce', label: 'MapReduce 논문 (Google, OSDI 2004)', kind: 'read', href: papers.mapreduce },
					{ id: 'long:paper-gfs', label: 'Google File System 논문 (SOSP 2003)', kind: 'read', href: papers.gfs },
					{ id: 'long:paper-bigtable', label: 'Bigtable 논문 (Google, OSDI 2006)', kind: 'read', href: papers.bigtable },
					{ id: 'long:paper-dynamo', label: 'Dynamo 논문 (Amazon, SOSP 2007)', kind: 'read', href: papers.dynamo },
					{ id: 'long:paper-spanner', label: 'Spanner 논문 (Google, OSDI 2012)', kind: 'read', href: papers.spanner },
					{ id: 'long:paper-memcache', label: 'Scaling Memcache at Facebook (NSDI 2013)', kind: 'read', href: papers.memcache },
				],
			},
			{
				title: '5–8주차 — 문제 풀이(Most)',
				when: '5–8주차',
				goal: '모든 문제를 먼저 직접 풀고, 해설과 비교해 놓친 트레이드오프를 기록합니다.',
				tasks: [
					...interviewBasics,
					{ page: 'system-design/pastebin', kind: 'practice' },
					{ page: 'system-design/twitter', kind: 'practice' },
					{ page: 'system-design/web-crawler', kind: 'practice' },
					{ page: 'system-design/mint', kind: 'practice' },
					{ page: 'system-design/social-graph', kind: 'practice' },
					{ page: 'system-design/query-cache', kind: 'practice' },
					{ page: 'system-design/sales-rank', kind: 'practice' },
					{ page: 'system-design/scaling-aws', kind: 'practice' },
					{ page: 'ood/hash-map', kind: 'practice' },
					{ page: 'ood/lru-cache', kind: 'practice' },
					{ page: 'ood/call-center', kind: 'practice' },
					{ page: 'ood/deck-of-cards', kind: 'practice' },
					{ page: 'ood/parking-lot', kind: 'practice' },
					{ page: 'ood/online-chat', kind: 'practice' },
				],
			},
			{
				title: '9–12주차 — 실전 감각',
				when: '9–12주차',
				goal: '처음 보는 문제를 시간 안에 풀어내는 연습과 회사별 준비로 마무리합니다.',
				tasks: [
					{ page: 'practice/additional-questions', kind: 'practice' },
					{
						id: 'long:additional-questions',
						label: '추가 면접 질문 10개 이상 풀어 보기',
						kind: 'practice',
						href: 'practice/additional-questions',
					},
					{ page: 'resources/company-architectures' },
					{ page: 'resources/engineering-blogs' },
					{
						id: 'long:mock-interviews',
						label: '동료와 45분 모의 면접 2회 이상 (화이트보드 사용)',
						kind: 'practice',
					},
					{ page: 'practice/flashcards', kind: 'review', note: '매일 10분씩 간격 반복' },
				],
			},
		],
	},
};

export const planOrder: PlanId[] = ['short', 'medium', 'long'];

/** The upstream study guide table, kept verbatim in meaning. */
export const studyGuideMatrix: {
	activity: string;
	href: string;
	short: string;
	medium: string;
	long: string;
}[] = [
	{ activity: '시스템 설계 주제를 읽고 시스템이 동작하는 방식을 폭넓게 이해하기', href: 'topics', short: '✓', medium: '✓', long: '✓' },
	{ activity: '지원하는 회사의 엔지니어링 블로그 글 몇 편 읽기', href: 'resources/engineering-blogs', short: '✓', medium: '✓', long: '✓' },
	{ activity: '실제 아키텍처 사례 몇 개 읽기', href: 'resources/real-world-architectures', short: '✓', medium: '✓', long: '✓' },
	{ activity: '시스템 설계 면접 접근법 복습하기', href: 'interview/approach', short: '✓', medium: '✓', long: '✓' },
	{ activity: '해설이 있는 시스템 설계 면접 문제 풀어 보기', href: 'system-design', short: '일부', medium: '많이', long: '대부분' },
	{ activity: '해설이 있는 객체 지향 설계 면접 문제 풀어 보기', href: 'ood', short: '일부', medium: '많이', long: '대부분' },
	{ activity: '추가 시스템 설계 면접 질문 검토하기', href: 'practice/additional-questions', short: '일부', medium: '많이', long: '대부분' },
];

/** Plans that include a given docs slug, used for the badges under each page title. */
export function plansForPage(slug: string): PlanId[] {
	return planOrder.filter((id) =>
		plans[id].phases.some((phase) => phase.tasks.some((task) => isPageTask(task) && task.page === slug)),
	);
}

export function allTaskIds(id: PlanId): string[] {
	return [...new Set(plans[id].phases.flatMap((phase) => phase.tasks.map(taskId)))];
}
