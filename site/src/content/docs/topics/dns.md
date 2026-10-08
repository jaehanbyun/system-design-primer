---
title: 도메인 이름 시스템 (DNS)
description: 도메인 이름을 IP 주소로 바꾸는 DNS의 계층 구조와 캐싱, 주요 레코드 유형, 관리형 DNS의 트래픽 라우팅 방식과 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#domain-name-system
---

:::note[핵심 요약]
- DNS는 `www.example.com` 같은 도메인 이름을 IP 주소로 변환합니다.
- DNS는 계층 구조입니다. 하위 DNS 서버와 브라우저·OS가 조회 결과를 캐시하며, 이 캐시는 DNS 전파 지연 때문에 오래된(stale) 값이 될 수 있습니다.
- 주요 레코드로 **NS**(네임 서버), **MX**(메일 서버), **A**(이름 → IP 주소), **CNAME**(이름 → 다른 이름)이 있습니다.
- CloudFlare나 Route 53 같은 관리형 DNS는 가중 라운드 로빈, 지연 시간 기반, 지리적 위치 기반 라우팅을 지원합니다.
- DNS 조회는 약간의 지연을 더하고, DNS 서버 관리는 복잡하며, DNS 서비스가 DDoS 공격의 표적이 되기도 합니다.
:::

![사용자 기기가 ISP DNS 서버와 루트 DNS 서버를 거쳐 www.google.com의 IP 주소를 알아낸 뒤 해당 서버에 접속하는 DNS 조회 과정](@repo/images/IOyLj4i.jpg)

*출처: [DNS security presentation](http://www.slideshare.net/srikrupa5/dns-security-presentation-issa)*

도메인 이름 시스템(Domain Name System, DNS)은 `www.example.com` 같은 도메인 이름을 IP 주소로 변환합니다.

DNS는 계층 구조로 되어 있으며, 최상위에는 소수의 권한 있는(authoritative) 서버가 있습니다. 조회할 때 어느 DNS 서버에 물어볼지는 라우터나 ISP가 알려 줍니다. 하위 DNS 서버는 매핑을 캐시하는데, DNS 전파 지연 때문에 이 캐시가 오래된(stale) 값이 될 수 있습니다. DNS 결과는 브라우저나 OS에도 일정 시간 동안 캐시될 수 있으며, 그 기간은 [TTL(time to live)](https://en.wikipedia.org/wiki/Time_to_live)이 결정합니다.

- **NS 레코드(name server)**: 도메인/서브도메인의 DNS 서버를 지정합니다.
- **MX 레코드(mail exchange)**: 메시지를 받을 메일 서버를 지정합니다.
- **A 레코드(address)**: 이름이 IP 주소를 가리키게 합니다.
- **CNAME(canonical)**: 이름이 다른 이름이나 `CNAME`(`example.com`에서 `www.example.com`으로), 또는 `A` 레코드를 가리키게 합니다.

[CloudFlare](https://www.cloudflare.com/dns/)나 [Route 53](https://aws.amazon.com/route53/) 같은 서비스는 관리형 DNS 서비스를 제공합니다. 일부 DNS 서비스는 여러 방식으로 트래픽을 라우팅할 수 있습니다.

- [가중 라운드 로빈(Weighted round robin)](https://www.jscape.com/blog/load-balancing-algorithms)
  - 유지보수 중인 서버로 트래픽이 가지 않게 막기
  - 크기가 서로 다른 클러스터 사이에서 트래픽 균형 맞추기
  - A/B 테스트
- [지연 시간 기반(Latency-based)](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-latency.html)
- [지리적 위치 기반(Geolocation-based)](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy-geo.html)

:::caution[단점: DNS]
- DNS 서버에 접속하는 과정에서 약간의 지연이 생깁니다. 다만 앞에서 설명한 캐싱으로 완화할 수 있습니다.
- DNS 서버 관리는 복잡할 수 있으며, 일반적으로 [정부, ISP, 대기업](http://superuser.com/questions/472695/who-controls-the-dns-servers/472729)이 관리합니다.
- 최근 DNS 서비스가 [DDoS 공격](http://dyn.com/blog/dyn-analysis-summary-of-friday-october-21-attack/)을 받아, Twitter의 IP 주소를 모르는 사용자들이 Twitter 같은 웹사이트에 접속하지 못하는 일이 있었습니다.
:::

## 면접에서는

- 고수준 설계를 그릴 때 클라이언트 요청이 처음 거치는 구성 요소로 DNS를 넣어 두세요. [Pastebin 설계](/system-design/pastebin/) 같은 해설도 설계를 확장하는 단계에서 DNS를 주요 논의거리로 꼽습니다.
- DNS는 장애 조치와도 연결됩니다. 외부에 공개된 서버를 [액티브-액티브](/topics/availability-patterns/#액티브-액티브-active-active)로 운영하면 DNS가 두 서버의 공인 IP를 모두 알아야 하고, [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설처럼 재부팅해도 바뀌지 않는 공인 고정 IP(Elastic IP)를 두면, 장애 조치 때 도메인이 새 IP를 가리키게 바꾸기만 하면 됩니다.
- TTL에 따른 트레이드오프를 짚으세요. 캐싱 덕분에 조회 지연은 줄지만, 레코드를 바꿔도 캐시가 만료될 때까지 오래된 값이 보일 수 있습니다. DNS는 [최종적 일관성](/topics/consistency-patterns/#최종적-일관성-eventual-consistency)의 대표적인 예입니다.
- 사용자가 여러 지역에 퍼져 있다면 지연 시간 기반·지리적 위치 기반 라우팅을, 배포나 실험이 필요하다면 가중 라운드 로빈(유지보수 중인 서버 제외, A/B 테스트)을 제안할 수 있습니다.
- DNS 조회 자체가 병목이 될 수도 있습니다. [웹 크롤러 설계](/system-design/web-crawler/) 해설에서는 크롤러 서비스가 주기적으로 갱신하는 자체 DNS 조회를 두는 방법을 제시합니다.

## 스스로 점검하기

<details>
<summary>A 레코드와 CNAME은 무엇이 다른가요?</summary>

A 레코드는 이름이 IP 주소를 직접 가리키게 합니다. CNAME은 이름이 다른 이름이나 `CNAME`(예: `example.com`에서 `www.example.com`으로), 또는 `A` 레코드를 가리키게 합니다.

</details>

<details>
<summary>DNS 레코드를 바꿨는데도 일부 사용자가 한동안 이전 IP로 접속하는 이유는 무엇인가요?</summary>

하위 DNS 서버, 브라우저, OS가 이전 매핑을 캐시하고 있기 때문입니다. 캐시는 TTL로 정한 기간 동안 유지되고 DNS 전파에도 지연이 있어, 그동안에는 오래된(stale) 값이 쓰일 수 있습니다.

</details>

<details>
<summary>가중 라운드 로빈 DNS 라우팅은 어떤 상황에 쓸 수 있나요?</summary>

유지보수 중인 서버로 트래픽이 가지 않게 막을 때, 크기가 서로 다른 클러스터 사이에서 트래픽 균형을 맞출 때, A/B 테스트를 할 때 쓸 수 있습니다.

</details>

<details>
<summary>DNS의 단점은 무엇인가요?</summary>

DNS 서버에 접속하면서 약간의 지연이 생기고(캐싱으로 완화), DNS 서버 관리는 복잡하며 주로 정부·ISP·대기업이 맡습니다. 또 DNS 서비스가 DDoS 공격을 받으면 IP 주소를 모르는 사용자는 웹사이트에 접속할 수 없게 됩니다.

</details>

## 출처 및 더 읽을거리

- [DNS architecture](https://technet.microsoft.com/en-us/library/dd197427(v=ws.10).aspx)
- [Wikipedia](https://en.wikipedia.org/wiki/Domain_Name_System)
- [DNS articles](https://support.dnsimple.com/categories/dns/)
