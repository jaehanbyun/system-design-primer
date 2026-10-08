---
title: "시스템 설계 주제: 여기서 시작하기 (Start here)"
description: 시스템 설계를 처음 공부한다면 확장성 강의와 글로 기본기를 다진 뒤, 상위 수준의 트레이드오프와 개별 주제로 넘어가는 학습 순서를 안내합니다.
original: https://github.com/donnemartin/system-design-primer#system-design-topics-start-here
---

:::note[핵심 요약]
- 시스템 설계가 처음이라면 먼저 흔히 쓰이는 원칙이 **무엇인지**, **어떻게 쓰이는지**, **장단점은 무엇인지** 기본기를 익혀야 합니다.
- 1단계로 하버드의 확장성 강의에서 수직 확장, 수평 확장, 캐싱, 로드 밸런싱, 데이터베이스 복제와 파티셔닝을 훑어봅니다.
- 2단계로 확장성 글 시리즈에서 클론(Clones), 데이터베이스, 캐시, 비동기 처리를 읽습니다.
- 그다음 성능 vs 확장성, 지연 시간 vs 처리량, 가용성 vs 일관성이라는 상위 수준의 트레이드오프를 살펴보고, DNS·CDN·로드 밸런서 같은 구체적인 주제로 넘어갑니다.
- 공부하는 내내 **모든 것은 트레이드오프**라는 점을 기억하세요.
:::

시스템 설계가 처음이신가요?

먼저 흔히 쓰이는 원칙들을 기본적으로 이해해야 합니다. 각 원칙이 무엇인지, 어떻게 쓰이는지, 장단점은 무엇인지 배워 보세요.

## 1단계: 확장성 강의 영상 보기

[Scalability Lecture at Harvard](https://www.youtube.com/watch?v=-W9F__D3oY4)

- 다루는 주제:
  - 수직 확장(Vertical scaling)
  - 수평 확장(Horizontal scaling)
  - 캐싱(Caching)
  - 로드 밸런싱(Load balancing)
  - 데이터베이스 복제(Database replication)
  - 데이터베이스 파티셔닝(Database partitioning)

## 2단계: 확장성 글 읽기

[Scalability](https://web.archive.org/web/20221030091841/http://www.lecloud.net/tagged/scalability/chrono)

- 다루는 주제:
  - [클론(Clones)](https://web.archive.org/web/20220530193911/https://www.lecloud.net/post/7295452622/scalability-for-dummies-part-1-clones)
  - [데이터베이스(Databases)](https://web.archive.org/web/20220602114024/https://www.lecloud.net/post/7994751381/scalability-for-dummies-part-2-database)
  - [캐시(Caches)](https://web.archive.org/web/20230126233752/https://www.lecloud.net/post/9246290032/scalability-for-dummies-part-3-cache)
  - [비동기 처리(Asynchronism)](https://web.archive.org/web/20220926171507/https://www.lecloud.net/post/9699762917/scalability-for-dummies-part-4-asynchronism)

## 다음 단계 (Next steps)

이어서 상위 수준의 트레이드오프를 살펴봅니다.

- [**성능** vs **확장성**](/topics/performance-vs-scalability/)
- [**지연 시간** vs **처리량**](/topics/latency-vs-throughput/)
- [**가용성** vs **일관성**](/topics/availability-vs-consistency/)

**모든 것은 트레이드오프**라는 점을 명심하세요.

그다음에는 [DNS](/topics/dns/), [CDN](/topics/cdn/), [로드 밸런서](/topics/load-balancer/) 같은 더 구체적인 주제를 깊이 있게 다룹니다.

## 면접에서는

- 면접에서 어떤 구성 요소를 제안하든 **얻는 것과 잃는 것**을 함께 말하세요. 모든 것은 트레이드오프라는 관점이 답변의 기본 태도입니다.
- 강의와 글에서 다룬 로드 밸런싱, 수평 확장, 캐싱, 데이터베이스 파티셔닝(샤딩)은 [시스템 설계 면접 접근법](/interview/approach/)의 4단계에서 병목을 찾아 해결할 때 꺼내는 기본 도구입니다.
- 처음부터 모든 기법을 넣기보다, 제약 조건에 비추어 병목을 먼저 찾고 필요한 기법을 골라 적용하는 흐름을 보여 주세요.

## 스스로 점검하기

<details>
<summary>수직 확장과 수평 확장은 어떻게 다른가요?</summary>

수직 확장(scale up)은 서버 한 대를 더 비싸고 성능 좋은 하드웨어로 키우는 방식이고, 수평 확장(scale out)은 범용(commodity) 서버를 여러 대 늘려 부하를 나누는 방식입니다. 수평 확장이 일반적으로 비용 효율이 좋고 가용성도 높지만, 서버를 복제해야 하므로 복잡도가 늘어납니다. ([로드 밸런서](/topics/load-balancer/#수평-확장-horizontal-scaling) 참고)

</details>

<details>
<summary>수평 확장을 위해 서버를 복제(clone)할 때, 서버가 상태를 갖지 않아야(stateless) 하는 이유는 무엇인가요?</summary>

로드 밸런서는 요청을 여러 서버 중 어디로든 보낼 수 있으므로, 어느 서버가 요청을 받더라도 똑같이 처리할 수 있어야 합니다. 세션이나 프로필 사진 같은 사용자 관련 데이터를 특정 서버에 두면 이 전제가 깨집니다. 그래서 세션은 데이터베이스(SQL, NoSQL)나 영속적인 캐시(Redis, Memcached) 같은 중앙 저장소에 둡니다.

</details>

<details>
<summary>데이터베이스 복제와 파티셔닝(샤딩)은 무엇이 다른가요?</summary>

복제는 같은 데이터를 여러 서버에 복사해 두는 것입니다. 예를 들어 마스터-슬레이브 복제에서는 마스터가 쓰기를 슬레이브에 복제하고 슬레이브는 읽기만 처리하므로, 읽기 부하를 나눌 수 있고 마스터가 내려가도 읽기 전용으로 계속 동작할 수 있습니다. 샤딩은 데이터를 여러 데이터베이스에 나눠 각 데이터베이스가 일부만 관리하게 하는 것으로, 데이터베이스마다 읽기·쓰기 트래픽이 줄고 쓰기를 병렬로 처리할 수 있습니다. ([관계형 데이터베이스](/topics/database/rdbms/) 참고)

</details>

<details>
<summary>기본기를 익힌 다음 살펴볼 상위 수준의 트레이드오프 세 가지는 무엇인가요?</summary>

성능 vs 확장성, 지연 시간 vs 처리량, 가용성 vs 일관성입니다.

</details>
