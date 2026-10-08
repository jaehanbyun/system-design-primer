---
title: AWS에서 수백만 사용자로 확장하기
description: 단일 EC2 서버에서 출발해 병목을 찾고 해결하는 과정을 반복하며, 사용자 1명에서 수천만 명까지 감당하도록 AWS 아키텍처를 단계적으로 확장합니다.
original: https://github.com/donnemartin/system-design-primer/blob/master/solutions/system_design/scaling_aws/README.md
---

:::note[이 문제에서 배우는 것]
- 벤치마크/부하 테스트 → 프로파일링 → 병목 해결 → 반복으로 기본 설계를 확장 가능한 설계로 발전시키는 접근법
- 단일 서버에서 시작해 정적 콘텐츠와 데이터베이스를 분리하고, **Load Balancer**·수평 확장·**CDN**을 더해 가는 순서
- 읽기 부하는 **Memory Cache**와 **MySQL Read Replicas**로, 시간대별 트래픽 변동은 **Autoscaling**으로 다루는 법
- 규모가 더 커질 때 데이터 웨어하우스, SQL 확장 패턴, NoSQL, **Queue**와 **Worker Service**를 이용한 비동기 처리로 넘어가는 시점
- 단계마다 함께 챙겨야 하는 보안(VPC, 포트 제한, 암호화)과 모니터링
:::

:::tip[먼저 직접 풀어 보세요]
45분 타이머를 맞추고 [4단계 접근법](/interview/approach/)으로 먼저 설계해 본 뒤 해설과 비교하세요. 특히 사용자가 늘어날 때마다 어떤 병목이 먼저 나타날지, 그때 무엇을 추가할지 순서대로 적어 보세요.
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

이 문제는 1) **벤치마크/부하 테스트**를 하고, 2) 병목 지점을 **프로파일링**하고, 3) 대안과 트레이드오프를 평가하면서 병목을 해결하고, 4) 이를 반복하는 반복적인 접근으로 풉니다. 기본 설계를 확장 가능한 설계로 발전시킬 때 쓰기 좋은 패턴입니다.

AWS 경력이 있거나 AWS 지식이 필요한 직무에 지원하는 경우가 아니라면 AWS 고유의 세부 사항까지 알 필요는 없습니다. 하지만 **이 연습에서 다루는 원칙의 상당수는 AWS 생태계 밖에서도 일반적으로 적용할 수 있습니다.**

#### 다음 유스케이스만 다루도록 범위를 정합니다

* **사용자**가 읽기 또는 쓰기 요청을 보냅니다
    * **서비스**는 요청을 처리하고 사용자 데이터를 저장한 뒤 결과를 반환합니다
* **서비스**는 소수의 사용자를 처리하던 수준에서 수백만 명을 처리하는 수준으로 발전해야 합니다
    * 많은 사용자와 요청을 처리하도록 아키텍처를 발전시키면서 일반적인 확장 패턴을 논의합니다
* **서비스**는 고가용성을 갖춥니다

### 제약 조건과 가정

#### 가정 세우기

* 트래픽은 고르게 분포하지 않습니다
* 관계형 데이터가 필요합니다
* 사용자 1명에서 수천만 명까지 확장합니다
    * 사용자 증가를 다음과 같이 표기합니다
        * Users+
        * Users++
        * Users+++
        * ...
    * 사용자 1,000만 명
    * 월 10억 건의 쓰기
    * 월 1,000억 건의 읽기
    * 읽기 대 쓰기 비율 100:1
    * 쓰기 1건당 콘텐츠 1 KB

#### 사용량 계산

**어림 계산(back-of-the-envelope)을 해야 하는지 면접관에게 확인하세요.**

* 매달 새로 생기는 콘텐츠 1 TB
    * 쓰기당 1 KB * 월 10억 건의 쓰기
    * 3년이면 새 콘텐츠 36 TB
    * 대부분의 쓰기는 기존 콘텐츠의 수정이 아니라 새 콘텐츠라고 가정합니다
* 평균 초당 쓰기 400건
* 평균 초당 읽기 40,000건

간단한 환산표:

* 한 달은 약 250만 초
* 초당 요청 1건 = 월 250만 건
* 초당 요청 40건 = 월 1억 건
* 초당 요청 400건 = 월 10억 건

## 2단계: 고수준 설계

> 중요한 구성 요소를 모두 담아 고수준 설계의 윤곽을 그립니다.

![Client가 DNS를 조회한 뒤 단일 Web Server에 요청하는 초기 고수준 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_1.png)

## 3단계: 핵심 구성 요소 설계

> 핵심 구성 요소를 하나씩 자세히 살펴봅니다.

### 유스케이스: 사용자가 읽기 또는 쓰기 요청을 보낸다

#### 목표

* 사용자가 1~2명뿐이라면 기본 구성만 있으면 됩니다
    * 단순하게 서버 한 대로 구성합니다
    * 필요할 때 수직 확장합니다
    * 모니터링으로 병목을 파악합니다

#### 서버 한 대로 시작하기

* EC2에서 실행하는 **Web server**
    * 사용자 데이터 저장소
    * [**MySQL Database**](/topics/database/rdbms/)

**수직 확장**(Vertical Scaling)을 사용합니다.

* 더 큰 서버를 고르기만 하면 됩니다
* 어떻게 스케일 업할지 판단하기 위해 지표를 지켜봅니다
    * 기본적인 모니터링으로 병목을 파악합니다: CPU, 메모리, IO, 네트워크 등
    * CloudWatch, top, nagios, statsd, graphite 등
* 수직 확장은 비용이 매우 커질 수 있습니다
* 중복 구성(redundancy)이나 장애 조치(failover)가 없습니다

*트레이드오프, 대안, 추가 세부 사항:*

* **수직 확장**의 대안은 [**수평 확장**](/topics/load-balancer/#수평-확장-horizontal-scaling)입니다

#### SQL로 시작하고 NoSQL을 고려하기

제약 조건에서 관계형 데이터가 필요하다고 가정했습니다. 우선 서버 한 대에서 **MySQL Database**를 사용하는 것으로 시작할 수 있습니다.

*트레이드오프, 대안, 추가 세부 사항:*

* [관계형 데이터베이스 관리 시스템(RDBMS)](/topics/database/rdbms/) 섹션을 참고하세요
* [SQL과 NoSQL](/topics/database/sql-or-nosql/) 중 무엇을 쓸지, 그 이유를 논의하세요

#### 고정 공인 IP 할당하기

* Elastic IP는 재부팅해도 IP가 바뀌지 않는 공개 엔드포인트를 제공합니다
* 장애 조치에 도움이 됩니다. 도메인이 새 IP를 가리키도록 바꾸기만 하면 됩니다

#### DNS 사용하기

Route 53 같은 **DNS**를 추가해 도메인을 인스턴스의 공인 IP에 매핑합니다.

*트레이드오프, 대안, 추가 세부 사항:*

* [도메인 네임 시스템](/topics/dns/) 섹션을 참고하세요

#### 웹 서버 보안 강화하기

* 꼭 필요한 포트만 엽니다
    * 웹 서버가 다음 포트로 들어오는 요청에 응답하도록 허용합니다
        * HTTP용 80
        * HTTPS용 443
        * 화이트리스트에 등록된 IP에만 SSH용 22
    * 웹 서버가 외부로 나가는 연결을 먼저 시작하지 못하게 막습니다

*트레이드오프, 대안, 추가 세부 사항:*

* [보안](/topics/security/) 섹션을 참고하세요

## 4단계: 설계 확장

> 주어진 제약 조건에서 병목을 찾아 해결합니다.

### 사용자+ (Users+)

![Web Server 뒤에 SQL 데이터베이스와 Object Store를 분리해 둔 Users+ 단계 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_2.png)

#### 가정

사용자 수가 늘기 시작하면서 서버 한 대에 걸리는 부하가 커지고 있습니다. **벤치마크/부하 테스트**와 **프로파일링** 결과를 보면 **MySQL Database**가 점점 더 많은 메모리와 CPU를 차지하고, 사용자 콘텐츠가 디스크 공간을 채우고 있습니다.

지금까지는 **수직 확장**으로 이런 문제를 해결할 수 있었습니다. 하지만 비용이 꽤 많이 들게 되었고, **MySQL Database**와 **Web Server**를 독립적으로 확장할 수도 없습니다.

#### 목표

* 서버 한 대의 부하를 줄이고 독립적으로 확장할 수 있게 합니다
    * 정적 콘텐츠를 **Object Store**에 따로 저장합니다
    * **MySQL Database**를 별도 서버로 옮깁니다
* 단점
    * 이런 변경은 복잡도를 높이고, **Web Server**가 **Object Store**와 **MySQL Database**를 가리키도록 수정해야 합니다
    * 새 구성 요소를 보호하기 위한 추가 보안 조치가 필요합니다
    * AWS 비용도 늘 수 있지만, 비슷한 시스템을 직접 운영하는 비용과 비교해 따져 봐야 합니다

#### 정적 콘텐츠를 따로 저장하기

* 정적 콘텐츠를 저장할 때는 S3 같은 관리형 **Object Store** 사용을 고려합니다
    * 확장성과 안정성이 매우 높습니다
    * 서버 측 암호화를 지원합니다
* 정적 콘텐츠를 S3로 옮깁니다
    * 사용자 파일
    * JS
    * CSS
    * 이미지
    * 동영상

#### MySQL 데이터베이스를 별도 서버로 옮기기

* **MySQL Database** 관리에는 RDS 같은 서비스 사용을 고려합니다
    * 관리와 확장이 쉽습니다
    * 여러 가용 영역(availability zone)을 지원합니다
    * 저장 데이터 암호화(encryption at rest)를 지원합니다

#### 시스템 보안 강화하기

* 전송 중인 데이터와 저장된 데이터를 암호화합니다
* 가상 사설 클라우드(Virtual Private Cloud, VPC)를 사용합니다
    * 단일 **Web Server**가 인터넷과 트래픽을 주고받을 수 있도록 퍼블릭 서브넷을 만듭니다
    * 나머지 모든 구성 요소는 프라이빗 서브넷에 두어 외부 접근을 막습니다
    * 구성 요소마다 화이트리스트에 등록된 IP에만 포트를 엽니다
* 이후 단계에서 추가하는 새 구성 요소에도 같은 패턴을 적용해야 합니다

*트레이드오프, 대안, 추가 세부 사항:*

* [보안](/topics/security/) 섹션을 참고하세요

### 사용자++ (Users++)

![CDN, Load Balancer, 여러 대의 Web Server, Write API와 Read API, SQL Write Master-Slave, Object Store를 갖춘 Users++ 단계 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_3.png)

#### 가정

**벤치마크/부하 테스트**와 **프로파일링** 결과, 피크 시간대에 단일 **Web Server**가 병목이 되어 응답이 느려지고 때로는 서비스가 중단되기도 합니다. 서비스가 성숙해 가면서 가용성과 중복성(redundancy)도 높이고 싶습니다.

#### 목표

* 다음 목표는 **Web Server**의 확장 문제를 해결하기 위한 것입니다
    * **벤치마크/부하 테스트**와 **프로파일링** 결과에 따라 이 중 한두 가지만 적용해도 충분할 수 있습니다
* [**수평 확장**](/topics/load-balancer/#수평-확장-horizontal-scaling)으로 늘어나는 부하를 처리하고 단일 장애 지점(SPOF)을 없앱니다
    * Amazon ELB나 HAProxy 같은 [**Load Balancer**](/topics/load-balancer/)를 추가합니다
        * ELB는 고가용성을 제공합니다
        * **Load Balancer**를 직접 구성한다면, 여러 가용 영역에 걸쳐 여러 서버를 [액티브-액티브](/topics/availability-patterns/#액티브-액티브-active-active)나 [액티브-패시브](/topics/availability-patterns/#액티브-패시브-active-passive) 방식으로 두면 가용성이 높아집니다
        * **Load Balancer**에서 SSL을 종료(termination)해 백엔드 서버의 연산 부하를 줄이고 인증서 관리를 단순하게 만듭니다
    * 여러 가용 영역에 분산된 여러 대의 **Web Server**를 사용합니다
    * 여러 가용 영역에 걸쳐 여러 **MySQL** 인스턴스를 [**Master-Slave Failover**](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication) 모드로 운영해 중복성을 높입니다
* **Web Server**와 [**Application Server**](/topics/application-layer/)를 분리합니다
    * 두 계층을 독립적으로 확장하고 구성합니다
    * **Web Server**는 [**Reverse Proxy**](/topics/reverse-proxy/)로 동작할 수 있습니다
    * 예를 들어 어떤 **Application Server**는 **Read API**를, 다른 서버는 **Write API**를 처리하도록 추가할 수 있습니다
* 정적(그리고 일부 동적) 콘텐츠를 CloudFront 같은 [**Content Delivery Network (CDN)**](/topics/cdn/)으로 옮겨 부하와 지연 시간을 줄입니다

*트레이드오프, 대안, 추가 세부 사항:*

* 자세한 내용은 위에 연결한 링크를 참고하세요

### 사용자+++ (Users+++)

![Users++ 구성에 Memory Cache와 SQL Read Replicas를 추가한 Users+++ 단계 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_4.png)

**참고:** 다이어그램이 복잡해지지 않도록 **Internal Load Balancers**는 표시하지 않았습니다.

#### 가정

**벤치마크/부하 테스트**와 **프로파일링** 결과, 읽기가 압도적으로 많고(쓰기 대비 100:1) 많은 읽기 요청 때문에 데이터베이스 성능이 떨어지고 있습니다.

#### 목표

* 다음 목표는 **MySQL Database**의 확장 문제를 해결하기 위한 것입니다
    * **벤치마크/부하 테스트**와 **프로파일링** 결과에 따라 이 중 한두 가지만 적용해도 충분할 수 있습니다
* 부하와 지연 시간을 줄이기 위해 다음 데이터를 Elasticache 같은 [**Memory Cache**](/topics/cache/)로 옮깁니다
    * **MySQL**에서 자주 접근하는 콘텐츠
        * **Memory Cache**를 도입하기 전에, 먼저 **MySQL Database**의 캐시 설정만으로 병목이 해소되는지 확인해 봅니다
    * **Web Server**의 세션 데이터
        * **Web Server**가 무상태(stateless)가 되어 **Autoscaling**이 가능해집니다
    * 메모리에서 1 MB를 순차적으로 읽는 데는 약 250마이크로초가 걸리지만, SSD에서는 4배, 디스크에서는 80배 더 오래 걸립니다.<sup>[1](/appendix/latency-numbers/)</sup>
* 쓰기 마스터의 부하를 줄이기 위해 [**MySQL Read Replicas**](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication)를 추가합니다
* 응답성을 높이기 위해 **Web Server**와 **Application Server**를 더 추가합니다

*트레이드오프, 대안, 추가 세부 사항:*

* 자세한 내용은 위에 연결한 링크를 참고하세요

#### MySQL 읽기 복제본 추가하기

* **Memory Cache**를 추가하고 확장하는 것 외에도, **MySQL Read Replicas**로 **MySQL Write Master**의 부하를 덜 수 있습니다
* **Web Server**에 쓰기와 읽기를 분리하는 로직을 추가합니다
* **MySQL Read Replicas** 앞에 **Load Balancer**를 추가합니다(다이어그램이 복잡해지지 않도록 표시하지 않았습니다)
* 대부분의 서비스는 쓰기보다 읽기가 많습니다

*트레이드오프, 대안, 추가 세부 사항:*

* [관계형 데이터베이스 관리 시스템(RDBMS)](/topics/database/rdbms/) 섹션을 참고하세요

### 사용자++++ (Users++++)

![Web Server, Write API, Read API를 각각 Autoscale 그룹으로 묶은 Users++++ 단계 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_5.png)

#### 가정

**벤치마크/부하 테스트**와 **프로파일링** 결과, 트래픽이 미국의 일반 업무 시간에 급증했다가 사용자가 퇴근하면 크게 줄어듭니다. 실제 부하에 따라 서버를 자동으로 늘리고 줄이면 비용을 아낄 수 있을 것 같습니다. 작은 조직이므로 **Autoscaling**과 일반 운영에 필요한 DevOps를 최대한 자동화하고 싶습니다.

#### 목표

* 필요한 만큼 용량을 확보하도록 **Autoscaling**을 추가합니다
    * 트래픽 급증에 대응합니다
    * 사용하지 않는 인스턴스를 꺼서 비용을 줄입니다
* DevOps를 자동화합니다
    * Chef, Puppet, Ansible 등
* 병목을 해결하기 위해 지표를 계속 모니터링합니다
    * **호스트 수준** - EC2 인스턴스 하나를 살펴봅니다
    * **집계 수준** - 로드 밸런서 통계를 살펴봅니다
    * **로그 분석** - CloudWatch, CloudTrail, Loggly, Splunk, Sumo
    * **외부에서 본 사이트 성능** - Pingdom 또는 New Relic
    * **알림과 장애 대응** - PagerDuty
    * **오류 보고** - Sentry

#### 오토스케일링 추가하기

* AWS **Autoscaling** 같은 관리형 서비스를 고려합니다
    * **Web Server**용 그룹 하나와 **Application Server** 유형마다 그룹 하나씩을 만들고, 각 그룹을 여러 가용 영역에 배치합니다
    * 최소 및 최대 인스턴스 수를 설정합니다
    * CloudWatch를 통해 스케일 업과 스케일 다운을 트리거합니다
        * 부하를 예측할 수 있다면 단순한 시간대 지표를 쓰거나
        * 일정 기간 동안의 지표를 씁니다
            * CPU 부하
            * 지연 시간
            * 네트워크 트래픽
            * 사용자 정의 지표
    * 단점
        * 오토스케일링은 복잡도를 높일 수 있습니다
        * 늘어난 수요에 맞춰 시스템이 적절히 스케일 업되거나, 수요가 줄었을 때 스케일 다운되기까지 시간이 걸릴 수 있습니다

### 사용자+++++ (Users+++++)

![Write API Async와 Queue, Worker Service, NoSQL, 샤딩과 페더레이션을 적용한 SQL을 추가한 Users+++++ 단계 설계](@repo/solutions/system_design/scaling_aws/scaling_aws_7.png)

**참고:** 다이어그램이 복잡해지지 않도록 **Autoscaling** 그룹은 표시하지 않았습니다.

#### 가정

서비스가 제약 조건에서 제시한 수치를 향해 계속 성장하면서, **벤치마크/부하 테스트**와 **프로파일링**을 반복 실행해 새로운 병목을 찾아내고 해결합니다.

#### 목표

문제의 제약 조건 때문에 생기는 확장 문제를 계속 해결해 나갑니다.

* **MySQL Database**가 너무 커지기 시작하면, 데이터베이스에는 일정 기간의 데이터만 저장하고 나머지는 Redshift 같은 데이터 웨어하우스에 저장하는 방법을 고려할 수 있습니다
    * Redshift 같은 데이터 웨어하우스는 매달 새로 생기는 콘텐츠 1 TB라는 제약 조건을 무리 없이 처리할 수 있습니다
* 평균 초당 40,000건의 읽기 요청이 들어오므로, 인기 있는 콘텐츠에 대한 읽기 트래픽은 **Memory Cache**를 확장해 처리할 수 있습니다. **Memory Cache**는 고르지 않게 분포한 트래픽과 트래픽 급증을 처리하는 데에도 유용합니다
    * **SQL Read Replicas**가 캐시 미스를 감당하기 어려울 수 있으므로, 추가적인 SQL 확장 패턴을 적용해야 할 것입니다
* 평균 초당 400건의 쓰기(피크는 이보다 훨씬 높을 것으로 예상)는 **SQL Write Master-Slave** 하나로는 버거울 수 있습니다. 이 역시 추가적인 확장 기법이 필요하다는 뜻입니다

SQL 확장 패턴에는 다음이 있습니다.

* [페더레이션](/topics/database/rdbms/#페더레이션-federation)
* [샤딩](/topics/database/rdbms/#샤딩-sharding)
* [비정규화](/topics/database/rdbms/#비정규화-denormalization)
* [SQL 튜닝](/topics/database/rdbms/#sql-튜닝-sql-tuning)

많은 읽기·쓰기 요청을 더 잘 처리하려면, 적절한 데이터를 DynamoDB 같은 [**NoSQL Database**](/topics/database/nosql/)로 옮기는 것도 고려해야 합니다.

[**Application Server**](/topics/application-layer/)를 더 세분화해 독립적으로 확장할 수도 있습니다. 실시간으로 처리하지 않아도 되는 배치 작업이나 연산은 **Queue**와 **Worker**를 이용해 [**비동기**](/topics/asynchronism/)로 처리할 수 있습니다.

* 예를 들어 사진 서비스라면 사진 업로드와 썸네일 생성을 분리할 수 있습니다
    * **Client**가 사진을 업로드합니다
    * **Application Server**가 SQS 같은 **Queue**에 작업을 넣습니다
    * EC2나 Lambda에서 실행되는 **Worker Service**가 **Queue**에서 작업을 꺼낸 뒤 다음을 수행합니다
        * 썸네일을 만듭니다
        * **Database**를 갱신합니다
        * 썸네일을 **Object Store**에 저장합니다

*트레이드오프, 대안, 추가 세부 사항:*

* 자세한 내용은 위에 연결한 링크를 참고하세요

## 추가 논의 사항

> 문제의 범위와 남은 시간에 따라 더 깊이 다뤄 볼 만한 주제입니다.

### SQL 확장 패턴

* [읽기 복제본](/topics/database/rdbms/#마스터-슬레이브-복제-master-slave-replication)
* [페더레이션](/topics/database/rdbms/#페더레이션-federation)
* [샤딩](/topics/database/rdbms/#샤딩-sharding)
* [비정규화](/topics/database/rdbms/#비정규화-denormalization)
* [SQL 튜닝](/topics/database/rdbms/#sql-튜닝-sql-tuning)

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

- **측정이 확장을 이끈다**: 처음부터 최종 아키텍처를 그리지 않고, 벤치마크/부하 테스트 → 프로파일링 → 병목 해결 → 반복의 루프를 돌면서 실제로 드러난 병목에 맞는 기법만 추가합니다. 단계마다 "한두 가지만 적용해도 충분할 수 있다"는 점을 기억하세요.
- **수직 확장에서 분리로**: 서버 한 대를 키우는 수직 확장은 단순하지만 비싸고 중복 구성이 없습니다. 정적 콘텐츠를 S3 같은 **Object Store**로, 데이터베이스를 별도 서버(RDS 같은 관리형 서비스)로 분리하는 것이 독립적인 확장의 첫걸음입니다.
- **웹 계층의 수평 확장**: **Web Server**가 병목이 되면 **Load Balancer** 뒤에 여러 가용 영역의 **Web Server**를 두고, 웹 계층과 애플리케이션 계층을 분리하며, 정적 콘텐츠는 **CDN**으로 내보냅니다. **MySQL**은 Master-Slave Failover로 중복성을 확보합니다.
- **읽기 부하와 무상태 서버**: 읽기 대 쓰기 비율이 100:1이므로 **Memory Cache**와 **MySQL Read Replicas**로 쓰기 마스터의 부하를 덜어 줍니다. 세션 데이터를 캐시로 옮기면 **Web Server**가 무상태가 되어 **Autoscaling**이 가능해집니다.
- **더 큰 규모에서의 선택지**: 데이터가 커지면 데이터 웨어하우스로 오래된 데이터를 옮기고, 쓰기·캐시 미스가 한계를 넘으면 페더레이션, 샤딩, 비정규화, SQL 튜닝, NoSQL을 검토합니다. 실시간일 필요가 없는 작업은 **Queue**와 **Worker Service**로 비동기 처리합니다.
- **보안과 운영은 단계마다 함께**: VPC의 퍼블릭/프라이빗 서브넷 분리, 화이트리스트 기반 포트 개방, 전송 중·저장 데이터 암호화를 새 구성 요소에도 똑같이 적용하고, 호스트·집계·로그·외부 성능 모니터링으로 다음 병목을 찾습니다.
