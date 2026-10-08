---
title: 관계형 데이터베이스 (RDBMS)와 확장 기법
description: 관계형 데이터베이스와 ACID를 정리하고, 복제·페더레이션·샤딩·비정규화·SQL 튜닝으로 RDBMS를 확장하는 방법과 각 기법의 단점을 살펴봅니다.
original: https://github.com/donnemartin/system-design-primer#relational-database-management-system-rdbms
---

:::note[핵심 요약]
- 관계형 데이터베이스는 테이블로 구성된 데이터 항목의 모음이며, 트랜잭션은 **ACID**(원자성, 일관성, 격리성, 지속성)를 따릅니다.
- 관계형 데이터베이스를 확장하는 기법으로 **마스터-슬레이브 복제**, **마스터-마스터 복제**, **페더레이션**, **샤딩**, **비정규화**, **SQL 튜닝**이 있습니다.
- 복제는 읽기를 분산하고 장애에 대비하게 해 주지만, 데이터 유실 가능성, 복제 지연, 하드웨어와 복잡도 증가라는 공통 단점이 있습니다.
- 페더레이션은 기능별로, 샤딩은 데이터의 일부씩 데이터베이스를 나눕니다. 둘 다 읽기·쓰기 트래픽을 줄이고 병렬 쓰기를 가능하게 하지만, 애플리케이션 로직과 조인이 복잡해집니다.
- 비정규화는 쓰기 성능을 조금 희생해 읽기 성능을 높이고, SQL 튜닝은 벤치마크와 프로파일링으로 병목을 찾는 데서 시작합니다.
:::

![여러 웹 인스턴스가 캐시, 읽기 복제본 두 대, 쓰기 마스터 한 대에 나눠 접근하는 데이터베이스 구성](@repo/images/Xkm5CXz.png)

*출처: [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs)*

SQL 같은 관계형 데이터베이스는 테이블 형태로 정리된 데이터 항목의 모음입니다.

**ACID**는 관계형 데이터베이스 [트랜잭션](https://en.wikipedia.org/wiki/Database_transaction)이 갖는 속성의 집합입니다.

- **원자성(Atomicity)** - 각 트랜잭션은 전부 실행되거나 전혀 실행되지 않습니다.
- **일관성(Consistency)** - 어떤 트랜잭션이든 데이터베이스를 하나의 유효한 상태에서 다른 유효한 상태로 옮깁니다.
- **격리성(Isolation)** - 트랜잭션을 동시에 실행한 결과가 트랜잭션을 하나씩 순서대로 실행한 결과와 같습니다.
- **지속성(Durability)** - 한번 커밋된 트랜잭션은 그 상태가 그대로 유지됩니다.

관계형 데이터베이스를 확장하는 기법에는 **마스터-슬레이브 복제**, **마스터-마스터 복제**, **페더레이션**, **샤딩**, **비정규화**, **SQL 튜닝** 등 여러 가지가 있습니다.

## 마스터-슬레이브 복제 (Master-slave replication)

마스터는 읽기와 쓰기를 모두 처리하고, 쓰기를 하나 이상의 슬레이브에 복제합니다. 슬레이브는 읽기만 처리합니다. 슬레이브가 다시 다른 슬레이브에 복제하는 트리 형태로 구성할 수도 있습니다. 마스터가 오프라인이 되면, 슬레이브 하나가 마스터로 승격되거나 새 마스터가 프로비저닝될 때까지 시스템은 읽기 전용 모드로 계속 동작할 수 있습니다.

![클라이언트의 읽기·쓰기는 마스터가 처리하고, 마스터가 두 슬레이브에 복제하며, 다른 클라이언트의 읽기는 각 슬레이브가 처리하는 구조](@repo/images/C9ioGtn.png)

*출처: [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)*

:::caution[단점: 마스터-슬레이브 복제]
- 슬레이브를 마스터로 승격하는 로직이 추가로 필요합니다.
- 마스터-슬레이브와 마스터-마스터 **모두**에 해당하는 내용은 [마스터-마스터 복제](/topics/database/rdbms/#마스터-마스터-복제-master-master-replication) 절 끝의 **단점: 복제 공통**을 참고하세요.
:::

## 마스터-마스터 복제 (Master-master replication)

두 마스터가 모두 읽기와 쓰기를 처리하며, 쓰기에 대해서는 서로 조율합니다. 어느 한쪽 마스터가 다운되더라도 시스템은 읽기와 쓰기를 모두 처리하면서 계속 동작할 수 있습니다.

![두 클라이언트가 각각 다른 마스터에 읽기·쓰기를 보내고, 두 마스터가 서로 양방향으로 복제하는 구조](@repo/images/krAHLGg.png)

*출처: [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)*

:::caution[단점: 마스터-마스터 복제]
- 어느 마스터에 쓸지 결정하려면 로드 밸런서를 두거나 애플리케이션 로직을 수정해야 합니다.
- 대부분의 마스터-마스터 시스템은 일관성이 느슨하거나(ACID 위반), 동기화 때문에 쓰기 지연 시간이 늘어납니다.
- 쓰기 노드가 늘어나고 지연 시간이 길어질수록 충돌 해결(conflict resolution)이 더 중요해집니다.
- 마스터-슬레이브와 마스터-마스터 **모두**에 해당하는 내용은 바로 아래 **단점: 복제 공통**을 참고하세요.
:::

:::caution[단점: 복제 공통]
- 새로 쓴 데이터가 다른 노드로 복제되기 전에 마스터에 장애가 나면 데이터가 유실될 수 있습니다.
- 쓰기는 읽기 복제본에서 재생(replay)됩니다. 쓰기가 많으면 읽기 복제본이 쓰기를 재생하느라 바빠져서 읽기를 그만큼 처리하지 못할 수 있습니다.
- 읽기 슬레이브가 많을수록 복제해야 할 양이 늘어나고, 그만큼 복제 지연(replication lag)이 커집니다.
- 어떤 시스템에서는 마스터에 쓸 때 여러 스레드로 병렬 쓰기를 할 수 있지만, 읽기 복제본은 단일 스레드로 순차 쓰기만 지원합니다.
- 복제를 하면 하드웨어가 늘어나고 복잡도도 높아집니다.
:::

**출처 및 더 읽을거리: 복제**

- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
- [Multi-master replication](https://en.wikipedia.org/wiki/Multi-master_replication)

## 페더레이션 (Federation)

![포럼, 사용자, 상품 데이터베이스가 기능별로 나뉘고 각각 마스터, 슬레이브, 읽기 복제본을 갖춘 구조](@repo/images/U3qV33e.png)

*출처: [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs)*

페더레이션(기능 분할, functional partitioning이라고도 합니다)은 데이터베이스를 기능별로 나눕니다. 예를 들어 하나의 거대한 모놀리식 데이터베이스 대신 **forums**, **users**, **products** 세 개의 데이터베이스를 둘 수 있습니다. 그러면 데이터베이스마다 읽기·쓰기 트래픽이 줄고, 그 결과 복제 지연도 줄어듭니다. 데이터베이스가 작아지면 메모리에 올릴 수 있는 데이터가 많아지고, 캐시 지역성(cache locality)이 좋아져 캐시 히트도 늘어납니다. 쓰기를 직렬화하는 단일 중앙 마스터가 없으므로 병렬로 쓸 수 있어 처리량이 늘어납니다.

:::caution[단점: 페더레이션]
- 스키마에 거대한 함수나 테이블이 필요하다면 페더레이션은 효과적이지 않습니다.
- 어느 데이터베이스에서 읽고 어느 데이터베이스에 쓸지 결정하도록 애플리케이션 로직을 수정해야 합니다.
- 두 데이터베이스의 데이터를 [서버 링크(server link)](http://stackoverflow.com/questions/5145637/querying-data-by-joining-two-tables-in-two-database-on-different-servers)로 조인하는 일은 더 복잡합니다.
- 페더레이션을 하면 하드웨어가 늘어나고 복잡도도 높아집니다.
:::

**출처 및 더 읽을거리: 페더레이션**

- [Scaling up to your first 10 million users](https://www.youtube.com/watch?v=kKjm4ehYiMs)

## 샤딩 (Sharding)

![애플리케이션의 요청이 로드 밸런서를 거쳐 사용자 이름 범위(A-C, D-F, G-I, X-Y)별로 나뉜 데이터베이스로 전달되는 구조](@repo/images/wU8x5Id.png)

*출처: [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)*

샤딩은 데이터를 여러 데이터베이스에 분산해, 각 데이터베이스가 전체 데이터의 일부만 관리하도록 합니다. 사용자 데이터베이스를 예로 들면, 사용자 수가 늘어날수록 클러스터에 샤드를 더 추가합니다.

[페더레이션](/topics/database/rdbms/#페더레이션-federation)의 장점과 비슷하게, 샤딩을 하면 읽기·쓰기 트래픽이 줄고, 복제할 양이 줄고, 캐시 히트가 늘어납니다. 인덱스 크기도 줄어들어 대개 쿼리가 빨라지고 성능이 좋아집니다. 샤드 하나가 다운되어도 나머지 샤드는 계속 동작합니다. 다만 데이터 유실을 막으려면 어떤 형태로든 복제를 추가하는 것이 좋습니다. 페더레이션처럼 쓰기를 직렬화하는 단일 중앙 마스터가 없으므로 병렬로 쓸 수 있어 처리량이 늘어납니다.

사용자 테이블을 샤딩하는 흔한 방법은 사용자 성(last name)의 첫 글자나 사용자의 지리적 위치를 기준으로 나누는 것입니다.

:::caution[단점: 샤딩]
- 샤드를 다루도록 애플리케이션 로직을 수정해야 하며, 그 결과 SQL 쿼리가 복잡해질 수 있습니다.
- 데이터가 특정 샤드에 쏠릴 수 있습니다. 예를 들어 파워 유저 여러 명이 한 샤드에 몰리면 그 샤드에 다른 샤드보다 많은 부하가 걸립니다.
    - 리밸런싱(rebalancing)은 복잡도를 더 높입니다. [일관된 해싱(consistent hashing)](http://www.paperplanes.de/2011/12/9/the-magic-of-consistent-hashing.html)에 기반한 샤딩 함수를 쓰면 옮겨야 하는 데이터 양을 줄일 수 있습니다.
- 여러 샤드에 걸친 데이터를 조인하는 일은 더 복잡합니다.
- 샤딩을 하면 하드웨어가 늘어나고 복잡도도 높아집니다.
:::

**출처 및 더 읽을거리: 샤딩**

- [The coming of the shard](http://highscalability.com/blog/2009/8/6/an-unorthodox-approach-to-database-design-the-coming-of-the.html)
- [Shard database architecture](https://en.wikipedia.org/wiki/Shard_(database_architecture))
- [Consistent hashing](http://www.paperplanes.de/2011/12/9/the-magic-of-consistent-hashing.html)

## 비정규화 (Denormalization)

비정규화는 쓰기 성능을 어느 정도 희생하는 대신 읽기 성능을 높이려는 기법입니다. 비용이 큰 조인을 피하려고 같은 데이터의 중복 사본을 여러 테이블에 기록합니다. [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)이나 Oracle 같은 일부 RDBMS는 [구체화된 뷰(materialized view)](https://en.wikipedia.org/wiki/Materialized_view)를 지원합니다. 구체화된 뷰는 중복 정보를 저장하고 중복 사본들의 일관성을 유지하는 일을 대신 처리해 줍니다.

[페더레이션](/topics/database/rdbms/#페더레이션-federation)이나 [샤딩](/topics/database/rdbms/#샤딩-sharding) 같은 기법으로 데이터가 분산되고 나면, 데이터 센터를 넘나드는 조인을 관리하는 일이 복잡도를 더욱 높입니다. 비정규화를 하면 이런 복잡한 조인 자체가 필요 없어질 수도 있습니다.

대부분의 시스템에서 읽기는 쓰기보다 100:1, 심지어 1000:1 비율로 훨씬 많을 수 있습니다. 복잡한 데이터베이스 조인이 필요한 읽기는 디스크 작업에 상당한 시간을 쓰기 때문에 비용이 매우 클 수 있습니다.

:::caution[단점: 비정규화]
- 데이터가 중복됩니다.
- 제약 조건(constraint)을 쓰면 중복된 정보의 사본들을 동기화하는 데 도움이 되지만, 그만큼 데이터베이스 설계가 복잡해집니다.
- 쓰기 부하가 큰 상황에서는 비정규화한 데이터베이스가 정규화된 데이터베이스보다 성능이 나쁠 수 있습니다.
:::

**출처 및 더 읽을거리: 비정규화**

- [Denormalization](https://en.wikipedia.org/wiki/Denormalization)

## SQL 튜닝 (SQL tuning)

SQL 튜닝은 범위가 넓은 주제여서 참고할 만한 [책](https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=sql+tuning)도 많이 나와 있습니다.

병목을 시뮬레이션하고 찾아내려면 **벤치마크**와 **프로파일링**이 중요합니다.

- **벤치마크(Benchmark)** - [ab](http://httpd.apache.org/docs/2.2/programs/ab.html) 같은 도구로 높은 부하 상황을 시뮬레이션합니다.
- **프로파일링(Profile)** - [슬로 쿼리 로그(slow query log)](http://dev.mysql.com/doc/refman/5.7/en/slow-query-log.html) 같은 도구를 켜서 성능 문제를 추적합니다.

벤치마크와 프로파일링을 해 보면 다음과 같은 최적화로 이어질 수 있습니다.

### 스키마 다듬기 (Tighten up the schema)

- MySQL은 빠르게 접근할 수 있도록 디스크의 연속된 블록에 데이터를 기록합니다.
- 고정 길이 필드에는 `VARCHAR` 대신 `CHAR`를 사용하세요.
    - `CHAR`는 빠른 임의 접근(random access)을 가능하게 합니다. 반면 `VARCHAR`는 다음 문자열로 넘어가기 전에 현재 문자열의 끝을 찾아야 합니다.
- 블로그 글처럼 큰 텍스트 덩어리에는 `TEXT`를 사용하세요. `TEXT`는 불리언 검색(boolean search)도 지원합니다. `TEXT` 필드를 쓰면 디스크에는 텍스트 블록의 위치를 찾는 데 쓰는 포인터가 저장됩니다.
- 2^32, 즉 약 40억까지의 큰 수에는 `INT`를 사용하세요.
- 통화(금액)에는 부동소수점 표현 오류를 피하도록 `DECIMAL`을 사용하세요.
- 큰 `BLOBS`는 저장하지 말고, 대신 그 객체를 가져올 수 있는 위치를 저장하세요.
- `VARCHAR(255)`는 8비트 숫자로 셀 수 있는 최대 문자 수로, 일부 RDBMS에서는 1바이트를 최대한 활용하는 길이인 경우가 많습니다.
- 해당되는 곳에는 `NOT NULL` 제약 조건을 설정해 [검색 성능을 높이세요](http://stackoverflow.com/questions/1017239/how-do-null-values-affect-performance-in-a-database-search).

### 좋은 인덱스 사용하기 (Use good indices)

- 쿼리에 쓰는 열(`SELECT`, `GROUP BY`, `ORDER BY`, `JOIN`)은 인덱스를 두면 더 빨라질 수 있습니다.
- 인덱스는 보통 자기 균형(self-balancing) [B-트리](https://en.wikipedia.org/wiki/B-tree)로 표현됩니다. B-트리는 데이터를 정렬된 상태로 유지하며, 검색·순차 접근·삽입·삭제를 로그 시간에 처리합니다.
- 인덱스를 두면 데이터를 메모리에 유지할 수 있지만, 그만큼 공간이 더 필요합니다.
- 인덱스도 함께 갱신해야 하므로 쓰기가 느려질 수 있습니다.
- 대량의 데이터를 적재할 때는 인덱스를 끄고 데이터를 적재한 다음 인덱스를 다시 만드는 편이 더 빠를 수 있습니다.

### 비용이 큰 조인 피하기 (Avoid expensive joins)

- 성능상 필요하다면 [비정규화](/topics/database/rdbms/#비정규화-denormalization)하세요.

### 테이블 분할하기 (Partition tables)

- 자주 접근하는 부분(hot spot)을 별도 테이블로 떼어 내, 메모리에 유지하기 쉽게 테이블을 나누세요.

### 쿼리 캐시 튜닝하기 (Tune the query cache)

- 경우에 따라 [쿼리 캐시](https://dev.mysql.com/doc/refman/5.7/en/query-cache.html)가 [성능 문제](https://www.percona.com/blog/2016/10/12/mysql-5-7-performance-tuning-immediately-after-installation/)를 일으킬 수 있습니다.

**출처 및 더 읽을거리: SQL 튜닝**

- [Tips for optimizing MySQL queries](http://aiddroid.com/10-tips-optimizing-mysql-queries-dont-suck/)
- [Is there a good reason i see VARCHAR(255) used so often?](http://stackoverflow.com/questions/1217466/is-there-a-good-reason-i-see-varchar255-used-so-often-as-opposed-to-another-l)
- [How do null values affect performance?](http://stackoverflow.com/questions/1017239/how-do-null-values-affect-performance-in-a-database-search)
- [Slow query log](http://dev.mysql.com/doc/refman/5.7/en/slow-query-log.html)

## 면접에서는

- 대부분의 서비스는 쓰기보다 읽기가 훨씬 많습니다. 그래서 해설들의 확장 설계에는 **SQL Write Master-Slave**와 **SQL Read Replicas**가 기본으로 들어가고, 읽기 부하는 메모리 캐시와 읽기 복제본으로 덜어 냅니다. ([AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 참고)
- 복제를 제안하면 공통 단점도 함께 말하세요. 마스터 장애 시 데이터 유실 가능성, 복제 지연, 그리고 읽기 복제본이 쓰기 재생에 묶이는 문제입니다. [Pastebin](/system-design/pastebin/) 해설도 "복제본이 쓰기 복제로 바빠지지 않는 한" 읽기 복제본이 캐시 미스를 감당할 수 있다고 단서를 답니다. 마스터 장애 대응은 [장애 조치](/topics/availability-patterns/#장애-조치-fail-over)와 연결해 설명하세요.
- 쓰기가 단일 **SQL Write Master-Slave**로 감당하기 어려워지면 페더레이션, 샤딩, 비정규화, SQL 튜닝 같은 추가 확장 패턴을 꺼내세요. [Twitter](/system-design/twitter/)와 [Mint.com](/system-design/mint/) 해설이 이 흐름을 따릅니다. 일부 데이터를 [NoSQL](/topics/database/nosql/)로 옮기는 방안도 함께 검토합니다.
- 샤딩을 말할 때는 샤드 키(성의 첫 글자, 지리적 위치), 특정 샤드로의 쏠림, 리밸런싱과 일관된 해싱, 샤드 간 조인의 어려움을 트레이드오프로 묶어 설명하세요. [소셜 그래프](/system-design/social-graph/) 해설은 친구끼리는 가까이 사는 경우가 많다는 점을 이용해 **Person Server**를 위치 기준으로 샤딩합니다.
- 어떤 기법이든 "왜 지금 필요한가"를 근거로 제시하세요. 해설들은 벤치마크/부하 테스트 → 프로파일링으로 병목 찾기 → 대안과 트레이드오프를 따지며 병목 해결 → 반복이라는 순서로 설계를 키워 가라고 강조합니다.

## 스스로 점검하기

<details>
<summary>ACID의 네 가지 속성은 각각 무엇을 보장하나요?</summary>

원자성은 트랜잭션이 전부 실행되거나 전혀 실행되지 않음을, 일관성은 트랜잭션이 데이터베이스를 유효한 상태에서 다른 유효한 상태로 옮김을, 격리성은 동시에 실행한 결과가 순서대로 실행한 결과와 같음을, 지속성은 커밋된 트랜잭션이 그대로 유지됨을 보장합니다.

</details>

<details>
<summary>마스터가 다운되면 마스터-슬레이브 복제와 마스터-마스터 복제는 각각 어떻게 되나요?</summary>

마스터-슬레이브에서는 슬레이브가 마스터로 승격되거나 새 마스터가 프로비저닝될 때까지 읽기 전용 모드로 동작하며, 승격을 위한 로직이 따로 필요합니다. 마스터-마스터에서는 남은 마스터가 읽기와 쓰기를 모두 계속 처리합니다. 대신 마스터-마스터는 어느 마스터에 쓸지 정하는 로드 밸런서나 애플리케이션 로직이 필요하고, 일관성이 느슨해지거나 쓰기 지연 시간이 늘어납니다.

</details>

<details>
<summary>페더레이션과 샤딩은 데이터베이스를 어떻게 다르게 나누나요?</summary>

페더레이션은 forums, users, products처럼 기능별로 데이터베이스를 나눕니다. 샤딩은 같은 종류의 데이터를 사용자 성의 첫 글자나 지리적 위치 같은 기준으로 나눠, 각 데이터베이스가 전체 데이터의 일부만 관리하게 합니다. 둘 다 데이터베이스별 트래픽과 복제량을 줄이고 캐시 히트를 늘리며, 단일 중앙 마스터가 없어 병렬 쓰기가 가능합니다.

</details>

<details>
<summary>비정규화는 어떤 상황에서 유리하고, 어떤 상황에서 불리한가요?</summary>

읽기가 쓰기보다 100:1이나 1000:1처럼 훨씬 많고, 복잡한 조인 때문에 읽기 비용이 클 때 유리합니다. 페더레이션이나 샤딩으로 데이터가 분산된 뒤의 복잡한 조인을 피하는 데도 도움이 됩니다. 반면 데이터가 중복되고, 사본을 동기화하느라 설계가 복잡해지며, 쓰기 부하가 큰 상황에서는 정규화된 데이터베이스보다 성능이 나쁠 수 있습니다.

</details>

<details>
<summary>인덱스를 추가할 때 얻는 것과 잃는 것은 무엇인가요?</summary>

`SELECT`, `GROUP BY`, `ORDER BY`, `JOIN`에 쓰는 열의 쿼리가 빨라집니다. 대신 인덱스를 두면 데이터를 메모리에 유지하느라 공간이 더 필요하고, 쓰기 때마다 인덱스도 갱신해야 하므로 쓰기가 느려질 수 있습니다. 그래서 대량 적재 시에는 인덱스를 끄고 적재한 뒤 다시 만드는 편이 빠를 수 있습니다.

</details>
