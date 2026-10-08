---
title: 웹 크롤러 설계
description: URL 목록을 크롤링해 역색인과 제목·스니펫을 만드는 웹 크롤러를 설계하며 우선순위 기반 크롤링, 중복과 사이클 방지, 재크롤링 주기, 검색 확장을 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/web_crawler/README.md
---

:::note[이 문제에서 배우는 것]
- 링크 10억 개, 월 40억 회 크롤링, 월 1,000억 건 검색이라는 가정에서 저장 용량과 초당 요청 수를 어림 계산하는 법
- `links_to_crawl`과 `crawled_links`를 NoSQL에 두고, 우선순위는 Redis sorted set으로 관리하는 크롤링 루프
- 페이지 시그니처로 비슷한 페이지를 감지해 무한 루프(사이클)를 피하고, **MapReduce**로 중복 URL을 제거하는 법
- 크롤링과 색인 생성을 **Queue**로 분리해 **Reverse Index Service**와 **Document Service**가 비동기로 처리하게 하는 구조
- 인기 검색어 캐싱, 자체 DNS 조회, 커넥션 풀링처럼 크롤러에 특화된 확장 전략
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 다음에 크롤링할 링크를 어떻게 고를지, 같은 페이지를 다시 크롤링하는 루프를 어떻게 막을지 스스로 정해 보세요.
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

* **서비스**가 URL 목록을 크롤링합니다
    * 단어를 해당 검색어가 포함된 페이지에 매핑하는 역색인(reverse index)을 생성합니다
    * 페이지의 제목과 스니펫(snippet)을 생성합니다
        * 제목과 스니펫은 정적이며, 검색 쿼리에 따라 바뀌지 않습니다
* **사용자**가 검색어를 입력하면, 크롤러가 생성한 제목과 스니펫이 붙은 관련 페이지 목록을 봅니다
    * 이 유스케이스는 고수준 구성 요소와 상호작용만 간단히 그리고, 깊이 들어가지 않아도 됩니다
* **서비스**는 고가용성을 갖춥니다

#### 범위 밖

* 검색 분석
* 개인화된 검색 결과
* 페이지 랭크(Page rank)

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
    * 어떤 검색은 매우 인기가 많고, 어떤 검색은 단 한 번만 실행됩니다
* 익명 사용자만 지원합니다
* 검색 결과 생성은 빨라야 합니다
* 웹 크롤러가 무한 루프에 빠지면 안 됩니다
    * 그래프에 사이클이 있으면 무한 루프에 빠집니다
* 크롤링할 링크 10억 개
    * 최신 상태를 유지하려면 페이지를 정기적으로 크롤링해야 합니다
    * 평균 갱신 주기는 약 일주일에 한 번이고, 인기 사이트는 더 자주 갱신합니다
        * 매달 링크 40억 개를 크롤링합니다
    * 웹 페이지당 평균 저장 크기: 500 KB
        * 단순화를 위해 변경된 페이지도 새 페이지와 똑같이 계산합니다
* 월 1,000억 건의 검색

[solr](http://lucene.apache.org/solr/)나 [nutch](http://nutch.apache.org/) 같은 기존 시스템은 쓰지 말고, 좀 더 전통적인 시스템을 활용해 연습해 보세요.

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 매달 저장되는 페이지 콘텐츠 2 PB
    * 페이지당 500 KB * 월 40억 개 링크 크롤링
    * 3년이면 저장되는 페이지 콘텐츠 72 PB
* 초당 쓰기 요청 1,600건
* 초당 검색 요청 40,000건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![사용자 검색 흐름(Client → Web Server → Query API → Reverse Index Service와 Document Service)과 크롤러 흐름(Crawler Service → 두 개의 Queue, NoSQL)을 함께 나타낸 웹 크롤러 고수준 설계](@repo/solutions/system_design/web_crawler/web_crawler_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 서비스가 URL 목록을 크롤링한다

처음에는 전체 사이트 인기도를 기준으로 순위를 매긴 `links_to_crawl` 목록이 있다고 가정합니다. 이 가정이 합리적이지 않다면 [Yahoo](https://www.yahoo.com/), [DMOZ](http://www.dmoz.org/)처럼 외부 콘텐츠로 링크를 거는 인기 사이트를 크롤러의 시드(seed)로 넣을 수 있습니다.

처리한 링크와 그 페이지 시그니처는 `crawled_links` 테이블에 저장합니다.

`links_to_crawl`과 `crawled_links`는 키-값 **NoSQL Database**에 저장할 수 있습니다. `links_to_crawl`의 순위가 매겨진 링크에는 [Redis](https://redis.io/)의 sorted set을 사용해 페이지 링크의 순위를 유지할 수 있습니다. [SQL과 NoSQL 중 무엇을 고를지에 대한 유스케이스와 트레이드오프](/topics/database/sql-or-nosql/)를 논의해야 합니다.

* **Crawler Service**는 각 페이지 링크를 다음과 같이 반복해서 처리합니다
    * 크롤링할 링크 중 순위가 가장 높은 링크를 가져옵니다
        * **NoSQL Database**의 `crawled_links`에 비슷한 페이지 시그니처를 가진 항목이 있는지 확인합니다
            * 비슷한 페이지가 있으면 해당 페이지 링크의 우선순위를 낮춥니다
                * 이렇게 하면 사이클에 빠지지 않습니다
                * 다음 링크로 넘어갑니다(continue)
            * 없으면 링크를 크롤링합니다
                * [역색인](https://en.wikipedia.org/wiki/Search_engine_indexing)을 생성하도록 **Reverse Index Service** 큐에 작업을 추가합니다
                * 정적인 제목과 스니펫을 생성하도록 **Document Service** 큐에 작업을 추가합니다
                * 페이지 시그니처를 생성합니다
                * **NoSQL Database**의 `links_to_crawl`에서 링크를 제거합니다
                * **NoSQL Database**의 `crawled_links`에 페이지 링크와 시그니처를 삽입합니다

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

`PagesDataStore`는 **Crawler Service** 안에서 **NoSQL Database**를 사용하는 추상화입니다.

```python
class PagesDataStore(object):

    def __init__(self, db);
        self.db = db
        ...

    def add_link_to_crawl(self, url):
        """Add the given link to `links_to_crawl`."""
        ...

    def remove_link_to_crawl(self, url):
        """Remove the given link from `links_to_crawl`."""
        ...

    def reduce_priority_link_to_crawl(self, url)
        """Reduce the priority of a link in `links_to_crawl` to avoid cycles."""
        ...

    def extract_max_priority_page(self):
        """Return the highest priority link in `links_to_crawl`."""
        ...

    def insert_crawled_link(self, url, signature):
        """Add the given link to `crawled_links`."""
        ...

    def crawled_similar(self, signature):
        """Determine if we've already crawled a page matching the given signature"""
        ...
```

`Page`는 **Crawler Service** 안에서 페이지와 그 내용, 자식 URL, 시그니처를 캡슐화하는 추상화입니다.

```python
class Page(object):

    def __init__(self, url, contents, child_urls, signature):
        self.url = url
        self.contents = contents
        self.child_urls = child_urls
        self.signature = signature
```

`Crawler`는 **Crawler Service**의 메인 클래스로, `Page`와 `PagesDataStore`로 구성됩니다.

```python
class Crawler(object):

    def __init__(self, data_store, reverse_index_queue, doc_index_queue):
        self.data_store = data_store
        self.reverse_index_queue = reverse_index_queue
        self.doc_index_queue = doc_index_queue

    def create_signature(self, page):
        """Create signature based on url and contents."""
        ...

    def crawl_page(self, page):
        for url in page.child_urls:
            self.data_store.add_link_to_crawl(url)
        page.signature = self.create_signature(page)
        self.data_store.remove_link_to_crawl(page.url)
        self.data_store.insert_crawled_link(page.url, page.signature)

    def crawl(self):
        while True:
            page = self.data_store.extract_max_priority_page()
            if page is None:
                break
            if self.data_store.crawled_similar(page.signature):
                self.data_store.reduce_priority_link_to_crawl(page.url)
            else:
                self.crawl_page(page)
```

### 중복 처리

그래프에 사이클이 있으면 웹 크롤러가 무한 루프에 빠질 수 있으므로 주의해야 합니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

중복 URL은 제거해야 합니다.

* 목록이 작다면 `sort | unique` 같은 방법을 쓸 수 있습니다
* 크롤링할 링크가 10억 개라면 **MapReduce**로 빈도가 1인 항목만 출력할 수 있습니다

```python
class RemoveDuplicateUrls(MRJob):

    def mapper(self, _, line):
        yield line, 1

    def reducer(self, key, values):
        total = sum(values)
        if total == 1:
            yield key, total
```

중복 콘텐츠를 감지하는 일은 더 복잡합니다. 페이지 내용을 바탕으로 시그니처를 생성하고, 두 시그니처가 얼마나 비슷한지 비교할 수 있습니다. 사용할 만한 알고리즘으로는 [자카드 지수(Jaccard index)](https://en.wikipedia.org/wiki/Jaccard_index)와 [코사인 유사도(cosine similarity)](https://en.wikipedia.org/wiki/Cosine_similarity)가 있습니다.

### 크롤링 결과를 갱신할 시점 정하기

최신 상태를 유지하려면 페이지를 정기적으로 크롤링해야 합니다. 크롤링 결과에는 페이지를 마지막으로 크롤링한 시점을 나타내는 `timestamp` 필드를 둘 수 있습니다. 기본 주기(예: 일주일)가 지나면 모든 페이지를 갱신해야 합니다. 자주 업데이트되거나 인기가 많은 사이트는 더 짧은 간격으로 갱신할 수 있습니다.

분석을 자세히 다루지는 않겠지만, 데이터 마이닝으로 특정 페이지가 업데이트되기까지 걸리는 평균 시간을 구하고, 그 통계로 페이지를 얼마나 자주 다시 크롤링할지 정할 수 있습니다.

웹마스터가 크롤링 빈도를 제어할 수 있도록 `Robots.txt` 파일을 지원할 수도 있습니다.

### 유스케이스: 사용자가 검색어를 입력하고 제목과 스니펫이 붙은 관련 페이지 목록을 본다

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Query API** 서버로 전달합니다
* **Query API** 서버는 다음을 수행합니다
    * 쿼리를 파싱합니다
        * 마크업을 제거합니다
        * 텍스트를 단어(term)로 나눕니다
        * 오타를 고칩니다
        * 대소문자를 정규화합니다
        * 쿼리를 불리언 연산을 쓰는 형태로 변환합니다
    * **Reverse Index Service**를 사용해 쿼리에 맞는 문서를 찾습니다
        * **Reverse Index Service**는 일치하는 결과의 순위를 매겨 상위 결과를 반환합니다
    * **Document Service**를 사용해 제목과 스니펫을 반환합니다

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl https://search.com/api/v1/search?query=hello+world
```

응답:

```
{
    "title": "foo's title",
    "snippet": "foo's snippet",
    "link": "https://foo.com",
},
{
    "title": "bar's title",
    "snippet": "bar's snippet",
    "link": "https://bar.com",
},
{
    "title": "baz's title",
    "snippet": "baz's snippet",
    "link": "https://baz.com",
},
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, Load Balancer, 여러 대의 Web Server와 Query API, Memory Cache를 추가하고 Crawler Service가 Queue를 통해 Reverse Index Service와 Document Service에 작업을 넘기도록 확장한 웹 크롤러 설계](@repo/solutions/system_design/web_crawler/web_crawler.png)

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
* [NoSQL](/topics/database/nosql/)
* [일관성 패턴](/topics/consistency-patterns/)
* [가용성 패턴](/topics/availability-patterns/)

어떤 검색은 매우 인기가 많고, 어떤 검색은 단 한 번만 실행됩니다. 인기 쿼리는 Redis나 Memcached 같은 **Memory Cache**에서 제공하면 응답 시간을 줄이고 **Reverse Index Service**와 **Document Service**의 과부하를 막을 수 있습니다. **Memory Cache**는 고르지 않게 분포한 트래픽과 트래픽 급증을 처리하는 데에도 유용합니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

다음은 **Crawling Service**에 적용할 수 있는 몇 가지 추가 최적화입니다.

* 데이터 크기와 요청 부하를 감당하려면 **Reverse Index Service**와 **Document Service**는 샤딩과 페더레이션을 적극적으로 활용해야 할 것입니다
* DNS 조회가 병목이 될 수 있으므로, **Crawler Service**는 주기적으로 갱신하는 자체 DNS 조회 정보를 유지할 수 있습니다
* **Crawler Service**는 한 번에 여러 연결을 열어 두는 방식, 즉 [커넥션 풀링(connection pooling)](https://en.wikipedia.org/wiki/Connection_pool)으로 성능을 높이고 메모리 사용량을 줄일 수 있습니다
    * [UDP](/topics/communication/#udp-user-datagram-protocol)로 바꾸면 성능을 더 높일 수도 있습니다
* 웹 크롤링은 대역폭을 많이 쓰므로, 높은 처리량을 유지할 만큼 대역폭이 충분한지 확인하세요

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

- **크롤링 상태 저장**: 크롤링할 링크(`links_to_crawl`)와 처리한 링크(`crawled_links`)를 키-값 **NoSQL Database**에 두고, 우선순위는 Redis sorted set으로 관리해 항상 순위가 가장 높은 링크부터 가져옵니다.
- **사이클 방지와 중복 제거**: 이미 크롤링한 페이지와 시그니처가 비슷하면 우선순위를 낮추고 넘어가 무한 루프를 피합니다. 중복 URL은 **MapReduce**로, 중복 콘텐츠는 자카드 지수나 코사인 유사도 같은 시그니처 비교로 걸러 냅니다.
- **크롤링과 색인 생성 분리**: **Crawler Service**는 **Reverse Index Service**와 **Document Service**의 큐에 작업만 넣고, 역색인과 제목·스니펫은 비동기로 생성합니다. 제목과 스니펫은 검색 쿼리와 무관한 정적 데이터라서 미리 만들어 둘 수 있습니다.
- **신선도 관리**: `timestamp`로 마지막 크롤링 시점을 기록해 기본 일주일 주기로 갱신하고, 인기 있거나 자주 바뀌는 사이트는 더 자주 갱신합니다. 페이지별 평균 업데이트 간격 통계나 `Robots.txt`로 주기를 조정할 수도 있습니다.
- **검색 쪽 확장**: 검색 트래픽은 일부 인기 쿼리에 몰리므로 **Memory Cache**로 응답 시간을 줄이고 하위 서비스의 과부하를 막습니다. 데이터 크기와 요청 부하는 **Reverse Index Service**와 **Document Service**의 샤딩과 페더레이션으로 감당합니다.
- **크롤러 쪽 최적화**: 자체 DNS 조회 정보, 커넥션 풀링, UDP 전환, 충분한 대역폭 확보가 크롤링 처리량을 좌우합니다.
