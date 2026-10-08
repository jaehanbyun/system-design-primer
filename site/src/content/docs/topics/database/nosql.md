---
title: NoSQL
description: NoSQL과 BASE 속성을 이해하고, 키-값 저장소, 문서 저장소, 와이드 컬럼 저장소, 그래프 데이터베이스의 구조와 쓰임새를 비교합니다.
original: https://github.com/donnemartin/system-design-primer#nosql
---

:::note[핵심 요약]
- NoSQL은 데이터를 **키-값 저장소**, **문서 저장소**, **와이드 컬럼 저장소**, **그래프 데이터베이스** 형태로 표현합니다. 데이터는 비정규화되어 있고, 조인은 보통 애플리케이션 코드에서 처리합니다.
- 대부분의 NoSQL 저장소는 진정한 ACID 트랜잭션이 없고 최종적 일관성을 택합니다. NoSQL의 속성은 흔히 **BASE**로 설명하며, BASE는 CAP 정리 관점에서 일관성보다 가용성을 택합니다.
- 키-값 저장소는 O(1) 읽기·쓰기를 제공해 단순한 데이터 모델이나 빠르게 바뀌는 데이터에, 문서 저장소는 유연성이 높아 가끔 바뀌는 데이터에 자주 쓰입니다.
- 와이드 컬럼 저장소는 매우 큰 데이터셋을 위한 높은 가용성과 확장성을, 그래프 데이터베이스는 소셜 네트워크처럼 관계가 복잡한 데이터 모델에서 높은 성능을 제공합니다.
:::

NoSQL은 **키-값 저장소**, **문서 저장소**, **와이드 컬럼 저장소**, **그래프 데이터베이스** 중 하나의 형태로 표현되는 데이터 항목의 모음입니다. 데이터는 비정규화되어 있으며, 조인은 보통 애플리케이션 코드에서 처리합니다. 대부분의 NoSQL 저장소는 진정한 ACID 트랜잭션을 지원하지 않고 [최종적 일관성](/topics/consistency-patterns/#최종적-일관성-eventual-consistency)을 택합니다.

NoSQL 데이터베이스의 속성은 흔히 **BASE**라는 말로 설명합니다. [CAP 정리](/topics/availability-vs-consistency/#cap-정리-cap-theorem)에 비추어 보면, BASE는 일관성보다 가용성을 택합니다.

- **기본적 가용성(Basically available)** - 시스템은 가용성을 보장합니다.
- **소프트 상태(Soft state)** - 입력이 없어도 시스템의 상태는 시간이 지나면서 바뀔 수 있습니다.
- **최종적 일관성(Eventual consistency)** - 일정 기간 동안 입력을 받지 않는다면, 시스템은 그 기간이 지나면서 일관된 상태가 됩니다.

[SQL과 NoSQL 중 무엇을 고를지](/topics/database/sql-or-nosql/) 정하는 것과 더불어, 어떤 유형의 NoSQL 데이터베이스가 유스케이스에 가장 잘 맞는지 이해해 두면 도움이 됩니다. 다음 절에서 **키-값 저장소**, **문서 저장소**, **와이드 컬럼 저장소**, **그래프 데이터베이스**를 차례로 살펴봅니다.

## 키-값 저장소 (Key-value store)

> 추상화(Abstraction): 해시 테이블

키-값 저장소는 일반적으로 O(1) 읽기와 쓰기를 제공하며, 메모리나 SSD를 기반으로 하는 경우가 많습니다. 키를 [사전순(lexicographic order)](https://en.wikipedia.org/wiki/Lexicographical_order)으로 유지하는 데이터 저장소는 키 범위를 효율적으로 조회할 수 있습니다. 키-값 저장소는 값과 함께 메타데이터를 저장할 수 있게 해 주기도 합니다.

키-값 저장소는 높은 성능을 제공하며, 단순한 데이터 모델이나 인메모리 캐시 계층처럼 빠르게 바뀌는 데이터에 자주 쓰입니다. 제공하는 연산이 제한적이기 때문에, 추가 연산이 필요하면 그 복잡도는 애플리케이션 계층으로 넘어갑니다.

키-값 저장소는 문서 저장소, 그리고 경우에 따라서는 그래프 데이터베이스 같은 더 복잡한 시스템의 기반이 됩니다.

**출처 및 더 읽을거리: 키-값 저장소**

- [Key-value database](https://en.wikipedia.org/wiki/Key-value_database)
- [Disadvantages of key-value stores](http://stackoverflow.com/questions/4056093/what-are-the-disadvantages-of-using-a-key-value-table-over-nullable-columns-or)
- [Redis architecture](http://qnimate.com/overview-of-redis-architecture/)
- [Memcached architecture](https://adayinthelifeof.nl/2011/02/06/memcache-internals/)

## 문서 저장소 (Document store)

> 추상화(Abstraction): 문서를 값으로 저장하는 키-값 저장소

문서 저장소는 문서(XML, JSON, 바이너리 등)를 중심으로 하며, 문서 하나에 해당 객체의 모든 정보를 저장합니다. 문서 저장소는 문서 자체의 내부 구조를 기준으로 질의할 수 있는 API나 쿼리 언어를 제공합니다. *참고로, 많은 키-값 저장소가 값의 메타데이터를 다루는 기능을 갖추고 있어 두 저장소 유형의 경계가 흐려지고 있습니다.*

내부 구현에 따라 문서는 컬렉션, 태그, 메타데이터, 디렉터리 단위로 구성됩니다. 문서를 묶거나 그룹으로 정리할 수는 있지만, 문서마다 필드가 완전히 다를 수도 있습니다.

[MongoDB](https://www.mongodb.com/mongodb-architecture)나 [CouchDB](https://blog.couchdb.org/2016/08/01/couchdb-2-0-architecture/) 같은 일부 문서 저장소는 복잡한 쿼리를 수행할 수 있도록 SQL과 비슷한 언어도 제공합니다. [DynamoDB](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf)는 키-값과 문서를 모두 지원합니다.

문서 저장소는 유연성이 높으며, 가끔씩 바뀌는 데이터를 다룰 때 자주 쓰입니다.

**출처 및 더 읽을거리: 문서 저장소**

- [Document-oriented database](https://en.wikipedia.org/wiki/Document-oriented_database)
- [MongoDB architecture](https://www.mongodb.com/mongodb-architecture)
- [CouchDB architecture](https://blog.couchdb.org/2016/08/01/couchdb-2-0-architecture/)
- [Elasticsearch architecture](https://www.elastic.co/blog/found-elasticsearch-from-the-bottom-up)

## 와이드 컬럼 저장소 (Wide column store)

![companies 슈퍼 컬럼 패밀리 아래에서 행 키 1이 address와 website 컬럼 패밀리를 갖고, 각 컬럼 패밀리가 이름/값 쌍의 컬럼으로 이루어진 구조](@repo/images/n16iOGk.png)

*출처: [SQL & NoSQL, a brief history](http://blog.grio.com/2015/11/sql-nosql-a-brief-history.html)*

> 추상화(Abstraction): 중첩 맵 `ColumnFamily<RowKey, Columns<ColKey, Value, Timestamp>>`

와이드 컬럼 저장소의 기본 데이터 단위는 컬럼(이름/값 쌍)입니다. 컬럼은 컬럼 패밀리(SQL 테이블에 해당)로 묶을 수 있고, 슈퍼 컬럼 패밀리는 컬럼 패밀리를 다시 묶습니다. 각 컬럼은 행 키(row key)로 독립적으로 접근할 수 있으며, 같은 행 키를 가진 컬럼들이 하나의 행을 이룹니다. 각 값에는 버전 관리와 충돌 해결에 쓰는 타임스탬프가 들어 있습니다.

Google은 최초의 와이드 컬럼 저장소로 [Bigtable](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf)을 선보였고, Bigtable은 Hadoop 생태계에서 자주 쓰이는 오픈 소스 [HBase](https://www.edureka.co/blog/hbase-architecture/)와 Facebook에서 나온 [Cassandra](http://docs.datastax.com/en/cassandra/3.0/cassandra/architecture/archIntro.html)에 영향을 주었습니다. BigTable, HBase, Cassandra 같은 저장소는 키를 사전순으로 유지하므로, 원하는 키 범위를 효율적으로 조회할 수 있습니다.

와이드 컬럼 저장소는 높은 가용성과 높은 확장성을 제공하며, 매우 큰 데이터셋에 자주 쓰입니다.

**출처 및 더 읽을거리: 와이드 컬럼 저장소**

- [SQL & NoSQL, a brief history](http://blog.grio.com/2015/11/sql-nosql-a-brief-history.html)
- [Bigtable architecture](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf)
- [HBase architecture](https://www.edureka.co/blog/hbase-architecture/)
- [Cassandra architecture](http://docs.datastax.com/en/cassandra/3.0/cassandra/architecture/archIntro.html)

## 그래프 데이터베이스 (Graph database)

![Alice, Bob 노드와 Chess 그룹 노드가 knows, is_member, Members 같은 레이블과 속성을 가진 관계로 연결된 속성 그래프](@repo/images/fNcl65g.png)

*출처: [Graph database](https://en.wikipedia.org/wiki/File:GraphDatabase_PropertyGraph.png)*

> 추상화(Abstraction): 그래프

그래프 데이터베이스에서 각 노드는 레코드이고, 각 아크(arc)는 두 노드 사이의 관계입니다. 그래프 데이터베이스는 외래 키가 많거나 다대다 관계가 많은 복잡한 관계를 표현하도록 최적화되어 있습니다.

그래프 데이터베이스는 소셜 네트워크처럼 관계가 복잡한 데이터 모델에서 높은 성능을 냅니다. 비교적 새로운 기술이라 아직 널리 쓰이지는 않으며, 개발 도구와 참고 자료를 찾기가 더 어려울 수 있습니다. 많은 그래프 데이터베이스는 [REST API](/topics/communication/#rest-representational-state-transfer)로만 접근할 수 있습니다.

**출처 및 더 읽을거리: 그래프 데이터베이스**

- [Graph database](https://en.wikipedia.org/wiki/Graph_database)
- [Neo4j](https://neo4j.com/)
- [FlockDB](https://blog.twitter.com/2010/introducing-flockdb)

## 면접에서는

- 해설에서 NoSQL은 보통 관계형 데이터베이스만으로 부족해질 때 등장합니다. [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설은 읽기·쓰기 요청이 계속 늘면 적절한 데이터를 DynamoDB 같은 NoSQL로 옮기라고 하고, [Twitter](/system-design/twitter/) 해설은 팬아웃 쓰기가 관계형 데이터베이스에 과부하를 주므로 쓰기가 빠른 NoSQL이나 메모리 캐시를 고르라고 합니다. NoSQL을 꺼낼 때는 **어떤 유형**인지까지 말하세요.
- 키-값 저장소는 단순한 조회에 잘 맞습니다. [Pastebin](/system-design/pastebin/) 해설은 거대한 해시 테이블처럼 쓰이는 관계형 데이터베이스의 대안으로 키-값 저장소를 언급하고, [웹 크롤러](/system-design/web-crawler/) 해설은 `links_to_crawl`과 `crawled_links`를 키-값 NoSQL에 두고 Redis의 sorted set으로 순위를 관리합니다.
- 그래프 데이터베이스는 관계가 복잡할 때 강력하지만, 아직 널리 쓰이지 않아 도구와 자료가 부족하다는 점도 함께 말하세요. [소셜 그래프](/system-design/social-graph/) 해설은 그래프 전용 솔루션을 쓰지 말라는 제약 아래 전통적인 시스템으로 문제를 풀고, 그 제약이 없다면 Neo4j 같은 그래프 데이터베이스를 쓸 수 있다고 덧붙입니다.
- NoSQL을 고르면 ACID 트랜잭션 대신 BASE와 최종적 일관성을 받아들이고, 조인을 애플리케이션 코드에서 처리하게 된다는 점을 트레이드오프로 짚어 주세요. ([일관성 패턴](/topics/consistency-patterns/#최종적-일관성-eventual-consistency) 참고)

## 스스로 점검하기

<details>
<summary>BASE의 세 가지 속성은 무엇이고, CAP 정리 관점에서 무엇을 택한 것인가요?</summary>

기본적 가용성(시스템이 가용성을 보장), 소프트 상태(입력이 없어도 상태가 시간에 따라 바뀔 수 있음), 최종적 일관성(일정 기간 입력이 없으면 시스템이 결국 일관된 상태가 됨)입니다. CAP 정리 관점에서 BASE는 일관성보다 가용성을 택합니다.

</details>

<details>
<summary>키-값 저장소는 어떤 데이터에 잘 맞고, 한계는 무엇인가요?</summary>

일반적으로 O(1) 읽기·쓰기를 제공하고 메모리나 SSD를 기반으로 해 성능이 높으므로, 단순한 데이터 모델이나 인메모리 캐시 계층처럼 빠르게 바뀌는 데이터에 잘 맞습니다. 다만 제공하는 연산이 제한적이라, 추가 연산이 필요하면 그 복잡도가 애플리케이션 계층으로 넘어갑니다.

</details>

<details>
<summary>문서 저장소는 키-값 저장소와 무엇이 다른가요?</summary>

문서 저장소는 문서를 값으로 저장하는 키-값 저장소로 볼 수 있으며, 문서 하나에 객체의 모든 정보를 담고 문서의 내부 구조를 기준으로 질의하는 API나 쿼리 언어를 제공합니다. 다만 많은 키-값 저장소도 값의 메타데이터를 다루는 기능이 있어 두 유형의 경계는 흐려지고 있습니다.

</details>

<details>
<summary>와이드 컬럼 저장소에서 컬럼, 컬럼 패밀리, 행 키는 각각 무엇인가요?</summary>

컬럼은 기본 데이터 단위인 이름/값 쌍이고, 컬럼 패밀리는 컬럼을 묶은 것으로 SQL 테이블에 해당합니다(슈퍼 컬럼 패밀리는 컬럼 패밀리를 다시 묶습니다). 행 키로 각 컬럼에 독립적으로 접근하며, 같은 행 키를 가진 컬럼들이 하나의 행을 이룹니다. 각 값에는 버전 관리와 충돌 해결을 위한 타임스탬프가 붙습니다.

</details>

<details>
<summary>그래프 데이터베이스는 어떤 데이터 모델에 적합하고, 도입할 때 무엇을 고려해야 하나요?</summary>

외래 키나 다대다 관계가 많은 복잡한 관계, 예를 들어 소셜 네트워크 같은 데이터 모델에서 높은 성능을 냅니다. 하지만 비교적 새로운 기술이라 널리 쓰이지 않아 개발 도구와 자료를 찾기 어려울 수 있고, 많은 그래프 데이터베이스는 REST API로만 접근할 수 있습니다.

</details>

## 출처 및 더 읽을거리

- [Explanation of base terminology](http://stackoverflow.com/questions/3342497/explanation-of-base-terminology)
- [NoSQL databases a survey and decision guidance](https://medium.com/baqend-blog/nosql-databases-a-survey-and-decision-guidance-ea7823a822d#.wskogqenq)
- [Scalability](https://web.archive.org/web/20220602114024/https://www.lecloud.net/post/7994751381/scalability-for-dummies-part-2-database)
- [Introduction to NoSQL](https://www.youtube.com/watch?v=qI_g07C_Q5I)
- [NoSQL patterns](http://horicky.blogspot.com/2009/11/nosql-patterns.html)
