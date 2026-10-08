---
title: Mint.com 설계
description: 금융 계좌의 거래 내역을 가져와 분류하고 예산을 추천하는 Mint.com을 설계하며 큐 기반 비동기 추출, 판매처 기반 분류, MapReduce 집계, 쓰기 위주 확장을 다룹니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/mint/README.md
---

:::note[이 문제에서 배우는 것]
- 쓰기가 읽기보다 10배 많은 **쓰기 위주** 시스템에서 월 50억 건의 거래를 어림 계산하는 법
- 오래 걸리는 거래 추출을 **Queue**와 **Transaction Extraction Service**로 비동기 처리하는 구조
- 판매처-카테고리 딕셔너리와 사용자의 수동 수정(크라우드소싱)으로 거래를 분류하는 **Category Service**
- 소득 구간별 기본 예산 템플릿으로 저장량을 줄이고, **MapReduce**로 카테고리별 월간 지출을 집계하는 법
- cache-aside 방식의 **Memory Cache**, 별도의 **Analytics Database**, 오래된 거래의 **Object Store** 이전으로 확장하는 법
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 거래 추출을 언제, 어떻게 실행할지와 거래를 카테고리로 어떻게 분류할지 스스로 정해 보세요.
:::

:::note
이 문서는 내용 중복을 피하기 위해 [시스템 설계 주제](/topics/)의 관련 부분으로 바로 연결합니다. 일반적인 논의 사항, 트레이드오프, 대안은 링크된 내용을 참고하세요.
:::

## 1단계: 유스케이스, 제약 조건, 가정 정리

> 요구 사항을 모으고 문제의 범위를 정합니다.
> 유스케이스와 제약 조건을 명확히 하기 위해 질문합니다.
> 가정을 논의합니다.

질문에 답해 줄 면접관이 없으므로, 여기서는 유스케이스와 제약 조건을 직접 정의하겠습니다.

### 유스케이스

#### 다음 유스케이스만 다루도록 범위를 정합니다

* **사용자**가 금융 계좌를 연결합니다
* **서비스**가 계좌에서 거래 내역을 추출합니다
    * 매일 업데이트합니다
    * 거래를 카테고리별로 분류합니다
        * 사용자가 카테고리를 직접 수정할 수 있습니다
        * 자동 재분류는 하지 않습니다
    * 카테고리별 월간 지출을 분석합니다
* **서비스**가 예산을 추천합니다
    * 사용자가 예산을 직접 설정할 수 있습니다
    * 예산에 가까워지거나 예산을 초과하면 알림을 보냅니다
* **서비스**는 고가용성을 갖춥니다

#### 범위 밖

* **서비스**가 추가 로깅과 분석을 수행합니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
* 계좌 자동 일일 업데이트는 지난 30일 동안 활동한 사용자에게만 적용합니다
* 금융 계좌를 추가하거나 제거하는 일은 비교적 드뭅니다
* 예산 알림은 즉시 보낼 필요가 없습니다
* 사용자 1,000만 명
    * 사용자당 예산 카테고리 10개 = 예산 항목 1억 개
    * 카테고리 예:
        * 주거(Housing) = $1,000
        * 식비(Food) = $200
        * 주유(Gas) = $100
    * 거래 카테고리는 판매처(seller)로 결정합니다
        * 판매처 50,000곳
* 금융 계좌 3,000만 개
* 월 50억 건의 거래
* 월 5억 건의 읽기 요청
* 쓰기 대 읽기 비율 10:1
    * 쓰기 위주입니다. 사용자는 매일 거래를 하지만, 사이트를 매일 방문하는 사용자는 많지 않습니다

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 거래 하나의 크기:
    * `user_id` - 8바이트
    * `created_at` - 5바이트
    * `seller` - 32바이트
    * `amount` - 5바이트
    * 합계: 약 50바이트
* 매달 새로 생기는 거래 콘텐츠 250 GB
    * 거래당 50바이트 * 월 50억 건
    * 3년이면 새 거래 콘텐츠 9 TB
    * 대부분은 기존 거래의 수정이 아니라 새 거래라고 가정합니다
* 평균 초당 거래 2,000건
* 평균 초당 읽기 요청 200건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 Web Server를 거쳐 Accounts API로 요청하고, Queue를 통해 Transaction Extraction Service가 Category·Budget·Notification Service를 사용하며 SQL과 Object Store에 저장하는 Mint.com 고수준 설계](@repo/solutions/system_design/mint/mint_basic.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자가 금융 계좌를 연결한다

사용자 1,000만 명의 정보는 [관계형 데이터베이스](/topics/database/rdbms/)에 저장할 수 있습니다. [SQL과 NoSQL 중 무엇을 고를지에 대한 유스케이스와 트레이드오프](/topics/database/sql-or-nosql/)를 논의해야 합니다.

* **Client**가 [리버스 프록시](/topics/reverse-proxy/)로 동작하는 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Accounts API** 서버로 전달합니다
* **Accounts API** 서버는 새로 입력된 계좌 정보로 **SQL Database**의 `accounts` 테이블을 업데이트합니다

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

`accounts` 테이블은 다음과 같은 구조로 만들 수 있습니다.

```
id int NOT NULL AUTO_INCREMENT
created_at datetime NOT NULL
last_update datetime NOT NULL
account_url varchar(255) NOT NULL
account_login varchar(32) NOT NULL
account_password_hash char(64) NOT NULL
user_id int NOT NULL
PRIMARY KEY(id)
FOREIGN KEY(user_id) REFERENCES users(id)
```

조회 속도를 높이고(테이블 전체를 스캔하는 대신 로그 시간에 조회) 데이터를 메모리에 유지하기 위해 `id`, `user_id`, `created_at`에 [인덱스](/topics/database/rdbms/#좋은-인덱스-사용하기-use-good-indices)를 만듭니다. 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>

공개 [**REST API**](/topics/communication/#rest-representational-state-transfer)를 사용합니다.

```
$ curl -X POST --data '{ "user_id": "foo", "account_url": "bar", \
    "account_login": "baz", "account_password": "qux" }' \
    https://mint.com/api/v1/account
```

내부 통신에는 [원격 프로시저 호출(RPC)](/topics/communication/#rpc-remote-procedure-call)을 사용할 수 있습니다.

다음으로, 서비스가 계좌에서 거래 내역을 추출합니다.

### 유스케이스: 서비스가 계좌에서 거래 내역을 추출한다

다음과 같은 경우에 계좌에서 정보를 추출해야 합니다.

* 사용자가 계좌를 처음 연결할 때
* 사용자가 계좌를 직접 새로 고칠 때
* 지난 30일 동안 활동한 사용자라면 매일 자동으로

데이터 흐름:

* **Client**가 **Web Server**에 요청을 보냅니다
* **Web Server**는 요청을 **Accounts API** 서버로 전달합니다
* **Accounts API** 서버는 [Amazon SQS](https://aws.amazon.com/sqs/)나 [RabbitMQ](https://www.rabbitmq.com/) 같은 **Queue**에 작업을 넣습니다
    * 거래 추출은 시간이 걸릴 수 있으므로 [큐를 사용해 비동기로](/topics/asynchronism/) 처리하는 편이 좋습니다. 다만 그만큼 복잡도가 늘어납니다
* **Transaction Extraction Service**는 다음을 수행합니다
    * **Queue**에서 작업을 가져와 금융 기관에서 해당 계좌의 거래 내역을 추출하고, 결과를 원시(raw) 로그 파일로 **Object Store**에 저장합니다
    * **Category Service**를 사용해 각 거래를 분류합니다
    * **Budget Service**를 사용해 카테고리별 월간 지출 합계를 계산합니다
        * **Budget Service**는 **Notification Service**를 사용해 사용자에게 예산에 가까워졌거나 예산을 초과했음을 알립니다
    * 분류된 거래로 **SQL Database**의 `transactions` 테이블을 업데이트합니다
    * 카테고리별 월간 지출 합계로 **SQL Database**의 `monthly_spending` 테이블을 업데이트합니다
    * **Notification Service**를 통해 거래 처리가 끝났음을 사용자에게 알립니다
        * **Queue**(그림에는 없음)를 사용해 알림을 비동기로 보냅니다

`transactions` 테이블은 다음과 같은 구조로 만들 수 있습니다.

```
id int NOT NULL AUTO_INCREMENT
created_at datetime NOT NULL
seller varchar(32) NOT NULL
amount decimal NOT NULL
user_id int NOT NULL
PRIMARY KEY(id)
FOREIGN KEY(user_id) REFERENCES users(id)
```

`id`, `user_id`, `created_at`에 [인덱스](/topics/database/rdbms/#좋은-인덱스-사용하기-use-good-indices)를 만듭니다.

`monthly_spending` 테이블은 다음과 같은 구조로 만들 수 있습니다.

```
id int NOT NULL AUTO_INCREMENT
month_year date NOT NULL
category varchar(32)
amount decimal NOT NULL
user_id int NOT NULL
PRIMARY KEY(id)
FOREIGN KEY(user_id) REFERENCES users(id)
```

`id`와 `user_id`에 [인덱스](/topics/database/rdbms/#좋은-인덱스-사용하기-use-good-indices)를 만듭니다.

#### 카테고리 서비스 (Category Service)

**Category Service**에는 가장 인기 있는 판매처로 판매처-카테고리 딕셔너리를 미리 채워 둘 수 있습니다. 판매처를 50,000곳으로 추정하고 항목 하나가 255바이트 미만이라고 추정하면, 딕셔너리는 메모리를 약 12 MB만 차지합니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

```python
class DefaultCategories(Enum):

    HOUSING = 0
    FOOD = 1
    GAS = 2
    SHOPPING = 3
    ...

seller_category_map = {}
seller_category_map['Exxon'] = DefaultCategories.GAS
seller_category_map['Target'] = DefaultCategories.SHOPPING
...
```

처음에 맵에 넣지 않은 판매처는, 사용자들이 직접 수정한 카테고리를 평가하는 크라우드소싱 방식으로 처리할 수 있습니다. 힙(heap)을 사용하면 판매처별 최상위(top) 수동 수정 카테고리를 O(1) 시간에 빠르게 조회할 수 있습니다.

```python
class Categorizer(object):

    def __init__(self, seller_category_map, seller_category_crowd_overrides_map):
        self.seller_category_map = seller_category_map
        self.seller_category_crowd_overrides_map = \
            seller_category_crowd_overrides_map

    def categorize(self, transaction):
        if transaction.seller in self.seller_category_map:
            return self.seller_category_map[transaction.seller]
        elif transaction.seller in self.seller_category_crowd_overrides_map:
            self.seller_category_map[transaction.seller] = \
                self.seller_category_crowd_overrides_map[transaction.seller].peek_min()
            return self.seller_category_map[transaction.seller]
        return None
```

거래 구현:

```python
class Transaction(object):

    def __init__(self, created_at, seller, amount):
        self.created_at = created_at
        self.seller = seller
        self.amount = amount
```

### 유스케이스: 서비스가 예산을 추천한다

우선 소득 구간에 따라 카테고리별 금액을 배분하는 일반적인 예산 템플릿을 사용할 수 있습니다. 이 방식을 쓰면 제약 조건에서 산정한 예산 항목 1억 개를 모두 저장할 필요 없이, 사용자가 직접 변경한 항목만 저장하면 됩니다. 사용자가 예산 카테고리를 변경하면 그 변경 내용을 `TABLE budget_overrides`에 저장할 수 있습니다.

```python
class Budget(object):

    def __init__(self, income):
        self.income = income
        self.categories_to_budget_map = self.create_budget_template()

    def create_budget_template(self):
        return {
            DefaultCategories.HOUSING: self.income * .4,
            DefaultCategories.FOOD: self.income * .2,
            DefaultCategories.GAS: self.income * .1,
            DefaultCategories.SHOPPING: self.income * .2,
            ...
        }

    def override_category_budget(self, category, amount):
        self.categories_to_budget_map[category] = amount
```

**Budget Service**에서는 `transactions` 테이블에 SQL 쿼리를 실행해 `monthly_spending` 집계 테이블을 생성할 수도 있습니다. 사용자는 보통 한 달에 여러 건의 거래를 하므로, `monthly_spending` 테이블의 행 수는 전체 거래 50억 건보다 훨씬 적을 것입니다.

대안으로, 원시 거래 파일에 **MapReduce** 작업을 실행해 다음을 처리할 수 있습니다.

* 각 거래를 분류합니다
* 카테고리별 월간 지출 합계를 생성합니다

거래 파일을 대상으로 분석을 실행하면 데이터베이스 부하를 크게 줄일 수 있습니다.

사용자가 카테고리를 변경하면 **Budget Service**를 호출해 분석을 다시 실행할 수 있습니다.

**코드를 얼마나 작성해야 하는지 면접관에게 확인하세요.**

탭으로 구분한 로그 파일 형식 예시:

```
user_id   timestamp   seller  amount
```

**MapReduce** 구현:

```python
class SpendingByCategory(MRJob):

    def __init__(self, categorizer):
        self.categorizer = categorizer
        self.current_year_month = calc_current_year_month()
        ...

    def calc_current_year_month(self):
        """Return the current year and month."""
        ...

    def extract_year_month(self, timestamp):
        """Return the year and month portions of the timestamp."""
        ...

    def handle_budget_notifications(self, key, total):
        """Call notification API if nearing or exceeded budget."""
        ...

    def mapper(self, _, line):
        """Parse each log line, extract and transform relevant lines.

        Argument line will be of the form:

        user_id   timestamp   seller  amount

        Using the categorizer to convert seller to category,
        emit key value pairs of the form:

        (user_id, 2016-01, shopping), 25
        (user_id, 2016-01, shopping), 100
        (user_id, 2016-01, gas), 50
        """
        user_id, timestamp, seller, amount = line.split('\t')
        category = self.categorizer.categorize(seller)
        period = self.extract_year_month(timestamp)
        if period == self.current_year_month:
            yield (user_id, period, category), amount

    def reducer(self, key, value):
        """Sum values for each key.

        (user_id, 2016-01, shopping), 125
        (user_id, 2016-01, gas), 50
        """
        total = sum(values)
        yield key, sum(values)
```

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

![DNS, CDN, Load Balancer, Read API, Memory Cache, SQL Write Master-Slave와 SQL Read Replicas, Object Store를 추가하고 각 서비스를 여러 대로 늘려 확장한 Mint.com 설계](@repo/solutions/system_design/mint/mint.png)

**중요: 초기 설계에서 최종 설계로 곧바로 건너뛰지 마세요!**

1) **벤치마크/부하 테스트**를 하고, 2) 병목 지점을 **프로파일링**하고, 3) 대안과 트레이드오프를 평가하면서 병목을 해결하고, 4) 이를 반복한다고 설명하세요. 초기 설계를 반복적으로 확장하는 예시는 [AWS에서 수백만 사용자로 확장하기](/system-design/scaling-aws/)를 참고하세요.

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
* [비동기 처리](/topics/asynchronism/)
* [일관성 패턴](/topics/consistency-patterns/)
* [가용성 패턴](/topics/availability-patterns/)

유스케이스를 하나 더 추가합니다. **사용자**가 요약 정보와 거래 내역에 접근합니다.

사용자 세션, 카테고리별 집계 통계, 최근 거래 내역은 Redis나 Memcached 같은 **Memory Cache**에 둘 수 있습니다.

* **Client**가 **Web Server**에 읽기 요청을 보냅니다
* **Web Server**는 요청을 **Read API** 서버로 전달합니다
    * 정적 콘텐츠는 S3 같은 **Object Store**에서 제공할 수 있으며, 이 콘텐츠는 **CDN**에 캐시됩니다
* **Read API** 서버는 다음을 수행합니다
    * **Memory Cache**에서 콘텐츠를 확인합니다
        * URL이 **Memory Cache**에 있으면 캐시된 콘텐츠를 반환합니다
        * 없으면
            * URL이 **SQL Database**에 있으면 콘텐츠를 가져옵니다
                * 가져온 콘텐츠로 **Memory Cache**를 업데이트합니다

트레이드오프와 대안은 [캐시 갱신 전략](/topics/cache/#캐시-갱신-전략-when-to-update-the-cache)을 참고하세요. 위 방식은 [cache-aside](/topics/cache/#cache-aside)에 해당합니다.

`monthly_spending` 집계 테이블을 **SQL Database**에 두는 대신, Amazon Redshift나 Google BigQuery 같은 데이터 웨어하우스 솔루션으로 별도의 **Analytics Database**를 만들 수 있습니다.

데이터베이스에는 한 달 치 `transactions` 데이터만 저장하고, 나머지는 데이터 웨어하우스나 **Object Store**에 저장할 수도 있습니다. Amazon S3 같은 **Object Store**라면 매달 새로 생기는 콘텐츠 250 GB라는 제약 조건을 무리 없이 처리할 수 있습니다.

*평균* 초당 200건(피크 때는 더 많음)의 읽기 요청을 처리하려면, 인기 있는 콘텐츠에 대한 트래픽은 데이터베이스 대신 **Memory Cache**가 처리해야 합니다. **Memory Cache**는 고르지 않게 분포한 트래픽과 트래픽 급증을 처리하는 데에도 유용합니다. 복제본이 쓰기를 복제하느라 과부하에 걸리지 않는 한, 캐시 미스는 **SQL Read Replicas**가 처리할 수 있을 것입니다.

*평균* 초당 2,000건(피크 때는 더 많음)의 거래 쓰기는 **SQL Write Master-Slave** 하나로 감당하기 어려울 수 있습니다. 추가적인 SQL 확장 패턴을 적용해야 할 수도 있습니다.

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

- **쓰기 위주 워크로드**: 쓰기가 읽기의 10배(평균 초당 거래 2,000건, 읽기 200건)라는 점이 설계를 좌우합니다. 단일 **SQL Write Master-Slave**로는 버거울 수 있어 페더레이션, 샤딩 같은 SQL 확장 패턴을 검토하고, 데이터베이스에는 한 달 치 거래만 두고 나머지는 데이터 웨어하우스나 **Object Store**로 옮깁니다.
- **큐 기반 비동기 추출**: 거래 추출은 오래 걸리므로 **Accounts API**는 **Queue**에 작업만 넣고 **Transaction Extraction Service**가 처리합니다. 응답성은 좋아지지만 복잡도가 늘어나는 트레이드오프가 있습니다. 자동 일일 업데이트를 최근 30일 안에 활동한 사용자로 한정해 부하도 줄입니다.
- **원시 로그 보존과 배치 집계**: 추출 결과를 원시 로그 파일로 **Object Store**에 남겨 두면, 분류와 카테고리별 월간 집계를 **MapReduce**로 실행할 수 있어 데이터베이스 부하를 크게 줄일 수 있습니다. 사용자가 카테고리를 바꾸면 **Budget Service**가 분석을 다시 실행합니다.
- **분류와 예산의 저장량 최적화**: 판매처 50,000곳의 딕셔너리는 약 12 MB라서 메모리에 충분히 들어가고, 처음 보는 판매처는 사용자들의 수동 수정을 크라우드소싱해 채웁니다. 예산은 소득 구간별 템플릿을 쓰고 사용자가 바꾼 항목만 `budget_overrides`에 저장해 1억 개 항목을 모두 저장하지 않아도 됩니다.
- **읽기 경로 캐싱**: 세션, 카테고리별 집계, 최근 거래는 **Memory Cache**에 cache-aside 방식으로 두고, 정적 콘텐츠는 **Object Store**와 **CDN**으로 제공합니다. `monthly_spending` 같은 집계는 별도의 **Analytics Database**로 분리할 수 있습니다.
