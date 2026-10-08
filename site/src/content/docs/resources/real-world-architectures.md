---
title: 실제 시스템 아키텍처 (Real world architectures)
description: MapReduce, Bigtable, Cassandra, GFS, Kafka처럼 실제로 쓰이는 시스템이 어떻게 설계되었는지 다룬 논문과 발표 자료를 유형별로 모았습니다.
original: https://github.com/donnemartin/system-design-primer#real-world-architectures
---

> 실제 시스템이 어떻게 설계되었는지 다룬 글 모음입니다.

![Write API로 들어온 트윗이 Fanout(Redis 타임라인 캐시), 검색 인덱스(Earlybird), 푸시, Hadoop 배치 처리로 나뉘어 전달되는 Twitter 아키텍처](@repo/images/TcUo2fw.png)

*출처: [Twitter timelines at scale](https://www.infoq.com/presentations/Twitter-Timeline-Scalability)*

**아래 글들을 읽을 때 세부 사항에 매달리지 말고, 대신 다음에 집중하세요.**

- 글들에 공통으로 나타나는 원칙, 자주 쓰이는 기술, 패턴을 찾아보세요.
- 각 구성 요소가 어떤 문제를 해결하는지, 어디에서 잘 동작하고 어디에서는 그렇지 않은지 공부하세요.
- 배운 교훈(lessons learned)을 정리해 보세요.

## 데이터 처리

| 시스템 | 참고 자료 |
|---|---|
| **MapReduce** - Google이 만든 분산 데이터 처리 시스템 | [research.google.com](http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/mapreduce-osdi04.pdf) |
| **Spark** - Databricks가 만든 분산 데이터 처리 시스템 | [slideshare.net](http://www.slideshare.net/AGrishchenko/apache-spark-architecture) |
| **Storm** - Twitter가 만든 분산 데이터 처리 시스템 | [slideshare.net](http://www.slideshare.net/previa/storm-16094009) |

## 데이터 저장소

| 시스템 | 참고 자료 |
|---|---|
| **Bigtable** - Google이 만든 분산 컬럼 지향 데이터베이스 | [harvard.edu](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/chang06bigtable.pdf) |
| **HBase** - Bigtable의 오픈 소스 구현체 | [slideshare.net](http://www.slideshare.net/alexbaranau/intro-to-hbase) |
| **Cassandra** - Facebook이 만든 분산 컬럼 지향 데이터베이스 | [slideshare.net](http://www.slideshare.net/planetcassandra/cassandra-introduction-features-30103666) |
| **DynamoDB** - Amazon이 만든 문서 지향 데이터베이스 | [harvard.edu](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf) |
| **MongoDB** - 문서 지향 데이터베이스 | [slideshare.net](http://www.slideshare.net/mdirolf/introduction-to-mongodb) |
| **Spanner** - Google이 만든, 전 세계에 걸쳐 분산된 데이터베이스 | [research.google.com](http://research.google.com/archive/spanner-osdi2012.pdf) |
| **Memcached** - 분산 메모리 캐싱 시스템 | [slideshare.net](http://www.slideshare.net/oemebamo/introduction-to-memcached) |
| **Redis** - 영속성(persistence)과 다양한 값 타입을 지원하는 분산 메모리 캐싱 시스템 | [slideshare.net](http://www.slideshare.net/dvirsky/introduction-to-redis) |

## 파일 시스템

| 시스템 | 참고 자료 |
|---|---|
| **Google File System (GFS)** - 분산 파일 시스템 | [research.google.com](http://static.googleusercontent.com/media/research.google.com/zh-CN/us/archive/gfs-sosp2003.pdf) |
| **Hadoop File System (HDFS)** - GFS의 오픈 소스 구현체 | [apache.org](http://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html) |

## 기타

| 시스템 | 참고 자료 |
|---|---|
| **Chubby** - Google이 만든, 느슨하게 결합된 분산 시스템을 위한 락(lock) 서비스 | [research.google.com](http://static.googleusercontent.com/external_content/untrusted_dlcp/research.google.com/en/us/archive/chubby-osdi06.pdf) |
| **Dapper** - 분산 시스템 추적(tracing) 인프라 | [research.google.com](http://static.googleusercontent.com/media/research.google.com/en//pubs/archive/36356.pdf) |
| **Kafka** - LinkedIn이 만든 Pub/Sub 메시지 큐 | [slideshare.net](http://www.slideshare.net/mumrah/kafka-talk-tri-hug) |
| **Zookeeper** - 동기화를 가능하게 하는 중앙 집중식 인프라와 서비스 | [slideshare.net](http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper) |

목록에 아키텍처를 추가하고 싶다면 [기여하기](/about/#기여하기)를 참고하세요.

:::tip[이렇게 활용하세요]
- [학습 가이드](/guide/)는 준비 기간과 상관없이 실제 아키텍처 글을 **몇 편** 읽어 보라고 권합니다. 전부 읽으려 하기보다 몇 개를 골라 위의 세 가지 관점으로 정리하세요.
- 시스템 설계 주제와 연결해서 읽으면 효과가 큽니다. Bigtable·HBase·Cassandra는 [와이드 컬럼 저장소](/topics/database/nosql/#와이드-컬럼-저장소-wide-column-store), MongoDB·DynamoDB는 [문서 저장소](/topics/database/nosql/#문서-저장소-document-store), Memcached·Redis는 [캐시](/topics/cache/), Zookeeper는 [서비스 디스커버리](/topics/application-layer/#서비스-디스커버리-service-discovery)에서 다시 등장합니다.
- 읽은 시스템을 면접 연습과 이어 보세요. [추가 시스템 설계 면접 질문](/practice/additional-questions/)에는 "Memcached 같은 캐시 시스템 설계", "Redis 같은 키-값 저장소 설계"처럼 이 목록의 시스템을 직접 설계해 보는 문제가 있습니다.
:::
