---
title: 통신 (Communication)
description: HTTP 동사의 성질, TCP와 UDP의 차이와 선택 기준, RPC와 REST의 설계 철학과 단점을 비교해 정리합니다.
original: https://github.com/donnemartin/system-design-primer#communication
---

:::note[핵심 요약]
- **HTTP**는 TCP·UDP 같은 하위 프로토콜 위에서 동작하는 요청/응답 방식의 애플리케이션 계층 프로토콜입니다. 동사(메서드)마다 멱등성, 안전성, 캐시 가능 여부가 다릅니다.
- **TCP**는 연결 지향 프로토콜로 패킷이 순서대로, 손상 없이 도착하도록 보장하지만, 그 대가로 지연이 생기고 UDP보다 효율이 떨어집니다.
- **UDP**는 비연결형으로 이런 보장이 없는 대신 더 효율적이어서 VoIP, 화상 채팅, 실시간 게임처럼 지연에 민감한 용도에 잘 맞습니다.
- **RPC**는 동작(behavior)을 노출하며 성능을 위해 내부 통신에 자주 쓰이고, **REST**는 데이터를 노출하며 결합도가 낮아 공개 HTTP API에 자주 쓰입니다.
:::

![물리 계층부터 애플리케이션 계층까지 이어지는 OSI 7계층 모델](@repo/images/5KeocQs.jpg)

*출처: [OSI 7 layer model](http://www.escotal.com/osilayer.html)*

## HTTP (Hypertext transfer protocol)

HTTP는 클라이언트와 서버 사이에서 데이터를 인코딩하고 전송하는 방법입니다. 요청/응답 프로토콜이어서, 클라이언트가 요청을 보내면 서버는 관련 콘텐츠와 요청 처리 결과에 대한 상태 정보를 담아 응답합니다. HTTP는 자기 완결적(self-contained)이므로, 요청과 응답이 로드 밸런싱, 캐싱, 암호화, 압축을 수행하는 여러 중간 라우터와 서버를 거쳐 흐를 수 있습니다.

기본적인 HTTP 요청은 동사(verb, 메서드)와 리소스(엔드포인트)로 이루어집니다. 자주 쓰는 HTTP 동사는 다음과 같습니다.

| 동사 | 설명 | 멱등성\* | 안전 | 캐시 가능 |
|---|---|---|---|---|
| GET | 리소스를 읽음 | 예 | 예 | 예 |
| POST | 리소스를 생성하거나, 데이터를 처리하는 프로세스를 실행 | 아니요 | 아니요 | 응답에 신선도(freshness) 정보가 있으면 예 |
| PUT | 리소스를 생성하거나 교체 | 예 | 아니요 | 아니요 |
| PATCH | 리소스를 부분적으로 갱신 | 아니요 | 아니요 | 응답에 신선도 정보가 있으면 예 |
| DELETE | 리소스를 삭제 | 예 | 아니요 | 아니요 |

\*여러 번 호출해도 결과가 달라지지 않는다는 뜻입니다.

HTTP는 **TCP**나 **UDP** 같은 하위 수준 프로토콜에 의존하는 애플리케이션 계층 프로토콜입니다.

**출처 및 더 읽을거리: HTTP**

- [What is HTTP?](https://www.nginx.com/resources/glossary/http/)
- [Difference between HTTP and TCP](https://www.quora.com/What-is-the-difference-between-HTTP-protocol-and-TCP-protocol)
- [Difference between PUT and PATCH](https://laracasts.com/discuss/channels/general-discussion/whats-the-differences-between-put-and-patch?page=1)

## TCP (Transmission control protocol)

![연결 지향 방식의 TCP에서 데이터가 손상되면 수신 측이 재전송을 요청하는 모습](@repo/images/JdAsdvG.jpg)

*출처: [How to make a multiplayer game](http://www.wildbunny.co.uk/blog/2012/10/09/how-to-make-a-multi-player-game-part-1/)*

TCP는 [IP 네트워크](https://en.wikipedia.org/wiki/Internet_Protocol) 위에서 동작하는 연결 지향(connection-oriented) 프로토콜입니다. 연결은 [핸드셰이크(handshake)](https://en.wikipedia.org/wiki/Handshaking)로 맺고 끊습니다. TCP는 다음과 같은 메커니즘으로, 보낸 모든 패킷이 원래 순서대로 손상 없이 목적지에 도착하도록 보장합니다.

- 패킷마다 붙는 시퀀스 번호와 [체크섬 필드](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Checksum_computation)
- [확인 응답(acknowledgement)](https://en.wikipedia.org/wiki/Acknowledgement_(data_networks)) 패킷과 자동 재전송

송신 측이 올바른 응답을 받지 못하면 패킷을 다시 보냅니다. 타임아웃이 여러 번 발생하면 연결을 끊습니다. TCP는 [흐름 제어(flow control)](https://en.wikipedia.org/wiki/Flow_control_(data))와 [혼잡 제어(congestion control)](https://en.wikipedia.org/wiki/Network_congestion#Congestion_control)도 구현합니다. 이런 보장 때문에 지연이 생기고, 일반적으로 UDP보다 전송 효율이 떨어집니다.

높은 처리량을 확보하려고 웹 서버가 TCP 연결을 많이 열어 두면 메모리 사용량이 커집니다. 웹 서버 스레드와, 예컨대 [memcached](https://memcached.org/) 서버 사이에 연결을 많이 열어 두는 것은 비용이 클 수 있습니다. 가능한 곳에서는 UDP로 전환하는 것과 함께 [연결 풀링(connection pooling)](https://en.wikipedia.org/wiki/Connection_pool)도 도움이 됩니다.

TCP는 높은 신뢰성이 필요하지만 시간에는 덜 민감한 애플리케이션에 유용합니다. 웹 서버, 데이터베이스 정보, SMTP, FTP, SSH 등이 그 예입니다.

다음과 같은 경우에는 UDP 대신 TCP를 사용하세요.

- 모든 데이터가 온전히 도착해야 할 때
- 네트워크 처리량을 자동으로 가늠해 최대한 활용하고 싶을 때

## UDP (User datagram protocol)

![비연결형 방식의 UDP에서 일부 데이터가 빠져도 재전송하지 않는 모습](@repo/images/yzDrJtA.jpg)

*출처: [How to make a multiplayer game](http://www.wildbunny.co.uk/blog/2012/10/09/how-to-make-a-multi-player-game-part-1/)*

UDP는 비연결형(connectionless)입니다. 데이터그램(패킷과 비슷한 개념)은 데이터그램 단위로만 보장됩니다. 데이터그램은 순서가 뒤바뀌어 도착하거나 아예 도착하지 않을 수도 있습니다. UDP는 혼잡 제어를 지원하지 않습니다. TCP가 제공하는 보장이 없는 만큼, UDP는 일반적으로 더 효율적입니다.

UDP는 브로드캐스트로 서브넷의 모든 장치에 데이터그램을 보낼 수 있습니다. 이 기능은 [DHCP](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)에서 유용합니다. 클라이언트가 아직 IP 주소를 받지 못한 상태인데, IP 주소 없이는 TCP로 스트리밍할 방법이 없기 때문입니다.

UDP는 신뢰성은 낮지만 VoIP, 화상 채팅, 스트리밍, 실시간 멀티플레이어 게임 같은 실시간 유스케이스에 잘 맞습니다.

다음과 같은 경우에는 TCP 대신 UDP를 사용하세요.

- 지연 시간을 최소화해야 할 때
- 늦게 도착한 데이터가 데이터 유실보다 더 나쁠 때
- 오류 정정(error correction)을 직접 구현하고 싶을 때

**출처 및 더 읽을거리: TCP와 UDP**

- [Networking for game programming](https://gafferongames.com/post/udp_vs_tcp/)
- [Key differences between TCP and UDP protocols](http://www.cyberciti.biz/faq/key-differences-between-tcp-and-udp-protocols/)
- [Difference between TCP and UDP](http://stackoverflow.com/questions/5970383/difference-between-tcp-and-udp)
- [Transmission control protocol](https://en.wikipedia.org/wiki/Transmission_Control_Protocol)
- [User datagram protocol](https://en.wikipedia.org/wiki/User_Datagram_Protocol)
- [Scaling memcache at Facebook](http://www.cs.bu.edu/~jappavoo/jappavoo.github.com/451/papers/memcache-fb.pdf)

## RPC (Remote procedure call)

![클라이언트 프로그램이 클라이언트 스텁과 통신 모듈을 거쳐 서버의 스텁과 서비스 프로시저를 호출하고 응답을 받는 RPC 구조](@repo/images/iF4Mkb5.png)

*출처: [Crack the system design interview](http://www.puncsky.com/blog/2016-02-13-crack-the-system-design-interview)*

RPC에서 클라이언트는 다른 주소 공간(보통 원격 서버)에 있는 프로시저를 실행시킵니다. 이 프로시저는 로컬 프로시저를 호출하듯 코드로 작성되므로, 서버와 통신하는 세부 사항이 클라이언트 프로그램에서 추상화됩니다. 원격 호출은 보통 로컬 호출보다 느리고 신뢰성이 낮으므로, RPC 호출과 로컬 호출을 구분해 두면 도움이 됩니다. 널리 쓰이는 RPC 프레임워크로는 [Protobuf](https://developers.google.com/protocol-buffers/), [Thrift](https://thrift.apache.org/), [Avro](https://avro.apache.org/docs/current/)가 있습니다.

RPC는 요청-응답 프로토콜입니다.

- **Client program**(클라이언트 프로그램) - 클라이언트 스텁 프로시저를 호출합니다. 로컬 프로시저를 호출할 때처럼 매개변수를 스택에 넣습니다.
- **Client stub procedure**(클라이언트 스텁 프로시저) - 프로시저 ID와 인자를 요청 메시지로 마샬링(marshal, 패킹)합니다.
- **Client communication module**(클라이언트 통신 모듈) - OS가 클라이언트에서 서버로 메시지를 보냅니다.
- **Server communication module**(서버 통신 모듈) - OS가 들어온 패킷을 서버 스텁 프로시저에 전달합니다.
- **Server stub procedure**(서버 스텁 프로시저) - 결과를 언마샬링하고, 프로시저 ID에 맞는 서버 프로시저를 호출하면서 받은 인자를 넘깁니다.
- 서버의 응답은 위 단계를 역순으로 거칩니다.

RPC 호출 예시:

```
GET /someoperation?data=anId

POST /anotheroperation
{
  "data":"anId";
  "anotherdata": "another value"
}
```

RPC는 동작(behavior)을 노출하는 데 초점을 둡니다. 유스케이스에 더 잘 맞도록 네이티브 호출을 직접 설계할 수 있기 때문에, RPC는 성능상의 이유로 내부 통신에 자주 쓰입니다.

다음과 같은 경우에는 네이티브 라이브러리(SDK라고도 함)를 선택하세요.

- 대상 플랫폼을 알고 있을 때
- 여러분의 "로직"에 어떻게 접근하게 할지 직접 통제하고 싶을 때
- 라이브러리에서 오류 제어가 어떻게 일어날지 직접 통제하고 싶을 때
- 성능과 최종 사용자 경험이 가장 중요할 때

**REST**를 따르는 HTTP API는 공개 API에 더 자주 쓰이는 편입니다.

:::caution[단점: RPC]
- RPC 클라이언트는 서비스 구현에 강하게 결합됩니다.
- 새로운 작업이나 유스케이스마다 새 API를 정의해야 합니다.
- RPC는 디버깅하기 어려울 수 있습니다.
- 기존 기술을 바로 활용하지 못할 수 있습니다. 예를 들어 [Squid](http://www.squid-cache.org/) 같은 캐싱 서버에서 [RPC 호출이 제대로 캐시되도록](https://web.archive.org/web/20170608193645/http://etherealbits.com/2012/12/debunking-the-myths-of-rpc-rest/) 하려면 추가 작업이 필요할 수 있습니다.
:::

## REST (Representational state transfer)

REST는 클라이언트/서버 모델을 강제하는 아키텍처 스타일로, 클라이언트는 서버가 관리하는 리소스 집합에 대해 동작합니다. 서버는 리소스의 표현(representation)과, 리소스를 조작하거나 새 표현을 가져올 수 있는 동작을 제공합니다. 모든 통신은 무상태(stateless)이고 캐시 가능해야 합니다.

RESTful 인터페이스에는 네 가지 특성이 있습니다.

- **리소스 식별(HTTP의 URI)** - 어떤 작업을 하든 같은 URI를 사용합니다.
- **표현을 통한 변경(HTTP의 동사)** - 동사, 헤더, 본문을 사용합니다.
- **자기 서술적 오류 메시지(HTTP의 상태 응답)** - 상태 코드를 사용하세요. 바퀴를 다시 발명하지 마세요.
- **[HATEOAS](http://restcookbook.com/Basics/hateoas/) (HTTP를 위한 HTML 인터페이스)** - 웹 서비스는 브라우저에서 완전히 접근할 수 있어야 합니다.

REST 호출 예시:

```
GET /someresources/anId

PUT /someresources/anId
{"anotherdata": "another value"}
```

REST는 데이터를 노출하는 데 초점을 둡니다. 클라이언트와 서버 사이의 결합도를 최소화하며, 공개 HTTP API에 자주 쓰입니다. REST는 리소스는 URI로, [표현은 헤더로](https://github.com/for-GET/know-your-http-well/blob/master/headers.md), 동작은 GET, POST, PUT, DELETE, PATCH 같은 동사로 노출하는, 더 범용적이고 일관된 방식을 사용합니다. 무상태이기 때문에 REST는 수평 확장과 파티셔닝에 매우 적합합니다.

:::caution[단점: REST]
- REST는 데이터 노출에 초점을 두기 때문에, 리소스가 자연스럽게 정리되어 있지 않거나 단순한 계층 구조로 접근되지 않는다면 잘 맞지 않을 수 있습니다. 예를 들어 특정 이벤트 집합에 해당하면서 지난 한 시간 동안 갱신된 레코드를 모두 반환하는 요청은 경로(path)로 쉽게 표현되지 않습니다. REST에서는 이를 URI 경로, 쿼리 파라미터, 경우에 따라서는 요청 본문까지 조합해 구현하게 될 가능성이 큽니다.
- REST는 보통 몇 가지 동사(GET, POST, PUT, DELETE, PATCH)에 의존하는데, 이 동사들이 유스케이스에 맞지 않을 때가 있습니다. 예를 들어 만료된 문서를 보관(archive) 폴더로 옮기는 작업은 이 동사들에 깔끔하게 들어맞지 않을 수 있습니다.
- 중첩된 계층 구조를 가진 복잡한 리소스를 가져오려면, 화면 하나를 렌더링하는 데도 클라이언트와 서버 사이를 여러 번 왕복해야 합니다. 블로그 글의 내용과 그 글에 달린 댓글을 함께 가져오는 경우가 그 예입니다. 네트워크 상태가 수시로 바뀌는 환경에서 동작하는 모바일 애플리케이션에는 이런 여러 번의 왕복이 특히 바람직하지 않습니다.
- 시간이 지나면서 API 응답에 필드가 추가되면, 오래된 클라이언트도 필요 없는 필드까지 포함해 새 데이터 필드를 모두 받게 됩니다. 그 결과 페이로드 크기가 커지고 지연 시간이 늘어납니다.
:::

## RPC와 REST 비교

| 작업 | RPC | REST |
|---|---|---|
| 가입 | **POST** /signup | **POST** /persons |
| 탈퇴 | **POST** /resign<br/>{<br/>"personid": "1234"<br/>} | **DELETE** /persons/1234 |
| 사용자 조회 | **GET** /readPerson?personid=1234 | **GET** /persons/1234 |
| 사용자의 아이템 목록 조회 | **GET** /readUsersItemsList?personid=1234 | **GET** /persons/1234/items |
| 사용자의 아이템 목록에 아이템 추가 | **POST** /addItemToUsersItemsList<br/>{<br/>"personid": "1234";<br/>"itemid": "456"<br/>} | **POST** /persons/1234/items<br/>{<br/>"itemid": "456"<br/>} |
| 아이템 수정 | **POST** /modifyItem<br/>{<br/>"itemid": "456";<br/>"key": "value"<br/>} | **PUT** /items/456<br/>{<br/>"key": "value"<br/>} |
| 아이템 삭제 | **POST** /removeItem<br/>{<br/>"itemid": "456"<br/>} | **DELETE** /items/456 |

*출처: [Do you really know why you prefer REST over RPC](https://apihandyman.io/do-you-really-know-why-you-prefer-rest-over-rpc/)*

## 면접에서는

- API를 정의하는 단계에서 **외부 클라이언트와의 통신은 REST를 따르는 HTTP API, 내부 통신은 RPC**로 나누는 구성이 해설 전반에 반복해 나옵니다([Pastebin](/system-design/pastebin/), [판매 순위](/system-design/sales-rank/) 등). REST는 결합도가 낮아 공개 API에 맞고, RPC는 호출을 유스케이스에 맞게 다듬을 수 있어 성능에 유리하다는 이유까지 함께 말하세요.
- REST 엔드포인트를 그릴 때는 동사의 성질을 근거로 고르세요. 예를 들어 PUT과 DELETE는 멱등이라 여러 번 호출해도 결과가 같지만, POST와 PATCH는 그렇지 않습니다.
- REST를 제안하면 후속 질문으로 단점이 나오기 쉽습니다. 중첩 리소스를 가져오느라 생기는 여러 번의 왕복(특히 모바일), 필드가 늘며 커지는 페이로드, 동사에 맞지 않는 작업을 예로 들 수 있어야 합니다.
- 전송 계층을 고를 때는 "데이터가 모두 온전히 도착해야 하는가, 늦은 데이터가 유실보다 나쁜가"를 기준으로 TCP와 UDP 중 하나를 고르세요. 많은 TCP 연결이 메모리를 잡아먹는 문제에는 연결 풀링이나, 가능한 곳에서 UDP로 전환하는 방법을 들 수 있습니다.

TCP와 UDP를 한눈에 비교하면 다음과 같습니다.

| | TCP | UDP |
|---|---|---|
| 연결 | 연결 지향, 핸드셰이크로 연결을 맺고 끊음 | 비연결형 |
| 전달 보장 | 순서대로, 손상 없이 도착하도록 보장(시퀀스 번호, 체크섬, 확인 응답, 재전송) | 데이터그램 단위로만 보장, 순서가 바뀌거나 유실될 수 있음 |
| 흐름·혼잡 제어 | 지원 | 혼잡 제어 미지원 |
| 효율 | 보장 때문에 지연이 생기고 효율이 떨어짐 | 보장이 없는 만큼 더 효율적 |
| IP 주소가 없을 때 | 연결을 맺고 스트리밍할 방법이 없음 | 서브넷 전체에 브로드캐스트 가능(예: DHCP) |
| 대표 용도 | 웹 서버, 데이터베이스 정보, SMTP, FTP, SSH | VoIP, 화상 채팅, 스트리밍, 실시간 멀티플레이어 게임 |

## 스스로 점검하기

<details>
<summary>HTTP 동사 중 멱등한 것과 그렇지 않은 것은 무엇인가요?</summary>

GET, PUT, DELETE는 멱등해서 여러 번 호출해도 결과가 달라지지 않습니다. POST와 PATCH는 멱등하지 않습니다. 이 중 안전한(safe) 동사는 GET뿐입니다.

</details>

<details>
<summary>TCP는 패킷이 순서대로, 손상 없이 도착하도록 어떻게 보장하나요? 그 대가는 무엇인가요?</summary>

패킷마다 시퀀스 번호와 체크섬 필드를 붙이고, 확인 응답 패킷과 자동 재전송을 사용합니다. 올바른 응답을 받지 못하면 다시 보내고, 타임아웃이 여러 번 나면 연결을 끊습니다. 흐름 제어와 혼잡 제어도 합니다. 이런 보장 때문에 지연이 생기고 UDP보다 전송 효율이 떨어집니다.

</details>

<details>
<summary>DHCP에서 UDP가 유용한 이유는 무엇인가요?</summary>

UDP는 서브넷의 모든 장치에 데이터그램을 브로드캐스트할 수 있습니다. DHCP 클라이언트는 아직 IP 주소를 받지 못한 상태라 TCP로 스트리밍할 방법이 없기 때문에 이 기능이 필요합니다.

</details>

<details>
<summary>RPC와 REST는 각각 무엇을 노출하는 데 초점을 두고, 주로 어디에 쓰이나요?</summary>

RPC는 동작(behavior)을 노출하며, 호출을 유스케이스에 맞게 직접 설계할 수 있어 성능을 위해 내부 통신에 자주 쓰입니다. REST는 데이터를 노출하며, 클라이언트와 서버의 결합도를 최소화하므로 공개 HTTP API에 자주 쓰입니다.

</details>

<details>
<summary>RPC의 단점에는 어떤 것이 있나요?</summary>

클라이언트가 서비스 구현에 강하게 결합되고, 새 작업이나 유스케이스마다 새 API를 정의해야 하며, 디버깅이 어려울 수 있습니다. 또 Squid 같은 캐싱 서버에서 RPC 호출이 제대로 캐시되게 하려면 추가 작업이 필요한 것처럼, 기존 기술을 바로 활용하지 못할 수 있습니다.

</details>

## 출처 및 더 읽을거리

HTTP와 TCP·UDP 관련 자료는 각 섹션 끝에 있습니다.

**출처 및 더 읽을거리: REST와 RPC**

- [Do you really know why you prefer REST over RPC](https://apihandyman.io/do-you-really-know-why-you-prefer-rest-over-rpc/)
- [When are RPC-ish approaches more appropriate than REST?](http://programmers.stackexchange.com/a/181186)
- [REST vs JSON-RPC](http://stackoverflow.com/questions/15056878/rest-vs-json-rpc)
- [Debunking the myths of RPC and REST](https://web.archive.org/web/20170608193645/http://etherealbits.com/2012/12/debunking-the-myths-of-rpc-rest/)
- [What are the drawbacks of using REST](https://www.quora.com/What-are-the-drawbacks-of-using-RESTful-APIs)
- [Crack the system design interview](http://www.puncsky.com/blog/2016-02-13-crack-the-system-design-interview)
- [Thrift](https://code.facebook.com/posts/1468950976659943/)
- [Why REST for internal use and not RPC](http://arstechnica.com/civis/viewtopic.php?t=1190508)
