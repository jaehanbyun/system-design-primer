import type { ImageMetadata } from 'astro';
import pastebin from '@repo/images/4edXG0T.png';
import twitter from '@repo/images/jrUBAF7.png';
import webCrawler from '@repo/images/bWxPtQA.png';
import mint from '@repo/images/V5q57vU.png';
import socialGraph from '@repo/images/cdCv5g7.png';
import queryCache from '@repo/images/4j99mhe.png';
import salesRank from '@repo/images/MzExP06.png';
import scalingAws from '@repo/images/jj3A5N8.png';

export interface Problem {
	page: string;
	/** The question as asked in the upstream README. */
	question: string;
	image: ImageMetadata;
	concepts: string[];
}

export const systemDesignProblems: Problem[] = [
	{
		page: 'system-design/pastebin',
		question: 'Pastebin.com (또는 Bit.ly) 설계',
		image: pastebin,
		concepts: ['MD5 · Base62 단축 URL', 'SQL · 객체 저장소', 'MapReduce 통계'],
	},
	{
		page: 'system-design/twitter',
		question: 'Twitter 타임라인과 검색 (또는 Facebook 피드와 검색) 설계',
		image: twitter,
		concepts: ['Fan Out Service', '메모리 캐시 타임라인', 'Search Cluster'],
	},
	{
		page: 'system-design/web-crawler',
		question: '웹 크롤러 설계',
		image: webCrawler,
		concepts: ['우선순위 크롤링', '중복 탐지(시그니처)', '역색인'],
	},
	{
		page: 'system-design/mint',
		question: 'Mint.com 설계',
		image: mint,
		concepts: ['거래 분류', '예산 알림', '큐 · MapReduce 집계'],
	},
	{
		page: 'system-design/social-graph',
		question: '소셜 네트워크 자료 구조 설계',
		image: socialGraph,
		concepts: ['BFS 최단 경로', 'Person Server 샤딩', 'Lookup Service'],
	},
	{
		page: 'system-design/query-cache',
		question: '검색 엔진용 키-값 저장소 설계',
		image: queryCache,
		concepts: ['LRU 캐시', '해시 테이블 + 연결 리스트', '캐시 확장'],
	},
	{
		page: 'system-design/sales-rank',
		question: 'Amazon 카테고리별 판매 순위 설계',
		image: salesRank,
		concepts: ['MapReduce 집계', 'SQL 읽기 복제본', '카테고리별 순위'],
	},
	{
		page: 'system-design/scaling-aws',
		question: 'AWS에서 수백만 사용자로 확장하는 시스템 설계',
		image: scalingAws,
		concepts: ['단계적 확장', 'Autoscaling', '읽기 복제본 · CDN'],
	},
];

export const oodProblems: { page: string; question: string; concepts: string[] }[] = [
	{ page: 'ood/hash-map', question: '해시 맵 설계', concepts: ['체이닝', '해시 함수'] },
	{ page: 'ood/lru-cache', question: 'LRU 캐시 설계', concepts: ['해시 맵', '연결 리스트'] },
	{ page: 'ood/call-center', question: '콜센터 설계', concepts: ['직급별 에스컬레이션', '대기열'] },
	{ page: 'ood/deck-of-cards', question: '카드 덱 설계', concepts: ['추상 클래스', '블랙잭 확장'] },
	{ page: 'ood/parking-lot', question: '주차장 설계', concepts: ['차량 크기', '층·주차 칸 모델링'] },
	{ page: 'ood/online-chat', question: '채팅 서버 설계', concepts: ['1:1 · 그룹 채팅', '친구 요청 상태'] },
];
