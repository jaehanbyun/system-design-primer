---
title: 성능 vs 확장성 (Performance vs scalability)
description: 확장성 있는 서비스가 무엇인지 정의하고, 성능 문제와 확장성 문제를 어떻게 구분하는지 정리합니다.
original: https://github.com/donnemartin/system-design-primer#performance-vs-scalability
---

:::note[핵심 요약]
- 자원을 추가한 만큼 그에 비례해 **성능**이 높아지는 서비스를 **확장성** 있는 서비스라고 합니다.
- 성능을 높인다는 것은 보통 더 많은 작업 단위를 처리한다는 뜻이지만, 데이터셋이 커질 때처럼 더 큰 작업 단위를 처리한다는 뜻일 수도 있습니다.
- **성능** 문제가 있으면 사용자 한 명이 써도 시스템이 느립니다.
- **확장성** 문제가 있으면 사용자 한 명에게는 빠르지만 부하가 커지면 느려집니다.
:::

자원을 추가한 만큼 그에 비례해 **성능**이 높아진다면, 그 서비스는 **확장성**이 있다(scalable)고 말합니다. 일반적으로 성능을 높인다는 것은 더 많은 작업 단위를 처리한다는 뜻이지만, 데이터셋이 커지는 경우처럼 더 큰 작업 단위를 처리한다는 뜻일 수도 있습니다.<sup>[1](http://www.allthingsdistributed.com/2006/03/a_word_on_scalability.html)</sup>

성능과 확장성은 이렇게 구분해 볼 수도 있습니다.

- **성능** 문제가 있다면, 사용자 한 명이 쓸 때도 시스템이 느립니다.
- **확장성** 문제가 있다면, 사용자 한 명이 쓸 때는 빠르지만 부하가 커지면 느려집니다.

## 면접에서는

- "시스템이 느리다"는 문제가 주어지면, 사용자 한 명에게도 느린지(성능 문제) 부하가 커질 때만 느린지(확장성 문제)부터 구분하세요. 원인이 어느 쪽이냐에 따라 살펴볼 지점이 달라집니다.
- 확장성은 "자원을 추가한 만큼 성능이 비례해 늘어나는가"라는 정의로 설명하면 명확합니다. 예를 들어 [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)으로 웹 서버를 늘리면 캐시와 데이터베이스 같은 하위(downstream) 서버가 감당해야 할 동시 연결도 늘어나므로, 그쪽이 병목이 되지 않는지 함께 짚어야 합니다.
- 처리할 작업량뿐 아니라 **데이터셋의 크기**가 커지는 것도 확장성의 대상입니다. 데이터가 계속 늘어나는 시나리오라면 [샤딩](/topics/database/rdbms/#샤딩-sharding) 같은 기법이 후속 질문으로 이어지기 쉽습니다.
- 병목이 실제로 어디인지는 벤치마크와 프로파일링으로 확인해야 합니다. [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설은 부하 테스트와 프로파일링 결과를 근거로 확장 단계를 하나씩 밟아 가는 좋은 예입니다.

## 스스로 점검하기

<details>
<summary>어떤 서비스를 "확장성 있다"고 말하나요?</summary>

자원을 추가한 만큼 그에 비례해 성능이 높아지는 서비스입니다. 여기서 성능 향상은 더 많은 작업 단위를 처리하는 것일 수도 있고, 데이터셋이 커질 때처럼 더 큰 작업 단위를 처리하는 것일 수도 있습니다.

</details>

<details>
<summary>사용자 한 명이 쓸 때는 빠른데 트래픽이 몰리면 느려집니다. 성능 문제인가요, 확장성 문제인가요?</summary>

확장성 문제입니다. 사용자 한 명이 쓸 때도 느리다면 성능 문제입니다.

</details>

<details>
<summary>성능 향상은 처리하는 요청 수를 늘리는 것만 뜻하나요?</summary>

아닙니다. 일반적으로는 더 많은 작업 단위를 처리하는 것을 뜻하지만, 데이터셋이 커지는 경우처럼 더 큰 작업 단위를 처리하는 것도 성능 향상에 해당합니다.

</details>

## 출처 및 더 읽을거리

- [A word on scalability](http://www.allthingsdistributed.com/2006/03/a_word_on_scalability.html)
- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
