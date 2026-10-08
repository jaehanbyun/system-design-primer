# 콘텐츠 작성 가이드

이 사이트의 페이지를 쓰거나 고칠 때 따르는 규칙입니다. 원문(영어)을 한국어로 옮기는 기준, 페이지 구조, 링크와 앵커 규칙을 정리합니다.

- 콘텐츠 위치: `site/src/content/docs/<slug>.md` (컴포넌트를 import할 때만 `.mdx`)
- 참고할 예시 페이지: `site/src/content/docs/topics/cdn.md`
- 변경 후에는 `npm run build`로 링크와 앵커를 검증하세요.

## 1. Frontmatter

```yaml
---
title: 콘텐츠 전송 네트워크 (CDN)
description: 한 문장 요약. 검색 결과와 링크 미리보기에 쓰입니다(60–110자).
original: https://github.com/donnemartin/system-design-primer#content-delivery-network
---
```

- `title`: 한국어 + 괄호 안 영어 원어. 예: `캐시 (Cache)`, `Pastebin.com (또는 Bit.ly) 설계`.
- `original`: 이 페이지의 원문 위치. README 섹션이면 `https://github.com/donnemartin/system-design-primer#<anchor>`, 해설이면 `https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/<dir>/README.md`, OOD면 해당 `.ipynb`의 blob URL.
- `sidebar` 등 다른 필드는 쓰지 마세요(사이드바 순서는 설정 파일에서 관리합니다).

## 2. 문체와 용어

- **합니다체**로 씁니다. 원문의 명령형(“Use …”)은 “…를 사용하세요”처럼 자연스럽게 옮깁니다.
- 한국 개발자가 실무에서 영어로 쓰는 용어는 영어 그대로 두거나 `한국어(English)`로 처음 한 번 병기합니다.
- 원문을 **빠짐없이** 번역합니다. 문장, 목록 항목, 표, 코드, 이미지, 링크를 생략하거나 요약하지 마세요. 의미를 바꾸지 마세요.
- 코드 블록은 원문과 **동일하게** 유지합니다(주석 포함). 언어 표시(```python 등)는 원문을 따릅니다.
- 외부 링크 URL은 원문 그대로 둡니다(죽은 링크라도 “고치지” 마세요). 링크 텍스트가 영어 글 제목이면 영어 그대로 둡니다.
- 원문의 강조(**굵게**)는 번역문에서도 같은 개념에 유지합니다.

### 용어집 (일관되게 사용)

| 원문 | 번역 |
|---|---|
| scalability / performance | 확장성 / 성능 |
| latency / throughput | 지연 시간 / 처리량 |
| availability / consistency / partition tolerance | 가용성 / 일관성 / 분할 내성 |
| weak / eventual / strong consistency | 약한 / 최종적 / 강한 일관성 |
| trade-off | 트레이드오프 |
| fail-over | 장애 조치(failover) |
| active-passive / active-active | 액티브-패시브 / 액티브-액티브 |
| replication / replica | 복제 / 복제본(replica) |
| master-slave / master-master | 마스터-슬레이브 / 마스터-마스터 (원문 용어 유지) |
| federation / sharding / denormalization | 페더레이션 / 샤딩 / 비정규화 |
| load balancer / reverse proxy | 로드 밸런서 / 리버스 프록시 |
| horizontal / vertical scaling | 수평 확장(scale out) / 수직 확장(scale up) |
| single point of failure | 단일 장애 지점(SPOF) |
| cache hit / miss, cache invalidation | 캐시 히트 / 미스, 캐시 무효화 |
| cache-aside, write-through, write-behind, refresh-ahead | 영어 그대로 |
| message queue / task queue / back pressure | 메시지 큐 / 작업 큐 / 배압(back pressure) |
| asynchronism / asynchronous | 비동기 처리 / 비동기 |
| use case / constraints / assumptions | 유스케이스 / 제약 조건 / 가정 |
| back-of-the-envelope calculation | 어림 계산 |
| object store | 객체 저장소(Object Store) |
| read replica | 읽기 복제본 |
| Disadvantage(s) | 단점 |
| Source(s) and further reading | 출처 및 더 읽을거리 |
| Web Server, Write API, Read API, SQL Database 등 해설 다이어그램의 **굵은 구성 요소 이름** | 영어 그대로 굵게 유지 (다이어그램과 일치) |

## 3. 페이지 구조

### 주제(topic) 페이지

1. `:::note[핵심 요약]` — 3–5개 불릿. 원문 내용에 충실한 요약(새 사실 추가 금지).
2. 본문 번역. 원문 섹션 제목이 페이지 `title`(h1)이 되므로, 원문의 하위 제목 레벨을 하나씩 올립니다(원문 `###` → `##`, `####` → `###`).
3. 원문의 **Disadvantage(s)** 는 제목 대신 aside로: `:::caution[단점: 캐시]` … `:::`
4. `## 면접에서는` — 3–6개 불릿. 이 주제를 면접에서 언제 꺼내고, 어떤 트레이드오프·후속 질문을 함께 말하면 좋은지. 원문과 다른 페이지(해설 포함) 내용에 근거해야 합니다.
5. `## 스스로 점검하기` — 3–5개의 Q&A. 형식은 예시 페이지처럼 `<details>`/`<summary>`를 쓰고, 답변 앞뒤에 **빈 줄**을 둡니다. 답은 페이지 내용으로 답할 수 있어야 합니다.
6. `## 출처 및 더 읽을거리` — 원문 링크 목록 그대로.
   - 원문에 하위 섹션별 출처(예: “Source(s) and further reading: replication”)가 있으면 그 자리에 **제목 없이** `**출처 및 더 읽을거리: 복제**` 굵은 문단 + 목록으로 둡니다.

### 시스템 설계 해설(solution) 페이지

1. `:::note[이 문제에서 배우는 것]` — 3–5개 불릿.
2. `:::tip[먼저 직접 풀어 보세요]` — “45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요.” 정도의 한두 문장.
3. 원문 전체 번역. 원문의 `## Step 1: …` 같은 제목은 `## 1단계: 유스케이스, 제약 조건, 가정 정리`처럼 옮깁니다. 원문의 `#` 제목(문제 이름)은 frontmatter `title`이므로 본문에 쓰지 않습니다. 원문의 “Note: This document links directly to relevant areas found in the system design topics…” 안내문은 `:::note` aside로 번역합니다.
4. 원문의 `*Note: …*` 같은 면접관 코멘트, “Clarify with your interviewer” 같은 블록인용은 그대로 블록인용(`>`)이나 aside로 번역합니다.
5. 마지막에 `## 복습 포인트` — 이 해설의 핵심 설계 결정과 트레이드오프 3–6개 불릿.

### 객체 지향 설계(OOD) 페이지 (`.mdx`)

```mdx
---
title: LRU 캐시 설계 (Design an LRU cache)
description: …
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/object_oriented_design/lru_cache/lru_cache.ipynb
---
import { Code } from '@astrojs/starlight/components';
import source from '@repo/solutions/object_oriented_design/lru_cache/lru_cache.py?raw';

:::note[이 문제에서 배우는 것]
- …
:::

## 제약 조건과 가정 (Constraints and assumptions)
(노트북의 markdown 셀 내용을 빠짐없이 번역)

## 설계 개요
(클래스별 책임을 표로 정리: | 클래스 | 책임 | 주요 메서드 |, 그리고 핵심 동작 흐름 설명)

## 해설 코드

<Code code={source} lang="py" title="lru_cache.py" />

## 면접에서는
## 스스로 점검하기
```

- 코드는 반드시 `.py` 파일을 `?raw`로 import해서 보여 줍니다(직접 복사 금지).
- MDX에서는 본문 텍스트의 `{`, `}`, `<`가 JSX로 해석됩니다. 본문에 써야 하면 인라인 코드(백틱)로 감싸세요.

## 4. 이미지

- 원문 이미지는 **저장소의 원본 파일을 alias로** 참조합니다(복사 금지).
  - `images/xxx.png` → `![한국어 대체 텍스트](@repo/images/xxx.png)`
  - 해설 이미지 → `![…](@repo/solutions/system_design/pastebin/pastebin_basic.png)`
  - 원문이 `imgur` 링크(`http://i.imgur.com/xxx.png`)를 쓰는 경우, 같은 파일이 `solutions/system_design/<dir>/`나 `images/`에 있는지 확인하고 로컬 파일을 쓰세요. 원문 해설의 `![Imgur](http://i.imgur.com/...)`는 대부분 같은 폴더의 `<name>.png`/`<name>_basic.png`에 해당합니다. 확실하지 않으면 이미지 크기와 문맥으로 판단하고, 그래도 모르겠으면 원래 URL을 그대로 쓰세요.
- `<p align="center"><img …></p>` HTML은 Markdown 이미지로 바꿉니다. 원문의 출처 캡션은 이미지 바로 다음 줄에 `*출처: [제목](URL)*` 형식으로 둡니다(빈 줄로 구분).
- 대체 텍스트(alt)는 이미지가 보여 주는 내용을 한국어로 짧게 설명합니다.

## 5. 링크

- 사이트 내부 링크는 항상 **루트 기준 + 끝 슬래시**: `/topics/cache/`. base 경로(`/system-design-primer`)는 쓰지 마세요(빌드 시 자동으로 붙습니다). 상대 링크(`../x/`)는 금지입니다(빌드 검증에서 실패).
- 앵커(`#…`)는 아래 레지스트리에 있는 것만 쓰세요. 그 외에는 페이지 링크만 겁니다. 잘못된 앵커는 빌드를 실패시킵니다.
- 원문의 README 앵커(`#cache-aside`, `https://github.com/donnemartin/system-design-primer#sharding` 등)는 아래 표로 변환합니다.

### 원문 앵커 → 사이트 경로

| 원문 앵커 | 사이트 경로 |
|---|---|
| `#system-design-topics-start-here`, `#step-1-…`, `#step-2-…`, `#next-steps` | `/topics/start-here/` |
| `#index-of-system-design-topics` | `/topics/` |
| `#performance-vs-scalability` | `/topics/performance-vs-scalability/` |
| `#latency-vs-throughput` | `/topics/latency-vs-throughput/` |
| `#availability-vs-consistency`, `#cap-theorem`, `#cp---…`, `#ap---…` | `/topics/availability-vs-consistency/` (+ 레지스트리 앵커) |
| `#consistency-patterns`, `#weak-/eventual-/strong-consistency` | `/topics/consistency-patterns/` (+ 앵커) |
| `#availability-patterns`, `#fail-over`, `#active-passive`, `#active-active`, `#replication`, `#availability-in-numbers` | `/topics/availability-patterns/` (+ 앵커) |
| `#domain-name-system` | `/topics/dns/` |
| `#content-delivery-network`, `#push-cdns`, `#pull-cdns` | `/topics/cdn/` (+ 앵커) |
| `#load-balancer`, `#layer-4-load-balancing`, `#layer-7-load-balancing`, `#horizontal-scaling` | `/topics/load-balancer/` (+ 앵커) |
| `#reverse-proxy-web-server`, `#load-balancer-vs-reverse-proxy` | `/topics/reverse-proxy/` |
| `#application-layer`, `#microservices`, `#service-discovery` | `/topics/application-layer/` (+ 앵커) |
| `#database`, `#relational-database-management-system-rdbms`, `#master-slave-replication`, `#master-master-replication`, `#disadvantages-replication`, `#federation`, `#sharding`, `#denormalization`, `#sql-tuning`, `#use-good-indices` | `/topics/database/rdbms/` (+ 앵커) |
| `#nosql`, `#key-value-store`, `#document-store`, `#wide-column-store`, `#graph-database` | `/topics/database/nosql/` (+ 앵커) |
| `#sql-or-nosql` | `/topics/database/sql-or-nosql/` |
| `#cache` 및 모든 캐시 하위 앵커 | `/topics/cache/` (+ 앵커) |
| `#asynchronism`, `#message-queues`, `#task-queues`, `#back-pressure` | `/topics/asynchronism/` (+ 앵커) |
| `#communication`, `#hypertext-transfer-protocol-http`, `#transmission-control-protocol-tcp`, `#user-datagram-protocol-udp`, `#remote-procedure-call-rpc`, `#representational-state-transfer-rest` | `/topics/communication/` (+ 앵커) |
| `#security` | `/topics/security/` |
| `#how-to-approach-a-system-design-interview-question` | `/interview/approach/` |
| `#appendix`, `#powers-of-two-table` | `/appendix/powers-of-two/` |
| `#latency-numbers-every-programmer-should-know` | `/appendix/latency-numbers/` |
| `#additional-system-design-interview-questions` | `/practice/additional-questions/` |
| `#real-world-architectures` | `/resources/real-world-architectures/` |
| `#company-architectures` | `/resources/company-architectures/` |
| `#company-engineering-blogs` | `/resources/engineering-blogs/` |
| `#system-design-interview-questions-with-solutions` | `/system-design/` |
| `#object-oriented-design-interview-questions-with-solutions` | `/ood/` |
| `#study-guide` | `/guide/` |
| `#contributing`, `#under-development`, `#credits`, `#license`, `#contact-info` | `/about/` |
| `solutions/system_design/<dir>/README.md` | `/system-design/<slug>/` — `pastebin`, `twitter`, `web_crawler`→`web-crawler`, `mint`, `social_graph`→`social-graph`, `query_cache`→`query-cache`, `sales_rank`→`sales-rank`, `scaling_aws`→`scaling-aws` |
| OOD 노트북 | `/ood/hash-map/`, `/ood/lru-cache/`, `/ood/call-center/`, `/ood/deck-of-cards/`, `/ood/parking-lot/`, `/ood/online-chat/` |

### 앵커 레지스트리 (주제 페이지 작성자는 아래 제목을 **글자 그대로** 써야 합니다)

| 페이지 | 제목(Markdown) | 링크 |
|---|---|---|
| availability-vs-consistency | `## CAP 정리 (CAP theorem)` | `/topics/availability-vs-consistency/#cap-정리-cap-theorem` |
| | `### CP: 일관성과 분할 내성` | `#cp-일관성과-분할-내성` |
| | `### AP: 가용성과 분할 내성` | `#ap-가용성과-분할-내성` |
| consistency-patterns | `## 약한 일관성 (Weak consistency)` | `/topics/consistency-patterns/#약한-일관성-weak-consistency` |
| | `## 최종적 일관성 (Eventual consistency)` | `#최종적-일관성-eventual-consistency` |
| | `## 강한 일관성 (Strong consistency)` | `#강한-일관성-strong-consistency` |
| availability-patterns | `## 장애 조치 (Fail-over)` | `/topics/availability-patterns/#장애-조치-fail-over` |
| | `### 액티브-패시브 (Active-passive)` | `#액티브-패시브-active-passive` |
| | `### 액티브-액티브 (Active-active)` | `#액티브-액티브-active-active` |
| | `## 복제 (Replication)` | `#복제-replication` |
| | `## 숫자로 보는 가용성 (Availability in numbers)` | `#숫자로-보는-가용성-availability-in-numbers` |
| cdn | `## Push CDN` / `## Pull CDN` | `/topics/cdn/#push-cdn`, `#pull-cdn` |
| load-balancer | `## L4 로드 밸런싱 (Layer 4 load balancing)` | `/topics/load-balancer/#l4-로드-밸런싱-layer-4-load-balancing` |
| | `## L7 로드 밸런싱 (Layer 7 load balancing)` | `#l7-로드-밸런싱-layer-7-load-balancing` |
| | `## 수평 확장 (Horizontal scaling)` | `#수평-확장-horizontal-scaling` |
| reverse-proxy | `## 로드 밸런서 vs 리버스 프록시` | `/topics/reverse-proxy/#로드-밸런서-vs-리버스-프록시` |
| application-layer | `## 마이크로서비스 (Microservices)` | `/topics/application-layer/#마이크로서비스-microservices` |
| | `## 서비스 디스커버리 (Service discovery)` | `#서비스-디스커버리-service-discovery` |
| database/rdbms | `## 마스터-슬레이브 복제 (Master-slave replication)` | `/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication` |
| | `## 마스터-마스터 복제 (Master-master replication)` | `#마스터-마스터-복제-master-master-replication` |
| | `## 페더레이션 (Federation)` | `#페더레이션-federation` |
| | `## 샤딩 (Sharding)` | `#샤딩-sharding` |
| | `## 비정규화 (Denormalization)` | `#비정규화-denormalization` |
| | `## SQL 튜닝 (SQL tuning)` | `#sql-튜닝-sql-tuning` |
| | `### 좋은 인덱스 사용하기 (Use good indices)` | `#좋은-인덱스-사용하기-use-good-indices` |
| database/nosql | `## 키-값 저장소 (Key-value store)` | `/topics/database/nosql/#키-값-저장소-key-value-store` |
| | `## 문서 저장소 (Document store)` | `#문서-저장소-document-store` |
| | `## 와이드 컬럼 저장소 (Wide column store)` | `#와이드-컬럼-저장소-wide-column-store` |
| | `## 그래프 데이터베이스 (Graph database)` | `#그래프-데이터베이스-graph-database` |
| cache | `## 클라이언트 캐싱 (Client caching)` | `/topics/cache/#클라이언트-캐싱-client-caching` |
| | `## CDN 캐싱 (CDN caching)` | `#cdn-캐싱-cdn-caching` |
| | `## 웹 서버 캐싱 (Web server caching)` | `#웹-서버-캐싱-web-server-caching` |
| | `## 데이터베이스 캐싱 (Database caching)` | `#데이터베이스-캐싱-database-caching` |
| | `## 애플리케이션 캐싱 (Application caching)` | `#애플리케이션-캐싱-application-caching` |
| | `## 데이터베이스 쿼리 수준 캐싱 (Caching at the database query level)` | `#데이터베이스-쿼리-수준-캐싱-caching-at-the-database-query-level` |
| | `## 객체 수준 캐싱 (Caching at the object level)` | `#객체-수준-캐싱-caching-at-the-object-level` |
| | `## 캐시 갱신 전략 (When to update the cache)` | `#캐시-갱신-전략-when-to-update-the-cache` |
| | `### Cache-aside` / `### Write-through` / `### Write-behind (write-back)` / `### Refresh-ahead` | `#cache-aside`, `#write-through`, `#write-behind-write-back`, `#refresh-ahead` |
| asynchronism | `## 메시지 큐 (Message queues)` | `/topics/asynchronism/#메시지-큐-message-queues` |
| | `## 작업 큐 (Task queues)` | `#작업-큐-task-queues` |
| | `## 배압 (Back pressure)` | `#배압-back-pressure` |
| communication | `## HTTP (Hypertext transfer protocol)` | `/topics/communication/#http-hypertext-transfer-protocol` |
| | `## TCP (Transmission control protocol)` | `#tcp-transmission-control-protocol` |
| | `## UDP (User datagram protocol)` | `#udp-user-datagram-protocol` |
| | `## RPC (Remote procedure call)` | `#rpc-remote-procedure-call` |
| | `## REST (Representational state transfer)` | `#rest-representational-state-transfer` |
| | `## RPC와 REST 비교` | `#rpc와-rest-비교` |

주제 페이지 작성자는 위 제목을 정확히 쓰되, 필요한 다른 제목은 자유롭게 추가할 수 있습니다. 같은 페이지에 같은 제목이 두 번 나오면 앵커가 바뀌므로 피하세요.

## 6. Markdown 문법 메모

- Aside: `:::note`, `:::tip`, `:::caution`, `:::danger`, 제목 지정은 `:::tip[제목]`. 닫을 때 `:::`.
- 표는 GFM 표. 원문 표의 `<br/>`는 그대로 써도 됩니다.
- 원문의 `<sup><a href=…>1</a></sup>` 각주 링크는 `<sup>[1](URL)</sup>` 형태로 두면 됩니다.
- `<details>` 안의 Markdown은 `<summary>…</summary>` 다음과 `</details>` 앞에 빈 줄이 있어야 렌더링됩니다.
- 제목에 Markdown 링크나 코드 서식을 넣지 마세요.
