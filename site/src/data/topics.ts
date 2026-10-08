/** Topic map groups, in the order a request travels through a system. */
export const topicGroups: { title: string; summary: string; pages: string[] }[] = [
	{
		title: '출발점',
		summary: '확장성 강의와 글로 공통 어휘를 만듭니다.',
		pages: ['topics/start-here'],
	},
	{
		title: '핵심 트레이드오프',
		summary: '모든 설계 결정의 바탕이 되는 개념 쌍입니다. 모든 것은 트레이드오프입니다.',
		pages: [
			'topics/performance-vs-scalability',
			'topics/latency-vs-throughput',
			'topics/availability-vs-consistency',
			'topics/consistency-patterns',
			'topics/availability-patterns',
		],
	},
	{
		title: '트래픽의 입구',
		summary: '요청이 서버에 닿기 전에 거치는 이름 해석, 캐시, 분산 계층입니다.',
		pages: ['topics/dns', 'topics/cdn', 'topics/load-balancer', 'topics/reverse-proxy'],
	},
	{
		title: '애플리케이션과 데이터',
		summary: '서비스를 나누고 데이터를 저장·확장하는 방법입니다.',
		pages: [
			'topics/application-layer',
			'topics/database/rdbms',
			'topics/database/nosql',
			'topics/database/sql-or-nosql',
		],
	},
	{
		title: '성능과 비동기',
		summary: '반복되는 읽기를 줄이고, 오래 걸리는 일은 뒤로 미룹니다.',
		pages: ['topics/cache', 'topics/asynchronism'],
	},
	{
		title: '통신과 보안',
		summary: '구성 요소끼리 대화하는 규약과 지켜야 할 기본기입니다.',
		pages: ['topics/communication', 'topics/security'],
	},
];
