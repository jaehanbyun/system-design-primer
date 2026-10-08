---
title: 검색 엔진용 키-값 캐시 설계
description: 최근 웹 서버 검색 쿼리의 결과를 저장하는 키-값 캐시를 LRU 방식으로 설계하고, 메모리 캐시를 여러 머신에 샤딩해 확장하는 방법을 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/query_cache/README.md
---

:::note[이 문제에서 배우는 것]
- 메모리가 제한된 캐시에서 해시 테이블과 이중 연결 리스트로 LRU 캐시를 구현하는 법
- 캐시 히트와 캐시 미스일 때 요청이 흐르는 경로, 그리고 이 흐름이 cache-aside 패턴이라는 점
- 페이지 내용·순위 변화에 맞춰 TTL로 캐시를 갱신하는 법
- **Memory Cache**를 여러 머신으로 확장하는 세 가지 방식과 `hash(query)` 기반 샤딩의 트레이드오프
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 메모리가 부족할 때 어떤 항목을 내보낼지, 캐시를 여러 머신에 어떻게 나눌지 스스로 정해 보세요.
:::

:::note
이 문서는 내용 중복을 피하기 위해 [시스템 설계 주제](/topics/)의 관련 부분으로 바로 연결합니다. 일반적인 논의 사항, 트레이드오프, 대안은 링크된 내용을 참고하세요.
:::

## 1단계: 유스케이스, 제약 조건, 가정 정리

> 요구 사항을 모으고 문제의 범위를 정합니다.
> 유스케이스와 제약 조건을 명확히 하기 위해 질문합니다.
> 가정을 논의합니다.

질문에 답해 줄 면접관이 없으므로, 여기서는 유스케이스와 제약 조건을 직접 정의하겠습니다.

### 유스케이스

#### 다음 유스케이스만 다루도록 범위를 정합니다

* **사용자**가 보낸 검색 요청이 캐시 히트로 이어집니다
* **사용자**가 보낸 검색 요청이 캐시 미스로 이어집니다
* **서비스**는 고가용성을 갖춥니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
    * 인기 있는 쿼리는 거의 항상 캐시에 있어야 합니다
    * 캐시 항목을 언제 만료하고 갱신할지 정해야 합니다
* 캐시에서 응답하려면 조회가 빨라야 합니다
* 머신 간 지연 시간이 낮습니다
* 캐시의 메모리는 제한되어 있습니다
    * 무엇을 남기고 무엇을 제거할지 정해야 합니다
    * 수백만 개의 쿼리를 캐시해야 합니다
* 사용자 1,000만 명
* 월 100억 건의 쿼리

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 캐시는 키가 쿼리, 값이 결과인 항목의 정렬된 목록을 저장합니다
    * `query` - 50바이트
    * `title` - 20바이트
    * `snippet` - 200바이트
    * 합계: 270바이트
* 100억 건의 쿼리가 모두 고유하고 모두 저장된다면 매달 캐시 데이터 2.7 TB
    * 검색당 270바이트 * 월 100억 건의 검색
    * 가정에서 메모리가 제한되어 있다고 했으므로, 캐시 내용을 어떻게 만료할지 정해야 합니다
* 초당 요청 4,000건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server로 요청하고, Web Server가 Query API로 전달하며, Query API가 Reverse Index Service, Document Service, Memory Cache를 사용하는 쿼리 캐시 고수준 설계](@repo/solutions/system_design/query_cache/query_cache_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자 요청이 캐시 히트로 이어진다

인기 있는 쿼리는 Redis나 Memcached 같은 **Memory Cache**에서 제공해 읽기 지연 시간을 줄이고, **Reverse Index Service**와 **Document Service**에 과부하가 걸리지 않게 할 수 있습니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

캐시 용량은 제한되어 있으므로, 오래된 항목은 LRU(least recently used, 가장 오랫동안 사용되지 않은 항목부터 제거) 방식으로 만료시킵니다.

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Query API** 서버로 전달합니다
* **Query API** 서버는 다음을 수행합니다
    * 쿼리를 파싱합니다
        * 마크업을 제거합니다
        * 텍스트를 단어(term)로 나눕니다
        * 오타를 고칩니다
        * 대소문자를 정규화합니다
        * 쿼리를 불리언 연산을 쓰는 형태로 변환합니다
    * 쿼리와 일치하는 콘텐츠가 **Memory Cache**에 있는지 확인합니다
        * **Memory Cache**에서 히트하면 **Memory Cache**는 다음을 수행합니다
            * 캐시된 항목의 위치를 LRU 목록의 맨 앞으로 옮깁니다
            * 캐시된 콘텐츠를 반환합니다
        * 그렇지 않으면 **Query API**가 다음을 수행합니다
            * **Reverse Index Service**를 사용해 쿼리와 일치하는 문서를 찾습니다
                * **Reverse Index Service**는 일치하는 결과의 순위를 매겨 상위 결과를 반환합니다
            * **Document Service**를 사용해 제목과 스니펫(snippet)을 반환합니다
            * 가져온 콘텐츠로 **Memory Cache**를 갱신하고, 해당 항목을 LRU 목록의 맨 앞에 둡니다

#### 캐시 구현

캐시는 이중 연결 리스트(doubly-linked list)로 구현할 수 있습니다. 새 항목은 머리(head)에 추가하고, 만료할 항목은 꼬리(tail)에서 제거합니다. 각 연결 리스트 노드를 빠르게 찾기 위해 해시 테이블을 함께 사용합니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

**Query API Server** 구현:

```python
class QueryApi(object):

    def __init__(self, memory_cache, reverse_index_service):
        self.memory_cache = memory_cache
        self.reverse_index_service = reverse_index_service

    def parse_query(self, query):
        """Remove markup, break text into terms, deal with typos,
        normalize capitalization, convert to use boolean operations.
        """
        ...

    def process_query(self, query):
        query = self.parse_query(query)
        results = self.memory_cache.get(query)
        if results is None:
            results = self.reverse_index_service.process_search(query)
            self.memory_cache.set(query, results)
        return results
```

**Node** 구현:

```python
class Node(object):

    def __init__(self, query, results):
        self.query = query
        self.results = results
```

**LinkedList** 구현:

```python
class LinkedList(object):

    def __init__(self):
        self.head = None
        self.tail = None

    def move_to_front(self, node):
        ...

    def append_to_front(self, node):
        ...

    def remove_from_tail(self):
        ...
```

**Cache** 구현:

```python
class Cache(object):

    def __init__(self, MAX_SIZE):
        self.MAX_SIZE = MAX_SIZE
        self.size = 0
        self.lookup = {}  # key: query, value: node
        self.linked_list = LinkedList()

    def get(self, query)
        """Get the stored query result from the cache.

        Accessing a node updates its position to the front of the LRU list.
        """
        node = self.lookup[query]
        if node is None:
            return None
        self.linked_list.move_to_front(node)
        return node.results

    def set(self, results, query):
        """Set the result for the given query key in the cache.

        When updating an entry, updates its position to the front of the LRU list.
        If the entry is new and the cache is at capacity, removes the oldest entry
        before the new entry is added.
        """
        node = self.lookup[query]
        if node is not None:
            # Key exists in cache, update the value
            node.results = results
            self.linked_list.move_to_front(node)
        else:
            # Key does not exist in cache
            if self.size == self.MAX_SIZE:
                # Remove the oldest entry from the linked list and lookup
                self.lookup.pop(self.linked_list.tail.query, None)
                self.linked_list.remove_from_tail()
            else:
                self.size += 1
            # Add the new key and value
            new_node = Node(query, results)
            self.linked_list.append_to_front(new_node)
            self.lookup[query] = new_node
```

#### 캐시를 갱신하는 시점

다음과 같은 경우에는 캐시를 갱신해야 합니다.

* 페이지 내용이 바뀔 때
* 페이지가 삭제되거나 새 페이지가 추가될 때
* 페이지 순위(page rank)가 바뀔 때

이런 경우를 처리하는 가장 간단한 방법은, 캐시된 항목이 갱신되기 전까지 캐시에 머무를 수 있는 최대 시간을 정해 두는 것입니다. 이를 보통 TTL(time to live)이라고 합니다.

트레이드오프와 대안은 [캐시 갱신 전략](/topics/cache/#캐시-갱신-전략-when-to-update-the-cache)을 참고하세요. 위 방식은 [cache-aside](/topics/cache/#cache-aside)에 해당합니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, Load Balancer, 여러 대의 Web Server와 Query API, Reverse Index Service, Document Service, Memory Cache로 확장한 쿼리 캐시 설계](@repo/solutions/system_design/query_cache/query_cache.png)

**중요: 초기 설계에서 최종 설계로 곧바로 건너뛰지 마세요!**

1) **벤치마크/부하 테스트**를 하고, 2) 병목 지점을 **프로파일링**하고, 3) 대안과 트레이드오프를 평가하면서 병목을 해결하고, 4) 이를 반복한다고 설명하세요. 초기 설계를 반복적으로 확장하는 예시는 [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/)를 참고하세요.

초기 설계에서 어떤 병목을 만날 수 있고 각 병목을 어떻게 해결할지 논의하는 것이 중요합니다. 예를 들어 여러 대의 **Web Server**와 함께 **Load Balancer**를 추가하면 어떤 문제가 해결될까요? **CDN**은요? **Master-Slave Replicas**는요? 각각의 대안과 **트레이드오프**는 무엇일까요?

설계를 완성하고 확장성 문제를 해결하기 위해 몇 가지 구성 요소를 추가합니다. 다이어그램이 복잡해지지 않도록 내부 로드 밸런서는 표시하지 않았습니다.

*논의가 반복되지 않도록*, 주요 논의 사항, 트레이드오프, 대안은 다음 [시스템 설계 주제](/topics/)를 참고하세요.

* [DNS](/topics/dns/)
* [로드 밸런서](/topics/load-balancer/)
* [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)
* [웹 서버(리버스 프록시)](/topics/reverse-proxy/)
* [API 서버(애플리케이션 계층)](/topics/application-layer/)
* [캐시](/topics/cache/)
* [일관성 패턴](/topics/consistency-patterns/)
* [가용성 패턴](/topics/availability-patterns/)

### Memory Cache를 여러 머신으로 확장하기

많은 요청량과 큰 메모리 요구량을 감당하기 위해 수평 확장을 합니다. **Memory Cache** 클러스터에 데이터를 저장하는 방법은 크게 세 가지입니다.

* **캐시 클러스터의 각 머신이 자기만의 캐시를 가집니다** - 단순하지만 캐시 히트율이 낮을 가능성이 큽니다.
* **캐시 클러스터의 각 머신이 캐시 전체의 사본을 가집니다** - 단순하지만 메모리를 비효율적으로 사용합니다.
* **캐시를 캐시 클러스터의 모든 머신에 [샤딩](/topics/database/rdbms/#샤딩-sharding)합니다** - 더 복잡하지만 아마 가장 좋은 선택일 것입니다. `machine = hash(query)`처럼 해싱을 사용하면 어떤 쿼리의 캐시된 결과가 어느 머신에 있을지 정할 수 있습니다. [일관된 해싱(consistent hashing)](/about/#원문에서-작성-중인-주제)을 사용하는 것이 좋을 것입니다.

## 추가 논의 사항

> 문제의 범위와 남은 시간에 따라 더 깊이 다뤄 볼 만한 주제입니다.

### SQL 확장 패턴

* [읽기 복제본](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication)
* [페더레이션](/topics/database/rdbms/#페더레이션-federation)
* [샤딩](/topics/database/rdbms/#샤딩-sharding)
* [비정규화](/topics/database/rdbms/#비정규화-denormalization)
* [SQL 튜닝](/topics/database/rdbms/#sql-튜닝-sql-tuning)

### NoSQL

* [키-값 저장소](/topics/database/nosql/#키-값-저장소-key-value-store)
* [문서 저장소](/topics/database/nosql/#문서-저장소-document-store)
* [와이드 컬럼 저장소](/topics/database/nosql/#와이드-컬럼-저장소-wide-column-store)
* [그래프 데이터베이스](/topics/database/nosql/#그래프-데이터베이스-graph-database)
* [SQL vs NoSQL](/topics/database/sql-or-nosql/)

### 캐싱

* 어디에 캐시할 것인가
    * [클라이언트 캐싱](/topics/cache/#클라이언트-캐싱-client-caching)
    * [CDN 캐싱](/topics/cache/#cdn-캐싱-cdn-caching)
    * [웹 서버 캐싱](/topics/cache/#웹-서버-캐싱-web-server-caching)
    * [데이터베이스 캐싱](/topics/cache/#데이터베이스-캐싱-database-caching)
    * [애플리케이션 캐싱](/topics/cache/#애플리케이션-캐싱-application-caching)
* 무엇을 캐시할 것인가
    * [데이터베이스 쿼리 수준 캐싱](/topics/cache/#데이터베이스-쿼리-수준-캐싱-caching-at-the-database-query-level)
    * [객체 수준 캐싱](/topics/cache/#객체-수준-캐싱-caching-at-the-object-level)
* 캐시를 언제 갱신할 것인가
    * [Cache-aside](/topics/cache/#cache-aside)
    * [Write-through](/topics/cache/#write-through)
    * [Write-behind (write-back)](/topics/cache/#write-behind-write-back)
    * [Refresh ahead](/topics/cache/#refresh-ahead)

### 비동기 처리와 마이크로서비스

* [메시지 큐](/topics/asynchronism/#메시지-큐-message-queues)
* [작업 큐](/topics/asynchronism/#작업-큐-task-queues)
* [배압(back pressure)](/topics/asynchronism/#배압-back-pressure)
* [마이크로서비스](/topics/application-layer/#마이크로서비스-microservices)

### 통신

* 트레이드오프를 논의하세요
    * 클라이언트와의 외부 통신 - [REST를 따르는 HTTP API](/topics/communication/#rest-representational-state-transfer)
    * 내부 통신 - [RPC](/topics/communication/#rpc-remote-procedure-call)
* [서비스 디스커버리](/topics/application-layer/#서비스-디스커버리-service-discovery)

### 보안

[보안 섹션](/topics/security/)을 참고하세요.

### 지연 시간 수치

[모든 프로그래머가 알아야 할 지연 시간 수치](/appendix/latency-numbers/)를 참고하세요.

### 지속적으로 할 일

* 병목이 생길 때마다 해결할 수 있도록 시스템을 계속 벤치마킹하고 모니터링하세요
* 확장은 반복적인 과정입니다

## 복습 포인트

- **메모리가 제한된 캐시에는 만료 정책이 필수**: 고유한 쿼리를 모두 저장하면 매달 2.7 TB가 쌓이므로, 무엇을 남기고 무엇을 내보낼지 정해야 합니다. 이 해설은 LRU를 택해 가장 오랫동안 쓰이지 않은 항목부터 제거합니다.
- **LRU 캐시의 구조**: 해시 테이블로 노드를 빠르게 찾고, 이중 연결 리스트의 머리에 새 항목을 넣고 꼬리에서 오래된 항목을 뺍니다. 조회하거나 갱신한 항목은 목록 맨 앞으로 옮깁니다.
- **cache-aside 흐름**: **Query API**는 쿼리를 파싱·정규화한 뒤 **Memory Cache**를 먼저 확인하고, 미스일 때만 **Reverse Index Service**와 **Document Service**를 호출한 다음 결과를 캐시에 채웁니다.
- **캐시 갱신**: 페이지 내용 변경, 페이지 추가·삭제, 페이지 순위 변화가 캐시를 낡게 만듭니다. 가장 단순한 대응은 항목마다 TTL을 두는 것이고, 다른 전략과의 트레이드오프도 설명할 수 있어야 합니다.
- **캐시 클러스터 구성의 트레이드오프**: 초당 4,000건의 요청과 큰 메모리 요구량 때문에 수평 확장이 필요합니다. 머신마다 독립된 캐시는 히트율이 낮고, 전체 사본은 메모리를 낭비하므로, `hash(query)`로 샤딩하고 일관된 해싱을 고려하는 방식이 가장 낫습니다.
