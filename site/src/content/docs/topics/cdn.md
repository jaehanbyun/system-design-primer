---
title: 콘텐츠 전송 네트워크 (CDN)
description: 사용자와 가까운 곳에서 정적 콘텐츠를 제공하는 CDN의 동작 방식, Push CDN과 Pull CDN의 차이, 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#content-delivery-network
---

:::note[핵심 요약]
- CDN은 전 세계에 분산된 프록시 서버 네트워크로, 사용자와 **가까운 위치**에서 콘텐츠를 제공합니다.
- 사용자는 더 빨리 응답을 받고, 원본 서버는 CDN이 대신 처리한 요청만큼 **부하를 덜어 냅니다**.
- **Push CDN**은 콘텐츠가 바뀔 때마다 직접 업로드하고, **Pull CDN**은 첫 요청 때 원본에서 가져와 TTL 동안 캐시합니다.
- 트래픽이 적거나 콘텐츠가 자주 바뀌지 않으면 Push, 트래픽이 많으면 Pull이 잘 맞습니다.
:::

![전 세계에 분산된 CDN 서버가 가까운 사용자에게 콘텐츠를 제공하는 모습](@repo/images/h9TAuGI.jpg)

*출처: [Why use a CDN](https://www.creative-artworks.eu/why-use-a-content-delivery-network-cdn/)*

콘텐츠 전송 네트워크(Content Delivery Network, CDN)는 전 세계에 분산된 프록시 서버 네트워크로, 사용자와 더 가까운 위치에서 콘텐츠를 제공합니다. 보통 HTML/CSS/JS, 사진, 동영상 같은 정적 파일을 CDN에서 제공하지만, Amazon CloudFront처럼 동적 콘텐츠를 지원하는 CDN도 있습니다. 클라이언트가 어느 서버에 접속할지는 사이트의 DNS 응답이 알려 줍니다.

CDN에서 콘텐츠를 제공하면 두 가지 면에서 성능이 크게 좋아집니다.

- 사용자가 가까운 데이터 센터에서 콘텐츠를 받습니다.
- CDN이 처리한 요청은 여러분의 서버가 처리하지 않아도 됩니다.

## Push CDN

Push CDN은 서버에서 변경이 생길 때마다 새 콘텐츠를 받습니다. 콘텐츠를 제공할 책임은 전적으로 여러분에게 있습니다. CDN에 직접 업로드하고, URL이 CDN을 가리키도록 다시 작성해야 합니다. 콘텐츠가 언제 만료되고 언제 갱신될지도 직접 설정할 수 있습니다. 콘텐츠는 새로 생기거나 바뀔 때만 업로드되므로 트래픽은 최소화되지만, 저장 공간은 최대로 사용합니다.

트래픽이 적거나 콘텐츠가 자주 바뀌지 않는 사이트에 Push CDN이 잘 맞습니다. 콘텐츠를 주기적으로 다시 가져오는 대신 CDN에 한 번만 올려 두면 되기 때문입니다.

## Pull CDN

Pull CDN은 첫 사용자가 콘텐츠를 요청할 때 서버에서 새 콘텐츠를 가져옵니다. 콘텐츠는 여러분의 서버에 그대로 두고, URL이 CDN을 가리키도록 다시 작성합니다. 그래서 콘텐츠가 CDN에 캐시되기 전까지는 요청이 느립니다.

콘텐츠를 얼마나 오래 캐시할지는 [TTL(time-to-live)](https://en.wikipedia.org/wiki/Time_to_live)이 결정합니다. Pull CDN은 CDN의 저장 공간을 최소화하지만, 파일이 실제로 바뀌기 전에 만료되어 다시 가져오게 되면 불필요한 트래픽이 생길 수 있습니다.

트래픽이 많은 사이트에는 Pull CDN이 잘 맞습니다. 최근에 요청된 콘텐츠만 CDN에 남기 때문에 트래픽이 더 고르게 분산됩니다.

:::caution[단점: CDN]
- 트래픽에 따라 CDN 비용이 상당할 수 있습니다. 다만 CDN을 쓰지 않을 때 드는 추가 비용과 함께 따져 봐야 합니다.
- TTL이 만료되기 전에 콘텐츠가 바뀌면 오래된(stale) 콘텐츠가 제공될 수 있습니다.
- 정적 콘텐츠의 URL이 CDN을 가리키도록 바꿔야 합니다.
:::

## 면접에서는

- 사용자가 여러 지역에 퍼져 있거나 이미지·동영상 같은 정적 콘텐츠가 많다면, 고수준 설계 단계에서 CDN을 먼저 제안하세요. 지연 시간과 원본 서버 부하를 함께 줄일 수 있습니다.
- Push와 Pull 중 무엇을 고를지는 **트래픽 규모**와 **콘텐츠 변경 빈도**를 근거로 설명하세요.
- CDN도 일종의 캐시입니다. TTL 때문에 오래된 콘텐츠가 보일 수 있다는 점과 무효화 전략을 함께 언급하면 좋습니다. ([캐시](/topics/cache/#cdn-캐싱-cdn-caching) 참고)
- [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설처럼, 정적 콘텐츠를 객체 저장소와 CDN으로 옮기는 것은 확장 과정에서 자주 등장하는 단계입니다.

## 스스로 점검하기

<details>
<summary>CDN이 성능을 높이는 두 가지 이유는 무엇인가요?</summary>

사용자는 가까운 데이터 센터에서 콘텐츠를 받으므로 지연 시간이 줄고, CDN이 처리한 요청은 원본 서버가 처리하지 않아도 되므로 서버 부하가 줄어듭니다.

</details>

<details>
<summary>Push CDN과 Pull CDN은 무엇이 다른가요?</summary>

Push CDN은 콘텐츠가 바뀔 때 직접 CDN에 업로드합니다. 트래픽은 최소화되지만 저장 공간을 많이 씁니다. Pull CDN은 첫 요청 때 원본에서 가져와 TTL 동안 캐시합니다. 저장 공간은 적게 쓰지만 캐시되기 전의 첫 요청이 느리고, 실제로 바뀌지 않은 파일을 만료 후 다시 가져오며 불필요한 트래픽이 생길 수 있습니다.

</details>

<details>
<summary>트래픽이 매우 많은 서비스에는 어느 방식이 더 잘 맞나요?</summary>

Pull CDN입니다. 최근에 요청된 콘텐츠만 CDN에 남기 때문에 트래픽이 더 고르게 분산됩니다.

</details>

## 출처 및 더 읽을거리

- [Globally distributed content delivery](https://figshare.com/articles/Globally_distributed_content_delivery/6605972)
- [The differences between push and pull CDNs](https://www.geeksforgeeks.org/system-design/pull-cdn-vs-push-cdn/)
- [Wikipedia](https://en.wikipedia.org/wiki/Content_delivery_network)
