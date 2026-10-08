---
title: 소셜 네트워크 자료 구조 설계
description: 사용자 1억 명과 친구 관계 50억 개를 여러 서버에 샤딩한 상태에서, BFS로 두 사람 사이의 최단 경로를 찾는 소셜 그래프 검색을 설계합니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/social_graph/README.md
---

:::note[이 문제에서 배우는 것]
- 가중치 없는 그래프에서 BFS로 최단 경로를 구하고, 이전 노드 기록(`prev_node_keys`)으로 경로를 역추적하는 법
- 머신 한 대에 들어가지 않는 그래프를 여러 **Person Server**에 샤딩하고 **Lookup Service**로 위치를 찾는 설계
- 분산 환경에서는 방문 여부를 노드 대신 별도 집합(`visited_ids`)으로 추적해야 하는 이유
- 머신 간 이동을 줄이는 배치 조회, 위치 기준 샤딩, 양방향 BFS 같은 최적화
- **Memory Cache**와 **NoSQL Database**에 BFS 탐색 결과를 저장해 반복 검색을 빠르게 만드는 법
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 그래프가 머신 한 대에 들어가지 않을 때 BFS를 어떻게 실행할지 스스로 정해 보세요.
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

* **사용자**가 누군가를 검색하면, 검색한 사람까지의 최단 경로를 봅니다
* **서비스**는 고가용성을 갖춥니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
    * 어떤 검색은 다른 검색보다 인기가 많고, 어떤 검색은 단 한 번만 실행됩니다
* 그래프 데이터는 머신 한 대에 다 들어가지 않습니다
* 그래프의 간선(edge)에는 가중치가 없습니다
* 사용자 1억 명
* 사용자당 평균 친구 50명
* 월 10억 건의 친구 검색

좀 더 전통적인 시스템을 활용해 연습해 보세요. [GraphQL](http://graphql.org/) 같은 그래프 전용 솔루션이나 [Neo4j](https://neo4j.com/) 같은 그래프 데이터베이스는 쓰지 마세요.

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 친구 관계 50억 개
    * 사용자 1억 명 * 사용자당 평균 친구 50명
* 초당 검색 요청 400건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server로 요청하고, Web Server가 Search API로, Search API가 User Graph Service로 전달하며, User Graph Service가 Lookup Service와 Person Server를 사용하는 소셜 그래프 고수준 설계](@repo/solutions/system_design/social_graph/social_graph_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자가 누군가를 검색하고, 검색한 사람까지의 최단 경로를 본다

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

수백만 명의 사용자(정점)와 수십억 개의 친구 관계(간선)라는 제약이 없다면, 가중치 없는 최단 경로 문제는 일반적인 BFS로 풀 수 있습니다.

```python
class Graph(Graph):

    def shortest_path(self, source, dest):
        if source is None or dest is None:
            return None
        if source is dest:
            return [source.key]
        prev_node_keys = self._shortest_path(source, dest)
        if prev_node_keys is None:
            return None
        else:
            path_ids = [dest.key]
            prev_node_key = prev_node_keys[dest.key]
            while prev_node_key is not None:
                path_ids.append(prev_node_key)
                prev_node_key = prev_node_keys[prev_node_key]
            return path_ids[::-1]

    def _shortest_path(self, source, dest):
        queue = deque()
        queue.append(source)
        prev_node_keys = {source.key: None}
        source.visit_state = State.visited
        while queue:
            node = queue.popleft()
            if node is dest:
                return prev_node_keys
            prev_node = node
            for adj_node in node.adj_nodes.values():
                if adj_node.visit_state == State.unvisited:
                    queue.append(adj_node)
                    prev_node_keys[adj_node.key] = prev_node.key
                    adj_node.visit_state = State.visited
        return None
```

하지만 모든 사용자를 한 머신에 담을 수는 없으므로, 사용자를 여러 **Person Server**에 [샤딩](/topics/database/rdbms/#샤딩-sharding)하고 **Lookup Service**를 통해 접근해야 합니다.

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Search API** 서버로 전달합니다
* **Search API** 서버는 요청을 **User Graph Service**로 전달합니다
* **User Graph Service**는 다음을 수행합니다
    * **Lookup Service**를 사용해 현재 사용자의 정보가 저장된 **Person Server**를 찾습니다
    * 적절한 **Person Server**를 찾아 현재 사용자의 `friend_ids` 목록을 가져옵니다
    * 현재 사용자를 `source`로, 현재 사용자의 `friend_ids`를 각 `adjacent_node`의 id로 삼아 BFS 탐색을 실행합니다
    * 주어진 id로 `adjacent_node`를 가져오려면
        * **User Graph Service**는 주어진 id에 해당하는 `adjacent_node`가 어느 **Person Server**에 저장되어 있는지 알아내기 위해 *다시* **Lookup Service**와 통신해야 합니다(최적화할 여지가 있는 부분입니다)

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

**참고**: 단순하게 보여 주기 위해 아래 코드에서는 오류 처리를 생략했습니다. 오류 처리까지 제대로 작성해야 하는지 물어보세요.

**Lookup Service** 구현:

```python
class LookupService(object):

    def __init__(self):
        self.lookup = self._init_lookup()  # key: person_id, value: person_server

    def _init_lookup(self):
        ...

    def lookup_person_server(self, person_id):
        return self.lookup[person_id]
```

**Person Server** 구현:

```python
class PersonServer(object):

    def __init__(self):
        self.people = {}  # key: person_id, value: person

    def add_person(self, person):
        ...

    def people(self, ids):
        results = []
        for id in ids:
            if id in self.people:
                results.append(self.people[id])
        return results
```

**Person** 구현:

```python
class Person(object):

    def __init__(self, id, name, friend_ids):
        self.id = id
        self.name = name
        self.friend_ids = friend_ids
```

**User Graph Service** 구현:

```python
class UserGraphService(object):

    def __init__(self, lookup_service):
        self.lookup_service = lookup_service

    def person(self, person_id):
        person_server = self.lookup_service.lookup_person_server(person_id)
        return person_server.people([person_id])

    def shortest_path(self, source_key, dest_key):
        if source_key is None or dest_key is None:
            return None
        if source_key is dest_key:
            return [source_key]
        prev_node_keys = self._shortest_path(source_key, dest_key)
        if prev_node_keys is None:
            return None
        else:
            # Iterate through the path_ids backwards, starting at dest_key
            path_ids = [dest_key]
            prev_node_key = prev_node_keys[dest_key]
            while prev_node_key is not None:
                path_ids.append(prev_node_key)
                prev_node_key = prev_node_keys[prev_node_key]
            # Reverse the list since we iterated backwards
            return path_ids[::-1]

    def _shortest_path(self, source_key, dest_key, path):
        # Use the id to get the Person
        source = self.person(source_key)
        # Update our bfs queue
        queue = deque()
        queue.append(source)
        # prev_node_keys keeps track of each hop from
        # the source_key to the dest_key
        prev_node_keys = {source_key: None}
        # We'll use visited_ids to keep track of which nodes we've
        # visited, which can be different from a typical bfs where
        # this can be stored in the node itself
        visited_ids = set()
        visited_ids.add(source.id)
        while queue:
            node = queue.popleft()
            if node.key is dest_key:
                return prev_node_keys
            prev_node = node
            for friend_id in node.friend_ids:
                if friend_id not in visited_ids:
                    friend_node = self.person(friend_id)
                    queue.append(friend_node)
                    prev_node_keys[friend_id] = prev_node.key
                    visited_ids.add(friend_id)
        return None
```

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl https://social.com/api/v1/friend_search?person_id=1234
```

응답:

```
{
    "person_id": "100",
    "name": "foo",
    "link": "https://social.com/foo",
},
{
    "person_id": "53",
    "name": "bar",
    "link": "https://social.com/bar",
},
{
    "person_id": "1234",
    "name": "baz",
    "link": "https://social.com/baz",
},
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, Load Balancer, 여러 대의 Web Server와 Query API, User Graph Service, Lookup Service, Person Server, Memory Cache로 확장한 소셜 그래프 설계](@repo/solutions/system_design/social_graph/social_graph.png)

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

*평균* 초당 400건(피크 때는 더 많음)의 읽기 요청이라는 제약 조건을 처리하려면, Redis나 Memcached 같은 **Memory Cache**에서 사용자(person) 데이터를 제공해 응답 시간을 줄이고 하위 서비스로 가는 트래픽도 줄일 수 있습니다. 여러 번 연달아 검색하는 사용자나 인맥이 넓은 사용자에게 특히 유용합니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

추가로 고려할 수 있는 최적화는 다음과 같습니다.

* 이후 조회를 빠르게 하기 위해 BFS 탐색 결과의 전체 또는 일부를 **Memory Cache**에 저장합니다
* 오프라인에서 일괄 계산(batch compute)한 BFS 탐색 결과의 전체 또는 일부를 **NoSQL Database**에 저장해 이후 조회를 빠르게 합니다
* 같은 **Person Server**에 있는 친구들을 묶어서 한 번에 조회해 머신 간 이동을 줄입니다
    * 친구끼리는 대개 가까운 곳에 살기 때문에, **Person Server**를 위치 기준으로 [샤딩](/topics/database/rdbms/#샤딩-sharding)하면 더 개선할 수 있습니다
* 출발지와 목적지에서 각각 BFS 탐색을 동시에 시작한 뒤 두 경로를 합칩니다
* 친구가 많은 사람부터 BFS 탐색을 시작합니다. 이런 사람은 현재 사용자와 검색 대상 사이의 [분리 단계(degrees of separation)](https://en.wikipedia.org/wiki/Six_degrees_of_separation) 수를 줄일 가능성이 높습니다
* 경우에 따라 검색에 상당한 시간이 걸릴 수 있으므로, 시간이나 홉(hop) 수에 제한을 두고 제한에 도달하면 검색을 계속할지 사용자에게 묻습니다
* (**Graph Database** 사용을 막는 제약이 없다면) [Neo4j](https://neo4j.com/) 같은 **Graph Database**나 [GraphQL](http://graphql.org/) 같은 그래프 전용 쿼리 언어를 사용합니다

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

- **BFS로 최단 경로 찾기**: 간선에 가중치가 없으므로 BFS가 처음 목적지에 도달한 경로가 곧 최단 경로입니다. 각 노드가 어느 노드에서 왔는지 `prev_node_keys`에 기록해 두었다가 목적지에서 거꾸로 따라가 경로를 만듭니다.
- **샤딩과 조회 서비스**: 사용자 1억 명, 친구 관계 50억 개는 머신 한 대에 들어가지 않으므로 사용자를 **Person Server**에 샤딩하고, 어느 서버에 있는지는 **Lookup Service**로 찾습니다. 그 대가로 BFS가 이웃을 방문할 때마다 **Lookup Service**를 다시 거쳐야 합니다.
- **분산 BFS의 방문 기록**: 노드가 여러 서버에 흩어져 있으므로, 노드 객체에 방문 상태를 저장하는 일반적인 BFS와 달리 **User Graph Service**가 `visited_ids` 집합으로 따로 추적합니다.
- **머신 간 이동 줄이기**: 같은 **Person Server**의 친구를 묶어 조회하고, 친구끼리 가까이 사는 경향을 이용해 위치 기준으로 샤딩합니다. 양방향 BFS, 친구가 많은 사람부터 탐색하기, 시간·홉 수 제한은 탐색 범위 자체를 줄입니다.
- **캐시와 사전 계산**: 초당 평균 400건의 검색은 **Memory Cache**에 사용자 데이터와 BFS 탐색 결과를 캐시하고, 오프라인에서 일괄 계산한 결과를 **NoSQL Database**에 저장해 감당합니다.
- **제약 조건을 의식한 대안 제시**: 이 문제는 일부러 그래프 데이터베이스를 배제했습니다. 그런 제약이 없다면 Neo4j 같은 **Graph Database**나 GraphQL이 대안이 된다는 점도 함께 언급하세요.
