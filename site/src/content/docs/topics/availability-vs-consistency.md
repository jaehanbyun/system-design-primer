---
title: 가용성 vs 일관성 (Availability vs consistency)
description: CAP 정리가 말하는 세 가지 보장과, 네트워크 분할이 일어났을 때 CP와 AP 중 무엇을 골라야 하는지 정리합니다.
original: https://github.com/donnemartin/system-design-primer#availability-vs-consistency
---

:::note[핵심 요약]
- 분산 컴퓨터 시스템은 **일관성**, **가용성**, **분할 내성** 가운데 두 가지만 보장할 수 있습니다(CAP 정리).
- 네트워크는 신뢰할 수 없으므로 분할 내성은 반드시 지원해야 합니다. 결국 일관성과 가용성 사이에서 트레이드오프를 선택하게 됩니다.
- **CP**는 분할된 노드의 응답을 기다리다 타임아웃 오류가 날 수 있지만, 원자적 읽기와 쓰기가 필요한 비즈니스에 적합합니다.
- **AP**는 최신이 아닐 수도 있는 데이터를 응답하지만, 최종적 일관성을 허용하거나 외부 오류가 있어도 계속 동작해야 하는 시스템에 적합합니다.
:::

## CAP 정리 (CAP theorem)

![두 노드 N1, N2로 일관성(두 노드가 같은 값 x를 가짐), 가용성(두 노드 모두 요청을 받음), 분할 내성(노드 사이 연결이 끊겨도 동작함)을 나타낸 그림](@repo/images/bgLMI2u.png)

*출처: [CAP theorem revisited](https://robertgreiner.com/cap-theorem-revisited)*

분산 컴퓨터 시스템에서는 다음 보장 가운데 두 가지만 지원할 수 있습니다.

- **일관성(Consistency)**: 모든 읽기는 가장 최근에 쓰인 값을 받거나, 아니면 오류를 받습니다.
- **가용성(Availability)**: 모든 요청이 응답을 받습니다. 다만 그 응답에 가장 최신 버전의 정보가 담겨 있다는 보장은 없습니다.
- **분할 내성(Partition Tolerance)**: 네트워크 장애로 시스템이 임의로 분할되더라도 시스템은 계속 동작합니다.

*네트워크는 신뢰할 수 없으므로 분할 내성은 반드시 지원해야 합니다. 따라서 소프트웨어 차원에서 일관성과 가용성 사이의 트레이드오프를 선택해야 합니다.*

### CP: 일관성과 분할 내성

분할된 노드의 응답을 기다리다 보면 타임아웃 오류가 날 수 있습니다. 비즈니스 요구 사항상 원자적(atomic) 읽기와 쓰기가 필요하다면 CP가 좋은 선택입니다.

### AP: 가용성과 분할 내성

응답으로는 어느 노드에서든 가장 쉽게 구할 수 있는 버전의 데이터가 반환되며, 이 데이터는 최신이 아닐 수도 있습니다. 분할이 해소된 뒤 쓰기가 전파되기까지 시간이 걸릴 수 있습니다.

비즈니스 요구 사항상 [최종적 일관성](/topics/consistency-patterns/#최종적-일관성-eventual-consistency)을 허용할 수 있거나, 외부 오류가 있어도 시스템이 계속 동작해야 한다면 AP가 좋은 선택입니다.

## 면접에서는

- 분산 데이터 저장소를 설계할 때는 네트워크 분할이 일어나면 일관성과 가용성 중 무엇을 포기할지 요구 사항에 근거해 밝히세요. "셋 중 둘을 고른다"보다 "네트워크는 신뢰할 수 없어 분할 내성은 필수이므로, C와 A 중 하나를 고른다"고 설명하는 편이 정확합니다.
- 선택의 근거는 비즈니스 요구 사항입니다. 원자적 읽기·쓰기가 필요하면 CP, 최종적 일관성으로 충분하거나 외부 오류에도 계속 응답해야 하면 AP를 고른다고 말하세요.
- 고른 쪽의 비용도 함께 말하세요. CP는 분할 중에 타임아웃 오류가 날 수 있고, AP는 오래된 데이터를 응답할 수 있으며 분할이 해소된 뒤 쓰기가 전파되기까지 시간이 걸립니다.
- 후속 질문으로 [일관성 패턴](/topics/consistency-patterns/)(약한·최종적·강한 일관성)과 [가용성 패턴](/topics/availability-patterns/)(장애 조치, 복제)이 이어지기 쉽습니다. [Pastebin 설계](/system-design/pastebin/) 같은 해설도 설계를 확장하는 단계에서 이 두 주제를 주요 논의거리로 꼽습니다.

## 스스로 점검하기

<details>
<summary>CAP 정리의 세 가지 보장은 각각 무엇을 뜻하나요?</summary>

일관성은 모든 읽기가 가장 최근에 쓰인 값이나 오류를 받는다는 뜻입니다. 가용성은 모든 요청이 응답을 받지만 그 응답이 최신 정보라는 보장은 없다는 뜻입니다. 분할 내성은 네트워크 장애로 시스템이 분할되어도 계속 동작한다는 뜻입니다.

</details>

<details>
<summary>실제 분산 시스템에서는 왜 사실상 CP와 AP 중 하나를 고르게 되나요?</summary>

네트워크는 신뢰할 수 없으므로 분할 내성은 반드시 지원해야 합니다. 그래서 남은 일관성과 가용성 사이에서 트레이드오프를 선택하게 됩니다.

</details>

<details>
<summary>네트워크 분할이 일어났을 때 CP 시스템과 AP 시스템은 요청에 어떻게 반응하나요?</summary>

CP 시스템은 분할된 노드의 응답을 기다리다 타임아웃 오류를 낼 수 있습니다. AP 시스템은 어느 노드에서든 구할 수 있는 버전의 데이터를 응답하므로 최신이 아닐 수 있고, 분할이 해소된 뒤 쓰기가 전파되기까지 시간이 걸릴 수 있습니다.

</details>

<details>
<summary>원자적 읽기와 쓰기가 반드시 필요한 서비스라면 CP와 AP 중 무엇이 적합한가요?</summary>

CP입니다. AP는 최종적 일관성을 허용할 수 있거나, 외부 오류가 있어도 시스템이 계속 동작해야 할 때 적합합니다.

</details>

## 출처 및 더 읽을거리

- [CAP theorem revisited](https://robertgreiner.com/cap-theorem-revisited/)
- [A plain english introduction to CAP theorem](http://ksat.me/a-plain-english-introduction-to-cap-theorem)
- [CAP FAQ](https://github.com/henryr/cap-faq)
- [The CAP theorem](https://www.youtube.com/watch?v=k-Yaq8AHlFA)
