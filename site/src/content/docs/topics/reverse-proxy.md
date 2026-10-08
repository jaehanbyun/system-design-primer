---
title: 리버스 프록시 (Reverse proxy)
description: 내부 서비스를 하나의 인터페이스로 묶어 외부에 노출하는 리버스 프록시(웹 서버)의 이점과 로드 밸런서와의 차이, 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#reverse-proxy-web-server
---

:::note[핵심 요약]
- 리버스 프록시는 내부 서비스를 한곳으로 모아 외부에 통일된 인터페이스를 제공하는 **웹 서버**입니다. 요청을 처리할 서버로 전달하고, 그 응답을 클라이언트에 돌려줍니다.
- 보안 강화, 확장성과 유연성 향상, SSL 종료, 압축, 캐싱, 정적 콘텐츠 직접 제공 같은 이점이 있습니다.
- 로드 밸런서는 **같은 기능을 하는 서버가 여러 대**일 때 유용하고, 리버스 프록시는 **서버가 한 대뿐이어도** 유용합니다.
- NGINX나 HAProxy는 L7 리버스 프록시와 로드 밸런싱을 모두 지원합니다.
- 리버스 프록시도 복잡도를 높이고, 하나만 두면 단일 장애 지점(SPOF)이 됩니다.
:::

![인터넷에서 들어온 요청을 내부 네트워크의 프록시가 받아 웹 서버로 전달하고 응답을 돌려주는 구조](@repo/images/n41Azff.png)

*출처: [Wikipedia](https://upload.wikimedia.org/wikipedia/commons/6/67/Reverse_proxy_h2g2bob.svg)*

리버스 프록시는 내부 서비스를 한곳으로 모으고 외부에는 통일된 인터페이스를 제공하는 웹 서버입니다. 클라이언트의 요청은 이를 처리할 수 있는 서버로 전달되고, 리버스 프록시는 그 서버의 응답을 클라이언트에 돌려줍니다.

그 밖에 다음과 같은 이점도 있습니다.

- **보안 강화** - 백엔드 서버에 대한 정보를 숨기고, 특정 IP를 차단 목록(blacklist)에 올리고, 클라이언트당 연결 수를 제한합니다.
- **확장성과 유연성 향상** - 클라이언트에게는 리버스 프록시의 IP만 보이므로, 뒤쪽 서버를 늘리거나 설정을 바꿀 수 있습니다.
- **SSL 종료(SSL termination)** - 들어오는 요청을 복호화하고 서버 응답을 암호화합니다. 비용이 클 수 있는 이 작업을 백엔드 서버가 직접 하지 않아도 됩니다.
    - 서버마다 [X.509 인증서](https://en.wikipedia.org/wiki/X.509)를 설치할 필요가 없어집니다.
- **압축** - 서버 응답을 압축합니다.
- **캐싱** - 캐시된 요청에는 저장해 둔 응답을 돌려줍니다.
- **정적 콘텐츠** - 정적 콘텐츠를 직접 제공합니다.
    - HTML/CSS/JS
    - 사진
    - 동영상
    - 기타

## 로드 밸런서 vs 리버스 프록시

- 로드 밸런서는 서버가 여러 대일 때 배치하면 유용합니다. 로드 밸런서는 보통 같은 기능을 하는 서버 집합으로 트래픽을 라우팅합니다.
- 리버스 프록시는 웹 서버나 애플리케이션 서버가 한 대뿐이어도 앞 절에서 설명한 이점을 누릴 수 있어 유용합니다.
- NGINX나 HAProxy 같은 솔루션은 L7 리버스 프록시와 로드 밸런싱을 모두 지원합니다.

:::caution[단점: 리버스 프록시]
- 리버스 프록시를 도입하면 복잡도가 높아집니다.
- 리버스 프록시가 하나뿐이면 단일 장애 지점이 되고, 리버스 프록시를 여러 대 구성하면(예: [장애 조치(failover)](https://en.wikipedia.org/wiki/Failover)) 복잡도가 더 높아집니다.
:::

## 면접에서는

- 해설의 기본 설계에서는 **Client**의 요청을 받는 **Web Server**를 리버스 프록시로 동작시키는 구성이 거의 항상 등장합니다([Pastebin](/system-design/pastebin/), [Twitter](/system-design/twitter/) 해설 등). 설계를 그릴 때 이 역할을 한 문장으로 설명할 수 있어야 합니다.
- "로드 밸런서와 무엇이 다른가요?"라는 질문에는 **서버 대수**를 기준으로 답하세요. 로드 밸런서는 같은 기능의 서버가 여러 대일 때 의미가 있고, 리버스 프록시는 서버가 한 대여도 보안·SSL 종료·압축·캐싱·정적 콘텐츠 제공 같은 이점을 줍니다. NGINX와 HAProxy는 둘 다 할 수 있다는 점도 덧붙이면 좋습니다. ([로드 밸런서](/topics/load-balancer/) 참고)
- 리버스 프록시도 하나뿐이면 단일 장애 지점입니다. 여러 대로 장애 조치를 구성하는 방안과 그만큼 늘어나는 복잡도를 함께 언급하세요.
- [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설에서는 **Web Server**를 **Application Server**와 분리해 리버스 프록시로 동작시키고, 두 계층을 독립적으로 확장·설정합니다. [애플리케이션 계층](/topics/application-layer/)과 이어서 보세요.

## 스스로 점검하기

<details>
<summary>리버스 프록시는 어떤 일을 하는 웹 서버인가요?</summary>

내부 서비스를 한곳으로 모아 외부에 통일된 인터페이스를 제공합니다. 클라이언트의 요청을 처리할 수 있는 서버로 전달하고, 그 서버의 응답을 클라이언트에 돌려줍니다.

</details>

<details>
<summary>클라이언트에게 리버스 프록시의 IP만 보이면 어떤 점이 좋은가요?</summary>

뒤쪽 서버를 늘리거나 설정을 바꿔도 클라이언트에 영향이 없으므로 확장성과 유연성이 높아집니다. 또 백엔드 서버에 대한 정보가 드러나지 않아 보안에도 도움이 됩니다.

</details>

<details>
<summary>서버가 한 대뿐인데도 리버스 프록시를 둘 이유가 있나요?</summary>

있습니다. 로드 밸런서는 서버가 여러 대일 때 의미가 있지만, 리버스 프록시는 서버가 한 대여도 보안 강화, SSL 종료, 응답 압축, 캐싱, 정적 콘텐츠 직접 제공 같은 이점을 줍니다.

</details>

<details>
<summary>리버스 프록시를 도입할 때의 단점은 무엇인가요?</summary>

시스템 복잡도가 높아집니다. 또 리버스 프록시가 하나뿐이면 단일 장애 지점이 되고, 장애 조치를 위해 여러 대를 구성하면 복잡도가 더 높아집니다.

</details>

## 출처 및 더 읽을거리

- [Reverse proxy vs load balancer](https://www.nginx.com/resources/glossary/reverse-proxy-vs-load-balancer/)
- [NGINX architecture](https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)
- [HAProxy architecture guide](http://www.haproxy.org/download/1.2/doc/architecture.txt)
- [Wikipedia](https://en.wikipedia.org/wiki/Reverse_proxy)
