---
title: 보안 (Security)
description: 보안 전문 직무가 아니라면 꼭 알아야 할 네 가지 기본, 즉 암호화, 입력 정제, 매개변수화된 쿼리, 최소 권한 원칙을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#security
---

:::note[핵심 요약]
- 보안은 범위가 넓지만, 보안 경험이나 배경이 많지 않고 보안 지식이 필요한 직무에 지원하는 것도 아니라면 **기본 사항**만 알아도 충분합니다.
- 데이터는 **전송 중**(in transit)에도, **저장 시**(at rest)에도 암호화합니다.
- XSS와 SQL 인젝션을 막기 위해 사용자 입력을 **정제**(sanitize)하고, SQL 인젝션 방어에는 **매개변수화된 쿼리**를 씁니다.
- 권한은 **최소 권한 원칙**(least privilege)에 따라 꼭 필요한 만큼만 줍니다.
:::

이 섹션은 아직 보강이 필요합니다. [기여](/about/#기여하기)를 고려해 주세요!

보안은 범위가 넓은 주제입니다. 상당한 경험이나 보안 관련 배경이 있거나 보안 지식이 필요한 직무에 지원하는 경우가 아니라면, 다음 기본 사항 이상은 알 필요가 없을 것입니다.

- 전송 중(in transit)인 데이터와 저장된(at rest) 데이터를 암호화하세요.
- [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting)와 [SQL 인젝션](https://en.wikipedia.org/wiki/SQL_injection)을 막기 위해 모든 사용자 입력과, 사용자에게 노출된 모든 입력 매개변수를 정제(sanitize)하세요.
- SQL 인젝션을 막기 위해 매개변수화된 쿼리(parameterized query)를 사용하세요.
- [최소 권한(least privilege)](https://en.wikipedia.org/wiki/Principle_of_least_privilege) 원칙을 따르세요.

## 면접에서는

- 일반적인 시스템 설계 면접에서 보안은 주인공이 아닙니다. 해설 문서들도 보안을 깊게 다루기보다 이 섹션을 참고하라고 안내합니다. 설계를 마무리하며 위 네 가지 기본을 짧고 정확하게 짚는 것을 목표로 하세요.
- 데이터 흐름을 따라 **암호화**를 설명하세요. 클라이언트와 서버 사이처럼 데이터가 오가는 구간은 전송 중 암호화, 데이터베이스나 객체 저장소에 쌓이는 데이터는 저장 시 암호화가 필요합니다. [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설도 시스템 보안 단계의 첫 항목으로 전송 중·저장 시 데이터 암호화를 꼽습니다.
- 사용자 입력을 받는 API를 그렸다면, 입력 정제와 매개변수화된 쿼리로 XSS와 SQL 인젝션을 막는다고 덧붙이세요.
- **최소 권한 원칙**은 네트워크 구성으로 보여 줄 수 있습니다. AWS 확장 해설은 웹 서버에 꼭 필요한 포트만 열고(SSH는 허용된 IP에서만), 웹 서버만 퍼블릭 서브넷에 두고 나머지는 외부 접근이 막힌 프라이빗 서브넷에 둡니다.
- 보안 전문성이 필요한 직무라면 기본 사항만으로는 부족합니다. 아래 자료의 API 보안 체크리스트나 OWASP Top 10으로 범위를 넓혀 준비하세요.

## 스스로 점검하기

<details>
<summary>보안 전문 직무가 아닐 때 알아 두어야 할 네 가지 기본은 무엇인가요?</summary>

전송 중·저장 시 데이터 암호화, XSS와 SQL 인젝션을 막기 위한 입력 정제, SQL 인젝션을 막기 위한 매개변수화된 쿼리, 최소 권한 원칙입니다.

</details>

<details>
<summary>"in transit"과 "at rest" 암호화는 각각 어떤 데이터를 보호하나요?</summary>

"in transit"은 네트워크를 통해 전송되는 중인 데이터를, "at rest"는 데이터베이스나 저장소에 저장되어 있는 데이터를 보호합니다. 기본 사항에서는 둘 다 암호화하라고 합니다.

</details>

<details>
<summary>SQL 인젝션을 막는 방법으로 이 섹션이 제시하는 두 가지는 무엇인가요?</summary>

사용자 입력과 사용자에게 노출된 입력 매개변수를 모두 정제하는 것, 그리고 매개변수화된 쿼리를 사용하는 것입니다. 입력 정제는 XSS를 막는 데도 쓰입니다.

</details>

## 출처 및 더 읽을거리

- [API security checklist](https://github.com/shieldfy/API-Security-Checklist)
- [Security guide for developers](https://github.com/FallibleInc/security-guide-for-developers)
- [OWASP top ten](https://www.owasp.org/index.php/OWASP_Top_Ten_Cheat_Sheet)
