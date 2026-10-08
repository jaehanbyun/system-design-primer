---
title: 캐시 (Cache)
description: 캐시를 둘 수 있는 위치, 쿼리 수준과 객체 수준 캐싱, cache-aside부터 refresh-ahead까지 네 가지 갱신 전략과 각각의 단점을 정리합니다.
original: https://github.com/donnemartin/system-design-primer#cache
---

:::note[핵심 요약]
- 캐시는 이전 결과를 재사용해 **페이지 로드 시간**을 줄이고, 서버와 데이터베이스의 **부하**를 덜어 줍니다. 고르지 않은 부하와 트래픽 급증을 흡수하는 데도 효과적입니다.
- 캐시는 클라이언트(OS·브라우저), CDN, 웹 서버, 데이터베이스, 애플리케이션(Memcached·Redis 같은 인메모리 캐시) 등 여러 위치에 둘 수 있습니다.
- 캐싱 대상은 크게 **데이터베이스 쿼리**와 **객체**로 나뉩니다. 쿼리 수준 캐싱은 무효화가 어렵고, 객체 수준 캐싱은 기반 데이터가 바뀌면 해당 객체만 지우면 됩니다.
- 갱신 전략은 **cache-aside**, **write-through**, **write-behind**, **refresh-ahead** 네 가지이며, 쓰기 성능·데이터 신선도·유실 위험·구현 복잡도 사이에서 트레이드오프가 있습니다.
- 가장 큰 숙제는 **캐시 무효화**입니다. 캐시와 원본 데이터 사이의 일관성을 유지해야 합니다.
:::

![디스패처가 먼저 캐시를 조회하고, 결과가 없으면 워커 풀에 요청을 넘긴 뒤 결과를 캐시에 저장하는 구조](@repo/images/Q6z24La.png)

*출처: [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)*

캐싱은 페이지 로드 시간을 줄이고 서버와 데이터베이스의 부하를 낮출 수 있습니다. 위 모델에서 디스패처(dispatcher)는 실제 실행을 아끼기 위해, 같은 요청이 전에 들어온 적이 있는지 먼저 확인하고 이전 결과를 찾아 반환하려고 합니다.

데이터베이스는 대개 읽기와 쓰기가 파티션 전체에 고르게 분산될 때 유리합니다. 인기 있는 항목은 이 분포를 한쪽으로 치우치게 만들어 병목을 일으킬 수 있습니다. 데이터베이스 앞에 캐시를 두면 고르지 않은 부하와 트래픽 급증(spike)을 흡수하는 데 도움이 됩니다.

## 클라이언트 캐싱 (Client caching)

캐시는 클라이언트 쪽(OS나 브라우저), [서버 쪽](/topics/reverse-proxy/), 또는 별도의 캐시 계층에 둘 수 있습니다.

## CDN 캐싱 (CDN caching)

[CDN](/topics/cdn/)도 캐시의 한 종류로 봅니다.

## 웹 서버 캐싱 (Web server caching)

[리버스 프록시](/topics/reverse-proxy/)나 [Varnish](https://www.varnish-cache.org/) 같은 캐시는 정적 콘텐츠와 동적 콘텐츠를 직접 제공할 수 있습니다. 웹 서버도 요청을 캐시해 두었다가 애플리케이션 서버에 묻지 않고 바로 응답을 반환할 수 있습니다.

## 데이터베이스 캐싱 (Database caching)

데이터베이스는 보통 기본 설정에서도 어느 정도 캐싱을 하며, 이 설정은 일반적인 유스케이스에 맞춰 최적화되어 있습니다. 특정 사용 패턴에 맞게 설정을 조정하면 성능을 더 끌어올릴 수 있습니다.

## 애플리케이션 캐싱 (Application caching)

Memcached나 Redis 같은 인메모리(in-memory) 캐시는 애플리케이션과 데이터 저장소 사이에 놓이는 키-값 저장소입니다. 데이터를 RAM에 보관하므로, 데이터를 디스크에 저장하는 일반적인 데이터베이스보다 훨씬 빠릅니다. 다만 RAM은 디스크보다 용량이 제한적이므로, [LRU(least recently used)](https://en.wikipedia.org/wiki/Cache_replacement_policies#Least_recently_used_(LRU)) 같은 [캐시 무효화](https://en.wikipedia.org/wiki/Cache_algorithms) 알고리즘으로 '차가운(cold)' 항목은 무효화하고 '뜨거운(hot)' 데이터는 RAM에 남겨 둘 수 있습니다.

Redis에는 다음과 같은 기능이 더 있습니다.

- 영속성(persistence) 옵션
- 정렬된 집합(sorted set), 리스트 같은 내장 자료 구조

캐시할 수 있는 수준은 여러 가지이며, 크게 **데이터베이스 쿼리**와 **객체** 두 범주로 나뉩니다.

- 행(row) 수준
- 쿼리 수준
- 완전히 구성된 직렬화 가능한 객체
- 완전히 렌더링된 HTML

일반적으로 파일 기반 캐싱은 피하는 것이 좋습니다. 서버 복제(cloning)와 오토 스케일링(auto-scaling)을 어렵게 만들기 때문입니다.

## 데이터베이스 쿼리 수준 캐싱 (Caching at the database query level)

데이터베이스에 쿼리할 때마다 쿼리를 해시한 값을 키로 삼아 결과를 캐시에 저장합니다. 이 방식에는 만료(expiration) 문제가 따릅니다.

- 쿼리가 복잡하면 캐시된 결과를 삭제하기 어렵습니다.
- 테이블 셀 하나처럼 데이터 한 조각만 바뀌어도, 바뀐 셀을 포함할 수 있는 캐시된 쿼리를 모두 삭제해야 합니다.

## 객체 수준 캐싱 (Caching at the object level)

애플리케이션 코드에서 하듯이 데이터를 객체로 바라보세요. 애플리케이션이 데이터베이스에서 가져온 데이터셋을 클래스 인스턴스나 자료 구조로 조립하게 합니다.

- 객체의 기반 데이터가 바뀌면 그 객체를 캐시에서 제거합니다.
- 비동기 처리가 가능해집니다. 워커(worker)가 캐시된 최신 객체를 가져다 객체를 조립할 수 있습니다.

캐시하기 좋은 대상은 다음과 같습니다.

- 사용자 세션
- 완전히 렌더링된 웹 페이지
- 활동 스트림(activity stream)
- 사용자 그래프 데이터

## 캐시 갱신 전략 (When to update the cache)

캐시에는 제한된 양의 데이터만 저장할 수 있으므로, 유스케이스에 가장 잘 맞는 캐시 갱신 전략을 골라야 합니다.

### Cache-aside

![애플리케이션이 캐시를 먼저 조회하고, 캐시 미스가 나면 저장소에서 읽어 캐시에 넣는 cache-aside 구조](@repo/images/ONjORqk.png)

*출처: [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast)*

저장소를 읽고 쓰는 일은 애플리케이션이 맡습니다. 캐시는 저장소와 직접 상호작용하지 않습니다. 애플리케이션은 다음 순서로 동작합니다.

- 캐시에서 항목을 찾지만 캐시 미스가 납니다.
- 데이터베이스에서 항목을 읽어 옵니다.
- 항목을 캐시에 추가합니다.
- 항목을 반환합니다.

```python
def get_user(self, user_id):
    user = cache.get("user.{0}", user_id)
    if user is None:
        user = db.query("SELECT * FROM users WHERE user_id = {0}", user_id)
        if user is not None:
            key = "user.{0}".format(user_id)
            cache.set(key, json.dumps(user))
    return user
```

[Memcached](https://memcached.org/)는 보통 이런 방식으로 사용합니다.

한 번 캐시에 추가된 데이터는 이후 읽기가 빠릅니다. Cache-aside는 지연 로딩(lazy loading)이라고도 부릅니다. 요청된 데이터만 캐시하므로, 아무도 요청하지 않는 데이터로 캐시가 채워지는 일을 막을 수 있습니다.

:::caution[단점: Cache-aside]
- 캐시 미스가 날 때마다 세 번의 왕복이 발생하므로 눈에 띄는 지연이 생길 수 있습니다.
- 데이터베이스에서 데이터가 갱신되면 캐시의 데이터가 오래된(stale) 상태가 될 수 있습니다. 캐시 항목을 강제로 갱신하게 하는 TTL(time-to-live)을 설정하거나 write-through를 함께 쓰면 이 문제를 완화할 수 있습니다.
- 노드에 장애가 나면 비어 있는 새 노드로 교체되므로 지연 시간이 늘어납니다.
:::

### Write-through

![애플리케이션은 캐시에만 읽고 쓰고, 캐시가 데이터베이스에 동기적으로 기록하는 write-through 구조](@repo/images/0vBc0hN.png)

*출처: [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)*

애플리케이션은 캐시를 주 데이터 저장소처럼 사용해 데이터를 읽고 쓰며, 데이터베이스를 읽고 쓰는 일은 캐시가 맡습니다.

- 애플리케이션이 캐시에 항목을 추가하거나 갱신합니다.
- 캐시가 데이터 저장소에 항목을 동기적으로 기록합니다.
- 반환합니다.

애플리케이션 코드:

```python
set_user(12345, {"foo":"bar"})
```

캐시 코드:

```python
def set_user(user_id, values):
    user = db.query("UPDATE Users WHERE id = {0}", user_id, values)
    cache.set(user_id, user)
```

Write-through는 쓰기 작업 때문에 전체적으로는 느린 방식이지만, 방금 쓴 데이터를 이후에 읽을 때는 빠릅니다. 사용자는 보통 데이터를 읽을 때보다 갱신할 때의 지연을 더 너그럽게 받아들입니다. 캐시의 데이터는 오래된 상태가 되지 않습니다.

:::caution[단점: Write-through]
- 장애나 확장 때문에 새 노드가 만들어지면, 그 노드는 데이터베이스에서 항목이 갱신될 때까지 해당 항목을 캐시하지 않습니다. Cache-aside를 write-through와 함께 쓰면 이 문제를 완화할 수 있습니다.
- 기록된 데이터 대부분이 한 번도 읽히지 않을 수 있습니다. TTL로 이 낭비를 최소화할 수 있습니다.
:::

### Write-behind (write-back)

![애플리케이션이 캐시에 쓰면, 캐시가 데이터베이스에는 나중에 비동기로 기록하는 write-behind 구조](@repo/images/rgSrvjG.png)

*출처: [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)*

Write-behind에서 애플리케이션은 다음과 같이 동작합니다.

- 캐시에 항목을 추가하거나 갱신합니다.
- 데이터 저장소에는 항목을 비동기로 기록해 쓰기 성능을 높입니다.

:::caution[단점: Write-behind]
- 캐시의 내용이 데이터 저장소에 반영되기 전에 캐시가 내려가면 데이터가 유실될 수 있습니다.
- Write-behind는 cache-aside나 write-through보다 구현하기가 더 복잡합니다.
:::

### Refresh-ahead

![캐시가 저장소에서 데이터를 미리 가져와 두고 클라이언트에 제공하는 refresh-ahead 구조](@repo/images/kxtjqgE.png)

*출처: [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast)*

최근에 접근한 캐시 항목을 만료되기 전에 자동으로 갱신하도록 캐시를 설정할 수 있습니다.

캐시가 앞으로 필요할 항목을 정확히 예측할 수 있다면, refresh-ahead는 read-through 방식보다 지연 시간을 줄일 수 있습니다.

:::caution[단점: Refresh-ahead]
- 앞으로 필요할 항목을 정확히 예측하지 못하면, refresh-ahead를 쓰지 않을 때보다 오히려 성능이 떨어질 수 있습니다.
:::

:::caution[단점: 캐시]
- [캐시 무효화](https://en.wikipedia.org/wiki/Cache_algorithms)를 통해 캐시와 데이터베이스 같은 원본 데이터(source of truth) 사이의 일관성을 유지해야 합니다.
- 캐시 무효화는 어려운 문제이며, 캐시를 언제 갱신할지 정하는 데 따르는 복잡성이 추가됩니다.
- Redis나 memcached를 추가하는 등 애플리케이션을 변경해야 합니다.
:::

## 면접에서는

- 읽기 요청이 많거나 인기 콘텐츠에 트래픽이 몰리는 설계라면, 데이터베이스 앞에 **Memory Cache**를 두자고 제안하세요. [Pastebin](/system-design/pastebin/)과 [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/) 해설처럼, 캐시는 고르지 않은 트래픽과 급증을 흡수하는 수단으로 자주 등장합니다.
- 바로 인메모리 캐시를 추가하기보다, 먼저 데이터베이스 자체의 캐시 설정을 조정해 병목이 풀리는지 확인하는 단계를 언급하면 좋습니다. AWS 확장 해설이 이 순서를 따릅니다.
- 갱신 전략을 골랐다면 **이유**를 함께 말하세요. 읽기·쓰기 경로에 따라 쓰기 지연, 데이터 신선도, 유실 위험이 달라집니다(아래 표 참고).
- 캐시 용량이 제한적이라는 점을 짚고, [쿼리 캐시](/system-design/query-cache/) 해설처럼 LRU로 오래된 항목을 내보내는 방식을 설명할 수 있으면 좋습니다. 구현까지 묻는다면 [LRU 캐시 설계](/ood/lru-cache/)를 참고하세요.
- 후속 질문으로 일관성이 자주 나옵니다. TTL, write-through 병행 같은 완화책과 함께, 캐시 무효화가 본질적으로 어려운 문제라는 점을 인정하세요. 파일 기반 캐시는 [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)을 어렵게 하므로 피한다는 점도 덧붙일 수 있습니다.

네 가지 갱신 전략을 한눈에 비교하면 다음과 같습니다.

| 전략 | 읽기/쓰기 경로 | 장점 | 단점 |
|---|---|---|---|
| Cache-aside | 애플리케이션이 캐시를 조회하고, 미스가 나면 DB에서 읽어 캐시에 넣음 | 요청된 데이터만 캐시, 이후 읽기가 빠름 | 미스마다 세 번 왕복, 오래된 데이터, 새 노드는 빈 캐시 |
| Write-through | 애플리케이션은 캐시에 쓰고, 캐시가 DB에 동기적으로 기록 | 방금 쓴 데이터 읽기가 빠르고 캐시가 오래되지 않음 | 쓰기가 느림, 읽히지 않을 데이터까지 기록, 새 노드는 갱신 전까지 비어 있음 |
| Write-behind | 애플리케이션은 캐시에 쓰고, DB에는 비동기로 기록 | 쓰기 성능 향상 | 캐시 장애 시 데이터 유실 가능, 구현이 더 복잡 |
| Refresh-ahead | 캐시가 최근 접근 항목을 만료 전에 자동 갱신 | 예측이 맞으면 read-through보다 지연 시간 감소 | 예측이 틀리면 오히려 성능 저하 |

## 스스로 점검하기

<details>
<summary>Cache-aside에서 캐시 미스가 나면 애플리케이션은 어떤 순서로 처리하나요?</summary>

캐시에서 항목을 찾다가 미스가 나면, 데이터베이스에서 항목을 읽어 오고, 그 항목을 캐시에 추가한 뒤 반환합니다. 이 때문에 미스마다 세 번의 왕복이 생겨 눈에 띄는 지연이 생길 수 있습니다.

</details>

<details>
<summary>데이터베이스 쿼리 수준 캐싱은 왜 만료 문제가 생기나요?</summary>

쿼리를 해시한 값을 키로 결과를 저장하기 때문에, 복잡한 쿼리의 캐시 결과를 골라 삭제하기 어렵습니다. 또 테이블 셀 하나만 바뀌어도 그 셀을 포함할 수 있는 캐시된 쿼리를 모두 지워야 합니다. 객체 수준 캐싱은 기반 데이터가 바뀐 객체만 제거하면 됩니다.

</details>

<details>
<summary>Write-through와 write-behind는 무엇이 다르고, 각각 어떤 위험이 있나요?</summary>

둘 다 애플리케이션이 캐시에 쓰지만, write-through는 캐시가 데이터 저장소에 **동기적으로** 기록하고 write-behind는 **비동기로** 기록합니다. Write-through는 쓰기가 느린 대신 캐시가 오래된 상태가 되지 않습니다. Write-behind는 쓰기 성능이 좋지만, 저장소에 반영되기 전에 캐시가 내려가면 데이터가 유실될 수 있고 구현도 더 복잡합니다.

</details>

<details>
<summary>Refresh-ahead를 도입했는데 오히려 성능이 나빠졌다면 원인은 무엇일까요?</summary>

Refresh-ahead는 앞으로 필요할 항목을 캐시가 정확히 예측해야 이득이 납니다. 예측이 빗나가면 쓰지 않을 항목을 미리 갱신하느라 refresh-ahead를 쓰지 않을 때보다 성능이 떨어질 수 있습니다.

</details>

<details>
<summary>파일 기반 캐싱을 피하라고 하는 이유는 무엇인가요?</summary>

파일 기반 캐시는 서버를 복제(cloning)하거나 오토 스케일링하기 어렵게 만들기 때문입니다.

</details>

## 출처 및 더 읽을거리

- [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast)
- [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)
- [Introduction to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/)
- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
- [Scalability](https://web.archive.org/web/20230126233752/https://www.lecloud.net/post/9246290032/scalability-for-dummies-part-3-cache)
- [AWS ElastiCache strategies](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/Strategies.html)
- [Wikipedia](https://en.wikipedia.org/wiki/Cache_(computing))
