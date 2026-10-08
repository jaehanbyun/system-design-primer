---
title: 로드 밸런서 (Load balancer)
description: 클라이언트 요청을 여러 서버에 나누는 로드 밸런서의 역할과 라우팅 기준, L4·L7 로드 밸런싱의 차이, 수평 확장과 그 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#load-balancer
---

:::note[핵심 요약]
- 로드 밸런서는 들어오는 클라이언트 요청을 애플리케이션 서버나 데이터베이스 같은 컴퓨팅 자원에 나눠 보내고, 받은 응답을 해당 클라이언트에 돌려줍니다.
- 비정상 서버로 요청이 가지 않게 막고, 자원 과부하를 방지하며, **단일 장애 지점**(SPOF)을 없애는 데 도움을 줍니다. SSL 종료와 세션 유지 같은 부가 기능도 제공합니다.
- **L4**는 전송 계층 정보(IP 주소, 포트)만 보고 분산하고, **L7**은 헤더·메시지·쿠키 같은 애플리케이션 계층 내용까지 보고 분산합니다. L4는 유연성을 포기하는 대신 시간과 컴퓨팅 자원이 덜 듭니다.
- 로드 밸런서는 **수평 확장**에도 도움이 됩니다. 다만 수평 확장을 하려면 서버를 무상태(stateless)로 만들어야 하고, 로드 밸런서 자체가 병목이나 단일 장애 지점이 될 수 있습니다.
:::

![클라이언트 요청을 받은 디스패처가 워커 풀에서 워커 하나를 골라 요청을 전달하고, 응답을 기다렸다가 클라이언트에 돌려주는 흐름](@repo/images/h81n9iK.png)

*출처: [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)*

로드 밸런서는 들어오는 클라이언트 요청을 애플리케이션 서버나 데이터베이스 같은 컴퓨팅 자원에 분산합니다. 어느 경우든 로드 밸런서는 컴퓨팅 자원이 돌려준 응답을 알맞은 클라이언트에 전달합니다. 로드 밸런서는 다음과 같은 일에 효과적입니다.

- 상태가 좋지 않은(unhealthy) 서버로 요청이 가지 않도록 막기
- 자원 과부하 방지
- 단일 장애 지점 제거에 도움

로드 밸런서는 하드웨어로 구현할 수도 있고(비용이 큽니다), HAProxy 같은 소프트웨어로 구현할 수도 있습니다.

그 밖에 다음과 같은 이점도 있습니다.

- **SSL 종료(SSL termination)** - 들어오는 요청을 복호화하고 서버 응답을 암호화합니다. 비용이 클 수 있는 이 작업을 백엔드 서버가 직접 하지 않아도 됩니다.
    - 서버마다 [X.509 인증서](https://en.wikipedia.org/wiki/X.509)를 설치할 필요가 없어집니다.
- **세션 유지(Session persistence)** - 웹 앱이 세션을 추적하지 않는 경우, 쿠키를 발급해 특정 클라이언트의 요청을 항상 같은 인스턴스로 보냅니다.

장애에 대비해 로드 밸런서를 여러 대 두는 구성이 일반적이며, [액티브-패시브](/topics/availability-patterns/#액티브-패시브-active-passive) 또는 [액티브-액티브](/topics/availability-patterns/#액티브-액티브-active-active) 방식으로 운영합니다.

로드 밸런서는 다음과 같은 다양한 기준(metric)으로 트래픽을 라우팅할 수 있습니다.

- 무작위(Random)
- 부하가 가장 적은 서버(Least loaded)
- 세션/쿠키
- [라운드 로빈 또는 가중 라운드 로빈](https://www.g33kinfo.com/info/round-robin-vs-weighted-round-robin-lb)
- [Layer 4](/topics/load-balancer/#l4-로드-밸런싱-layer-4-load-balancing)
- [Layer 7](/topics/load-balancer/#l7-로드-밸런싱-layer-7-load-balancing)

## L4 로드 밸런싱 (Layer 4 load balancing)

L4 로드 밸런서는 [전송 계층](/topics/communication/)의 정보를 보고 요청을 어떻게 분산할지 결정합니다. 보통 헤더에 담긴 출발지·목적지 IP 주소와 포트를 보며, 패킷의 내용은 보지 않습니다. L4 로드 밸런서는 업스트림 서버와 주고받는 네트워크 패킷을 전달하면서 [네트워크 주소 변환(NAT)](https://web.archive.org/web/20240117134735/https://www.nginx.com/resources/glossary/layer-4-load-balancing/)을 수행합니다.

## L7 로드 밸런싱 (Layer 7 load balancing)

L7 로드 밸런서는 [애플리케이션 계층](/topics/communication/)을 보고 요청을 어떻게 분산할지 결정합니다. 여기에는 헤더, 메시지, 쿠키의 내용이 포함될 수 있습니다. L7 로드 밸런서는 네트워크 트래픽을 종료(terminate)하고, 메시지를 읽고, 로드 밸런싱 결정을 내린 다음, 선택한 서버로 연결을 엽니다. 예를 들어 L7 로드 밸런서는 동영상 트래픽은 동영상을 호스팅하는 서버로 보내고, 더 민감한 사용자 결제(billing) 트래픽은 보안을 강화한 서버로 보낼 수 있습니다.

L4 로드 밸런싱은 유연성을 포기하는 대신 L7보다 시간과 컴퓨팅 자원이 덜 듭니다. 다만 최신 범용 하드웨어(commodity hardware)에서는 그 성능 차이가 미미할 수 있습니다.

## 수평 확장 (Horizontal scaling)

로드 밸런서는 수평 확장에도 도움이 되어 성능과 가용성을 높여 줍니다. 범용 장비를 늘려 확장(scale out)하는 방식은 단일 서버를 더 비싼 하드웨어로 키우는 방식, 즉 **수직 확장**(Vertical Scaling)보다 비용 효율이 좋고 가용성도 높습니다. 또한 특화된 엔터프라이즈 시스템보다는 범용 하드웨어를 다룰 인력을 구하기가 더 쉽습니다.

:::caution[단점: 수평 확장]
- 수평 확장은 복잡도를 높이고, 서버를 복제(cloning)해야 합니다.
    - 서버는 상태가 없어야(stateless) 합니다. 세션이나 프로필 사진 같은 사용자 관련 데이터를 서버에 두면 안 됩니다.
    - 세션은 [데이터베이스](/topics/database/rdbms/)(SQL, NoSQL)나 영속적인 [캐시](/topics/cache/)(Redis, Memcached) 같은 중앙 데이터 저장소에 둘 수 있습니다.
- 업스트림 서버가 늘어날수록 캐시나 데이터베이스 같은 다운스트림 서버는 더 많은 동시 연결을 감당해야 합니다.
:::

:::caution[단점: 로드 밸런서]
- 자원이 부족하거나 설정이 제대로 되어 있지 않으면 로드 밸런서가 성능 병목이 될 수 있습니다.
- 단일 장애 지점을 없애려고 로드 밸런서를 도입하면 그만큼 복잡도가 높아집니다.
- 로드 밸런서가 하나뿐이면 그 자체가 단일 장애 지점이 되고, 여러 대를 구성하면 복잡도가 더 높아집니다.
:::

## 면접에서는

- 웹 서버를 여러 대 두는 순간 그 앞에 로드 밸런서가 필요합니다. 해설들도 초기 설계의 병목을 다룰 때 "여러 **Web Server** 앞에 **Load Balancer**를 두면 어떤 문제가 해결되는가?"를 먼저 묻습니다([Pastebin 설계](/system-design/pastebin/) 등).
- "로드 밸런서가 죽으면요?"라는 후속 질문에 대비하세요. 로드 밸런서를 [액티브-패시브나 액티브-액티브](/topics/availability-patterns/#장애-조치-fail-over)로 여러 대 두는 방법과, 그만큼 복잡도가 늘어난다는 트레이드오프를 함께 말하면 좋습니다.
- L4와 L7 중 무엇을 쓸지 물으면 **유연성 대 비용**으로 답하세요. L7은 요청 내용을 보고 동영상·결제 트래픽을 다른 서버로 보낼 수 있고, L4는 그 유연성을 포기하는 대신 더 가볍습니다.
- 수평 확장을 제안했다면 서버를 무상태(stateless)로 만들고 세션을 데이터베이스나 Redis/Memcached 같은 캐시로 옮기는 방법, 그리고 다운스트림 데이터베이스·캐시의 동시 연결 증가까지 짚어 주세요.
- [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설처럼, 단일 서버에서 수평 확장으로 넘어갈 때 ELB나 HAProxy 같은 로드 밸런서를 추가하고 SSL을 로드 밸런서에서 종료해 백엔드 부하와 인증서 관리를 줄이는 흐름이 자주 나옵니다.

## 스스로 점검하기

<details>
<summary>로드 밸런서가 효과적으로 해 주는 세 가지 일은 무엇인가요?</summary>

상태가 좋지 않은 서버로 요청이 가지 않도록 막고, 특정 자원에 과부하가 걸리지 않게 하며, 단일 장애 지점을 없애는 데 도움을 줍니다.

</details>

<details>
<summary>L4 로드 밸런싱과 L7 로드 밸런싱은 무엇을 보고 요청을 분산하나요?</summary>

L4는 전송 계층 정보, 즉 헤더의 출발지·목적지 IP 주소와 포트를 보고 패킷 내용은 보지 않습니다. L7은 애플리케이션 계층의 헤더, 메시지, 쿠키 내용까지 봅니다. 그래서 L7은 트래픽 종류에 따라 다른 서버로 보낼 수 있을 만큼 유연하지만, L4가 시간과 컴퓨팅 자원을 덜 씁니다.

</details>

<details>
<summary>로드 밸런서에서 SSL을 종료하면 어떤 이점이 있나요?</summary>

요청 복호화와 응답 암호화처럼 비용이 클 수 있는 작업을 백엔드 서버가 하지 않아도 되고, 서버마다 X.509 인증서를 설치할 필요도 없어집니다.

</details>

<details>
<summary>수평 확장을 할 때 서버를 무상태(stateless)로 만들어야 하는 이유는 무엇이고, 세션은 어디에 두나요?</summary>

수평 확장은 서버를 복제해서 늘리는 방식이므로, 어떤 서버가 요청을 받아도 똑같이 처리할 수 있어야 합니다. 그래서 세션이나 프로필 사진 같은 사용자 관련 데이터를 서버에 두지 않고, 데이터베이스(SQL, NoSQL)나 영속적인 캐시(Redis, Memcached) 같은 중앙 데이터 저장소에 둡니다.

</details>

<details>
<summary>로드 밸런서를 도입했을 때 생기는 단점은 무엇인가요?</summary>

자원이 부족하거나 설정이 잘못되면 성능 병목이 될 수 있고, 시스템 복잡도가 높아집니다. 또 로드 밸런서가 하나뿐이면 그 자체가 단일 장애 지점이 되며, 이를 피하려고 여러 대를 구성하면 복잡도가 더 높아집니다.

</details>

## 출처 및 더 읽을거리

- [NGINX architecture](https://www.nginx.com/blog/inside-nginx-how-we-designed-for-performance-scale/)
- [HAProxy architecture guide](http://www.haproxy.org/download/1.2/doc/architecture.txt)
- [Scalability](https://web.archive.org/web/20220530193911/https://www.lecloud.net/post/7295452622/scalability-for-dummies-part-1-clones)
- [Wikipedia](https://en.wikipedia.org/wiki/Load_balancing_(computing))
- [Layer 4 load balancing](https://www.nginx.com/resources/glossary/layer-4-load-balancing/)
- [Layer 7 load balancing](https://www.nginx.com/resources/glossary/layer-7-load-balancing/)
- [ELB listener config](http://docs.aws.amazon.com/elasticloadbalancing/latest/classic/elb-listener-config.html)
