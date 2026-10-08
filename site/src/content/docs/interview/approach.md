---
title: 시스템 설계 면접 접근법 (How to approach)
description: 열린 대화인 시스템 설계 면접을 이끄는 4단계 — 유스케이스·제약 조건 정리, 고수준 설계, 핵심 구성 요소 설계, 확장 — 와 어림 계산을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question
---

:::note[핵심 요약]
- 시스템 설계 면접은 **열린 대화**이고, 대화를 이끄는 사람은 **여러분**입니다.
- 4단계로 진행합니다: **유스케이스·제약 조건·가정 정리 → 고수준 설계 → 핵심 구성 요소 설계 → 설계 확장**.
- 확장 단계에서는 주어진 제약 조건을 기준으로 병목을 찾고, 해결책과 그 **트레이드오프**를 함께 이야기합니다.
- 손으로 하는 **어림 계산**을 요구받을 수 있으니 2의 거듭제곱과 지연 시간 숫자를 익혀 두세요.
:::

> 시스템 설계 면접 문제를 푸는 방법

시스템 설계 면접은 **열린 대화(open-ended conversation)** 입니다. 대화는 여러분이 이끌어야 합니다.

아래 단계를 따라 논의를 진행할 수 있습니다. 이 과정을 몸에 익히려면 [해설이 있는 시스템 설계 면접 문제](/system-design/)를 아래 단계에 따라 풀어 보세요.

## 1단계: 유스케이스, 제약 조건, 가정 정리

요구 사항을 모으고 문제의 범위를 정합니다. 유스케이스와 제약 조건을 명확히 하기 위해 질문하고, 가정을 함께 이야기합니다.

- 누가 사용하나요?
- 어떻게 사용하나요?
- 사용자는 몇 명인가요?
- 시스템은 무엇을 하나요?
- 시스템의 입력과 출력은 무엇인가요?
- 처리해야 할 데이터는 얼마나 되나요?
- 초당 요청은 얼마나 들어오나요?
- 읽기와 쓰기의 비율은 어느 정도인가요?

## 2단계: 고수준 설계

중요한 구성 요소를 모두 포함한 고수준 설계의 윤곽을 잡습니다.

- 주요 구성 요소와 연결을 스케치합니다.
- 아이디어의 근거를 설명합니다.

## 3단계: 핵심 구성 요소 설계

핵심 구성 요소마다 세부 사항으로 들어갑니다. 예를 들어 [URL 단축 서비스 설계](/system-design/pastebin/)를 요청받았다면 다음을 논의합니다.

- 전체 URL의 해시를 생성하고 저장하기
    - [MD5](/system-design/pastebin/)와 [Base62](/system-design/pastebin/)
    - 해시 충돌
    - SQL 또는 NoSQL
    - 데이터베이스 스키마
- 해시된 URL을 전체 URL로 변환하기
    - 데이터베이스 조회
- API와 객체 지향 설계

## 4단계: 설계 확장

주어진 제약 조건을 바탕으로 병목을 찾아 해결합니다. 예를 들어 확장성 문제를 해결하려면 다음이 필요할까요?

- [로드 밸런서](/topics/load-balancer/)
- [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)
- [캐싱](/topics/cache/)
- [데이터베이스 샤딩](/topics/database/rdbms/#샤딩-sharding)

가능한 해결책과 트레이드오프를 논의하세요. 모든 것은 트레이드오프입니다. [확장 가능한 시스템 설계의 원칙](/topics/)을 활용해 병목을 해결하세요.

## 어림 계산

손으로 몇 가지를 어림해 보라는 요청을 받을 수 있습니다. [부록](/appendix/powers-of-two/)의 다음 자료를 참고하세요.

- [Use back of the envelope calculations](http://highscalability.com/blog/2011/1/26/google-pro-tip-use-back-of-the-envelope-calculations-to-choo.html)
- [2의 거듭제곱 표](/appendix/powers-of-two/)
- [모든 프로그래머가 알아야 할 지연 시간 숫자](/appendix/latency-numbers/)

[어림 계산](/interview/estimation/) 페이지에서는 해설에서 쓰는 환산 규칙과 계산기로 직접 연습할 수 있습니다.

## 면접에서는

원문의 4단계를 실제 면접에서 쓰기 좋게 정리한 체크리스트입니다.

| 단계 | 스스로 확인할 질문 | 놓치기 쉬운 것 |
|---|---|---|
| 1. 유스케이스·제약 조건 | 핵심 유스케이스 2–3개와 범위 밖(out of scope)을 합의했나요? 사용자 수, 요청 수, 읽기:쓰기 비율을 숫자로 정했나요? | 가용성·지연 시간 요구 같은 비기능 요구 사항 |
| 2. 고수준 설계 | 클라이언트부터 저장소까지 요청 흐름을 끝까지 그렸나요? 구성 요소마다 왜 필요한지 말했나요? | 읽기 경로와 쓰기 경로를 따로 그려 보기 |
| 3. 핵심 구성 요소 | 데이터 모델(스키마)과 API를 정했나요? 핵심 알고리즘(예: 단축 URL 생성)을 설명했나요? | SQL과 NoSQL 중 고른 이유 |
| 4. 확장 | 1단계의 숫자를 기준으로 병목을 찾았나요? 해결책마다 트레이드오프를 말했나요? | 단일 장애 지점(SPOF), 캐시 무효화, 복제 지연 |

:::tip[해설로 연습하는 방법]
[해설이 있는 시스템 설계 문제](/system-design/)는 모두 이 4단계 순서로 쓰여 있습니다. 문제를 읽은 뒤 해설을 닫고 타이머를 맞춘 채 단계마다 직접 적어 본 다음, 해설의 같은 단계와 비교해 보세요.
:::

## 스스로 점검하기

<details>
<summary>1단계에서 꼭 물어봐야 할 숫자 관련 질문은 무엇인가요?</summary>

사용자는 몇 명인지, 처리해야 할 데이터는 얼마나 되는지, 초당 요청은 얼마나 들어오는지, 읽기와 쓰기의 비율은 어느 정도인지입니다. 이 숫자가 4단계에서 병목을 찾는 기준이 됩니다.

</details>

<details>
<summary>4단계에서 확장성 문제를 해결하기 위해 검토하는 대표적인 수단 네 가지는 무엇인가요?</summary>

로드 밸런서, 수평 확장, 캐싱, 데이터베이스 샤딩입니다. 어떤 수단을 쓰든 해결책과 트레이드오프를 함께 논의해야 합니다.

</details>

<details>
<summary>URL 단축 서비스의 핵심 구성 요소를 설계할 때 논의할 거리는 무엇인가요?</summary>

전체 URL의 해시를 생성하고 저장하는 방법(MD5와 Base62, 해시 충돌, SQL 또는 NoSQL, 데이터베이스 스키마), 해시된 URL을 전체 URL로 변환하는 방법(데이터베이스 조회), 그리고 API와 객체 지향 설계입니다.

</details>

## 출처 및 더 읽을거리

어떤 면접이 될지 감을 잡으려면 다음 글을 확인하세요.

- [How to ace a systems design interview](https://web.archive.org/web/20210505130322/https://www.palantir.com/2011/10/how-to-rock-a-systems-design-interview/)
- [The system design interview](http://www.hiredintech.com/system-design)
- [Intro to Architecture and Systems Design Interviews](https://www.youtube.com/watch?v=ZgdS0EUmn70)
- [System design template](https://leetcode.com/discuss/career/229177/My-System-Design-Template)
