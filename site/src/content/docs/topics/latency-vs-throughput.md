---
title: 지연 시간 vs 처리량 (Latency vs throughput)
description: 지연 시간과 처리량이 각각 무엇을 측정하는지, 그리고 시스템을 설계할 때 둘 사이에서 무엇을 목표로 삼아야 하는지 정리합니다.
original: https://github.com/donnemartin/system-design-primer#latency-vs-throughput
---

:::note[핵심 요약]
- **지연 시간**은 어떤 동작을 수행하거나 결과를 만들어 내는 데 걸리는 시간입니다.
- **처리량**은 단위 시간당 그런 동작을 수행하거나 결과를 만들어 내는 횟수입니다.
- 일반적으로 **허용 가능한 지연 시간**을 지키면서 **처리량을 최대화**하는 것을 목표로 삼습니다.
:::

**지연 시간**(latency)은 어떤 동작을 수행하거나 어떤 결과를 만들어 내는 데 걸리는 시간입니다.

**처리량**(throughput)은 단위 시간당 그러한 동작을 수행하거나 결과를 만들어 내는 횟수입니다.

일반적으로 **허용 가능한 지연 시간** 안에서 **최대 처리량**을 목표로 삼아야 합니다.

## 면접에서는

- 설계 결정을 설명할 때 "허용 가능한 지연 시간을 지키면서 처리량을 최대화한다"는 기준을 분명히 하세요. 두 지표를 섞어 말하지 말고, 어떤 결정이 어느 쪽에 영향을 주는지 구분해 말하는 것이 좋습니다.
- 지연 시간을 줄이는 대표적인 수단으로 [캐시](/topics/cache/)와 [CDN](/topics/cdn/)을 들 수 있습니다. [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설도 부하와 지연 시간을 함께 줄이려고 메모리 캐시와 CDN을 도입합니다.
- 비용이 큰 작업을 요청 경로에서 떼어 내는 [비동기 처리](/topics/asynchronism/)도 요청 시간을 줄이는 방법입니다.
- 쓰기 처리량이 문제라면, 쓰기를 직렬화하는 단일 마스터 없이 여러 곳에 병렬로 쓸 수 있는 [샤딩](/topics/database/rdbms/#샤딩-sharding)이나 [페더레이션](/topics/database/rdbms/#페더레이션-federation)을 후보로 꺼낼 수 있습니다.
- 지연 시간을 어림 계산할 때는 [모든 프로그래머가 알아야 할 지연 시간 수치](/appendix/latency-numbers/)를 참고하세요.

## 스스로 점검하기

<details>
<summary>지연 시간과 처리량은 각각 무엇을 측정하나요?</summary>

지연 시간은 어떤 동작을 수행하거나 결과를 만들어 내는 데 걸리는 시간이고, 처리량은 단위 시간당 그런 동작이나 결과의 수입니다.

</details>

<details>
<summary>웹 서버가 요청 하나를 처리하는 데 200ms가 걸리고, 초당 500건의 요청을 처리합니다. 각각 어느 지표에 해당하나요?</summary>

요청 하나에 걸리는 200ms는 지연 시간이고, 초당 처리하는 500건은 처리량입니다.

</details>

<details>
<summary>두 지표 사이에서 일반적으로 무엇을 목표로 삼아야 하나요?</summary>

허용 가능한 지연 시간을 지키는 범위 안에서 처리량을 최대화하는 것을 목표로 삼습니다.

</details>

## 출처 및 더 읽을거리

- [Understanding latency vs throughput](https://community.cadence.com/cadence_blogs_8/b/fv/posts/understanding-latency-vs-throughput)
