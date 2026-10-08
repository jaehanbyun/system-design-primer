/**
 * Korean flashcards for spaced-repetition review.
 *
 * Cards are written from the upstream sources (README topic sections and appendix,
 * solutions/system_design/*, solutions/object_oriented_design/*), not copied from the
 * original Anki decks in resources/flash_cards/. Numbers are taken verbatim from the
 * sources. `topic` is the docs slug of the page that explains the answer.
 */

export type FlashcardDeck = 'concepts' | 'problems' | 'ood';

export interface Flashcard {
	/** Unique kebab-case id, stable across edits. */
	id: string;
	deck: FlashcardDeck;
	/** Docs slug of the page that explains the answer, e.g. 'topics/cache'. */
	topic: string;
	/** Question in Korean. Plain text; inline <code> allowed. */
	front: string;
	/** Answer in Korean. Small HTML subset only: <p>, <ul>, <li>, <strong>, <code>, <br>. */
	back: string;
}

export const flashcards: Flashcard[] = [
	// ---------------------------------------------------------------------------
	// concepts: start here
	// ---------------------------------------------------------------------------
	{
		id: 'start-here-scalability-lecture',
		deck: 'concepts',
		topic: 'topics/start-here',
		front: '시스템 설계 공부의 1단계로 권하는 Harvard 확장성 강의에서 다루는 주제는 무엇인가요?',
		back: `<ul><li>수직 확장(Vertical scaling)</li><li>수평 확장(Horizontal scaling)</li><li>캐싱(Caching)</li><li>로드 밸런싱(Load balancing)</li><li>데이터베이스 복제(Database replication)</li><li>데이터베이스 파티셔닝(Database partitioning)</li></ul>`,
	},
	{
		id: 'start-here-high-level-tradeoffs',
		deck: 'concepts',
		topic: 'topics/start-here',
		front: 'DNS, CDN, 로드 밸런서 같은 구체적인 주제로 들어가기 전에 먼저 살펴보는 세 가지 고수준 트레이드오프와, 기억해야 할 원칙은?',
		back: `<ul><li>성능(performance) vs 확장성(scalability)</li><li>지연 시간(latency) vs 처리량(throughput)</li><li>가용성(availability) vs 일관성(consistency)</li></ul><p>원칙: <strong>모든 것은 트레이드오프</strong>입니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: performance vs scalability
	// ---------------------------------------------------------------------------
	{
		id: 'scalability-definition',
		deck: 'concepts',
		topic: 'topics/performance-vs-scalability',
		front: '서비스가 "확장 가능하다(scalable)"는 것은 무엇을 뜻하나요?',
		back: `<p>추가한 자원에 <strong>비례해 성능이 증가</strong>하는 것을 말합니다. 성능 증가는 보통 더 많은 작업 단위를 처리하는 것이지만, 데이터셋이 커질 때처럼 더 큰 작업 단위를 처리하는 것일 수도 있습니다.</p>`,
	},
	{
		id: 'performance-vs-scalability-problem',
		deck: 'concepts',
		topic: 'topics/performance-vs-scalability',
		front: '성능 문제와 확장성 문제는 증상으로 어떻게 구분하나요?',
		back: `<ul><li><strong>성능 문제</strong>: 사용자 한 명에게도 시스템이 느립니다.</li><li><strong>확장성 문제</strong>: 사용자 한 명에게는 빠르지만 부하가 커지면 느려집니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: latency vs throughput
	// ---------------------------------------------------------------------------
	{
		id: 'latency-vs-throughput',
		deck: 'concepts',
		topic: 'topics/latency-vs-throughput',
		front: '지연 시간(latency)과 처리량(throughput)의 정의, 그리고 일반적으로 지향해야 할 목표는?',
		back: `<ul><li><strong>지연 시간</strong>: 어떤 동작을 수행하거나 결과를 만들어 내는 데 걸리는 시간</li><li><strong>처리량</strong>: 단위 시간당 수행하는 그런 동작이나 결과의 수</li></ul><p>일반적으로 <strong>수용 가능한 지연 시간</strong> 안에서 <strong>최대 처리량</strong>을 목표로 합니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: availability vs consistency (CAP)
	// ---------------------------------------------------------------------------
	{
		id: 'cap-theorem-definition',
		deck: 'concepts',
		topic: 'topics/availability-vs-consistency',
		front: 'CAP 정리의 세 가지 보장(C, A, P)을 각각 정의해 보세요.',
		back: `<p>분산 시스템은 다음 중 두 가지만 보장할 수 있습니다.</p><ul><li><strong>일관성(Consistency)</strong>: 모든 읽기는 가장 최근 쓰기 결과나 에러를 받습니다.</li><li><strong>가용성(Availability)</strong>: 모든 요청은 응답을 받지만, 그 응답이 최신 정보라는 보장은 없습니다.</li><li><strong>분할 내성(Partition Tolerance)</strong>: 네트워크 장애로 임의의 분할이 생겨도 시스템이 계속 동작합니다.</li></ul>`,
	},
	{
		id: 'cap-why-choose-c-or-a',
		deck: 'concepts',
		topic: 'topics/availability-vs-consistency',
		front: 'CAP 정리에서 실제 선택지가 "일관성 vs 가용성"으로 좁혀지는 이유는?',
		back: `<p>네트워크는 신뢰할 수 없으므로 <strong>분할 내성은 반드시 지원</strong>해야 합니다. 따라서 남는 것은 일관성과 가용성 사이의 소프트웨어 트레이드오프입니다.</p>`,
	},
	{
		id: 'cap-cp-vs-ap',
		deck: 'concepts',
		topic: 'topics/availability-vs-consistency',
		front: 'CP 시스템과 AP 시스템은 네트워크 분할 시 어떻게 동작하며, 각각 언제 선택하나요?',
		back: `<ul><li><strong>CP</strong>: 분할된 노드의 응답을 기다리다 타임아웃 에러가 날 수 있습니다. 비즈니스상 <strong>원자적 읽기·쓰기</strong>가 필요할 때 적합합니다.</li><li><strong>AP</strong>: 어느 노드에서든 가장 쉽게 얻을 수 있는 버전을 반환하므로 최신이 아닐 수 있고, 쓰기는 분할이 해소된 뒤 전파됩니다. <strong>최종적 일관성</strong>을 허용하거나 외부 오류에도 계속 동작해야 할 때 적합합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: consistency patterns
	// ---------------------------------------------------------------------------
	{
		id: 'weak-consistency',
		deck: 'concepts',
		topic: 'topics/consistency-patterns',
		front: '약한 일관성(weak consistency)이란 무엇이고, 어디에 잘 맞나요?',
		back: `<p>쓰기 후 읽기가 그 값을 볼 수도, 못 볼 수도 있는 최선 노력(best effort) 방식입니다. memcached 같은 시스템에서 볼 수 있고, VoIP·화상 채팅·실시간 멀티플레이어 게임 같은 실시간 유스케이스에 잘 맞습니다. 예: 통화 중 몇 초간 연결이 끊기면 재연결 후 그동안 오간 말은 들리지 않습니다.</p>`,
	},
	{
		id: 'eventual-consistency',
		deck: 'concepts',
		topic: 'topics/consistency-patterns',
		front: '최종적 일관성(eventual consistency)의 동작 방식과 대표 사례는?',
		back: `<p>쓰기 후 읽기가 <strong>결국</strong> 그 값을 보게 됩니다(보통 밀리초 이내). 데이터는 <strong>비동기적으로</strong> 복제됩니다. DNS와 이메일이 대표 사례이며, 고가용성 시스템에 잘 맞습니다.</p>`,
	},
	{
		id: 'strong-consistency',
		deck: 'concepts',
		topic: 'topics/consistency-patterns',
		front: '강한 일관성(strong consistency)의 동작 방식과 대표 사례는?',
		back: `<p>쓰기 후 읽기는 반드시 그 값을 봅니다. 데이터는 <strong>동기적으로</strong> 복제됩니다. 파일 시스템과 RDBMS가 대표 사례이며, 트랜잭션이 필요한 시스템에 잘 맞습니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: availability patterns
	// ---------------------------------------------------------------------------
	{
		id: 'active-passive-vs-active-active',
		deck: 'concepts',
		topic: 'topics/availability-patterns',
		front: '액티브-패시브와 액티브-액티브 장애 조치(failover)는 어떻게 다른가요?',
		back: `<ul><li><strong>액티브-패시브</strong>(master-slave failover): 두 서버가 heartbeat를 주고받다가 끊기면 패시브가 액티브의 IP 주소를 넘겨받습니다. 트래픽은 액티브만 처리하고, 다운타임은 패시브가 hot standby인지 cold standby인지에 달려 있습니다.</li><li><strong>액티브-액티브</strong>(master-master failover): 두 서버가 모두 트래픽을 처리해 부하를 나눕니다. 외부용이면 DNS가, 내부용이면 애플리케이션 로직이 두 서버를 모두 알아야 합니다.</li></ul>`,
	},
	{
		id: 'failover-disadvantages',
		deck: 'concepts',
		topic: 'topics/availability-patterns',
		front: '고가용성을 위한 두 가지 상호 보완 패턴은 무엇이며, 그중 장애 조치(failover)의 단점은?',
		back: `<p>두 패턴은 <strong>장애 조치(fail-over)</strong>와 <strong>복제(replication)</strong>입니다. 장애 조치의 단점은 다음과 같습니다.</p><ul><li>하드웨어와 복잡성이 추가됩니다.</li><li>새로 쓴 데이터가 패시브로 복제되기 전에 액티브가 실패하면 데이터가 손실될 수 있습니다.</li></ul>`,
	},
	{
		id: 'availability-three-nines',
		deck: 'concepts',
		topic: 'topics/availability-patterns',
		front: '가용성 99.9%(three 9s)일 때 허용되는 연간·월간·주간·일간 다운타임은?',
		back: `<ul><li>연간: <strong>8h 45min 57s</strong></li><li>월간: <strong>43m 49.7s</strong></li><li>주간: <strong>10m 4.8s</strong></li><li>일간: <strong>1m 26.4s</strong></li></ul>`,
	},
	{
		id: 'availability-four-nines',
		deck: 'concepts',
		topic: 'topics/availability-patterns',
		front: '가용성 99.99%(four 9s)일 때 허용되는 연간·월간·주간·일간 다운타임은?',
		back: `<ul><li>연간: <strong>52min 35.7s</strong></li><li>월간: <strong>4m 23s</strong></li><li>주간: <strong>1m 5s</strong></li><li>일간: <strong>8.6s</strong></li></ul>`,
	},
	{
		id: 'availability-sequence-vs-parallel',
		deck: 'concepts',
		topic: 'topics/availability-patterns',
		front: '가용성이 각각 99.9%인 구성 요소 Foo와 Bar를 직렬(in sequence)로, 또 병렬(in parallel)로 연결하면 전체 가용성은?',
		back: `<ul><li><strong>직렬</strong>: <code>Availability (Foo) * Availability (Bar)</code> → <strong>99.8%</strong>로 낮아집니다.</li><li><strong>병렬</strong>: <code>1 - (1 - Availability (Foo)) * (1 - Availability (Bar))</code> → <strong>99.9999%</strong>로 높아집니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: DNS
	// ---------------------------------------------------------------------------
	{
		id: 'dns-hierarchy-caching',
		deck: 'concepts',
		topic: 'topics/dns',
		front: 'DNS는 무엇을 하며, 조회 결과는 어디에서 어떻게 캐시되나요?',
		back: `<p>www.example.com 같은 도메인 이름을 IP 주소로 변환합니다. DNS는 최상위에 소수의 권한 있는(authoritative) 서버가 있는 계층 구조이고, 조회 시 어느 DNS 서버에 물을지는 라우터나 ISP가 알려 줍니다. 하위 DNS 서버는 매핑을 캐시하는데, DNS 전파 지연 때문에 오래된(stale) 값이 될 수 있습니다. 브라우저나 OS도 <strong>TTL(time to live)</strong>로 정해진 기간 동안 결과를 캐시합니다.</p>`,
	},
	{
		id: 'dns-record-types',
		deck: 'concepts',
		topic: 'topics/dns',
		front: 'DNS 레코드 NS, MX, A, CNAME은 각각 무엇을 지정하나요?',
		back: `<ul><li><strong>NS(name server)</strong>: 도메인/서브도메인의 DNS 서버</li><li><strong>MX(mail exchange)</strong>: 메시지를 받을 메일 서버</li><li><strong>A(address)</strong>: 이름 → IP 주소</li><li><strong>CNAME(canonical)</strong>: 이름 → 다른 이름이나 <code>CNAME</code>(example.com → www.example.com), 또는 <code>A</code> 레코드</li></ul>`,
	},
	{
		id: 'dns-routing-methods',
		deck: 'concepts',
		topic: 'topics/dns',
		front: 'CloudFlare, Route 53 같은 관리형 DNS가 제공하는 트래픽 라우팅 방식은? 가중 라운드 로빈은 어디에 쓰나요?',
		back: `<ul><li><strong>Weighted round robin</strong>: 유지보수 중인 서버로 트래픽이 가지 않게 하기, 크기가 다른 클러스터 간 균형 맞추기, A/B 테스트</li><li><strong>Latency-based</strong> 라우팅</li><li><strong>Geolocation-based</strong> 라우팅</li></ul>`,
	},
	{
		id: 'dns-disadvantages',
		deck: 'concepts',
		topic: 'topics/dns',
		front: 'DNS의 단점은?',
		back: `<ul><li>DNS 서버에 접근하면 약간의 지연이 생깁니다(캐싱으로 완화).</li><li>DNS 서버 관리는 복잡할 수 있어 보통 정부, ISP, 대기업이 관리합니다.</li><li>DNS 서비스가 DDoS 공격을 받으면, 사용자는 IP 주소를 모르는 한 Twitter 같은 사이트에 접속할 수 없습니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: CDN
	// ---------------------------------------------------------------------------
	{
		id: 'cdn-definition-benefits',
		deck: 'concepts',
		topic: 'topics/cdn',
		front: 'CDN이란 무엇이며, 성능을 어떤 두 가지 방식으로 개선하나요?',
		back: `<p>사용자와 가까운 위치에서 콘텐츠를 제공하는, 전 세계에 분산된 프록시 서버 네트워크입니다. 보통 HTML/CSS/JS, 사진, 동영상 같은 정적 파일을 제공합니다(Amazon CloudFront처럼 동적 콘텐츠를 지원하는 CDN도 있음).</p><ul><li>사용자가 가까운 데이터 센터에서 콘텐츠를 받습니다.</li><li>CDN이 처리한 요청은 내 서버가 처리하지 않아도 됩니다.</li></ul>`,
	},
	{
		id: 'push-cdn',
		deck: 'concepts',
		topic: 'topics/cdn',
		front: 'Push CDN은 어떻게 동작하며, 어떤 사이트에 잘 맞나요?',
		back: `<p>서버에서 변경이 생길 때마다 새 콘텐츠를 CDN에 직접 업로드하고, URL이 CDN을 가리키도록 바꿉니다. 만료·갱신 시점을 직접 설정할 수 있고, 새로 생기거나 바뀐 콘텐츠만 올리므로 <strong>트래픽은 최소화</strong>되지만 <strong>저장 공간은 최대화</strong>됩니다. <strong>트래픽이 적거나</strong> 콘텐츠가 자주 바뀌지 않는 사이트에 잘 맞습니다.</p>`,
	},
	{
		id: 'pull-cdn',
		deck: 'concepts',
		topic: 'topics/cdn',
		front: 'Pull CDN은 어떻게 동작하며, 어떤 사이트에 잘 맞나요?',
		back: `<p>첫 사용자가 요청할 때 CDN이 서버에서 새 콘텐츠를 가져옵니다. 콘텐츠는 서버에 두고 URL만 CDN을 가리키도록 바꾸며, CDN에 캐시되기 전까지는 요청이 느립니다. TTL이 캐시 기간을 정하는데, <strong>CDN 저장 공간은 최소화</strong>되지만 실제로 바뀌기 전에 만료되어 다시 가져오면 <strong>중복 트래픽</strong>이 생길 수 있습니다. 최근 요청된 콘텐츠만 남아 트래픽이 고르게 분산되므로 <strong>트래픽이 많은</strong> 사이트에 잘 맞습니다.</p>`,
	},
	{
		id: 'cdn-disadvantages',
		deck: 'concepts',
		topic: 'topics/cdn',
		front: 'CDN의 단점은?',
		back: `<ul><li>트래픽에 따라 비용이 클 수 있습니다(단, CDN을 쓰지 않을 때 드는 추가 비용과 비교해야 합니다).</li><li>TTL이 만료되기 전에 콘텐츠가 갱신되면 오래된 콘텐츠가 제공될 수 있습니다.</li><li>정적 콘텐츠의 URL을 CDN을 가리키도록 바꿔야 합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: load balancer
	// ---------------------------------------------------------------------------
	{
		id: 'load-balancer-benefits',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: '로드 밸런서는 무엇에 효과적이며, 추가로 어떤 이점을 주나요?',
		back: `<ul><li>비정상(unhealthy) 서버로 요청이 가는 것을 막습니다.</li><li>리소스 과부하를 막습니다.</li><li>단일 장애 지점(SPOF) 제거를 돕습니다.</li><li><strong>SSL termination</strong>: 백엔드 대신 요청 복호화·응답 암호화를 처리하고, 서버마다 X.509 인증서를 설치할 필요를 없앱니다.</li><li><strong>Session persistence</strong>: 웹 앱이 세션을 추적하지 않으면 쿠키를 발급해 특정 클라이언트의 요청을 같은 인스턴스로 보냅니다.</li></ul>`,
	},
	{
		id: 'load-balancer-routing-metrics',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: '로드 밸런서가 트래픽을 라우팅하는 기준(metric)에는 무엇이 있나요?',
		back: `<ul><li>Random</li><li>Least loaded</li><li>Session/cookies</li><li>Round robin 또는 weighted round robin</li><li>Layer 4</li><li>Layer 7</li></ul>`,
	},
	{
		id: 'l4-vs-l7-load-balancing',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: 'L4 로드 밸런싱과 L7 로드 밸런싱은 무엇을 보고 요청을 분배하며, 어떤 트레이드오프가 있나요?',
		back: `<ul><li><strong>L4</strong>: 전송 계층 정보(헤더의 출발지·목적지 IP 주소와 포트)를 보고, 패킷 내용은 보지 않습니다. NAT를 수행하며 업스트림 서버와 패킷을 주고받습니다.</li><li><strong>L7</strong>: 애플리케이션 계층(헤더, 메시지, 쿠키)을 봅니다. 네트워크 트래픽을 종료하고 메시지를 읽어 결정한 뒤, 선택한 서버로 새 연결을 엽니다. 예: 동영상 트래픽은 동영상 서버로, 민감한 결제 트래픽은 보안이 강화된 서버로 보냅니다.</li></ul><p>L4는 유연성을 희생하는 대신 L7보다 시간과 컴퓨팅 자원이 덜 듭니다(최신 범용 하드웨어에서는 차이가 미미할 수 있음).</p>`,
	},
	{
		id: 'horizontal-vs-vertical-scaling',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: '수평 확장(scale out)이 수직 확장(scale up)보다 나은 점은?',
		back: `<p>범용(commodity) 머신으로 수평 확장하는 편이, 단일 서버를 더 비싼 하드웨어로 키우는 수직 확장보다 <strong>비용 효율적</strong>이고 <strong>가용성</strong>도 높습니다. 또 특수한 엔터프라이즈 시스템보다 범용 하드웨어를 다루는 인재를 채용하기가 쉽습니다.</p>`,
	},
	{
		id: 'horizontal-scaling-disadvantages',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: '수평 확장의 단점은? 서버를 복제(clone)하려면 무엇을 지켜야 하나요?',
		back: `<ul><li>복잡성이 늘고 서버를 복제해야 합니다.</li><li>서버는 <strong>무상태(stateless)</strong>여야 합니다. 세션이나 프로필 사진 같은 사용자 데이터를 서버에 두면 안 됩니다.</li><li>세션은 데이터베이스(SQL, NoSQL)나 영속 캐시(Redis, Memcached) 같은 중앙 저장소에 둡니다.</li><li>업스트림 서버가 늘어날수록 캐시·데이터베이스 같은 다운스트림 서버가 더 많은 동시 연결을 감당해야 합니다.</li></ul>`,
	},
	{
		id: 'load-balancer-disadvantages',
		deck: 'concepts',
		topic: 'topics/load-balancer',
		front: '로드 밸런서의 단점은?',
		back: `<ul><li>자원이 부족하거나 설정이 잘못되면 성능 병목이 될 수 있습니다.</li><li>SPOF를 없애려고 도입해도 복잡성이 늘어납니다.</li><li>로드 밸런서가 하나뿐이면 그 자체가 SPOF이고, 여러 대를 구성하면 복잡성이 더 커집니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: reverse proxy
	// ---------------------------------------------------------------------------
	{
		id: 'reverse-proxy-benefits',
		deck: 'concepts',
		topic: 'topics/reverse-proxy',
		front: '리버스 프록시(웹 서버)란 무엇이고, 어떤 이점이 있나요?',
		back: `<p>내부 서비스를 중앙화하고 외부에 통합된 인터페이스를 제공하는 웹 서버입니다. 클라이언트 요청을 처리할 수 있는 서버로 전달한 뒤 그 응답을 클라이언트에 돌려줍니다.</p><ul><li><strong>보안 강화</strong>: 백엔드 서버 정보 은닉, IP 차단, 클라이언트별 연결 수 제한</li><li><strong>확장성·유연성</strong>: 클라이언트는 프록시의 IP만 보므로 서버를 늘리거나 설정을 바꾸기 쉬움</li><li><strong>SSL termination</strong>, <strong>압축</strong>, <strong>캐싱</strong>, <strong>정적 콘텐츠 직접 제공</strong></li></ul>`,
	},
	{
		id: 'load-balancer-vs-reverse-proxy',
		deck: 'concepts',
		topic: 'topics/reverse-proxy',
		front: '로드 밸런서와 리버스 프록시는 각각 언제 유용한가요?',
		back: `<ul><li>로드 밸런서는 <strong>서버가 여러 대</strong>일 때 유용하며, 보통 같은 기능을 하는 서버 집합으로 트래픽을 보냅니다.</li><li>리버스 프록시는 웹 서버나 애플리케이션 서버가 <strong>한 대뿐이어도</strong> 보안·SSL termination·캐싱 같은 이점 때문에 유용합니다.</li><li>NGINX, HAProxy 같은 솔루션은 L7 리버스 프록시와 로드 밸런싱을 모두 지원합니다.</li></ul>`,
	},
	{
		id: 'reverse-proxy-disadvantages',
		deck: 'concepts',
		topic: 'topics/reverse-proxy',
		front: '리버스 프록시의 단점은?',
		back: `<ul><li>도입하면 복잡성이 늘어납니다.</li><li>리버스 프록시가 하나뿐이면 SPOF이고, 여러 대(failover)를 구성하면 복잡성이 더 커집니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: application layer
	// ---------------------------------------------------------------------------
	{
		id: 'application-layer-separation',
		deck: 'concepts',
		topic: 'topics/application-layer',
		front: '웹 계층과 애플리케이션 계층(플랫폼 계층)을 분리하면 무엇이 좋나요?',
		back: `<p>두 계층을 <strong>독립적으로 확장하고 설정</strong>할 수 있습니다. 새 API를 추가할 때 웹 서버를 늘리지 않고 애플리케이션 서버만 추가할 수 있고, 애플리케이션 계층의 워커는 비동기 처리도 가능하게 합니다. 단일 책임 원칙에 따라 작고 자율적인 서비스들이 함께 동작하면, 작은 팀이 빠른 성장에 더 공격적으로 대비할 수 있습니다.</p>`,
	},
	{
		id: 'microservices',
		deck: 'concepts',
		topic: 'topics/application-layer',
		front: '마이크로서비스란 무엇이며, 애플리케이션 계층을 이렇게 나누면 어떤 단점이 있나요?',
		back: `<p>독립적으로 배포할 수 있는 작고 모듈화된 서비스들의 모음입니다. 각 서비스는 고유한 프로세스로 실행되고, 잘 정의된 경량 메커니즘으로 통신해 비즈니스 목표를 달성합니다(예: Pinterest의 사용자 프로필, 팔로워, 피드, 검색, 사진 업로드 서비스).</p><p>단점: 느슨하게 결합된 서비스는 모놀리식과 다른 아키텍처·운영·프로세스 접근이 필요하고, 배포와 운영 측면의 복잡성이 늘어납니다.</p>`,
	},
	{
		id: 'service-discovery',
		deck: 'concepts',
		topic: 'topics/application-layer',
		front: '서비스 디스커버리(service discovery)는 무엇을 하며, 대표 도구는?',
		back: `<p>Consul, Etcd, Zookeeper 같은 시스템이 등록된 이름·주소·포트를 추적해 서비스들이 서로를 찾도록 돕습니다. 서비스 무결성은 보통 HTTP 엔드포인트를 이용한 <strong>헬스 체크</strong>로 확인합니다. Consul과 Etcd에는 설정값 같은 공유 데이터를 저장하기 좋은 키-값 저장소가 내장되어 있습니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: RDBMS
	// ---------------------------------------------------------------------------
	{
		id: 'acid-properties',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '관계형 데이터베이스 트랜잭션의 ACID 속성을 설명해 보세요.',
		back: `<ul><li><strong>Atomicity(원자성)</strong>: 각 트랜잭션은 전부 수행되거나 전혀 수행되지 않습니다.</li><li><strong>Consistency(일관성)</strong>: 모든 트랜잭션은 데이터베이스를 하나의 유효한 상태에서 다른 유효한 상태로 옮깁니다.</li><li><strong>Isolation(격리성)</strong>: 트랜잭션을 동시에 실행한 결과가 순차적으로 실행한 결과와 같습니다.</li><li><strong>Durability(지속성)</strong>: 커밋된 트랜잭션은 그대로 유지됩니다.</li></ul>`,
	},
	{
		id: 'master-slave-replication',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '마스터-슬레이브 복제는 어떻게 동작하며, 마스터가 다운되면 어떻게 되나요?',
		back: `<p>마스터는 읽기와 쓰기를 처리하며 쓰기를 하나 이상의 슬레이브에 복제하고, 슬레이브는 읽기만 처리합니다(슬레이브가 다른 슬레이브로 트리 형태로 복제할 수도 있음). 마스터가 오프라인이 되면 슬레이브가 마스터로 승격되거나 새 마스터가 준비될 때까지 <strong>읽기 전용 모드</strong>로 계속 동작합니다. 단점: 슬레이브를 마스터로 승격하는 추가 로직이 필요합니다.</p>`,
	},
	{
		id: 'master-master-replication',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '마스터-마스터 복제는 어떻게 동작하며, 단점은?',
		back: `<p>두 마스터가 모두 읽기·쓰기를 처리하고 쓰기에 대해 서로 조율합니다. 한쪽이 다운되어도 읽기·쓰기를 계속할 수 있습니다.</p><ul><li>어디에 쓸지 정하려면 로드 밸런서를 두거나 애플리케이션 로직을 바꿔야 합니다.</li><li>대부분 느슨한 일관성(ACID 위반)이거나, 동기화 때문에 쓰기 지연이 늘어납니다.</li><li>쓰기 노드가 늘고 지연이 커질수록 충돌 해결(conflict resolution)이 더 중요해집니다.</li></ul>`,
	},
	{
		id: 'replication-disadvantages',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '마스터-슬레이브와 마스터-마스터 복제에 공통된 단점은?',
		back: `<ul><li>새로 쓴 데이터가 다른 노드로 복제되기 전에 마스터가 실패하면 데이터가 손실될 수 있습니다.</li><li>쓰기는 읽기 복제본에서 재실행(replay)되므로, 쓰기가 많으면 복제본이 읽기를 충분히 처리하지 못합니다.</li><li>읽기 슬레이브가 많을수록 복제할 양이 늘어 복제 지연(replication lag)이 커집니다.</li><li>일부 시스템에서는 마스터가 여러 스레드로 병렬 쓰기를 하지만, 읽기 복제본은 단일 스레드 순차 쓰기만 지원합니다.</li><li>하드웨어와 복잡성이 추가됩니다.</li></ul>`,
	},
	{
		id: 'federation',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '페더레이션(federation)이란 무엇이며, 어떤 이점이 있나요?',
		back: `<p>데이터베이스를 기능별로 나누는 것(기능 분할, functional partitioning)입니다. 예: 하나의 모놀리식 DB 대신 <strong>forums</strong>, <strong>users</strong>, <strong>products</strong> DB 세 개를 둡니다.</p><ul><li>DB별 읽기·쓰기 트래픽이 줄어 복제 지연도 줄어듭니다.</li><li>DB가 작아져 메모리에 더 많이 올라가고, 캐시 지역성이 좋아져 캐시 히트가 늘어납니다.</li><li>쓰기를 직렬화하는 단일 중앙 마스터가 없어 병렬로 쓸 수 있으므로 처리량이 늘어납니다.</li></ul>`,
	},
	{
		id: 'federation-disadvantages',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '페더레이션의 단점은?',
		back: `<ul><li>스키마에 거대한 기능이나 테이블이 필요하면 효과가 없습니다.</li><li>어느 DB에서 읽고 쓸지 정하도록 애플리케이션 로직을 바꿔야 합니다.</li><li>두 DB의 데이터를 조인하려면 server link가 필요해 더 복잡합니다.</li><li>하드웨어와 복잡성이 추가됩니다.</li></ul>`,
	},
	{
		id: 'sharding',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '샤딩(sharding)이란 무엇이며, 사용자 테이블은 보통 어떤 기준으로 샤딩하나요?',
		back: `<p>각 데이터베이스가 데이터의 일부만 관리하도록 데이터를 여러 DB에 분산합니다. 페더레이션처럼 읽기·쓰기 트래픽과 복제가 줄고 캐시 히트가 늘며, 인덱스 크기도 줄어 쿼리가 빨라집니다. 한 샤드가 다운되어도 나머지는 동작합니다(데이터 손실을 막으려면 복제는 필요). 사용자 테이블은 보통 <strong>성(last name)의 이니셜</strong>이나 <strong>지리적 위치</strong>로 샤딩합니다.</p>`,
	},
	{
		id: 'sharding-disadvantages',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '샤딩의 단점은? 리밸런싱 부담은 어떻게 줄일 수 있나요?',
		back: `<ul><li>샤드를 다루도록 애플리케이션 로직을 바꿔야 하고, SQL 쿼리가 복잡해질 수 있습니다.</li><li>데이터 분포가 한쪽으로 쏠릴 수 있습니다(예: 파워 유저가 몰린 샤드에 부하 집중). 리밸런싱은 복잡성을 더하며, <strong>consistent hashing</strong> 기반 샤딩 함수로 옮겨야 할 데이터 양을 줄일 수 있습니다.</li><li>여러 샤드의 데이터를 조인하기가 더 복잡합니다.</li><li>하드웨어와 복잡성이 추가됩니다.</li></ul>`,
	},
	{
		id: 'denormalization',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '비정규화(denormalization)는 무엇을 얻고 무엇을 잃나요?',
		back: `<p>쓰기 성능을 일부 희생해 <strong>읽기 성능</strong>을 높입니다. 비싼 조인을 피하려고 여러 테이블에 중복 데이터를 쓰며, PostgreSQL·Oracle의 materialized view가 이를 도와줍니다. 대부분의 시스템에서 읽기가 쓰기보다 100:1, 심지어 1000:1로 많기 때문에 유용합니다.</p><p>단점: 데이터가 중복되고, 중복 사본을 동기화하는 제약 조건이 DB 설계를 복잡하게 하며, 쓰기 부하가 크면 정규화된 DB보다 성능이 나쁠 수 있습니다.</p>`,
	},
	{
		id: 'sql-tuning-schema',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: 'SQL 튜닝에서 스키마를 다듬을 때 CHAR/VARCHAR, TEXT, INT, DECIMAL, BLOB, NOT NULL에 관한 권장 사항은?',
		back: `<ul><li>고정 길이 필드는 <code>VARCHAR</code> 대신 <code>CHAR</code>: 빠른 랜덤 접근이 가능합니다(<code>VARCHAR</code>는 문자열 끝을 찾아야 다음으로 넘어감).</li><li>블로그 글 같은 큰 텍스트는 <code>TEXT</code>: 불리언 검색도 지원합니다.</li><li>2^32(약 40억)까지의 큰 수는 <code>INT</code></li><li>통화는 부동소수점 표현 오차를 피하려고 <code>DECIMAL</code></li><li>큰 <code>BLOBS</code>는 저장하지 말고 객체를 가져올 위치를 저장</li><li>해당되면 <code>NOT NULL</code> 제약으로 검색 성능 향상</li></ul>`,
	},
	{
		id: 'sql-good-indices',
		deck: 'concepts',
		topic: 'topics/database/rdbms',
		front: '인덱스는 어떤 쿼리를 빠르게 하며, 대가는 무엇인가요?',
		back: `<ul><li><code>SELECT</code>, <code>GROUP BY</code>, <code>ORDER BY</code>, <code>JOIN</code>에 쓰는 컬럼은 인덱스로 빨라질 수 있습니다.</li><li>인덱스는 보통 자가 균형 B-tree로, 데이터를 정렬된 상태로 유지하며 검색·순차 접근·삽입·삭제를 로그 시간에 처리합니다.</li><li>대가: 데이터를 메모리에 두므로 공간이 더 필요하고, 인덱스도 갱신해야 해서 쓰기가 느려질 수 있습니다.</li><li>대량 적재 시에는 인덱스를 끄고 적재한 뒤 다시 빌드하는 편이 빠를 수 있습니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: NoSQL
	// ---------------------------------------------------------------------------
	{
		id: 'nosql-base',
		deck: 'concepts',
		topic: 'topics/database/nosql',
		front: 'NoSQL의 일반적인 특징과 BASE 속성을 설명해 보세요.',
		back: `<p>NoSQL은 데이터를 키-값, 문서, 와이드 컬럼, 그래프 형태로 표현합니다. 데이터는 비정규화되고 조인은 보통 애플리케이션 코드에서 하며, 대부분 진정한 ACID 트랜잭션이 없고 최종적 일관성을 선호합니다. BASE는 CAP 관점에서 일관성보다 가용성을 택합니다.</p><ul><li><strong>Basically available</strong>: 시스템이 가용성을 보장합니다.</li><li><strong>Soft state</strong>: 입력이 없어도 시스템 상태가 시간에 따라 바뀔 수 있습니다.</li><li><strong>Eventual consistency</strong>: 그 기간 동안 입력이 없다면 시간이 지나 일관된 상태가 됩니다.</li></ul>`,
	},
	{
		id: 'key-value-store',
		deck: 'concepts',
		topic: 'topics/database/nosql',
		front: '키-값 저장소(key-value store)의 추상화, 특징, 주 용도는?',
		back: `<p>추상화: <strong>해시 테이블</strong>. 보통 O(1) 읽기·쓰기를 제공하며 메모리나 SSD를 기반으로 합니다. 키를 사전순으로 유지해 키 범위를 효율적으로 조회할 수 있는 저장소도 있습니다. 성능이 높아 단순한 데이터 모델이나, 인메모리 캐시 계층처럼 빠르게 바뀌는 데이터에 쓰입니다. 제공하는 연산이 제한적이라 추가 연산이 필요하면 복잡성이 애플리케이션 계층으로 넘어갑니다.</p>`,
	},
	{
		id: 'document-store',
		deck: 'concepts',
		topic: 'topics/database/nosql',
		front: '문서 저장소(document store)의 추상화, 특징, 주 용도는?',
		back: `<p>추상화: <strong>문서를 값으로 저장하는 키-값 저장소</strong>. 문서(XML, JSON, 바이너리 등)가 한 객체의 모든 정보를 담고, 문서 내부 구조로 쿼리하는 API나 쿼리 언어를 제공합니다. 컬렉션·태그·메타데이터·디렉터리로 구성하지만 같은 그룹의 문서도 필드가 완전히 다를 수 있습니다(예: MongoDB, CouchDB). 유연성이 높아 가끔 바뀌는 데이터를 다룰 때 쓰입니다.</p>`,
	},
	{
		id: 'wide-column-store',
		deck: 'concepts',
		topic: 'topics/database/nosql',
		front: '와이드 컬럼 저장소(wide column store)의 추상화, 데이터 구조, 주 용도는?',
		back: `<p>추상화: 중첩 맵 <code>ColumnFamily&lt;RowKey, Columns&lt;ColKey, Value, Timestamp&gt;&gt;</code>. 기본 단위는 컬럼(이름/값 쌍)이고, 컬럼은 컬럼 패밀리(SQL 테이블과 유사)로 묶이며, 같은 row key를 가진 컬럼들이 하나의 행이 됩니다. 각 값에는 버전 관리와 충돌 해결용 타임스탬프가 있습니다. Bigtable, HBase, Cassandra가 대표적이며, 고가용성·고확장성을 제공해 매우 큰 데이터셋에 쓰입니다.</p>`,
	},
	{
		id: 'graph-database',
		deck: 'concepts',
		topic: 'topics/database/nosql',
		front: '그래프 데이터베이스의 추상화와 강점, 한계는?',
		back: `<p>추상화: <strong>그래프</strong>. 각 노드는 레코드, 각 아크(arc)는 두 노드 사이의 관계입니다. 외래 키가 많거나 다대다 관계처럼 복잡한 관계를 표현하는 데 최적화되어 소셜 네트워크 같은 모델에서 높은 성능을 냅니다. 다만 비교적 새로워 널리 쓰이지 않고, 개발 도구와 자료를 찾기 어려울 수 있으며, 상당수는 REST API로만 접근할 수 있습니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: SQL or NoSQL
	// ---------------------------------------------------------------------------
	{
		id: 'reasons-for-sql',
		deck: 'concepts',
		topic: 'topics/database/sql-or-nosql',
		front: 'SQL을 선택할 만한 이유는 무엇인가요?',
		back: `<ul><li>구조화된 데이터, 엄격한 스키마</li><li>관계형 데이터, 복잡한 조인 필요</li><li>트랜잭션</li><li>명확한 확장 패턴</li><li>더 성숙한 생태계(개발자, 커뮤니티, 코드, 도구 등)</li><li>인덱스 조회가 매우 빠름</li></ul>`,
	},
	{
		id: 'reasons-for-nosql',
		deck: 'concepts',
		topic: 'topics/database/sql-or-nosql',
		front: 'NoSQL을 선택할 만한 이유는 무엇인가요?',
		back: `<ul><li>반구조화된 데이터</li><li>동적이거나 유연한 스키마</li><li>비관계형 데이터, 복잡한 조인 불필요</li><li>수 TB(또는 PB)의 데이터 저장</li><li>매우 데이터 집약적인 워크로드</li><li>매우 높은 IOPS 처리량</li></ul>`,
	},
	{
		id: 'nosql-sample-data',
		deck: 'concepts',
		topic: 'topics/database/sql-or-nosql',
		front: 'NoSQL에 잘 맞는 데이터의 예는?',
		back: `<ul><li>클릭스트림과 로그 데이터의 빠른 수집</li><li>리더보드나 점수 데이터</li><li>장바구니 같은 임시 데이터</li><li>자주 접근하는(hot) 테이블</li><li>메타데이터/조회(lookup) 테이블</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: cache
	// ---------------------------------------------------------------------------
	{
		id: 'cache-why',
		deck: 'concepts',
		topic: 'topics/cache',
		front: '캐시는 무엇을 개선하며, 데이터베이스 앞에 캐시를 두면 특히 어떤 문제를 완화하나요?',
		back: `<p>페이지 로드 시간을 줄이고 서버와 데이터베이스의 부하를 낮춥니다. 데이터베이스는 파티션 간 읽기·쓰기가 고르게 분산될 때 유리한데, 인기 항목이 분포를 쏠리게 해 병목을 만들 수 있습니다. 데이터베이스 앞의 캐시는 이런 <strong>불균등한 부하와 트래픽 급증(spike)</strong>을 흡수합니다.</p>`,
	},
	{
		id: 'cache-locations',
		deck: 'concepts',
		topic: 'topics/cache',
		front: '캐시를 둘 수 있는 위치(계층)를 나열해 보세요.',
		back: `<ul><li><strong>클라이언트 캐싱</strong>: OS나 브라우저</li><li><strong>CDN 캐싱</strong>: CDN도 일종의 캐시</li><li><strong>웹 서버 캐싱</strong>: 리버스 프록시나 Varnish가 정적·동적 콘텐츠를 직접 제공</li><li><strong>데이터베이스 캐싱</strong>: 기본 설정의 캐시를 사용 패턴에 맞게 조정</li><li><strong>애플리케이션 캐싱</strong>: Memcached, Redis 같은 인메모리 캐시</li></ul>`,
	},
	{
		id: 'application-caching',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Memcached, Redis 같은 애플리케이션 캐시는 왜 빠르며, 한정된 RAM은 어떻게 관리하나요? Redis의 추가 기능은?',
		back: `<p>애플리케이션과 데이터 저장소 사이에 있는 키-값 저장소로, 데이터를 <strong>RAM</strong>에 두므로 디스크에 저장하는 일반 데이터베이스보다 훨씬 빠릅니다. RAM은 디스크보다 한정적이므로 <strong>LRU</strong> 같은 캐시 무효화 알고리즘으로 cold 항목을 내보내고 hot 데이터를 RAM에 유지합니다. Redis는 <strong>영속성 옵션</strong>과 sorted set·list 같은 <strong>내장 자료 구조</strong>를 추가로 제공합니다.</p>`,
	},
	{
		id: 'query-vs-object-caching',
		deck: 'concepts',
		topic: 'topics/cache',
		front: '데이터베이스 쿼리 수준 캐싱과 객체 수준 캐싱을 비교해 보세요. 무엇을 캐시하면 좋은가요?',
		back: `<ul><li><strong>쿼리 수준</strong>: 쿼리를 해시해 키로, 결과를 값으로 저장합니다. 복잡한 쿼리의 캐시를 지우기 어렵고, 테이블 셀 하나가 바뀌면 그 셀을 포함할 수 있는 모든 캐시 쿼리를 지워야 하는 만료 문제가 있습니다.</li><li><strong>객체 수준</strong>: DB에서 조립한 데이터를 클래스 인스턴스나 자료 구조로 캐시합니다. 기반 데이터가 바뀌면 그 객체만 제거하면 되고, 워커가 최신 캐시 객체를 소비하는 비동기 처리도 가능합니다.</li></ul><p>캐시 후보: 사용자 세션, 완전히 렌더링된 웹 페이지, 활동 스트림, 사용자 그래프 데이터</p>`,
	},
	{
		id: 'cache-aside-flow',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Cache-aside(lazy loading) 패턴에서 애플리케이션은 읽기 요청을 어떤 순서로 처리하나요?',
		back: `<p>캐시는 저장소와 직접 상호작용하지 않고, 애플리케이션이 저장소 읽기·쓰기를 책임집니다.</p><ul><li>캐시에서 항목을 찾음 → 캐시 미스</li><li>데이터베이스에서 항목을 로드</li><li>캐시에 항목을 추가</li><li>항목을 반환</li></ul><p>요청된 데이터만 캐시되므로 요청되지 않는 데이터로 캐시가 차지 않습니다. Memcached가 보통 이렇게 쓰입니다.</p>`,
	},
	{
		id: 'cache-aside-disadvantages',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Cache-aside의 단점과 완화 방법은?',
		back: `<ul><li>캐시 미스마다 <strong>세 번의 왕복</strong>이 생겨 눈에 띄는 지연이 생길 수 있습니다.</li><li>DB에서 데이터가 갱신되면 캐시 데이터가 오래될(stale) 수 있습니다. TTL을 설정해 캐시 항목을 강제로 갱신하거나 write-through를 함께 써서 완화합니다.</li><li>노드가 실패하면 비어 있는 새 노드로 교체되어 지연이 늘어납니다.</li></ul>`,
	},
	{
		id: 'write-through',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Write-through 패턴의 동작과 장단점은?',
		back: `<p>애플리케이션은 캐시를 주 데이터 저장소처럼 읽고 쓰고, 캐시가 DB에 <strong>동기적으로</strong> 씁니다. 쓰기 때문에 전체 동작은 느리지만, 방금 쓴 데이터를 이후에 읽는 것은 빠르고 캐시 데이터가 오래되지 않습니다(사용자는 보통 읽기보다 쓰기 지연에 관대함).</p><p>단점: 장애나 확장으로 새로 생긴 노드는 DB에서 해당 항목이 갱신될 때까지 캐시하지 않습니다(cache-aside를 함께 써서 완화). 쓴 데이터 대부분이 읽히지 않을 수 있습니다(TTL로 최소화).</p>`,
	},
	{
		id: 'write-behind',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Write-behind(write-back) 패턴의 동작과 단점은?',
		back: `<p>캐시에 항목을 추가·갱신한 뒤, 데이터 저장소에는 <strong>비동기적으로</strong> 써서 쓰기 성능을 높입니다.</p><p>단점: 내용이 저장소에 반영되기 전에 캐시가 다운되면 <strong>데이터가 손실</strong>될 수 있고, cache-aside나 write-through보다 구현이 복잡합니다.</p>`,
	},
	{
		id: 'refresh-ahead',
		deck: 'concepts',
		topic: 'topics/cache',
		front: 'Refresh-ahead 패턴은 무엇이며, 언제 역효과가 나나요?',
		back: `<p>최근 접근한 캐시 항목을 만료되기 전에 자동으로 갱신하도록 캐시를 설정합니다. 앞으로 필요할 항목을 정확히 예측하면 read-through보다 지연을 줄일 수 있지만, <strong>예측이 빗나가면</strong> refresh-ahead를 쓰지 않을 때보다 성능이 나빠질 수 있습니다.</p>`,
	},
	{
		id: 'cache-disadvantages',
		deck: 'concepts',
		topic: 'topics/cache',
		front: '캐시 도입의 일반적인 단점은?',
		back: `<ul><li>캐시 무효화를 통해 캐시와 데이터베이스 같은 원본(source of truth) 사이의 일관성을 유지해야 합니다.</li><li>캐시 무효화는 어려운 문제이며, 언제 캐시를 갱신할지에 따른 복잡성이 추가됩니다.</li><li>Redis나 memcached를 추가하는 등 애플리케이션을 바꿔야 합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: asynchronism
	// ---------------------------------------------------------------------------
	{
		id: 'async-when',
		deck: 'concepts',
		topic: 'topics/asynchronism',
		front: '비동기 워크플로는 언제 도움이 되고, 언제는 동기 처리가 더 낫나요?',
		back: `<ul><li><strong>도움이 될 때</strong>: 인라인으로 처리하면 오래 걸리는 비싼 작업의 요청 시간을 줄일 때, 주기적인 데이터 집계처럼 시간이 걸리는 작업을 미리 해 둘 때</li><li><strong>동기가 나을 때</strong>: 저렴한 계산이나 실시간 워크플로. 큐를 도입하면 지연과 복잡성이 늘어날 수 있습니다.</li></ul>`,
	},
	{
		id: 'message-queue-flow',
		deck: 'concepts',
		topic: 'topics/asynchronism',
		front: '메시지 큐를 이용한 비동기 워크플로의 흐름을 설명해 보세요.',
		back: `<ul><li>애플리케이션이 작업(job)을 큐에 발행하고 사용자에게 작업 상태를 알립니다.</li><li>워커가 큐에서 작업을 가져와 처리한 뒤 완료를 알립니다.</li></ul><p>사용자는 블로킹되지 않고 작업은 백그라운드에서 처리됩니다. 그동안 클라이언트는 작업이 끝난 것처럼 보이도록 약간의 처리를 할 수 있습니다. 예: 트윗은 내 타임라인에 바로 보이지만, 모든 팔로워에게 전달되기까지는 시간이 걸릴 수 있습니다.</p>`,
	},
	{
		id: 'message-brokers',
		deck: 'concepts',
		topic: 'topics/asynchronism',
		front: 'Redis, RabbitMQ, Amazon SQS를 메시지 큐로 쓸 때 각각의 주의점은?',
		back: `<ul><li><strong>Redis</strong>: 단순한 메시지 브로커로 유용하지만 메시지가 유실될 수 있습니다.</li><li><strong>RabbitMQ</strong>: 인기 있지만 AMQP 프로토콜에 맞춰야 하고 노드를 직접 관리해야 합니다.</li><li><strong>Amazon SQS</strong>: 호스팅형이지만 지연이 클 수 있고 메시지가 두 번 전달될 수 있습니다.</li></ul>`,
	},
	{
		id: 'task-queue',
		deck: 'concepts',
		topic: 'topics/asynchronism',
		front: '작업 큐(task queue)는 메시지 큐와 무엇이 다른가요?',
		back: `<p>메시지 큐는 메시지를 받고, 보관하고, 전달합니다. 작업 큐는 작업과 관련 데이터를 받아 <strong>실행</strong>한 뒤 결과를 전달합니다. 작업 큐는 스케줄링을 지원할 수 있고, 계산 집약적인 작업을 백그라운드에서 실행하는 데 쓰입니다. 예: Celery(스케줄링 지원, 주로 Python 지원).</p>`,
	},
	{
		id: 'back-pressure',
		deck: 'concepts',
		topic: 'topics/asynchronism',
		front: '배압(back pressure)은 어떤 문제를 해결하며, 큐가 가득 차면 클라이언트는 어떤 응답을 받나요?',
		back: `<p>큐가 크게 늘어 메모리보다 커지면 캐시 미스와 디스크 읽기가 생겨 성능이 더 나빠집니다. 배압은 <strong>큐 크기를 제한</strong>해 이미 큐에 있는 작업의 높은 처리량과 좋은 응답 시간을 유지합니다. 큐가 가득 차면 클라이언트는 server busy 또는 <strong>HTTP 503</strong> 상태 코드를 받고, 나중에(예: <strong>지수 백오프</strong>로) 다시 시도합니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: communication
	// ---------------------------------------------------------------------------
	{
		id: 'http-verbs',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'HTTP 메서드 GET, POST, PUT, PATCH, DELETE 중 멱등(idempotent)한 것, 안전(safe)한 것, 캐시 가능한 것은?',
		back: `<ul><li><strong>멱등</strong>(여러 번 호출해도 결과가 같음): GET, PUT, DELETE (POST, PATCH는 아님)</li><li><strong>안전</strong>: GET만</li><li><strong>캐시 가능</strong>: GET은 가능, POST·PATCH는 응답에 freshness 정보가 있을 때만, PUT·DELETE는 불가</li></ul>`,
	},
	{
		id: 'tcp-guarantees',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'TCP는 패킷이 순서대로, 손상 없이 도착하도록 어떻게 보장하며, 그 대가는?',
		back: `<p>핸드셰이크로 연결을 맺고 끊는 연결 지향 프로토콜입니다. 패킷마다 <strong>시퀀스 번호와 체크섬</strong>을 두고, <strong>확인 응답(ACK)과 자동 재전송</strong>을 사용합니다. 흐름 제어와 혼잡 제어도 구현하며, 타임아웃이 여러 번 나면 연결을 끊습니다. 이런 보장 때문에 지연이 생기고, 보통 UDP보다 전송 효율이 낮습니다.</p>`,
	},
	{
		id: 'tcp-vs-udp',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'UDP 대신 TCP를 써야 할 때와, TCP 대신 UDP를 써야 할 때는?',
		back: `<ul><li><strong>TCP</strong>: 모든 데이터가 온전히 도착해야 할 때, 네트워크 처리량을 자동으로 최대한 활용하고 싶을 때. 예: 웹 서버, 데이터베이스 정보, SMTP, FTP, SSH</li><li><strong>UDP</strong>: 가장 낮은 지연이 필요할 때, 늦게 도착한 데이터가 유실보다 나쁠 때, 오류 정정을 직접 구현하고 싶을 때. 예: VoIP, 화상 채팅, 스트리밍, 실시간 멀티플레이어 게임</li></ul>`,
	},
	{
		id: 'rpc-definition',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'RPC(Remote Procedure Call)는 무엇이며, 주로 어디에 쓰이나요?',
		back: `<p>클라이언트가 다른 주소 공간(보통 원격 서버)에서 프로시저를 실행시키는 방식으로, 서버와 통신하는 세부 사항을 추상화해 로컬 호출처럼 코드를 작성합니다. 원격 호출은 로컬 호출보다 느리고 덜 안정적이므로 구분하는 것이 좋습니다. RPC는 <strong>동작(behavior) 노출</strong>에 초점을 두며, 용도에 맞게 네이티브 호출을 직접 만들 수 있어 성능상 이유로 <strong>내부 통신</strong>에 자주 쓰입니다. 대표 프레임워크: Protobuf, Thrift, Avro.</p>`,
	},
	{
		id: 'rpc-disadvantages',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'RPC의 단점은?',
		back: `<ul><li>RPC 클라이언트가 서비스 구현에 강하게 결합됩니다.</li><li>새 연산이나 유스케이스마다 새 API를 정의해야 합니다.</li><li>디버깅이 어려울 수 있습니다.</li><li>기존 기술을 바로 활용하지 못할 수 있습니다. 예: Squid 같은 캐싱 서버에서 RPC 호출을 제대로 캐시하려면 추가 작업이 필요합니다.</li></ul>`,
	},
	{
		id: 'rest-qualities',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'REST란 무엇이며, RESTful 인터페이스의 네 가지 품질은?',
		back: `<p>클라이언트가 서버가 관리하는 리소스 집합에 작용하는 클라이언트/서버 모델의 아키텍처 스타일입니다. 모든 통신은 무상태(stateless)이고 캐시 가능해야 합니다.</p><ul><li><strong>리소스 식별(HTTP의 URI)</strong>: 연산과 무관하게 같은 URI 사용</li><li><strong>표현으로 변경(HTTP 메서드)</strong>: 메서드, 헤더, 본문 사용</li><li><strong>자기 서술적 에러 메시지(HTTP 상태 코드)</strong>: 바퀴를 다시 발명하지 말고 상태 코드 사용</li><li><strong>HATEOAS(HTTP용 HTML 인터페이스)</strong>: 웹 서비스가 브라우저에서 완전히 접근 가능해야 함</li></ul>`,
	},
	{
		id: 'rest-disadvantages',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'REST의 단점은?',
		back: `<ul><li>리소스가 단순한 계층으로 자연스럽게 구성되지 않으면 맞지 않을 수 있습니다. 예: 지난 1시간 동안 특정 이벤트에 맞는 갱신 레코드 조회는 경로로 표현하기 어렵습니다.</li><li>몇 개의 메서드(GET, POST, PUT, DELETE, PATCH)에 의존해 유스케이스에 맞지 않을 때가 있습니다. 예: 만료 문서를 보관 폴더로 옮기기</li><li>중첩된 리소스는 화면 하나를 그리려고 여러 번 왕복해야 해 모바일에 불리합니다.</li><li>응답 필드가 늘수록 오래된 클라이언트도 필요 없는 필드까지 받아 페이로드와 지연이 커집니다.</li></ul>`,
	},
	{
		id: 'rpc-vs-rest',
		deck: 'concepts',
		topic: 'topics/communication',
		front: 'RPC와 REST는 각각 무엇을 노출하는 데 초점을 두며, 언제 선택하나요?',
		back: `<ul><li><strong>RPC</strong>: <strong>동작</strong> 노출에 초점을 두며 성능을 위해 내부 통신에 자주 쓰입니다. 대상 플랫폼을 알고, 로직 접근 방식과 에러 처리를 통제하고 싶고, 성능과 사용자 경험이 최우선이면 네이티브 라이브러리(SDK)를 선택합니다.</li><li><strong>REST</strong>: <strong>데이터</strong> 노출에 초점을 두며 클라이언트/서버 결합을 최소화해 공개 HTTP API에 자주 쓰입니다. 무상태라 수평 확장과 파티셔닝에 유리합니다.</li></ul>`,
	},
	{
		id: 'rpc-vs-rest-example',
		deck: 'concepts',
		topic: 'topics/communication',
		front: '"사람 1234 탈퇴(Resign)"와 "아이템 456 수정"을 RPC 스타일과 REST 스타일로 각각 어떻게 호출하나요?',
		back: `<ul><li><strong>탈퇴</strong>: RPC <code>POST /resign</code> + <code>{"personid": "1234"}</code> / REST <code>DELETE /persons/1234</code></li><li><strong>아이템 수정</strong>: RPC <code>POST /modifyItem</code> + <code>{"itemid": "456"; "key": "value"}</code> / REST <code>PUT /items/456</code> + <code>{"key": "value"}</code></li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: security
	// ---------------------------------------------------------------------------
	{
		id: 'security-basics',
		deck: 'concepts',
		topic: 'topics/security',
		front: '보안 전문 포지션이 아니라면 시스템 설계 면접에서 알아야 할 보안 기본 사항은?',
		back: `<ul><li>전송 중(in transit) 및 저장 시(at rest) 암호화</li><li>XSS와 SQL injection을 막기 위해 모든 사용자 입력(또는 사용자에게 노출된 입력 파라미터)을 정제(sanitize)</li><li>SQL injection을 막기 위해 파라미터화된 쿼리(parameterized queries) 사용</li><li>최소 권한 원칙(principle of least privilege) 적용</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: appendix, powers of two
	// ---------------------------------------------------------------------------
	{
		id: 'powers-of-two-10-20',
		deck: 'concepts',
		topic: 'appendix/powers-of-two',
		front: '2^10과 2^20의 정확한 값, 근삿값, 바이트 단위는?',
		back: `<ul><li>2^10 = 1,024 ≈ 1 thousand → <strong>1 KB</strong></li><li>2^20 = 1,048,576 ≈ 1 million → <strong>1 MB</strong></li></ul>`,
	},
	{
		id: 'powers-of-two-30-40',
		deck: 'concepts',
		topic: 'appendix/powers-of-two',
		front: '2^30과 2^40의 정확한 값, 근삿값, 바이트 단위는?',
		back: `<ul><li>2^30 = 1,073,741,824 ≈ 1 billion → <strong>1 GB</strong></li><li>2^40 = 1,099,511,627,776 ≈ 1 trillion → <strong>1 TB</strong></li></ul>`,
	},
	{
		id: 'powers-of-two-16-32',
		deck: 'concepts',
		topic: 'appendix/powers-of-two',
		front: '2^16과 2^32의 정확한 값과 바이트 단위는?',
		back: `<ul><li>2^16 = 65,536 → <strong>64 KB</strong></li><li>2^32 = 4,294,967,296 → <strong>4 GB</strong> (SQL 튜닝에서 <code>INT</code>가 담는 "2^32, 약 40억"과 같은 수)</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: appendix, latency numbers
	// ---------------------------------------------------------------------------
	{
		id: 'latency-cpu-memory',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'L1 캐시 참조, L2 캐시 참조, 메인 메모리 참조의 지연 시간은?',
		back: `<ul><li>L1 캐시 참조: <strong>0.5 ns</strong></li><li>L2 캐시 참조: <strong>7 ns</strong> (L1의 14배)</li><li>메인 메모리 참조: <strong>100 ns</strong> (L2의 20배, L1의 200배)</li></ul><p>참고: 분기 예측 실패 5 ns, 뮤텍스 lock/unlock 25 ns</p>`,
	},
	{
		id: 'latency-1kb-ops',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'Zippy로 1 KB를 압축하는 시간과, 1 Gbps 네트워크로 1 KB를 보내는 시간은?',
		back: `<p>둘 다 약 <strong>10 us</strong>(10,000 ns)입니다.</p>`,
	},
	{
		id: 'latency-ssd-random-read',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'SSD에서 4 KB를 랜덤으로 읽는 데 걸리는 시간은?',
		back: `<p>약 <strong>150 us</strong>(150,000 ns)입니다(~1GB/sec SSD 기준).</p>`,
	},
	{
		id: 'latency-memory-1mb',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: '메모리에서 1 MB를 순차로 읽는 데 걸리는 시간은?',
		back: `<p>약 <strong>250 us</strong>(250,000 ns)입니다. SSD에서 1 MB를 순차로 읽는 시간(1 ms)의 1/4입니다.</p>`,
	},
	{
		id: 'latency-datacenter-round-trip',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: '같은 데이터 센터 안에서 한 번 왕복(round trip)하는 시간과, 초당 가능한 왕복 횟수는?',
		back: `<p>약 <strong>500 us</strong>(0.5 ms)이며, 데이터 센터 안에서는 초당 약 <strong>2,000번</strong> 왕복할 수 있습니다.</p>`,
	},
	{
		id: 'latency-ssd-1mb',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'SSD에서 1 MB를 순차로 읽는 데 걸리는 시간은? 메모리와 비교하면?',
		back: `<p>약 <strong>1 ms</strong>(1,000 us)로, 메모리에서 1 MB를 순차로 읽는 시간(250 us)의 <strong>4배</strong>입니다.</p>`,
	},
	{
		id: 'latency-hdd',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'HDD 탐색(seek) 시간과 HDD에서 1 MB를 순차로 읽는 시간은?',
		back: `<ul><li>HDD seek: <strong>10 ms</strong> (데이터 센터 왕복의 20배)</li><li>HDD에서 1 MB 순차 읽기: <strong>30 ms</strong> (메모리의 120배, SSD의 30배)</li></ul><p>참고: 1 Gbps 네트워크로 1 MB를 순차로 읽으면 10 ms(메모리의 40배, SSD의 10배)입니다.</p>`,
	},
	{
		id: 'latency-intercontinental',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: '캘리포니아 → 네덜란드 → 캘리포니아로 패킷을 보내는 시간과, 초당 가능한 전 세계 왕복 횟수는?',
		back: `<p>약 <strong>150 ms</strong>이며, 전 세계 왕복은 초당 <strong>6~7번</strong> 정도 가능합니다.</p>`,
	},
	{
		id: 'latency-sequential-throughput',
		deck: 'concepts',
		topic: 'appendix/latency-numbers',
		front: 'HDD, 1 Gbps 이더넷, SSD, 메인 메모리의 순차 읽기 속도(어림값)는?',
		back: `<ul><li>HDD: <strong>30 MB/s</strong></li><li>1 Gbps 이더넷: <strong>100 MB/s</strong></li><li>SSD: <strong>1 GB/s</strong></li><li>메인 메모리: <strong>4 GB/s</strong></li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: interview approach
	// ---------------------------------------------------------------------------
	{
		id: 'approach-four-steps',
		deck: 'concepts',
		topic: 'interview/approach',
		front: '시스템 설계 면접 질문에 접근하는 4단계는?',
		back: `<p>시스템 설계 면접은 <strong>열린 대화</strong>이며, 지원자가 대화를 주도해야 합니다.</p><ul><li>1단계: 유스케이스, 제약 조건, 가정 정리</li><li>2단계: 고수준 설계 작성</li><li>3단계: 핵심 구성 요소 설계</li><li>4단계: 설계 확장</li></ul>`,
	},
	{
		id: 'approach-step1-questions',
		deck: 'concepts',
		topic: 'interview/approach',
		front: '1단계(유스케이스·제약 조건·가정 정리)에서 요구 사항과 범위를 파악하려면 어떤 질문을 하나요?',
		back: `<ul><li>누가, 어떻게 사용하나요? 사용자는 몇 명인가요?</li><li>시스템은 무엇을 하나요? 입력과 출력은 무엇인가요?</li><li>처리할 데이터 양은 얼마인가요?</li><li>초당 요청은 몇 건인가요?</li><li>예상 읽기:쓰기 비율은 얼마인가요?</li></ul>`,
	},
	{
		id: 'approach-step2-3',
		deck: 'concepts',
		topic: 'interview/approach',
		front: '2단계(고수준 설계)와 3단계(핵심 구성 요소 설계)에서는 무엇을 하나요? URL 단축 서비스라면 3단계에서 무엇을 논의하나요?',
		back: `<p>2단계에서는 주요 구성 요소와 연결을 스케치하고 아이디어를 정당화합니다. 3단계에서는 각 핵심 구성 요소를 깊이 다룹니다. URL 단축 서비스라면 다음을 논의합니다.</p><ul><li>전체 URL의 해시 생성·저장: MD5와 Base62, 해시 충돌, SQL 또는 NoSQL, 데이터베이스 스키마</li><li>해시된 URL을 전체 URL로 변환: 데이터베이스 조회</li><li>API와 객체 지향 설계</li></ul>`,
	},
	{
		id: 'approach-step4-iterative',
		deck: 'concepts',
		topic: 'interview/approach',
		front: '4단계(설계 확장)는 어떻게 진행하나요? 초기 설계에서 곧바로 최종 설계로 넘어가도 되나요?',
		back: `<p>안 됩니다. 제약 조건에 비추어 병목을 찾고 해결하되, 다음 과정을 반복적으로 진행한다고 설명해야 합니다.</p><ul><li>1) 벤치마크/부하 테스트</li><li>2) 프로파일링으로 병목 파악</li><li>3) 대안과 트레이드오프를 평가하며 병목 해결</li><li>4) 반복</li></ul><p>로드 밸런서, 수평 확장, 캐싱, 데이터베이스 샤딩 등이 필요한지 검토합니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// concepts: back-of-the-envelope estimation
	// ---------------------------------------------------------------------------
	{
		id: 'estimation-seconds-per-month',
		deck: 'concepts',
		topic: 'interview/estimation',
		front: '어림 계산에서 한 달은 몇 초로 잡나요? 초당 1건은 한 달에 몇 건인가요?',
		back: `<p>한 달은 약 <strong>250만(2.5 million) 초</strong>로 잡으므로, 초당 1건 = 월 <strong>250만 건</strong>입니다.</p>`,
	},
	{
		id: 'estimation-rps-conversions',
		deck: 'concepts',
		topic: 'interview/estimation',
		front: '초당 40건과 초당 400건은 한 달에 각각 몇 건인가요?',
		back: `<ul><li>초당 40건 = 월 <strong>1억(100 million)</strong> 건</li><li>초당 400건 = 월 <strong>10억(1 billion)</strong> 건</li></ul><p>월간 수치를 초당 수치로 바꿀 때는 "월 10억 건 = 초당 400건" 비율을 곱하면 편합니다.</p>`,
	},
	{
		id: 'estimation-practice-monthly-to-rps',
		deck: 'concepts',
		topic: 'interview/estimation',
		front: '월 150억(15 billion) 건의 트윗과 월 2,500억(250 billion) 건의 읽기 요청은 각각 초당 몇 건인가요?',
		back: `<p>"월 10억 건 = 초당 400건"을 이용합니다.</p><ul><li>150억 × (400 / 10억) = 초당 <strong>6,000</strong>건</li><li>2,500억 × (400 / 10억) = 초당 <strong>10만(100 thousand)</strong>건</li></ul>`,
	},
	{
		id: 'estimation-storage-growth',
		deck: 'concepts',
		topic: 'interview/estimation',
		front: '쓰기 1건당 1 KB, 월 10억 건의 쓰기라면 한 달과 3년 동안 새로 쌓이는 콘텐츠는?',
		back: `<p>1 KB × 10억 = 월 <strong>1 TB</strong>이고, 3년(36개월)이면 <strong>36 TB</strong>입니다. 대부분의 쓰기가 기존 데이터 갱신이 아닌 새 콘텐츠라고 가정합니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// problems: Pastebin
	// ---------------------------------------------------------------------------
	{
		id: 'pastebin-estimates',
		deck: 'problems',
		topic: 'system-design/pastebin',
		front: 'Pastebin 설계: 월 1,000만 건 쓰기와 1억 건 읽기를 가정할 때 어림 계산 결과(저장량, 초당 요청)는?',
		back: `<ul><li>paste당 약 1.27 KB (본문 1 KB + 메타데이터)</li><li>월 12.7 GB, 3년간 약 450 GB의 새 콘텐츠</li><li>3년간 3억 6천만(360 million) 개의 shortlink</li><li>평균 초당 쓰기 4건, 읽기 40건 (읽기:쓰기 = 10:1)</li></ul>`,
	},
	{
		id: 'pastebin-shortlink-generation',
		deck: 'problems',
		topic: 'system-design/pastebin',
		front: 'Pastebin 설계: 고유한 단축 URL(shortlink)은 어떻게 생성하며, 왜 Base 64가 아닌 Base 62를 쓰나요?',
		back: `<p>사용자 IP 주소 + 타임스탬프(또는 무작위 데이터)의 <strong>MD5</strong> 해시를 <strong>Base 62</strong>로 인코딩하고 앞 <strong>7자</strong>를 씁니다. 62^7가지 값이면 3년간 3억 6천만 개의 shortlink를 충분히 감당하며, 생성한 URL이 SQL Database에 이미 있으면 다시 생성합니다. Base 62는 <code>[a-zA-Z0-9]</code>만 써서 URL에서 특수 문자 이스케이프가 필요 없지만, Base 64는 추가 문자 <code>+</code>와 <code>/</code> 때문에 URL에 문제가 됩니다.</p>`,
	},
	{
		id: 'pastebin-storage-and-scaling',
		deck: 'problems',
		topic: 'system-design/pastebin',
		front: 'Pastebin 설계: paste 본문과 메타데이터는 어디에 저장하고, 분석·만료·읽기 트래픽은 어떻게 처리하나요?',
		back: `<ul><li>메타데이터는 <strong>SQL Database</strong>의 <code>pastes</code> 테이블(<code>shortlink</code>가 기본 키), 본문은 Amazon S3 같은 <strong>Object Store</strong>에 저장</li><li>페이지 분석은 실시간일 필요가 없으므로 <strong>Web Server</strong> 로그를 <strong>MapReduce</strong>로 집계</li><li>만료된 paste는 SQL Database를 스캔해 삭제(또는 만료 표시)</li><li>인기 콘텐츠 읽기는 <strong>Memory Cache</strong>가, 캐시 미스는 <strong>SQL Read Replicas</strong>가 처리</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: Twitter
	// ---------------------------------------------------------------------------
	{
		id: 'twitter-estimates',
		deck: 'problems',
		topic: 'system-design/twitter',
		front: 'Twitter 타임라인 설계: 핵심 어림 계산 수치(트윗, 팬아웃, 읽기, 검색, 저장량)는?',
		back: `<ul><li>하루 5억 트윗(월 150억) → 초당 6,000 트윗</li><li>트윗당 평균 10회 팬아웃 → 초당 6만 건 팬아웃 전달</li><li>월 2,500억 읽기 → 초당 10만 읽기</li><li>월 100억 검색 → 초당 4,000 검색</li><li>트윗당 약 10 KB → 월 150 TB, 3년간 5.4 PB</li></ul>`,
	},
	{
		id: 'twitter-fanout-home-timeline',
		deck: 'problems',
		topic: 'system-design/twitter',
		front: 'Twitter 설계: 트윗을 게시하면 Fan Out Service는 무엇을 하며, 홈 타임라인은 왜 Memory Cache에 저장하나요?',
		back: `<p>초당 6만 건의 팬아웃 쓰기는 전통적인 관계형 DB에 과부하를 주므로, NoSQL이나 <strong>Memory Cache</strong>처럼 쓰기가 빠른 저장소를 씁니다.</p><ul><li><strong>User Graph Service</strong>로 팔로워 조회</li><li>팔로워들의 홈 타임라인(Memory Cache, 예: Redis 리스트)에 트윗 저장: O(n), 팔로워 1,000명 = 조회·삽입 1,000번</li><li><strong>Search Index Service</strong>에 저장, 미디어는 <strong>Object Store</strong>에 저장</li><li><strong>Notification Service</strong>가 큐로 푸시 알림을 비동기 전송</li></ul>`,
	},
	{
		id: 'twitter-fanout-bottleneck',
		deck: 'problems',
		topic: 'system-design/twitter',
		front: 'Twitter 설계: 팔로워가 수백만 명인 사용자 때문에 생기는 팬아웃 병목은 어떻게 완화하나요?',
		back: `<ul><li>팬아웃에 몇 분이 걸려 @reply와 경쟁 상태가 생길 수 있으므로, 서빙 시점에 트윗을 재정렬합니다.</li><li>팔로워가 많은 사용자의 트윗은 팬아웃하지 않고, 검색으로 찾아 홈 타임라인 결과와 병합한 뒤 서빙 시점에 재정렬합니다.</li><li>Memory Cache에는 홈 타임라인당 수백 개의 트윗과 활성 사용자의 타임라인만 유지합니다(최근 30일간 비활성 사용자는 SQL Database에서 재구성).</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: web crawler
	// ---------------------------------------------------------------------------
	{
		id: 'web-crawler-estimates',
		deck: 'problems',
		topic: 'system-design/web-crawler',
		front: '웹 크롤러 설계: 링크 10억 개를 평균 주 1회 갱신, 페이지당 500 KB, 월 1,000억 검색을 가정할 때 어림 계산 결과는?',
		back: `<ul><li>월 40억 링크 크롤링</li><li>월 2 PB, 3년간 72 PB의 페이지 콘텐츠 저장</li><li>초당 쓰기 1,600건</li><li>초당 검색 40,000건</li></ul>`,
	},
	{
		id: 'web-crawler-cycles-duplicates',
		deck: 'problems',
		topic: 'system-design/web-crawler',
		front: '웹 크롤러 설계: 크롤러가 무한 루프에 빠지지 않게 하고 중복을 처리하는 방법은?',
		back: `<ul><li><code>crawled_links</code>에 비슷한 페이지 시그니처가 있으면 그 링크의 <strong>우선순위를 낮춰</strong> 사이클을 피합니다.</li><li>중복 URL 제거: 작은 목록은 <code>sort | unique</code>, 10억 개 링크는 빈도가 1인 항목만 출력하는 <strong>MapReduce</strong></li><li>중복 콘텐츠 탐지: 페이지 내용으로 시그니처를 만들고 Jaccard index나 cosine similarity로 유사도를 비교</li></ul>`,
	},
	{
		id: 'web-crawler-storage-and-scaling',
		deck: 'problems',
		topic: 'system-design/web-crawler',
		front: '웹 크롤러 설계: 크롤링할 링크 목록은 어디에 저장하며, Crawler Service와 검색 경로는 어떻게 최적화하나요?',
		back: `<ul><li><code>links_to_crawl</code>과 <code>crawled_links</code>는 키-값 <strong>NoSQL Database</strong>에, 순위가 매겨진 링크는 Redis <strong>sorted set</strong>으로 관리</li><li>DNS 조회가 병목이 될 수 있으므로 주기적으로 갱신하는 자체 DNS 조회 유지</li><li>많은 연결을 동시에 열어 두는 <strong>connection pooling</strong>으로 성능 향상·메모리 절감(UDP 전환도 고려)</li><li>인기 검색어는 <strong>Memory Cache</strong>로 처리하고, <strong>Reverse Index Service</strong>와 <strong>Document Service</strong>는 샤딩·페더레이션을 적극 활용</li><li>대역폭 집약적이므로 충분한 대역폭 확보</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: Mint.com
	// ---------------------------------------------------------------------------
	{
		id: 'mint-estimates',
		deck: 'problems',
		topic: 'system-design/mint',
		front: 'Mint.com 설계: 읽기와 쓰기 중 어느 쪽이 많으며, 핵심 어림 계산 수치는?',
		back: `<p>사용자는 매일 거래하지만 사이트는 매일 방문하지 않으므로 <strong>쓰기 중심(쓰기:읽기 = 10:1)</strong>입니다.</p><ul><li>월 50억 거래, 거래당 약 50 bytes → 월 250 GB, 3년간 9 TB</li><li>평균 초당 거래 2,000건, 읽기 200건</li></ul>`,
	},
	{
		id: 'mint-transaction-extraction',
		deck: 'problems',
		topic: 'system-design/mint',
		front: 'Mint.com 설계: 계좌에서 거래 내역을 추출하는 작업은 어떻게 처리하나요?',
		back: `<p>추출은 오래 걸릴 수 있으므로 <strong>Accounts API</strong>가 Amazon SQS나 RabbitMQ 같은 <strong>Queue</strong>에 작업을 넣어 비동기로 처리합니다. <strong>Transaction Extraction Service</strong>는 큐에서 작업을 꺼내 다음을 수행합니다.</p><ul><li>금융 기관에서 거래를 추출해 원시 로그 파일로 <strong>Object Store</strong>에 저장</li><li><strong>Category Service</strong>로 거래 분류</li><li><strong>Budget Service</strong>로 카테고리별 월간 지출 집계(예산 근접·초과 시 <strong>Notification Service</strong>로 알림)</li><li>SQL Database의 <code>transactions</code>, <code>monthly_spending</code> 테이블 갱신</li></ul>`,
	},
	{
		id: 'mint-category-budget',
		deck: 'problems',
		topic: 'system-design/mint',
		front: 'Mint.com 설계: Category Service와 Budget Service는 저장·계산 부담을 어떻게 줄이나요?',
		back: `<ul><li><strong>Category Service</strong>: 인기 판매자 위주로 seller → category 사전을 미리 채웁니다. 판매자 50,000곳, 항목당 255 bytes 미만이면 약 12 MB 메모리로 충분합니다. 사전에 없는 판매자는 사용자의 수동 오버라이드를 크라우드소싱하고, 힙으로 판매자별 최상위 오버라이드를 O(1)에 조회합니다.</li><li><strong>Budget Service</strong>: 소득 구간별 일반 예산 템플릿을 써서 1억 개 예산 항목을 모두 저장하지 않고 사용자가 바꾼 항목만 저장합니다. 월간 집계는 원시 거래 파일에 대한 <strong>MapReduce</strong>로 돌려 DB 부하를 줄일 수 있습니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: social graph
	// ---------------------------------------------------------------------------
	{
		id: 'social-graph-estimates',
		deck: 'problems',
		topic: 'system-design/social-graph',
		front: '소셜 네트워크 자료 구조 설계: 사용자 1억 명, 평균 친구 50명, 월 10억 건 친구 검색을 가정할 때 어림 계산 결과는?',
		back: `<ul><li>친구 관계: 1억 × 50 = <strong>50억(5 billion)</strong></li><li>검색 요청: 초당 <strong>400</strong>건</li></ul><p>그래프 데이터는 한 머신에 들어가지 않고, 간선에는 가중치가 없다고 가정합니다.</p>`,
	},
	{
		id: 'social-graph-sharded-bfs',
		deck: 'problems',
		topic: 'system-design/social-graph',
		front: '소셜 그래프 설계: 한 머신에 담기지 않는 그래프에서 검색한 사람까지의 최단 경로는 어떻게 찾나요?',
		back: `<p>가중치 없는 최단 경로이므로 <strong>BFS</strong>를 씁니다. 사용자를 여러 <strong>Person Server</strong>에 샤딩하고, <strong>Lookup Service</strong>(person_id → Person Server)로 위치를 찾습니다. <strong>User Graph Service</strong>는 현재 사용자를 source로, 그 <code>friend_ids</code>를 인접 노드로 삼아 BFS를 돌리며, 인접 노드마다 Lookup Service를 다시 거칩니다. 방문 여부는 노드 자체가 아닌 별도의 <code>visited_ids</code> 집합으로 추적합니다.</p>`,
	},
	{
		id: 'social-graph-optimizations',
		deck: 'problems',
		topic: 'system-design/social-graph',
		front: '소셜 그래프 설계: BFS 친구 검색을 빠르게 하는 최적화 방법은?',
		back: `<ul><li>Person 데이터와 완전·부분 BFS 결과를 <strong>Memory Cache</strong>에 저장(오프라인 배치 계산 결과는 NoSQL Database에)</li><li>같은 Person Server에 있는 친구 조회를 묶어 머신 간 이동을 줄이고, 친구끼리 가까이 사는 경향을 이용해 <strong>위치 기준으로 샤딩</strong></li><li>출발지와 목적지에서 동시에 BFS를 돌려 두 경로를 병합</li><li>친구가 많은 사람부터 탐색을 시작</li><li>시간이나 홉 수 제한을 두고, 넘으면 계속 검색할지 사용자에게 묻기</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: query cache
	// ---------------------------------------------------------------------------
	{
		id: 'query-cache-estimates',
		deck: 'problems',
		topic: 'system-design/query-cache',
		front: '검색 엔진용 키-값 쿼리 캐시 설계: 항목 크기, 저장량, 초당 요청 어림 계산은?',
		back: `<ul><li>항목당 270 bytes (<code>query</code> 50 + <code>title</code> 20 + <code>snippet</code> 200)</li><li>월 100억 쿼리가 모두 고유하고 전부 저장한다면 월 2.7 TB → 메모리가 한정되어 있으므로 만료 정책이 필요</li><li>초당 4,000 요청</li></ul>`,
	},
	{
		id: 'query-cache-lru',
		deck: 'problems',
		topic: 'system-design/query-cache',
		front: '쿼리 캐시 설계: 캐시는 어떤 자료 구조로 구현하며, 캐시 히트와 미스 때 각각 무엇을 하나요?',
		back: `<p>용량이 한정되어 LRU로 오래된 항목을 만료합니다. <strong>이중 연결 리스트</strong>(새 항목은 head에 추가, 만료할 항목은 tail에서 제거)와 각 노드를 빠르게 찾기 위한 <strong>해시 테이블</strong>을 함께 씁니다.</p><ul><li>히트: 해당 항목을 LRU 리스트 맨 앞으로 옮기고 반환</li><li>미스: Reverse Index Service와 Document Service로 결과를 만든 뒤 캐시 맨 앞에 추가</li></ul><p>이 흐름은 cache-aside에 해당하며, 항목 갱신은 TTL을 두는 것이 가장 간단합니다.</p>`,
	},
	{
		id: 'query-cache-sharding',
		deck: 'problems',
		topic: 'system-design/query-cache',
		front: '쿼리 캐시 설계: Memory Cache를 여러 머신으로 확장하는 세 가지 방법과, 그중 최선은?',
		back: `<ul><li>각 머신이 자체 캐시를 가짐: 단순하지만 캐시 히트율이 낮음</li><li>각 머신이 캐시 사본을 가짐: 단순하지만 메모리 사용이 비효율적</li><li><strong>모든 머신에 캐시를 샤딩</strong>: 더 복잡하지만 최선. <code>machine = hash(query)</code>로 머신을 정하고, consistent hashing을 쓰는 것이 좋습니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: sales rank
	// ---------------------------------------------------------------------------
	{
		id: 'sales-rank-estimates',
		deck: 'problems',
		topic: 'system-design/sales-rank',
		front: 'Amazon 카테고리별 판매 순위 설계: 핵심 가정과 어림 계산 수치는?',
		back: `<ul><li>상품 1,000만 개, 카테고리 1,000개, 결과는 매시간 갱신</li><li>월 10억 거래, 거래당 약 40 bytes → 월 40 GB, 3년간 1.44 TB</li><li>월 1,000억 읽기, 읽기:쓰기 = 100:1</li><li>평균 초당 거래 400건, 읽기 40,000건</li></ul>`,
	},
	{
		id: 'sales-rank-mapreduce',
		deck: 'problems',
		topic: 'system-design/sales-rank',
		front: '판매 순위 설계: Sales Rank Service는 지난주 카테고리별 인기 상품을 어떻게 계산하나요?',
		back: `<p>Amazon S3 같은 <strong>Object Store</strong>에 저장한 <strong>Sales API</strong> 서버 로그를 입력으로 다단계 <strong>MapReduce</strong>를 돌립니다.</p><ul><li>1단계: 지난주 데이터를 <code>(category, product_id), sum(quantity)</code>로 변환</li><li>2단계: 키를 <code>(category, quantity), product_id</code> 형태로 바꿔 분산 정렬</li></ul><p>결과는 <strong>SQL Database</strong>의 <code>sales_rank</code> 집계 테이블에 넣고, <strong>Read API</strong>가 이 테이블을 조회합니다.</p>`,
	},
	{
		id: 'sales-rank-scaling',
		deck: 'problems',
		topic: 'system-design/sales-rank',
		front: '판매 순위 설계: 평균 초당 40,000 읽기와 400 쓰기라는 부하는 어떻게 처리하나요?',
		back: `<ul><li>인기 콘텐츠(와 그 판매 순위) 읽기는 <strong>Memory Cache</strong>가 처리하며, 불균등한 트래픽과 급증도 흡수합니다.</li><li>읽기량이 커서 <strong>SQL Read Replicas</strong>만으로는 캐시 미스를 감당하기 어렵고, 초당 400 쓰기도 단일 <strong>SQL Write Master-Slave</strong>에 버거울 수 있어 페더레이션·샤딩·비정규화·SQL 튜닝이 필요합니다.</li><li>DB에는 일정 기간 데이터만 두고 나머지는 데이터 웨어하우스나 Object Store에 저장하며, 일부 데이터를 NoSQL Database로 옮기는 것도 고려합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// problems: scaling on AWS
	// ---------------------------------------------------------------------------
	{
		id: 'scaling-aws-estimates',
		deck: 'problems',
		topic: 'system-design/scaling-aws',
		front: 'AWS에서 수백만 사용자로 확장하기: 최종 목표 규모의 가정과 어림 계산 수치는?',
		back: `<ul><li>사용자 1,000만 명, 월 10억 쓰기·1,000억 읽기(읽기:쓰기 = 100:1), 쓰기당 1 KB</li><li>월 1 TB, 3년간 36 TB의 새 콘텐츠</li><li>평균 초당 쓰기 400건, 읽기 40,000건</li></ul>`,
	},
	{
		id: 'scaling-aws-single-box-to-users-plus-plus',
		deck: 'problems',
		topic: 'system-design/scaling-aws',
		front: 'AWS 확장하기: 단일 박스에서 시작해 Users+, Users++ 단계에서는 각각 무엇을 하나요?',
		back: `<ul><li><strong>시작</strong>: EC2 단일 박스(웹 서버 + MySQL), 필요하면 수직 확장, 모니터링으로 병목 파악, Elastic IP와 Route 53 DNS</li><li><strong>Users+</strong>: 정적 콘텐츠를 S3 같은 Object Store로 분리, MySQL을 RDS 등 별도 박스로 이전, VPC의 public/private 서브넷으로 보안 강화</li><li><strong>Users++</strong>: 로드 밸런서(ELB, SSL termination)와 여러 가용 영역의 웹 서버로 수평 확장, MySQL Master-Slave failover, 웹 서버와 애플리케이션 서버 분리, 정적 콘텐츠를 CDN(CloudFront)으로 이전</li></ul>`,
	},
	{
		id: 'scaling-aws-users-plus-plus-plus',
		deck: 'problems',
		topic: 'system-design/scaling-aws',
		front: 'AWS 확장하기: 읽기가 많아 DB가 느려진 Users+++ 단계와, 업무 시간에만 트래픽이 몰리는 Users++++ 단계의 해결책은?',
		back: `<ul><li><strong>Users+++</strong>(읽기:쓰기 = 100:1): 자주 읽는 콘텐츠와 웹 서버의 세션 데이터를 ElastiCache 같은 <strong>Memory Cache</strong>로 옮기고(웹 서버가 무상태가 되어 오토스케일링 가능), <strong>MySQL Read Replicas</strong>를 추가합니다. 그 전에 MySQL 자체 캐시 설정으로 충분한지 먼저 확인합니다.</li><li><strong>Users++++</strong>: <strong>Autoscaling</strong>으로 CloudWatch 지표에 따라 용량을 늘리고 줄여 비용을 아끼고, Chef·Puppet·Ansible 등으로 DevOps를 자동화하며 계속 모니터링합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// ood: hash map
	// ---------------------------------------------------------------------------
	{
		id: 'ood-hash-map-collision',
		deck: 'ood',
		topic: 'ood/hash-map',
		front: '해시 맵 설계: 충돌(collision)은 어떻게 해결하며, 해시 함수는 무엇인가요?',
		back: `<p><strong>체이닝(chaining)</strong>으로 해결합니다. <code>HashTable</code>은 <code>size</code>개의 버킷 리스트(<code>self.table</code>)를 두고, 각 버킷에 <code>Item(key, value)</code>를 리스트로 저장합니다. 해시 함수는 <code>key % self.size</code>이며, 단순화를 위해 키는 정수뿐이고 load factor는 신경 쓰지 않는다고 가정합니다.</p>`,
	},
	{
		id: 'ood-hash-map-operations',
		deck: 'ood',
		topic: 'ood/hash-map',
		front: '해시 맵 설계: <code>set</code>, <code>get</code>, <code>remove</code>는 각각 어떻게 동작하나요?',
		back: `<ul><li><code>set</code>: 해시 인덱스의 버킷을 순회해 같은 키가 있으면 값을 덮어쓰고, 없으면 새 <code>Item</code>을 추가</li><li><code>get</code>: 버킷에서 키를 찾아 값을 반환하고, 없으면 <code>KeyError</code></li><li><code>remove</code>: 버킷에서 키를 찾아 삭제하고, 없으면 <code>KeyError</code></li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// ood: LRU cache
	// ---------------------------------------------------------------------------
	{
		id: 'ood-lru-cache-structures',
		deck: 'ood',
		topic: 'ood/lru-cache',
		front: 'LRU 캐시 설계: 어떤 두 자료 구조를 결합하며, 각각 왜 필요한가요?',
		back: `<ul><li><strong>해시 맵</strong>(<code>self.lookup</code>, key: query → value: node): 쿼리로 노드를 바로 찾습니다.</li><li><strong>이중 연결 리스트</strong>(<code>LinkedList</code>, head/tail, 노드마다 prev/next): 사용 순서를 유지해, 접근한 노드를 맨 앞으로 옮기고(<code>move_to_front</code>) 가장 오래된 노드를 tail에서 제거합니다(<code>remove_from_tail</code>).</li></ul><p>둘을 함께 써야 조회와 최근 사용 순서 갱신을 모두 빠르게 할 수 있습니다. <code>get</code>도 접근한 노드를 맨 앞으로 옮깁니다.</p>`,
	},
	{
		id: 'ood-lru-cache-set',
		deck: 'ood',
		topic: 'ood/lru-cache',
		front: 'LRU 캐시 설계: <code>set</code>은 기존 키, 새 키(용량 여유), 새 키(용량 가득)일 때 각각 어떻게 동작하나요?',
		back: `<ul><li><strong>기존 키</strong>: 노드의 결과를 갱신하고 리스트 맨 앞으로 옮깁니다.</li><li><strong>새 키, 여유 있음</strong>: <code>size</code>를 1 늘리고 새 노드를 맨 앞에 추가한 뒤 <code>lookup</code>에 등록합니다.</li><li><strong>새 키, 가득 참</strong>(<code>size == MAX_SIZE</code>): tail의 가장 오래된 항목을 <code>lookup</code>과 연결 리스트에서 모두 제거한 뒤, 새 노드를 맨 앞에 추가하고 <code>lookup</code>에 등록합니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// ood: call center
	// ---------------------------------------------------------------------------
	{
		id: 'ood-call-center-dispatch',
		deck: 'ood',
		topic: 'ood/call-center',
		front: '콜센터 설계: 전화는 어떤 순서로 직원에게 배정되며, 아무도 받을 수 없으면 어떻게 되나요?',
		back: `<p>직급은 <code>Rank</code> enum의 Operator → Supervisor → Director입니다. 처음 전화는 Operator가 받고, 응대 가능한(<code>employee.call is None</code>) Operator가 없으면 Supervisor, 그다음 Director 순으로 넘어갑니다. Director는 모든 전화를 처리할 수 있다고 가정하며, 그래도 받을 사람이 없으면 전화는 <code>deque</code>인 <code>queued_calls</code>에 대기합니다.</p>`,
	},
	{
		id: 'ood-call-center-escalation',
		deck: 'ood',
		topic: 'ood/call-center',
		front: '콜센터 설계: 직원이 처리할 수 없는 전화는 어떻게 에스컬레이션되며, 클래스 구조로는 어떻게 표현하나요?',
		back: `<p>추상 클래스 <code>Employee</code>가 <code>escalate_call</code>을 추상 메서드로 두고 하위 클래스가 구현합니다. <code>Operator</code>는 전화의 직급을 <code>SUPERVISOR</code>로, <code>Supervisor</code>는 <code>DIRECTOR</code>로 올린 뒤, 공통 <code>_escalate_call</code>이 전화 상태를 <code>READY</code>로 되돌리고 직원의 전화를 비운 뒤 콜센터에 알립니다. <code>Director</code>는 모든 전화를 처리해야 하므로 에스컬레이션하면 예외(<code>NotImplementedError</code>)를 던집니다.</p>`,
	},

	// ---------------------------------------------------------------------------
	// ood: deck of cards
	// ---------------------------------------------------------------------------
	{
		id: 'ood-deck-of-cards-blackjack-card',
		deck: 'ood',
		topic: 'ood/deck-of-cards',
		front: '카드 덱 설계: 범용 카드 덱을 블랙잭으로 확장할 때 <code>BlackJackCard</code>는 카드 값을 어떻게 계산하나요?',
		back: `<p>추상 클래스 <code>Card</code>의 추상 프로퍼티 <code>value</code>를 오버라이드합니다. 에이스(1)는 1, 페이스 카드(Jack = 11, Queen = 12, King = 13)는 10, 나머지는 원래 값을 반환합니다. setter는 1~13 범위를 벗어난 값이 들어오면 <code>ValueError</code>를 던집니다.</p>`,
	},
	{
		id: 'ood-deck-of-cards-hand-deck',
		deck: 'ood',
		topic: 'ood/deck-of-cards',
		front: '카드 덱 설계: <code>BlackJackHand.score</code>는 점수를 어떻게 고르며, <code>Deck</code>은 카드 배분을 어떻게 추적하나요?',
		back: `<ul><li><code>BlackJackHand.score</code>: 에이스를 고려한 가능한 점수들(<code>possible_scores</code>) 중 21 이하의 최댓값을 반환하고, 그런 점수가 없으면 21을 넘는 점수 중 최솟값을 반환합니다.</li><li><code>Deck</code>: <code>deal_index</code>가 다음에 나눠 줄 카드를 가리키고, <code>deal_card</code>는 카드를 <code>is_available = False</code>로 표시한 뒤 인덱스를 늘립니다. 남은 카드 수는 <code>len(self.cards) - self.deal_index</code>입니다.</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// ood: parking lot
	// ---------------------------------------------------------------------------
	{
		id: 'ood-parking-lot-vehicles',
		deck: 'ood',
		topic: 'ood/parking-lot',
		front: '주차장 설계: 차량 종류별로 들어갈 수 있는 주차 공간은 어떻게 다르며, 코드에서는 어떻게 표현하나요?',
		back: `<ul><li><code>Motorcycle</code>: 모든 공간 가능(<code>can_fit_in_spot</code>이 항상 True), 1칸</li><li><code>Car</code>: compact 또는 large 공간, 1칸</li><li><code>Bus</code>: large 공간만 가능하며 연속된 large 공간 <strong>5칸</strong> 필요(<code>spot_size=5</code>)</li></ul><p>추상 클래스 <code>Vehicle</code>의 추상 메서드 <code>can_fit_in_spot</code>을 각 하위 클래스가 구현하는 다형성으로 표현합니다.</p>`,
	},
	{
		id: 'ood-parking-lot-hierarchy',
		deck: 'ood',
		topic: 'ood/parking-lot',
		front: '주차장 설계: <code>ParkingLot</code>, <code>Level</code>, <code>ParkingSpot</code>은 주차 요청을 어떻게 나눠 처리하나요?',
		back: `<ul><li><code>ParkingLot</code>: 여러 층(<code>levels</code>)을 순회하며 주차에 성공한 첫 층에 주차합니다.</li><li><code>Level</code>: 차량이 들어갈 빈 공간을 찾아(<code>_find_available_spot</code>) 그 공간에 주차하고, 빈 공간 수(<code>available_spots</code>)를 관리합니다.</li><li><code>ParkingSpot</code>: 비어 있고 <code>vehicle.can_fit_in_spot(self)</code>가 참일 때만 차량을 받을 수 있습니다(<code>can_fit_vehicle</code>).</li></ul>`,
	},

	// ---------------------------------------------------------------------------
	// ood: online chat
	// ---------------------------------------------------------------------------
	{
		id: 'ood-online-chat-user',
		deck: 'ood',
		topic: 'ood/online-chat',
		front: '온라인 채팅 설계: <code>User</code>는 친구, 채팅, 친구 요청을 어떤 자료 구조로 관리하나요?',
		back: `<p>모두 id를 키로 하는 딕셔너리입니다.</p><ul><li><code>friends_by_id</code>: 친구 id → User</li><li><code>friend_ids_to_private_chats</code>: 친구 id → 1:1 채팅</li><li><code>group_chats_by_id</code>: 채팅 id → GroupChat</li><li><code>received_friend_requests_by_friend_id</code>, <code>sent_friend_requests_by_friend_id</code>: 친구 id → AddRequest</li></ul><p>전체 사용자는 <code>UserService.users_by_id</code>가 관리합니다.</p>`,
	},
	{
		id: 'ood-online-chat-chats-requests',
		deck: 'ood',
		topic: 'ood/online-chat',
		front: '온라인 채팅 설계: 1:1 채팅과 그룹 채팅은 어떻게 모델링하며, 친구 요청의 상태는 어떻게 표현하나요?',
		back: `<ul><li>추상 클래스 <code>Chat</code>(<code>chat_id</code>, <code>users</code>, <code>messages</code>)을 <code>PrivateChat</code>(생성 시 두 사용자를 추가)과 <code>GroupChat</code>(<code>add_user</code>, <code>remove_user</code>)이 상속합니다.</li><li>친구 요청은 <code>AddRequest</code>(보낸·받는 사용자 id, 상태, 타임스탬프)이고, 상태는 <code>RequestStatus</code> enum(<code>UNREAD</code>, <code>READ</code>, <code>ACCEPTED</code>, <code>REJECTED</code>)으로 표현합니다.</li></ul>`,
	},
];
