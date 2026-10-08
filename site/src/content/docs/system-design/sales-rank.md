---
title: Amazon 카테고리별 판매 순위 설계
description: 판매 로그를 MapReduce로 집계해 지난 일주일의 카테고리별 인기 상품 순위를 계산하고, 초당 40,000건의 읽기를 캐시와 SQL 확장 패턴으로 감당하는 설계를 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/sales_rank/README.md
---

:::note[이 문제에서 배우는 것]
- 거래 로그 크기와 초당 요청 수를 어림 계산해 저장 용량과 처리량 요구를 정하는 법
- 원본 로그를 **Object Store**에 모으고 **MapReduce** 배치로 순위를 집계하는 파이프라인 설계
- 2단계 MapReduce(카테고리·상품별 합산 → 분산 정렬)를 키 설계로 구현하는 법
- 집계 결과를 `sales_rank` 테이블에 저장하고 인덱스로 조회를 빠르게 하는 법
- 읽기가 쓰기의 100배인 워크로드를 **Memory Cache**, 읽기 복제본, SQL 확장 패턴으로 다루는 법
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 매시간 갱신되는 순위를 어떤 방식으로 계산할지 스스로 정해 보세요.
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

* **서비스**가 지난 일주일 동안 카테고리별로 가장 인기 있는 상품을 계산합니다
* **사용자**가 지난 일주일 동안 카테고리별로 가장 인기 있는 상품을 봅니다
* **서비스**는 고가용성을 갖춥니다

#### 범위 밖

* 일반적인 전자상거래 사이트
    * 판매 순위 계산에 필요한 구성 요소만 설계합니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
* 상품은 여러 카테고리에 속할 수 있습니다
* 상품의 카테고리는 바뀌지 않습니다
* `foo/bar/baz` 같은 하위 카테고리는 없습니다
* 결과는 매시간 갱신되어야 합니다
    * 인기 있는 상품은 더 자주 갱신해야 할 수도 있습니다
* 상품 1,000만 개
* 카테고리 1,000개
* 월 10억 건의 거래
* 월 1,000억 건의 읽기 요청
* 읽기 대 쓰기 비율 100:1

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 거래 하나의 크기
    * `created_at` - 5바이트
    * `product_id` - 8바이트
    * `category_id` - 4바이트
    * `seller_id` - 8바이트
    * `buyer_id` - 8바이트
    * `quantity` - 4바이트
    * `total_price` - 5바이트
    * 합계: 약 40바이트
* 매달 새로 생기는 거래 콘텐츠 40 GB
    * 거래당 40바이트 * 월 10억 건의 거래
    * 3년이면 새 거래 콘텐츠 1.44 TB
    * 대부분은 기존 거래의 수정이 아니라 새 거래라고 가정합니다
* 평균 초당 거래 400건
* 평균 초당 읽기 요청 40,000건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server로 요청하고, Web Server가 Sales API와 Read API로 전달하며, 이들과 Sales Rank Service가 SQL과 Object Store를 사용하는 판매 순위 고수준 설계](@repo/solutions/system_design/sales_rank/sales_rank_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 서비스가 지난 일주일 동안 카테고리별 인기 상품을 계산한다

분산 파일 시스템을 직접 관리하는 대신, **Sales API** 서버의 원본 로그 파일을 Amazon S3 같은 관리형 **Object Store**에 저장할 수 있습니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

로그 항목은 다음과 같이 탭으로 구분되어 있다고 가정합니다.

```
timestamp   product_id  category_id    qty     total_price   seller_id    buyer_id
t1          product1    category1      2       20.00         1            1
t2          product1    category2      2       20.00         2            2
t2          product1    category2      1       10.00         2            3
t3          product2    category1      3        7.00         3            4
t4          product3    category2      7        2.00         4            5
t5          product4    category1      1        5.00         5            6
...
```

**Sales Rank Service**는 **Sales API** 서버 로그 파일을 입력으로 삼아 **MapReduce**를 실행하고, 그 결과를 **SQL Database**의 집계 테이블 `sales_rank`에 기록할 수 있습니다. [SQL과 NoSQL 중 무엇을 고를지에 대한 유스케이스와 트레이드오프](/topics/database/sql-or-nosql/)를 논의해야 합니다.

여러 단계로 이루어진 **MapReduce**를 사용합니다.

* **1단계** - 데이터를 `(category, product_id), sum(quantity)` 형태로 변환합니다
* **2단계** - 분산 정렬을 수행합니다

```python
class SalesRanker(MRJob):

    def within_past_week(self, timestamp):
        """Return True if timestamp is within past week, False otherwise."""
        ...

    def mapper(self, _ line):
        """Parse each log line, extract and transform relevant lines.

        Emit key value pairs of the form:

        (category1, product1), 2
        (category2, product1), 2
        (category2, product1), 1
        (category1, product2), 3
        (category2, product3), 7
        (category1, product4), 1
        """
        timestamp, product_id, category_id, quantity, total_price, seller_id, \
            buyer_id = line.split('\t')
        if self.within_past_week(timestamp):
            yield (category_id, product_id), quantity

    def reducer(self, key, value):
        """Sum values for each key.

        (category1, product1), 2
        (category2, product1), 3
        (category1, product2), 3
        (category2, product3), 7
        (category1, product4), 1
        """
        yield key, sum(values)

    def mapper_sort(self, key, value):
        """Construct key to ensure proper sorting.

        Transform key and value to the form:

        (category1, 2), product1
        (category2, 3), product1
        (category1, 3), product2
        (category2, 7), product3
        (category1, 1), product4

        The shuffle/sort step of MapReduce will then do a
        distributed sort on the keys, resulting in:

        (category1, 1), product4
        (category1, 2), product1
        (category1, 3), product2
        (category2, 3), product1
        (category2, 7), product3
        """
        category_id, product_id = key
        quantity = value
        yield (category_id, quantity), product_id

    def reducer_identity(self, key, value):
        yield key, value

    def steps(self):
        """Run the map and reduce steps."""
        return [
            self.mr(mapper=self.mapper,
                    reducer=self.reducer),
            self.mr(mapper=self.mapper_sort,
                    reducer=self.reducer_identity),
        ]
```

결과는 다음과 같이 정렬된 목록이 되며, 이를 `sales_rank` 테이블에 삽입할 수 있습니다.

```
(category1, 1), product4
(category1, 2), product1
(category1, 3), product2
(category2, 3), product1
(category2, 7), product3
```

`sales_rank` 테이블은 다음과 같은 구조로 만들 수 있습니다.

```
id int NOT NULL AUTO_INCREMENT
category_id int NOT NULL
total_sold int NOT NULL
product_id int NOT NULL
PRIMARY KEY(id)
FOREIGN KEY(category_id) REFERENCES Categories(id)
FOREIGN KEY(product_id) REFERENCES Products(id)
```

조회 속도를 높이고(테이블 전체를 스캔하는 대신 로그 시간에 조회) 데이터를 메모리에 유지하기 위해 `id`, `category_id`, `product_id`에 [인덱스](/topics/database/rdbms/#좋은-인덱스-사용하기-use-good-indices)를 만듭니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

### 유스케이스: 사용자가 지난 일주일 동안 카테고리별 인기 상품을 본다

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Read API** 서버로 전달합니다
* **Read API** 서버는 **SQL Database**의 `sales_rank` 테이블에서 데이터를 읽습니다

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl https://amazon.com/api/v1/popular?category_id=1234
```

응답:

```
{
    "id": "100",
    "category_id": "1234",
    "total_sold": "100000",
    "product_id": "50",
},
{
    "id": "53",
    "category_id": "1234",
    "total_sold": "90000",
    "product_id": "200",
},
{
    "id": "75",
    "category_id": "1234",
    "total_sold": "80000",
    "product_id": "3",
},
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, CDN, Load Balancer, 여러 대의 Web Server와 Sales API·Read API·Sales Rank Service, Memory Cache, SQL Write Master-Slave와 SQL Read Replicas, Object Store로 확장한 판매 순위 설계](@repo/solutions/system_design/sales_rank/sales_rank.png)

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

**Analytics Database**에는 Amazon Redshift나 Google BigQuery 같은 데이터 웨어하우스 솔루션을 사용할 수 있습니다.

데이터베이스에는 일정 기간의 데이터만 저장하고, 나머지는 데이터 웨어하우스나 **Object Store**에 저장하는 방법도 있습니다. Amazon S3 같은 **Object Store**라면 매달 새로 생기는 콘텐츠 40 GB라는 제약 조건을 무리 없이 처리할 수 있습니다.

*평균* 초당 40,000건(피크 때는 더 많음)의 읽기 요청을 처리하려면, 인기 있는 콘텐츠(와 그 판매 순위)에 대한 트래픽은 데이터베이스 대신 **Memory Cache**가 처리해야 합니다. **Memory Cache**는 고르지 않게 분포한 트래픽과 트래픽 급증을 처리하는 데에도 유용합니다. 읽기량이 이만큼 많으면 **SQL Read Replicas**가 캐시 미스를 다 감당하지 못할 수 있으므로, 추가적인 SQL 확장 패턴을 적용해야 할 것입니다.

*평균* 초당 400건(피크 때는 더 많음)의 쓰기는 **SQL Write Master-Slave** 하나로는 버거울 수 있습니다. 이 역시 추가적인 확장 기법이 필요하다는 뜻입니다.

SQL 확장 패턴에는 다음이 있습니다.

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

- **실시간이 아닌 집계는 배치로**: 순위는 매시간 갱신하면 되므로, **Sales API** 서버의 원본 로그를 S3 같은 **Object Store**에 모아 두고 **Sales Rank Service**가 **MapReduce**로 주기적으로 집계합니다. 분산 파일 시스템을 직접 운영할 필요가 없습니다.
- **두 단계 MapReduce**: 1단계에서 지난 일주일 로그만 골라 `(category, product_id)`별 판매 수량을 합산하고, 2단계에서 키를 `(category_id, quantity)`로 바꿔 셔플/정렬 단계가 카테고리별 분산 정렬을 하게 만듭니다. 정렬을 키 설계로 해결한다는 점이 핵심입니다.
- **조회용 집계 테이블**: 정렬된 결과를 **SQL Database**의 `sales_rank` 테이블에 넣고 `id`, `category_id`, `product_id`에 인덱스를 걸어, **Read API**가 카테고리별 순위를 빠르게 읽도록 합니다.
- **읽기 위주 트래픽 확장**: 읽기 대 쓰기 비율이 100:1이고 평균 초당 40,000건을 읽으므로, 인기 콘텐츠와 그 순위는 **Memory Cache**가 처리해야 합니다. 캐시 미스가 **SQL Read Replicas**의 한계를 넘으면 추가 SQL 확장 패턴이 필요합니다.
- **쓰기와 데이터 보관**: 평균 초당 400건의 쓰기는 **SQL Write Master-Slave** 하나로 버거울 수 있으므로 페더레이션, 샤딩, 비정규화, SQL 튜닝, NoSQL 이전을 검토합니다. 오래된 데이터는 Redshift·BigQuery 같은 데이터 웨어하우스나 **Object Store**로 옮겨 데이터베이스 크기를 관리합니다.
