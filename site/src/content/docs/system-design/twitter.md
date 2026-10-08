---
title: Twitter 타임라인과 검색 설계
description: 트윗을 팔로워의 홈 타임라인에 팬아웃하고 키워드 검색을 제공하는 Twitter를 설계하며 메모리 캐시 타임라인, 검색 클러스터, 팔로워가 많은 계정 처리를 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/twitter/README.md
---

:::note[이 문제에서 배우는 것]
- 월 2,500억 건 읽기, 초당 6만 건 팬아웃 같은 대규모 수치를 어림 계산하고, "읽기가 훨씬 많다"는 결론을 설계 근거로 쓰는 법
- 사용자 타임라인은 **SQL Database**에, 홈 타임라인은 쓰기가 빠른 **Memory Cache**(Redis 리스트)에 두는 이유
- 트윗을 쓸 때 **Fan Out Service**가 팔로워 조회, 홈 타임라인 저장, 검색 색인, 미디어 저장, 알림을 어떻게 조율하는지
- 검색 쿼리를 파싱하고 **Search Cluster**에 흩어서 질의한 뒤 결과를 병합·정렬하는 흐름
- 팔로워가 수백만 명인 계정의 팬아웃 병목을 서빙 시점 병합으로 피하는 법과 캐시 크기를 줄이는 최적화
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 홈 타임라인을 "쓸 때 미리 만들지, 읽을 때 조합할지", 팔로워가 아주 많은 계정은 어떻게 다룰지 스스로 정해 보세요.
:::

:::note
이 문서는 내용 중복을 피하기 위해 [시스템 설계 주제](/topics/)의 관련 부분으로 바로 연결합니다. 일반적인 논의 사항, 트레이드오프, 대안은 링크된 내용을 참고하세요.
:::

**Facebook 피드 설계**와 **Facebook 검색 설계**도 비슷한 문제입니다.

## 1단계: 유스케이스, 제약 조건, 가정 정리

> 요구 사항을 모으고 문제의 범위를 정합니다.
> 유스케이스와 제약 조건을 명확히 하기 위해 질문합니다.
> 가정을 논의합니다.

질문에 답해 줄 면접관이 없으므로, 여기서는 유스케이스와 제약 조건을 직접 정의하겠습니다.

### 유스케이스

#### 다음 유스케이스만 다루도록 범위를 정합니다

* **사용자**가 트윗을 게시합니다
    * **서비스**가 팔로워에게 트윗을 푸시하고, 푸시 알림과 이메일을 보냅니다
* **사용자**가 사용자 타임라인(해당 사용자의 활동)을 봅니다
* **사용자**가 홈 타임라인(사용자가 팔로우하는 사람들의 활동)을 봅니다
* **사용자**가 키워드를 검색합니다
* **서비스**는 고가용성을 갖춥니다

#### 범위 밖

* **서비스**가 Twitter Firehose와 기타 스트림으로 트윗을 푸시합니다
* **서비스**가 사용자의 공개 범위 설정에 따라 트윗을 걸러 냅니다
    * 사용자가 답글 대상자를 팔로우하고 있지 않으면 @reply를 숨깁니다
    * '리트윗 숨기기' 설정을 따릅니다
* 분석

### 제약 조건과 가정

#### 가정 세우기

일반

* 트래픽은 고르게 분포하지 않습니다
* 트윗 게시는 빨라야 합니다
    * 팔로워가 수백만 명이 아니라면, 트윗을 모든 팔로워에게 팬아웃하는 작업도 빨라야 합니다
* 활성 사용자 1억 명
* 하루 5억 건, 즉 월 150억 건의 트윗
    * 트윗 하나는 평균 10곳으로 팬아웃(전달)됩니다
    * 팬아웃으로 전달되는 트윗은 하루 총 50억 건
    * 팬아웃으로 전달되는 트윗은 월 1,500억 건
* 월 2,500억 건의 읽기 요청
* 월 100억 건의 검색

타임라인

* 타임라인 조회는 빨라야 합니다
* Twitter는 쓰기보다 읽기 비중이 큽니다
    * 트윗을 빠르게 읽을 수 있도록 최적화합니다
* 트윗 수집(ingest)은 쓰기 위주입니다

검색

* 검색은 빨라야 합니다
* 검색은 읽기 위주입니다

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 트윗 하나의 크기:
    * `tweet_id` - 8바이트
    * `user_id` - 32바이트
    * `text` - 140바이트
    * `media` - 평균 10 KB
    * 합계: 약 10 KB
* 매달 새로 생기는 트윗 콘텐츠 150 TB
    * 트윗당 10 KB * 하루 5억 건 * 한 달 30일
    * 3년이면 새 트윗 콘텐츠 5.4 PB
* 초당 읽기 요청 10만 건
    * 월 2,500억 건 읽기 요청 * (초당 요청 400건 / 월 요청 10억 건)
* 초당 트윗 6,000건
    * 월 150억 건 트윗 * (초당 요청 400건 / 월 요청 10억 건)
* 초당 팬아웃으로 전달되는 트윗 6만 건
    * 월 1,500억 건 팬아웃 전달 * (초당 요청 400건 / 월 요청 10억 건)
* 초당 검색 요청 4,000건
    * 월 100억 건 검색 * (초당 요청 400건 / 월 요청 10억 건)

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server로 요청하고, Read API·Write API·Search API가 각각 Timeline Service, Fan Out Service, Search Service 등을 거쳐 Memory Cache, MySQL, Object Store를 사용하는 Twitter 고수준 설계](@repo/solutions/system_design/twitter/twitter_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자가 트윗을 게시한다

사용자 타임라인(해당 사용자의 활동)을 채우기 위해, 사용자가 직접 쓴 트윗은 [관계형 데이터베이스](/topics/database/rdbms/)에 저장할 수 있습니다. [SQL과 NoSQL 중 무엇을 고를지에 대한 유스케이스와 트레이드오프](/topics/database/sql-or-nosql/)를 논의해야 합니다.

트윗을 전달하고 홈 타임라인(사용자가 팔로우하는 사람들의 활동)을 만드는 일은 더 까다롭습니다. 트윗을 모든 팔로워에게 팬아웃하면(초당 6만 건의 팬아웃 전달) 전통적인 [관계형 데이터베이스](/topics/database/rdbms/)는 과부하에 걸립니다. 그래서 **NoSQL database**나 **Memory Cache**처럼 쓰기가 빠른 데이터 저장소를 고르는 편이 좋을 것입니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

사진이나 동영상 같은 미디어는 **Object Store**에 저장할 수 있습니다.

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 트윗을 게시합니다
* **Web Server**는 요청을 **Write API** 서버로 전달합니다
* **Write API**는 **SQL database**에 있는 해당 사용자의 타임라인에 트윗을 저장합니다
* **Write API**는 **Fan Out Service**를 호출하고, **Fan Out Service**는 다음을 수행합니다
    * **User Graph Service**에 질의해 **Memory Cache**에 저장된 사용자의 팔로워를 찾습니다
    * **Memory Cache**에 있는 *사용자 팔로워들의 홈 타임라인*에 트윗을 저장합니다
        * O(n) 연산: 팔로워 1,000명 = 조회와 삽입 1,000번
    * 빠르게 검색할 수 있도록 **Search Index Service**에 트윗을 저장합니다
    * 미디어를 **Object Store**에 저장합니다
    * **Notification Service**를 사용해 팔로워에게 푸시 알림을 보냅니다
        * **Queue**(그림에는 없음)를 사용해 알림을 비동기로 보냅니다

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

**Memory Cache**가 Redis라면, 다음과 같은 구조로 Redis의 기본 리스트(list)를 사용할 수 있습니다.

```
           tweet n+2                   tweet n+1                   tweet n
| 8 bytes   8 bytes  1 byte | 8 bytes   8 bytes  1 byte | 8 bytes   8 bytes  1 byte |
| tweet_id  user_id  meta   | tweet_id  user_id  meta   | tweet_id  user_id  meta   |
```

새 트윗은 **Memory Cache**에 들어가고, 이것이 사용자의 홈 타임라인(사용자가 팔로우하는 사람들의 활동)을 채웁니다.

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl -X POST --data '{ "user_id": "123", "auth_token": "ABC123", \
    "status": "hello world!", "media_ids": "ABC987" }' \
    https://twitter.com/api/v1/tweet
```

응답:

```
{
    "created_at": "Wed Sep 05 00:37:15 +0000 2012",
    "status": "hello world!",
    "tweet_id": "987",
    "user_id": "123",
    ...
}
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

### 유스케이스: 사용자가 홈 타임라인을 본다

* **Client**가 **Web Server**에 홈 타임라인 요청을 보냅니다
* **Web Server**는 요청을 **Read API** 서버로 전달합니다
* **Read API** 서버는 **Timeline Service**를 호출하고, **Timeline Service**는 다음을 수행합니다
    * **Memory Cache**에 저장된 타임라인 데이터(트윗 ID와 사용자 ID 포함)를 가져옵니다 - O(1)
    * [multiget](http://redis.io/commands/mget)으로 **Tweet Info Service**에 질의해 트윗 ID에 대한 추가 정보를 얻습니다 - O(n)
    * multiget으로 **User Info Service**에 질의해 사용자 ID에 대한 추가 정보를 얻습니다 - O(n)

REST API:

```
$ curl https://twitter.com/api/v1/home_timeline?user_id=123
```

응답:

```
{
    "user_id": "456",
    "tweet_id": "123",
    "status": "foo"
},
{
    "user_id": "789",
    "tweet_id": "456",
    "status": "bar"
},
{
    "user_id": "789",
    "tweet_id": "579",
    "status": "baz"
},
```

### 유스케이스: 사용자가 사용자 타임라인을 본다

* **Client**가 **Web Server**에 사용자 타임라인 요청을 보냅니다
* **Web Server**는 요청을 **Read API** 서버로 전달합니다
* **Read API**는 **SQL Database**에서 사용자 타임라인을 가져옵니다

REST API는 홈 타임라인과 비슷합니다. 다만 모든 트윗이 사용자가 팔로우하는 사람들이 아니라 그 사용자 본인에게서 나온다는 점이 다릅니다.

### 유스케이스: 사용자가 키워드를 검색한다

* **Client**가 **Web Server**에 검색 요청을 보냅니다
* **Web Server**는 요청을 **Search API** 서버로 전달합니다
* **Search API**는 **Search Service**를 호출하고, **Search Service**는 다음을 수행합니다
    * 입력 쿼리를 파싱·토큰화해 무엇을 검색해야 하는지 판단합니다
        * 마크업을 제거합니다
        * 텍스트를 단어(term)로 나눕니다
        * 오타를 고칩니다
        * 대소문자를 정규화합니다
        * 쿼리를 불리언 연산을 쓰는 형태로 변환합니다
    * **Search Cluster**(예: [Lucene](https://lucene.apache.org/))에 질의해 결과를 얻습니다
        * 클러스터의 각 서버에 [scatter-gather](/about/#원문에서-작성-중인-주제) 방식으로 질의해 쿼리에 맞는 결과가 있는지 확인합니다
        * 결과를 병합하고, 순위를 매기고, 정렬해 반환합니다

REST API:

```
$ curl https://twitter.com/api/v1/search?query=hello+world
```

응답은 홈 타임라인과 비슷하지만, 주어진 쿼리에 맞는 트윗이 반환된다는 점이 다릅니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, CDN, Load Balancer, 여러 대의 Web Server와 API·서비스, Memory Cache, SQL Read Replicas, SQL Write Master-Slave, Object Store로 확장한 Twitter 설계](@repo/solutions/system_design/twitter/twitter.png)

**중요: 초기 설계에서 최종 설계로 곧바로 건너뛰지 마세요!**

1) **벤치마크/부하 테스트**를 하고, 2) 병목 지점을 **프로파일링**하고, 3) 대안과 트레이드오프를 평가하면서 병목을 해결하고, 4) 이를 반복한다고 설명하세요. 초기 설계를 반복적으로 확장하는 예시는 [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/)를 참고하세요.

초기 설계에서 어떤 병목을 만날 수 있고 각 병목을 어떻게 해결할지 논의하는 것이 중요합니다. 예를 들어 여러 대의 **Web Server**와 함께 **Load Balancer**를 추가하면 어떤 문제가 해결될까요? **CDN**은요? **Master-Slave Replicas**는요? 각각의 대안과 **트레이드오프**는 무엇일까요?

설계를 완성하고 확장성 문제를 해결하기 위해 몇 가지 구성 요소를 추가합니다. 다이어그램이 복잡해지지 않도록 내부 로드 밸런서는 표시하지 않았습니다.

*논의가 반복되지 않도록*, 주요 논의 사항, 트레이드오프, 대안은 다음 [시스템 설계 주제](/topics/)를 참고하세요.

* [DNS](/topics/dns/)
* [CDN](/topics/cdn/)
* [로드 밸런서](/topics/load-balancer/)
* [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)
* [웹 서버(리버스 프록시)](/topics/reverse-proxy/)
* [API 서버(애플리케이션 계층)](/topics/application-layer/)
* [캐시](/topics/cache/)
* [관계형 데이터베이스 관리 시스템(RDBMS)](/topics/database/rdbms/)
* [SQL 쓰기 마스터-슬레이브 장애 조치(failover)](/topics/availability-patterns/#장애-조치-fail-over)
* [마스터-슬레이브 복제](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication)
* [일관성 패턴](/topics/consistency-patterns/)
* [가용성 패턴](/topics/availability-patterns/)

**Fanout Service**는 잠재적인 병목입니다. 팔로워가 수백만 명인 Twitter 사용자의 트윗은 팬아웃 과정을 모두 거치는 데 몇 분이 걸릴 수 있습니다. 그러면 해당 트윗에 달리는 @reply와 경쟁 상태(race condition)가 생길 수 있는데, 서빙 시점에 트윗을 다시 정렬해 이를 완화할 수 있습니다.

팔로워가 매우 많은 사용자의 트윗은 아예 팬아웃하지 않는 방법도 있습니다. 대신 이런 사용자의 트윗은 검색으로 찾아 사용자의 홈 타임라인 결과와 병합한 뒤, 서빙 시점에 트윗을 다시 정렬합니다.

추가로 다음과 같이 최적화할 수 있습니다.

* **Memory Cache**에는 홈 타임라인마다 트윗을 수백 개만 보관합니다
* **Memory Cache**에는 활성 사용자의 홈 타임라인 정보만 보관합니다
    * 지난 30일 동안 활동하지 않은 사용자라면 **SQL Database**에서 타임라인을 다시 만들 수 있습니다
        * **User Graph Service**에 질의해 사용자가 누구를 팔로우하는지 알아냅니다
        * **SQL Database**에서 트윗을 가져와 **Memory Cache**에 추가합니다
* **Tweet Info Service**에는 한 달 치 트윗만 저장합니다
* **User Info Service**에는 활성 사용자만 저장합니다
* 지연 시간을 낮게 유지하려면 **Search Cluster**는 트윗을 메모리에 보관해야 할 가능성이 높습니다

**SQL Database**의 병목도 해결해야 합니다.

**Memory Cache**가 데이터베이스 부하를 줄여 주겠지만, **SQL Read Replicas**만으로 캐시 미스를 감당하기는 어려울 것이므로, 추가적인 SQL 확장 패턴을 적용해야 할 가능성이 큽니다.

쓰기량이 많아 **SQL Write Master-Slave** 하나로는 감당하지 못하므로, 이 점에서도 추가 확장 기법이 필요합니다.

* [페더레이션](/topics/database/rdbms/#페더레이션-federation)
* [샤딩](/topics/database/rdbms/#샤딩-sharding)
* [비정규화](/topics/database/rdbms/#비정규화-denormalization)
* [SQL 튜닝](/topics/database/rdbms/#sql-튜닝-sql-tuning)

일부 데이터를 **NoSQL Database**로 옮기는 것도 고려해야 합니다.

## 추가 논의 사항

> 문제의 범위와 남은 시간에 따라 더 깊이 다뤄 볼 만한 주제입니다.

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

- **타임라인마다 다른 저장소**: 사용자 타임라인은 **SQL Database**에, 홈 타임라인은 쓰기가 빠른 **Memory Cache**에 둡니다. 초당 6만 건의 팬아웃 쓰기는 전통적인 관계형 데이터베이스로 감당하기 어렵기 때문입니다. Redis 리스트에는 `tweet_id`, `user_id`, `meta`만 담아 항목을 작게 유지합니다.
- **쓸 때 팬아웃, 읽을 때 조합**: 트윗을 게시할 때 **Fan Out Service**가 팔로워들의 홈 타임라인에 미리 넣어 두므로, 읽을 때는 캐시에서 ID 목록을 O(1)로 가져온 뒤 트윗과 사용자 상세 정보를 multiget으로 채웁니다. 읽기가 압도적으로 많은 시스템에서 읽기를 빠르게 하는 대신, 팔로워 수에 비례하는 O(n) 쓰기 비용을 치르는 트레이드오프입니다.
- **팔로워가 아주 많은 계정**: 팬아웃에 몇 분이 걸리고 @reply와 경쟁 상태가 생길 수 있습니다. 서빙 시점 재정렬로 완화하거나, 이런 계정의 트윗은 팬아웃하지 않고 검색으로 찾아 홈 타임라인과 병합하는 방안을 함께 제시합니다.
- **캐시 크기 관리**: 홈 타임라인당 트윗 수백 개, 최근 30일 안에 활동한 사용자만 캐시하고, 비활성 사용자의 타임라인은 **User Graph Service**와 **SQL Database**로 다시 만듭니다. **Tweet Info Service**와 **User Info Service**도 한 달 치 트윗, 활성 사용자로 범위를 줄입니다.
- **검색 파이프라인**: 쿼리를 파싱·정규화한 뒤 **Search Cluster**의 각 서버에 흩어서 질의하고 결과를 병합·순위화합니다. 지연 시간을 낮추려면 검색 클러스터가 트윗을 메모리에 보관해야 합니다.
- **SQL 확장**: 캐시가 있어도 읽기 복제본만으로는 캐시 미스를, 단일 쓰기 마스터로는 쓰기량을 감당하기 어려우므로 페더레이션, 샤딩, 비정규화, SQL 튜닝과 일부 데이터의 NoSQL 이전을 검토합니다.
