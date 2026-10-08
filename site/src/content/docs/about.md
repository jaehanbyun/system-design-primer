---
title: 이 사이트에 대해
description: 이 학습 사이트의 원저작물과 라이선스, 번역·재구성 원칙, 원문이 작성 중인 주제, 감사의 말과 기여 방법을 안내합니다.
original: https://github.com/donnemartin/system-design-primer#motivation
---

이 사이트는 Donne Martin의 [The System Design Primer](https://github.com/donnemartin/system-design-primer)를 한국어로 옮기고, 원문의 **학습 가이드(Study guide)** 를 중심으로 다시 구성한 학습용 사이트입니다.

## 원문의 목표

> 대규모 시스템을 설계하는 방법을 배웁니다.
>
> 시스템 설계 면접을 준비합니다.

### 대규모 시스템 설계 배우기

확장 가능한 시스템을 설계하는 방법을 배우면 더 나은 엔지니어가 될 수 있습니다.

시스템 설계는 범위가 넓은 주제입니다. 시스템 설계 원칙에 관한 **자료는 웹 곳곳에 방대하게 흩어져 있습니다**. 원문 저장소는 대규모 시스템을 만드는 방법을 배우는 데 도움이 되는 자료를 **체계적으로 모은 것**입니다.

### 오픈 소스 커뮤니티에서 배우기

원문은 계속 업데이트되는 오픈 소스 프로젝트입니다. 기여를 환영합니다.

### 시스템 설계 면접 준비하기

많은 테크 기업에서 시스템 설계는 코딩 면접과 함께 **기술 면접 과정의 필수 요소**입니다. **자주 나오는 시스템 설계 면접 문제를 연습**하고, 그 결과를 토론 내용·코드·다이어그램이 담긴 **예시 해설과 비교**해 보세요.

면접 준비를 위한 다른 주제:

- [학습 가이드](/guide/)
- [시스템 설계 면접 접근법](/interview/approach/)
- [시스템 설계 면접 문제, **해설 포함**](/system-design/)
- [객체 지향 설계 면접 문제, **해설 포함**](/ood/)
- [추가 시스템 설계 면접 질문](/practice/additional-questions/)

## 이 사이트에서 달라진 점

| 항목 | 내용 |
|---|---|
| 언어 | 원문(영어)을 한국어로 옮겼습니다. 실무에서 영어로 쓰는 용어는 영어를 함께 적었습니다. |
| 구성 | 한 페이지였던 README를 주제별 페이지로 나누고, 학습 가이드의 기간별 표를 [단기](/guide/short/)·[중기](/guide/medium/)·[장기](/guide/long/) 체크리스트로 만들었습니다. |
| 학습 장치 | 주제 페이지마다 **핵심 요약**, **면접에서는**, **스스로 점검하기**를, 해설마다 **이 문제에서 배우는 것**과 **복습 포인트**를 덧붙였습니다. 번역 페이지에서는 원문에 없는 내용을 이처럼 따로 구분된 섹션에 둡니다. |
| 도구 | [플래시카드](/practice/flashcards/), [어림 계산기](/interview/estimation/), [가용성 계산기](/topics/availability-patterns/), [지연 시간 차트](/appendix/latency-numbers/)를 추가했습니다. |
| 해설 코드 | 객체 지향 설계 해설의 파이썬 코드는 원문 저장소의 `.py` 파일을 그대로 불러와 보여 줍니다. |
| 이미지 | 원문 저장소의 이미지를 그대로 사용합니다. 해설의 imgur 이미지는 저장소 안의 같은 파일로 바꿨습니다. |

원문과 다르게 읽히는 부분이 있다면 각 페이지 제목 아래의 **원문 (English)** 링크로 원문을 확인하세요. 번역 오류는 페이지 아래의 **페이지 편집** 링크로 바로 고칠 수 있습니다.

## 원문에서 작성 중인 주제

원문에서 아직 작성 중(under development)인 주제입니다. 해설에서 이 주제로 연결된 링크는 이 절을 가리킵니다. 섹션을 새로 추가하거나 작성 중인 섹션을 완성하고 싶다면 원문에 기여해 주세요.

- MapReduce를 이용한 분산 컴퓨팅
- 일관된 해싱(Consistent hashing)
- 스캐터 개더(Scatter gather)

## 기여하기

> 커뮤니티에서 배웁니다.

원문은 다음과 같은 풀 리퀘스트를 환영합니다.

- 오류 수정
- 섹션 개선
- 새 섹션 추가
- [번역](https://github.com/donnemartin/system-design-primer/issues/28)

다듬어야 할 내용은 위의 **원문에서 작성 중인 주제**에 모아 둡니다.

원문 내용 자체를 고치거나 새 문제를 추가하려면 원문 저장소의 [기여 가이드라인](https://github.com/donnemartin/system-design-primer/blob/master/CONTRIBUTING.md)을 따라 원문 저장소에 기여해 주세요. 한국어 번역과 이 사이트의 구성에 대한 수정은 이 저장소의 `site/` 디렉터리에서 할 수 있습니다.

## 감사의 말

출처와 참고 자료는 원문 곳곳에 표시되어 있습니다. 원문 저자는 특히 다음 자료에 감사를 표합니다.

- [Hired in tech](http://www.hiredintech.com/system-design/the-system-design-process/)
- [Cracking the coding interview](https://www.amazon.com/dp/0984782850/)
- [High scalability](http://highscalability.com/)
- [checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)
- [shashank88/system_design](https://github.com/shashank88/system_design)
- [mmcgrana/services-engineering](https://github.com/mmcgrana/services-engineering)
- [System design cheat sheet](https://gist.github.com/vasanthk/485d1c25737e8e72759f)
- [A distributed systems reading list](http://dancres.github.io/Pages/)
- [Cracking the system design interview](http://www.puncsky.com/blog/2016-02-13-crack-the-system-design-interview)

## 연락처

원문에 관한 이슈, 질문, 의견이 있다면 원문 저자에게 편하게 연락하세요. 연락처는 원문 저자의 [GitHub 페이지](https://github.com/donnemartin)에서 확인할 수 있습니다.

## 라이선스

원문 저자는 원문의 코드와 자료를 오픈 소스 라이선스로 제공합니다. 원문은 저자의 개인 저장소이므로, 라이선스는 저자의 고용주(Facebook)가 아니라 저자 개인이 부여합니다.

    Copyright 2017 Donne Martin

    Creative Commons Attribution 4.0 International License (CC BY 4.0)

    http://creativecommons.org/licenses/by/4.0/

이 사이트의 번역과 재구성도 원저작물과 같은 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)으로 제공하며, 라이선스 조건에 따라 원저작자를 표시하고 변경 사항(한국어 번역, 페이지 분할, 학습용 요약·점검 질문·도구 추가)을 위와 같이 밝힙니다.
