---
title: 애플리케이션 계층 (Application layer)
description: 웹 계층과 애플리케이션 계층을 분리하는 이유, 마이크로서비스와 서비스 디스커버리의 개념, 이 구조가 가져오는 복잡도를 정리합니다.
original: https://github.com/donnemartin/system-design-primer#application-layer
---

:::note[핵심 요약]
- 웹 계층과 애플리케이션 계층(플랫폼 계층)을 분리하면 두 계층을 **독립적으로 확장하고 설정**할 수 있습니다. 새 API를 추가할 때 웹 서버까지 늘릴 필요가 없을 수도 있습니다.
- **단일 책임 원칙**에 따라 작고 자율적인 서비스로 나누면, 작은 팀이 빠른 성장에 대비해 더 과감하게 계획할 수 있습니다. 애플리케이션 계층의 워커는 비동기 처리에도 도움이 됩니다.
- **마이크로서비스**는 독립적으로 배포할 수 있는 작은 모듈형 서비스의 모음이며, 각 서비스는 고유한 프로세스로 실행되고 가벼운 메커니즘으로 통신합니다.
- **서비스 디스커버리** 시스템(Consul, Etcd, Zookeeper)은 등록된 이름·주소·포트를 추적해 서비스들이 서로를 찾게 해 줍니다.
- 대신 모놀리식과는 다른 아키텍처·운영·프로세스가 필요하고, 배포와 운영이 복잡해질 수 있습니다.
:::

![요청이 로드 밸런서를 거쳐 여러 웹 서버로, 다시 여러 플랫폼 서버를 거쳐 데이터베이스로 전달되는 계층 구조](@repo/images/yB5SYwm.png)

*출처: [Intro to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/#platform_layer)*

웹 계층을 애플리케이션 계층(플랫폼 계층이라고도 합니다)과 분리하면 두 계층을 각각 독립적으로 확장하고 설정할 수 있습니다. 새 API를 추가하면 애플리케이션 서버는 늘어나지만, 웹 서버까지 꼭 늘릴 필요는 없습니다. **단일 책임 원칙**(single responsibility principle)은 함께 협력하는 작고 자율적인 서비스를 지향합니다. 작은 서비스를 맡은 작은 팀은 빠른 성장에 대비해 더 과감하게 계획을 세울 수 있습니다.

애플리케이션 계층의 워커(worker)는 [비동기 처리](/topics/asynchronism/)를 가능하게 하는 데에도 도움이 됩니다.

## 마이크로서비스 (Microservices)

이 논의와 관련된 개념으로 [마이크로서비스](https://en.wikipedia.org/wiki/Microservices)가 있습니다. 마이크로서비스는 독립적으로 배포할 수 있는 작은 모듈형 서비스의 모음이라고 설명할 수 있습니다. 각 서비스는 고유한 프로세스로 실행되며, 잘 정의된 가벼운 메커니즘으로 통신하면서 하나의 비즈니스 목표를 수행합니다. <sup>[1](https://smartbear.com/learn/api-design/what-are-microservices)</sup>

예를 들어 Pinterest라면 사용자 프로필, 팔로워, 피드, 검색, 사진 업로드 같은 마이크로서비스를 둘 수 있습니다.

## 서비스 디스커버리 (Service discovery)

[Consul](https://www.consul.io/docs/index.html), [Etcd](https://coreos.com/etcd/docs/latest), [Zookeeper](http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper) 같은 시스템은 등록된 이름, 주소, 포트를 추적해 서비스들이 서로를 찾을 수 있게 돕습니다. [헬스 체크(health check)](https://www.consul.io/intro/getting-started/checks.html)는 서비스가 정상인지 확인하는 데 쓰이며, 흔히 [HTTP](/topics/communication/#http-hypertext-transfer-protocol) 엔드포인트로 수행합니다. Consul과 Etcd에는 모두 [키-값 저장소](/topics/database/nosql/#키-값-저장소-key-value-store)가 내장되어 있어, 설정 값이나 그 밖의 공유 데이터를 저장하는 데 유용합니다.

:::caution[단점: 애플리케이션 계층]
- 느슨하게 결합된 서비스로 이루어진 애플리케이션 계층을 추가하려면, 모놀리식 시스템과 비교해 아키텍처, 운영, 프로세스 관점에서 다른 접근 방식이 필요합니다.
- 마이크로서비스는 배포와 운영 측면에서 복잡도를 높일 수 있습니다.
:::

## 면접에서는

- [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설처럼 **Web Server**와 **Application Server**를 분리하면 두 계층을 독립적으로 확장하고 설정할 수 있습니다. 예를 들어 **Read API**를 처리하는 애플리케이션 서버와 **Write API**를 처리하는 애플리케이션 서버를 따로 둘 수 있습니다.
- 실시간으로 처리할 필요가 없는 배치 작업이나 계산은 큐와 워커로 [비동기 처리](/topics/asynchronism/)할 수 있다는 점과 연결해 말하세요. 같은 해설에서 사진 업로드와 썸네일 생성을 분리하는 예가 나옵니다.
- 마이크로서비스를 제안할 때는 단일 책임 원칙과 독립 배포의 장점만 말하지 말고, 배포·운영 복잡도가 커지고 모놀리식과는 다른 아키텍처·운영·프로세스가 필요하다는 트레이드오프도 함께 말하세요.
- 서비스가 많아지면 "서비스끼리 서로를 어떻게 찾나요?"라는 후속 질문이 나올 수 있습니다. Consul, Etcd, Zookeeper 같은 서비스 디스커버리와 HTTP 엔드포인트 기반 헬스 체크를 언급하세요. 해설들도 추가 논의 주제로 마이크로서비스와 서비스 디스커버리를 꼽습니다.
- 서비스 사이의 통신 방식도 함께 정리해 두세요. 해설에서는 클라이언트와의 외부 통신은 REST를 따르는 HTTP API로, 내부 통신은 RPC로 나눠 트레이드오프를 논의하도록 권합니다. ([RPC와 REST 비교](/topics/communication/#rpc와-rest-비교) 참고)

## 스스로 점검하기

<details>
<summary>웹 계층과 애플리케이션 계층을 분리하면 무엇이 좋아지나요?</summary>

두 계층을 각각 독립적으로 확장하고 설정할 수 있습니다. 예를 들어 새 API를 추가할 때 애플리케이션 서버만 늘리고 웹 서버는 그대로 둘 수 있습니다. 또 애플리케이션 계층의 워커는 비동기 처리를 가능하게 하는 데 도움이 됩니다.

</details>

<details>
<summary>마이크로서비스란 무엇인가요?</summary>

독립적으로 배포할 수 있는 작은 모듈형 서비스의 모음입니다. 각 서비스는 고유한 프로세스로 실행되고, 잘 정의된 가벼운 메커니즘으로 통신하면서 하나의 비즈니스 목표를 수행합니다. Pinterest라면 사용자 프로필, 팔로워, 피드, 검색, 사진 업로드 등으로 나눌 수 있습니다.

</details>

<details>
<summary>Consul이나 Etcd 같은 서비스 디스커버리 시스템은 어떤 역할을 하나요?</summary>

등록된 이름, 주소, 포트를 추적해 서비스들이 서로를 찾을 수 있게 합니다. 흔히 HTTP 엔드포인트로 헬스 체크를 해서 서비스가 정상인지 확인하며, Consul과 Etcd는 내장 키-값 저장소에 설정 값이나 공유 데이터를 저장할 수도 있습니다.

</details>

<details>
<summary>애플리케이션 계층을 분리하고 마이크로서비스를 도입할 때의 단점은 무엇인가요?</summary>

느슨하게 결합된 서비스 구조는 모놀리식 시스템과 비교해 아키텍처, 운영, 프로세스 관점에서 다른 접근이 필요합니다. 또 마이크로서비스는 배포와 운영의 복잡도를 높일 수 있습니다.

</details>

## 출처 및 더 읽을거리

- [Intro to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale)
- [Crack the system design interview](http://www.puncsky.com/blog/2016-02-13-crack-the-system-design-interview)
- [Service oriented architecture](https://en.wikipedia.org/wiki/Service-oriented_architecture)
- [Introduction to Zookeeper](http://www.slideshare.net/sauravhaloi/introduction-to-apache-zookeeper)
- [Here's what you need to know about building microservices](https://cloudncode.wordpress.com/2016/07/22/msa-getting-started/)
