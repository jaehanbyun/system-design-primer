---
title: 비동기 처리 (Asynchronism)
description: 무거운 작업을 요청 흐름에서 떼어 내는 메시지 큐와 작업 큐, 큐가 넘칠 때를 대비한 배압, 비동기 처리의 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#asynchronism
---

:::note[핵심 요약]
- 비동기 워크플로는 비용이 큰 작업을 요청 흐름 밖으로 빼서 **요청 시간**을 줄이고, 주기적인 데이터 집계처럼 오래 걸리는 작업을 **미리** 해 둘 수 있게 합니다.
- **메시지 큐**는 메시지를 받아 보관했다가 전달합니다. 애플리케이션은 큐에 작업을 넣고, 워커가 백그라운드에서 처리하므로 사용자는 기다리지 않습니다.
- **작업 큐**는 작업과 관련 데이터를 받아 실행하고 결과를 돌려주며, 스케줄링과 계산량이 많은 백그라운드 작업에 쓰입니다.
- 큐가 무한정 커지지 않도록 **배압**(back pressure)으로 큐 크기를 제한하고, 넘치는 요청에는 HTTP 503을 돌려주어 나중에 재시도하게 합니다.
- 계산이 가볍거나 실시간이어야 하는 작업에는 큐가 지연과 복잡성을 더할 수 있으므로, 동기 처리가 나을 수 있습니다.
:::

![요청을 받은 웹 서버가 메시지 큐에 작업을 넣고, 큐 소비자가 이를 꺼내 데이터베이스에 반영하는 구조](@repo/images/54GYsSx.png)

*출처: [Intro to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/#platform_layer)*

비동기 워크플로는 원래라면 요청 흐름 안에서(in-line) 처리했을 비용이 큰 작업의 요청 시간을 줄여 줍니다. 데이터를 주기적으로 집계하는 것처럼 시간이 오래 걸리는 작업을 미리 처리해 두는 데도 도움이 됩니다.

## 메시지 큐 (Message queues)

메시지 큐는 메시지를 받고, 보관하고, 전달합니다. 어떤 작업이 요청 흐름 안에서 처리하기에 너무 느리다면, 다음과 같은 흐름으로 메시지 큐를 사용할 수 있습니다.

- 애플리케이션이 큐에 작업을 발행(publish)한 뒤, 사용자에게 작업 상태를 알립니다.
- 워커가 큐에서 작업을 가져와 처리한 뒤, 작업이 끝났음을 알립니다.

사용자는 작업이 끝날 때까지 막혀 있지 않고(non-blocking), 작업은 백그라운드에서 처리됩니다. 그동안 클라이언트는 필요하다면 약간의 처리를 직접 해서 작업이 이미 끝난 것처럼 보이게 할 수 있습니다. 예를 들어 트윗을 올리면 내 타임라인에는 곧바로 게시된 것처럼 보이지만, 실제로 모든 팔로워에게 전달되기까지는 시간이 좀 걸릴 수 있습니다.

[**Redis**](https://redis.io/)는 간단한 메시지 브로커로 쓰기 좋지만, 메시지가 유실될 수 있습니다.

[**RabbitMQ**](https://www.rabbitmq.com/)는 널리 쓰이지만, 'AMQP' 프로토콜에 맞춰야 하고 노드를 직접 관리해야 합니다.

[**Amazon SQS**](https://aws.amazon.com/sqs/)는 호스팅 서비스이지만, 지연 시간이 길 수 있고 메시지가 두 번 전달될 가능성이 있습니다.

## 작업 큐 (Task queues)

작업 큐는 작업과 관련 데이터를 받아 실행한 뒤, 그 결과를 전달합니다. 스케줄링을 지원할 수 있고, 계산량이 많은 작업을 백그라운드에서 실행하는 데 사용할 수 있습니다.

[**Celery**](https://docs.celeryproject.org/en/stable/)는 스케줄링을 지원하며, 주로 Python을 지원합니다.

## 배압 (Back pressure)

큐가 크게 불어나기 시작하면 큐 크기가 메모리보다 커질 수 있고, 그 결과 캐시 미스와 디스크 읽기가 발생해 성능이 더 느려집니다. [배압(back pressure)](http://mechanical-sympathy.blogspot.com/2012/05/apply-back-pressure-when-overloaded.html)은 큐 크기를 제한해, 이미 큐에 들어 있는 작업에 대해서는 높은 처리량과 좋은 응답 시간을 유지하도록 돕습니다. 큐가 가득 차면 클라이언트는 서버가 바쁘다는 응답이나 HTTP 503 상태 코드를 받고, 나중에 다시 시도하게 됩니다. 클라이언트는 [지수 백오프(exponential backoff)](https://en.wikipedia.org/wiki/Exponential_backoff) 등을 사용해 나중에 요청을 재시도할 수 있습니다.

:::caution[단점: 비동기 처리]
- 계산 비용이 적은 작업이나 실시간 워크플로 같은 유스케이스에는 동기 처리가 더 적합할 수 있습니다. 큐를 도입하면 지연과 복잡성이 늘어날 수 있기 때문입니다.
:::

## 면접에서는

- 썸네일 생성, 알림 발송, 배치 집계처럼 실시간일 필요가 없는 무거운 작업이 보이면 **큐와 워커**로 비동기 처리하자고 제안하세요. [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설은 사진 업로드와 썸네일 생성을 SQS 같은 큐와 워커로 분리합니다.
- 사용자 경험도 함께 설명하세요. 트윗 예시처럼 클라이언트에는 바로 완료된 것처럼 보여 주고, 실제 전달은 백그라운드에서 처리할 수 있습니다. [Twitter](/system-design/twitter/) 해설에서도 알림은 큐를 통해 비동기로 보냅니다.
- 브로커를 고를 때는 트레이드오프를 짚으세요. Redis는 단순하지만 메시지가 유실될 수 있고, RabbitMQ는 AMQP와 노드 운영 부담이 있으며, SQS는 관리형이지만 지연이 길고 중복 전달이 생길 수 있습니다. 중복 전달이 가능하다면 같은 작업이 두 번 처리돼도 괜찮은지 후속 질문에 대비하세요.
- "트래픽이 몰려 큐가 계속 커지면 어떻게 하나요?"라는 질문에는 배압으로 큐 크기를 제한하고, 넘치는 요청에는 503을 돌려주며, 클라이언트는 지수 백오프로 재시도한다고 답할 수 있습니다.
- 모든 것을 비동기로 만들지는 마세요. 가벼운 계산이나 실시간 응답이 필요한 경로는 동기로 두는 편이 낫다는 점을 함께 말하면 균형 잡힌 답이 됩니다.

## 스스로 점검하기

<details>
<summary>메시지 큐를 쓰는 기본 흐름은 어떻게 되나요?</summary>

애플리케이션이 큐에 작업을 발행하고 사용자에게 작업 상태를 알립니다. 워커는 큐에서 작업을 가져와 처리한 뒤 완료를 알립니다. 사용자는 작업이 끝날 때까지 막혀 있지 않고, 작업은 백그라운드에서 처리됩니다.

</details>

<details>
<summary>메시지 큐와 작업 큐는 무엇이 다른가요?</summary>

메시지 큐는 메시지를 받고, 보관하고, 전달하는 역할을 합니다. 작업 큐는 작업과 관련 데이터를 받아 직접 실행하고 그 결과를 전달하며, 스케줄링이나 계산량이 많은 백그라운드 작업에 쓰입니다. Celery가 작업 큐의 예입니다.

</details>

<details>
<summary>큐가 계속 커지면 어떤 문제가 생기고, 배압은 이를 어떻게 해결하나요?</summary>

큐 크기가 메모리보다 커지면 캐시 미스와 디스크 읽기가 생겨 성능이 더 느려집니다. 배압은 큐 크기를 제한해 이미 들어온 작업의 처리량과 응답 시간을 지킵니다. 큐가 가득 차면 클라이언트는 서버가 바쁘다는 응답이나 HTTP 503을 받고, 지수 백오프 등으로 나중에 재시도합니다.

</details>

<details>
<summary>비동기 처리가 오히려 맞지 않는 경우는 언제인가요?</summary>

계산이 가벼운 작업이나 실시간 워크플로입니다. 이런 경우 큐를 도입하면 지연과 복잡성이 늘어날 수 있어 동기 처리가 더 적합할 수 있습니다.

</details>

## 출처 및 더 읽을거리

- [It's all a numbers game](https://www.youtube.com/watch?v=1KRYH75wgy4)
- [Applying back pressure when overloaded](http://mechanical-sympathy.blogspot.com/2012/05/apply-back-pressure-when-overloaded.html)
- [Little's law](https://en.wikipedia.org/wiki/Little%27s_law)
- [What is the difference between a message queue and a task queue?](https://www.quora.com/What-is-the-difference-between-a-message-queue-and-a-task-queue-Why-would-a-task-queue-require-a-message-broker-like-RabbitMQ-Redis-Celery-or-IronMQ-to-function)
