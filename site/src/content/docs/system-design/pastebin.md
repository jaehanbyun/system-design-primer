---
title: Pastebin.com (또는 Bit.ly) 설계
description: 텍스트를 붙여 넣으면 단축 링크를 돌려주는 Pastebin을 설계하며 고유 URL 생성, 메타데이터와 본문 저장소 분리, 읽기 위주 트래픽 확장을 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/pastebin/README.md
---

:::note[이 문제에서 배우는 것]
- 월 1,000만 건 쓰기, 1억 건 읽기라는 가정에서 저장 용량과 초당 요청 수를 어림 계산하는 법
- MD5 해시와 Base 62 인코딩으로 7자리 단축 링크(shortlink)를 만들고 중복을 확인하는 법
- 작은 메타데이터는 **SQL Database**에, 붙여 넣은 본문은 **Object Store**에 나눠 저장하는 설계
- 실시간이 필요 없는 페이지 분석을 **Web Server** 로그와 **MapReduce**로 처리하는 법
- 읽기 위주 트래픽을 **Memory Cache**와 **SQL Read Replicas**로 흡수하며 설계를 단계적으로 확장하는 법
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 고유한 단축 링크를 어떻게 만들지, 붙여 넣은 내용을 어디에 저장할지 스스로 정해 보세요.
:::

:::note
이 문서는 내용 중복을 피하기 위해 [시스템 설계 주제](/topics/)의 관련 부분으로 바로 연결합니다. 일반적인 논의 사항, 트레이드오프, 대안은 링크된 내용을 참고하세요.
:::

**Bit.ly 설계**도 비슷한 문제입니다. 다만 Pastebin은 단축되기 전의 원래 URL 대신 붙여 넣은 내용(paste) 자체를 저장해야 한다는 점이 다릅니다.

## 1단계: 유스케이스, 제약 조건, 가정 정리

> 요구 사항을 모으고 문제의 범위를 정합니다.
> 유스케이스와 제약 조건을 명확히 하기 위해 질문합니다.
> 가정을 논의합니다.

질문에 답해 줄 면접관이 없으므로, 여기서는 유스케이스와 제약 조건을 직접 정의하겠습니다.

### 유스케이스

#### 다음 유스케이스만 다루도록 범위를 정합니다

* **사용자**가 텍스트 블록을 입력하면 무작위로 생성된 링크를 받습니다
    * 만료
        * 기본 설정은 만료되지 않음
        * 선택적으로 만료 시간을 지정할 수 있음
* **사용자**가 paste의 URL을 입력하고 내용을 봅니다
* **사용자**는 익명입니다
* **서비스**가 페이지 분석 정보를 추적합니다
    * 월별 방문 통계
* **서비스**가 만료된 paste를 삭제합니다
* **서비스**는 고가용성을 갖춥니다

#### 범위 밖

* **사용자**가 계정을 등록합니다
    * **사용자**가 이메일을 인증합니다
* **사용자**가 등록한 계정으로 로그인합니다
    * **사용자**가 문서를 편집합니다
* **사용자**가 공개 범위를 설정할 수 있습니다
* **사용자**가 단축 링크를 직접 지정할 수 있습니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
* 단축 링크를 따라가는 동작은 빨라야 합니다
* paste는 텍스트만 다룹니다
* 페이지 조회 분석은 실시간일 필요가 없습니다
* 사용자 1,000만 명
* 월 1,000만 건의 paste 쓰기
* 월 1억 건의 paste 읽기
* 읽기 대 쓰기 비율 10:1

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* paste 하나의 크기
    * paste당 콘텐츠 1 KB
    * `shortlink` - 7바이트
    * `expiration_length_in_minutes` - 4바이트
    * `created_at` - 5바이트
    * `paste_path` - 255바이트
    * 합계 = 약 1.27 KB
* 매달 새로 생기는 paste 콘텐츠 12.7 GB
    * paste당 1.27 KB * 월 1,000만 건
    * 3년이면 새 paste 콘텐츠 약 450 GB
    * 3년이면 단축 링크 3억 6,000만 개
    * 대부분은 기존 paste의 수정이 아니라 새 paste라고 가정합니다
* 평균 초당 paste 쓰기 4건
* 평균 초당 읽기 요청 40건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server로 요청하고, Web Server가 Write API와 Read API로 전달하며, 이들과 Analytics가 SQL과 Object Store를 사용하는 Pastebin 고수준 설계](@repo/solutions/system_design/pastebin/pastebin_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자가 텍스트 블록을 입력하면 무작위로 생성된 링크를 받는다

[관계형 데이터베이스](/topics/database/rdbms/)를 거대한 해시 테이블처럼 사용해, 생성된 URL을 paste 파일이 있는 파일 서버와 경로에 매핑할 수 있습니다.

파일 서버를 직접 관리하는 대신 Amazon S3 같은 관리형 **Object Store**나 [NoSQL 문서 저장소](/topics/database/nosql/#문서-저장소-document-store)를 쓸 수도 있습니다.

관계형 데이터베이스를 거대한 해시 테이블로 쓰는 대신 [NoSQL 키-값 저장소](/topics/database/nosql/#키-값-저장소-key-value-store)를 쓰는 방법도 있습니다. [SQL과 NoSQL 중 무엇을 고를지에 대한 트레이드오프](/topics/database/sql-or-nosql/)를 논의해야 합니다. 아래에서는 관계형 데이터베이스를 쓰는 방식으로 설명합니다.

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 paste 생성 요청을 보냅니다
* **Web Server**는 요청을 **Write API** 서버로 전달합니다
* **Write API** 서버는 다음을 수행합니다
    * 고유한 URL을 생성합니다
        * **SQL Database**에 중복이 있는지 조회해 URL이 고유한지 확인합니다
        * URL이 고유하지 않으면 다른 URL을 생성합니다
        * 사용자 지정 URL을 지원한다면 사용자가 입력한 URL을 쓸 수 있습니다(이때도 중복을 확인합니다)
    * **SQL Database**의 `pastes` 테이블에 저장합니다
    * paste 데이터를 **Object Store**에 저장합니다
    * URL을 반환합니다

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

`pastes` 테이블은 다음과 같은 구조로 만들 수 있습니다.

```
shortlink char(7) NOT NULL
expiration_length_in_minutes int NOT NULL
created_at datetime NOT NULL
paste_path varchar(255) NOT NULL
PRIMARY KEY(shortlink)
```

기본 키를 `shortlink` 열로 지정하면, 데이터베이스가 고유성을 보장하는 데 쓰는 [인덱스](/topics/database/rdbms/#좋은-인덱스-사용하기-use-good-indices)가 만들어집니다. 조회 속도를 높이고(테이블 전체를 스캔하는 대신 로그 시간에 조회) 데이터를 메모리에 유지하기 위해 `created_at`에도 인덱스를 추가로 만듭니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

고유한 URL은 다음과 같이 생성할 수 있습니다.

* 사용자의 ip_address + timestamp로 [**MD5**](https://en.wikipedia.org/wiki/MD5) 해시를 구합니다
    * MD5는 128비트 해시 값을 만드는, 널리 쓰이는 해시 함수입니다
    * MD5의 출력은 균등하게 분포합니다
    * 무작위로 생성한 데이터의 MD5 해시를 사용해도 됩니다
* MD5 해시를 [**Base 62**](https://www.kerstner.at/2012/07/shortening-strings-using-base-62-encoding/)로 인코딩합니다
    * Base 62는 `[a-zA-Z0-9]`로 인코딩하므로 URL에 잘 맞고, 특수 문자를 이스케이프할 필요가 없습니다
    * 원래 입력에 대한 해시 결과는 하나뿐이고, Base 62는 결정적(deterministic)입니다(무작위성이 없습니다)
    * Base 64도 많이 쓰이는 인코딩이지만, 추가로 쓰이는 `+`와 `/` 문자 때문에 URL에서 문제가 생깁니다
    * 다음 [Base 62 의사 코드](http://stackoverflow.com/questions/742013/how-to-code-a-url-shortener)는 O(k) 시간에 실행되며, 여기서 k는 자릿수 = 7입니다

```python
def base_encode(num, base=62):
    digits = []
    while num > 0
      remainder = modulo(num, base)
      digits.push(remainder)
      num = divide(num, base)
    digits = digits.reverse
```

* 출력의 처음 7자를 취합니다. 그러면 가능한 값이 62^7개가 되므로, 3년 동안 단축 링크 3억 6,000만 개라는 제약 조건을 처리하기에 충분합니다

```python
url = base_encode(md5(ip_address+timestamp))[:URL_LENGTH]
```

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl -X POST --data '{ "expiration_length_in_minutes": "60", \
    "paste_contents": "Hello World!" }' https://pastebin.com/api/v1/paste
```

응답:

```
{
    "shortlink": "foobar"
}
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

### 유스케이스: 사용자가 paste의 URL을 입력하고 내용을 본다

* **Client**가 **Web Server**에 paste 조회 요청을 보냅니다
* **Web Server**는 요청을 **Read API** 서버로 전달합니다
* **Read API** 서버는 다음을 수행합니다
    * **SQL Database**에서 생성된 URL을 확인합니다
        * URL이 **SQL Database**에 있으면 **Object Store**에서 paste 내용을 가져옵니다
        * 없으면 사용자에게 오류 메시지를 반환합니다

REST API:

```
$ curl https://pastebin.com/api/v1/paste?shortlink=foobar
```

응답:

```
{
    "paste_contents": "Hello World"
    "created_at": "YYYY-MM-DD HH:MM:SS"
    "expiration_length_in_minutes": "60"
}
```

### 유스케이스: 서비스가 페이지 분석 정보를 추적한다

실시간 분석은 요구 사항이 아니므로, **Web Server** 로그를 **MapReduce**로 처리해 조회 수를 집계하면 됩니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

```python
class HitCounts(MRJob):

    def extract_url(self, line):
        """Extract the generated url from the log line."""
        ...

    def extract_year_month(self, line):
        """Return the year and month portions of the timestamp."""
        ...

    def mapper(self, _, line):
        """Parse each log line, extract and transform relevant lines.

        Emit key value pairs of the form:

        (2016-01, url0), 1
        (2016-01, url0), 1
        (2016-01, url1), 1
        """
        url = self.extract_url(line)
        period = self.extract_year_month(line)
        yield (period, url), 1

    def reducer(self, key, values):
        """Sum values for each key.

        (2016-01, url0), 2
        (2016-01, url1), 1
        """
        yield key, sum(values)
```

### 유스케이스: 서비스가 만료된 paste를 삭제한다

만료된 paste를 삭제하려면 **SQL Database**를 스캔해 만료 타임스탬프가 현재 타임스탬프보다 이전인 항목을 모두 찾으면 됩니다. 그런 다음 만료된 항목을 모두 테이블에서 삭제하거나 만료됨으로 표시합니다.

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, CDN, Load Balancer, 여러 대의 Web Server와 Write API·Read API·Analytics, Memory Cache, SQL Write Master-Slave와 SQL Read Replicas, SQL Analytics, Object Store로 확장한 Pastebin 설계](@repo/solutions/system_design/pastebin/pastebin.png)

**중요: 초기 설계에서 최종 설계로 곧바로 건너뛰지 마세요!**

이 과정을 반복적으로 진행한다고 설명하세요. 1) **벤치마크/부하 테스트**를 하고, 2) 병목 지점을 **프로파일링**하고, 3) 대안과 트레이드오프를 평가하면서 병목을 해결하고, 4) 이를 반복합니다. 초기 설계를 반복적으로 확장하는 예시는 [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/)를 참고하세요.

초기 설계에서 어떤 병목을 만날 수 있고 각 병목을 어떻게 해결할지 논의하는 것이 중요합니다. 예를 들어 여러 대의 **Web Server**와 함께 **Load Balancer**를 추가하면 어떤 문제가 해결될까요? **CDN**은요? **Master-Slave Replicas**는요? 각각의 대안과 **트레이드오프**는 무엇일까요?

설계를 완성하고 확장성 문제를 해결하기 위해 몇 가지 구성 요소를 추가합니다. 다이어그램이 복잡해지지 않도록 내부 로드 밸런서는 표시하지 않았습니다.

*논의가 반복되지 않도록*, 주요 논의 사항, 트레이드오프, 대안은 다음 [시스템 설계 주제](/topics/)를 참고하세요.

* [DNS](/topics/dns/)
* [CDN](/topics/cdn/)
* [로드 밸런서](/topics/load-balancer/)
* [수평 확장](/topics/load-balancer/#수평-확장-horizontal-scaling)
* [웹 서버(리버스 프록시)](/topics/reverse-proxy/)
* [API 서버(애플리케이션 계층)](/topics/application-layer/)
* [캐시](/topics/cache/)
* [관계형 데이터베이스 관리 시스템(RDBMS)](/topics/database/rdbms/)
* [SQL 쓰기 마스터-슬레이브 장애 조치(failover)](/topics/availability-patterns/#장애-조치-fail-over)
* [마스터-슬레이브 복제](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication)
* [일관성 패턴](/topics/consistency-patterns/)
* [가용성 패턴](/topics/availability-patterns/)

**Analytics Database**에는 Amazon Redshift나 Google BigQuery 같은 데이터 웨어하우스 솔루션을 사용할 수 있습니다.

Amazon S3 같은 **Object Store**라면 매달 새로 생기는 콘텐츠 12.7 GB라는 제약 조건을 무리 없이 처리할 수 있습니다.

*평균* 초당 40건(피크 때는 더 많음)의 읽기 요청을 처리하려면, 인기 있는 콘텐츠에 대한 트래픽은 데이터베이스 대신 **Memory Cache**가 처리해야 합니다. **Memory Cache**는 고르지 않게 분포한 트래픽과 트래픽 급증을 처리하는 데에도 유용합니다. 복제본이 쓰기를 복제하느라 과부하에 걸리지 않는 한, 캐시 미스는 **SQL Read Replicas**가 처리할 수 있을 것입니다.

*평균* 초당 4건(피크 때는 더 많음)의 paste 쓰기는 **SQL Write Master-Slave** 하나로도 감당할 수 있을 것입니다. 그렇지 않다면 추가적인 SQL 확장 패턴을 적용해야 합니다.

* [페더레이션](/topics/database/rdbms/#페더레이션-federation)
* [샤딩](/topics/database/rdbms/#샤딩-sharding)
* [비정규화](/topics/database/rdbms/#비정규화-denormalization)
* [SQL 튜닝](/topics/database/rdbms/#sql-튜닝-sql-tuning)

일부 데이터를 **NoSQL Database**로 옮기는 것도 고려해야 합니다.

## 추가 논의 사항

> 문제의 범위와 남은 시간에 따라 더 깊이 다뤄 볼 만한 주제입니다.

### NoSQL

* [키-값 저장소](/topics/database/nosql/#키-값-저장소-key-value-store)
* [문서 저장소](/topics/database/nosql/#문서-저장소-document-store)
* [와이드 컬럼 저장소](/topics/database/nosql/#와이드-컬럼-저장소-wide-column-store)
* [그래프 데이터베이스](/topics/database/nosql/#그래프-데이터베이스-graph-database)
* [SQL vs NoSQL](/topics/database/sql-or-nosql/)

### 캐싱

* 어디에 캐시할 것인가
    * [클라이언트 캐싱](/topics/cache/#클라이언트-캐싱-client-caching)
    * [CDN 캐싱](/topics/cache/#cdn-캐싱-cdn-caching)
    * [웹 서버 캐싱](/topics/cache/#웹-서버-캐싱-web-server-caching)
    * [데이터베이스 캐싱](/topics/cache/#데이터베이스-캐싱-database-caching)
    * [애플리케이션 캐싱](/topics/cache/#애플리케이션-캐싱-application-caching)
* 무엇을 캐시할 것인가
    * [데이터베이스 쿼리 수준 캐싱](/topics/cache/#데이터베이스-쿼리-수준-캐싱-caching-at-the-database-query-level)
    * [객체 수준 캐싱](/topics/cache/#객체-수준-캐싱-caching-at-the-object-level)
* 캐시를 언제 갱신할 것인가
    * [Cache-aside](/topics/cache/#cache-aside)
    * [Write-through](/topics/cache/#write-through)
    * [Write-behind (write-back)](/topics/cache/#write-behind-write-back)
    * [Refresh ahead](/topics/cache/#refresh-ahead)

### 비동기 처리와 마이크로서비스

* [메시지 큐](/topics/asynchronism/#메시지-큐-message-queues)
* [작업 큐](/topics/asynchronism/#작업-큐-task-queues)
* [배압(back pressure)](/topics/asynchronism/#배압-back-pressure)
* [마이크로서비스](/topics/application-layer/#마이크로서비스-microservices)

### 통신

* 트레이드오프를 논의하세요
    * 클라이언트와의 외부 통신 - [REST를 따르는 HTTP API](/topics/communication/#rest-representational-state-transfer)
    * 내부 통신 - [RPC](/topics/communication/#rpc-remote-procedure-call)
* [서비스 디스커버리](/topics/application-layer/#서비스-디스커버리-service-discovery)

### 보안

[보안 섹션](/topics/security/)을 참고하세요.

### 지연 시간 수치

[모든 프로그래머가 알아야 할 지연 시간 수치](/appendix/latency-numbers/)를 참고하세요.

### 지속적으로 할 일

* 병목이 생길 때마다 해결할 수 있도록 시스템을 계속 벤치마킹하고 모니터링하세요
* 확장은 반복적인 과정입니다

## 복습 포인트

- **메타데이터와 본문 분리**: 단축 링크, 만료 시간, 경로 같은 작은 메타데이터는 `shortlink`를 기본 키로 둔 **SQL Database**에, 실제 paste 내용은 **Object Store**에 저장합니다. 매달 12.7 GB씩 늘어나는 콘텐츠는 S3 같은 객체 저장소가 무리 없이 감당합니다.
- **단축 링크 생성**: ip_address + timestamp의 MD5 해시를 Base 62로 인코딩하고 앞 7자를 씁니다. 62^7개의 값이면 3년간 3억 6,000만 개를 감당하기에 충분하고, 충돌은 **SQL Database**에서 중복을 확인해 다시 생성하는 방식으로 처리합니다. Base 64는 `+`, `/` 문자 때문에 URL에 맞지 않습니다.
- **SQL과 NoSQL의 트레이드오프**: 같은 "거대한 해시 테이블" 역할을 NoSQL 키-값 저장소로도 할 수 있으므로, 어느 쪽을 고르든 그 이유를 설명할 수 있어야 합니다.
- **실시간이 아닌 작업은 배치로**: 월별 방문 통계는 **Web Server** 로그를 **MapReduce**로 집계하고, 결과는 Redshift나 BigQuery 같은 **Analytics Database**에 둡니다. 만료된 paste도 주기적으로 스캔해 삭제하거나 만료됨으로 표시합니다.
- **읽기 위주 트래픽 확장**: 읽기가 쓰기의 10배이므로 인기 콘텐츠는 **Memory Cache**가, 캐시 미스는 **SQL Read Replicas**가 처리합니다. 평균 초당 4건의 쓰기는 **SQL Write Master-Slave** 하나로 충분하고, 부족해지면 페더레이션, 샤딩, 비정규화, SQL 튜닝을 검토합니다.
- **반복적 확장**: 최종 설계로 곧바로 건너뛰지 말고 벤치마크 → 프로파일링 → 병목 해결 → 반복의 순서로 확장한다고 설명합니다.
