---
title: 추가 시스템 설계 면접 질문 (Additional questions)
description: 자주 나오는 시스템 설계 면접 질문 23개와 각 문제를 푸는 데 도움이 되는 참고 자료를 모았습니다. 해설 문제를 끝낸 뒤 연습 문제로 활용하세요.
original: https://github.com/donnemartin/system-design-primer#additional-system-design-interview-questions
---

> 자주 나오는 시스템 설계 면접 질문과, 각 문제를 푸는 방법을 다룬 참고 자료 링크입니다.

이 목록에는 해설이 없습니다. 그래서 실전처럼 연습하기에 좋습니다. 질문을 하나 고른 뒤 [시스템 설계 면접 접근법](/interview/approach/)의 4단계(유스케이스·제약 조건 정리 → 고수준 설계 → 핵심 구성 요소 설계 → 확장)에 따라 직접 설계해 보세요. 사용자 수, 초당 요청 수, 저장해야 할 데이터 양 같은 수치는 [어림 계산](/interview/estimation/)으로 직접 추정해 봅니다. 설계를 마친 다음에 참고 자료를 읽고, 내 설계에서 놓친 구성 요소와 트레이드오프가 무엇인지 비교하세요.

| 질문 | 참고 자료 |
|---|---|
| Dropbox 같은 파일 동기화 서비스 설계 | [youtube.com](https://www.youtube.com/watch?v=PE4gwstWhmc) |
| Google 같은 검색 엔진 설계 | [queue.acm.org](http://queue.acm.org/detail.cfm?id=988407)<br/>[stackexchange.com](http://programmers.stackexchange.com/questions/38324/interview-question-how-would-you-implement-google-search)<br/>[ardendertat.com](http://www.ardendertat.com/2012/01/11/implementing-search-engines/)<br/>[stanford.edu](http://infolab.stanford.edu/~backrub/google.html) |
| Google 같은 확장 가능한 웹 크롤러 설계 | [quora.com](https://www.quora.com/How-can-I-build-a-web-crawler-from-scratch) |
| Google Docs 설계 | [code.google.com](https://code.google.com/p/google-mobwrite/)<br/>[neil.fraser.name](https://neil.fraser.name/writing/sync/) |
| Redis 같은 키-값 저장소 설계 | [codecapsule.com](http://codecapsule.com/2012/11/07/ikvs-implementing-a-key-value-store-table-of-contents/)<br/>[allthingsdistributed.com](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) |
| Memcached 같은 캐시 시스템 설계 | [slideshare.net](http://www.slideshare.net/oemebamo/introduction-to-memcached) |
| Amazon 같은 추천 시스템 설계 | [hulu.com](https://web.archive.org/web/20170406065247/http://tech.hulu.com/blog/2011/09/19/recommendation-system.html)<br/>[ijcai13.org](http://ijcai13.org/files/tutorial_slides/td3.pdf) |
| Bitly 같은 URL 단축(tinyurl) 시스템 설계 | [n00tc0d3r.blogspot.com](http://n00tc0d3r.blogspot.com/) |
| WhatsApp 같은 채팅 앱 설계 | [highscalability.com](http://highscalability.com/blog/2014/2/26/the-whatsapp-architecture-facebook-bought-for-19-billion.html) |
| Instagram 같은 사진 공유 시스템 설계 | [highscalability.com](http://highscalability.com/flickr-architecture)<br/>[highscalability.com](http://highscalability.com/blog/2011/12/6/instagram-architecture-14-million-users-terabytes-of-photos.html) |
| Facebook 뉴스 피드 기능 설계 | [quora.com](http://www.quora.com/What-are-best-practices-for-building-something-like-a-News-Feed)<br/>[quora.com](http://www.quora.com/Activity-Streams/What-are-the-scaling-issues-to-keep-in-mind-while-developing-a-social-network-feed)<br/>[slideshare.net](http://www.slideshare.net/danmckinley/etsy-activity-feeds-architecture) |
| Facebook 타임라인 기능 설계 | [facebook.com](https://www.facebook.com/note.php?note_id=10150468255628920)<br/>[highscalability.com](http://highscalability.com/blog/2012/1/23/facebook-timeline-brought-to-you-by-the-power-of-denormaliza.html) |
| Facebook 채팅 기능 설계 | [erlang-factory.com](http://www.erlang-factory.com/upload/presentations/31/EugeneLetuchy-ErlangatFacebook.pdf)<br/>[facebook.com](https://www.facebook.com/note.php?note_id=14218138919&id=9445547199&index=0) |
| Facebook 같은 그래프 검색 기능 설계 | [facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-building-out-the-infrastructure-for-graph-search/10151347573598920)<br/>[facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-indexing-and-ranking-in-graph-search/10151361720763920)<br/>[facebook.com](https://www.facebook.com/notes/facebook-engineering/under-the-hood-the-natural-language-interface-of-graph-search/10151432733048920) |
| CloudFlare 같은 콘텐츠 전송 네트워크(CDN) 설계 | [figshare.com](https://figshare.com/articles/Globally_distributed_content_delivery/6605972) |
| Twitter 같은 트렌딩 토픽 시스템 설계 | [michael-noll.com](http://www.michael-noll.com/blog/2013/01/18/implementing-real-time-trending-topics-in-storm/)<br/>[snikolov .wordpress.com](http://snikolov.wordpress.com/2012/11/14/early-detection-of-twitter-trends/) |
| 랜덤 ID 생성 시스템 설계 | [blog.twitter.com](https://blog.twitter.com/2010/announcing-snowflake)<br/>[github.com](https://github.com/twitter/snowflake/) |
| 특정 시간 구간 동안의 상위 k개 요청 반환하기 | [cs.ucsb.edu](https://www.cs.ucsb.edu/sites/default/files/documents/2005-23.pdf)<br/>[wpi.edu](http://davis.wpi.edu/xmdv/docs/EDBT11-diyang.pdf) |
| 여러 데이터 센터에서 데이터를 제공하는 시스템 설계 | [highscalability.com](http://highscalability.com/blog/2009/8/24/how-google-serves-data-from-multiple-datacenters.html) |
| 온라인 멀티플레이어 카드 게임 설계 | [indieflashblog.com](https://web.archive.org/web/20180929181117/http://www.indieflashblog.com/how-to-create-an-asynchronous-multiplayer-game.html)<br/>[buildnewgames.com](http://buildnewgames.com/real-time-multiplayer/) |
| 가비지 컬렉션 시스템 설계 | [stuffwithstuff.com](http://journal.stuffwithstuff.com/2013/12/08/babys-first-garbage-collector/)<br/>[washington.edu](http://courses.cs.washington.edu/courses/csep521/07wi/prj/rick.pdf) |
| API 처리율 제한기(rate limiter) 설계 | [https://stripe.com/blog/](https://stripe.com/blog/rate-limiters) |
| NASDAQ이나 Binance 같은 증권 거래소 설계 | [Jane Street](https://youtu.be/b1e4t2k2KJY)<br/>[Golang Implementation](https://around25.com/blog/building-a-trading-engine-for-a-crypto-exchange/)<br/>[Go Implementation](http://bhomnick.net/building-a-simple-limit-order-in-go/) |
| 시스템 설계 질문 추가하기 | [기여하기](/about/#기여하기) |

:::tip[이렇게 활용하세요]
- [학습 가이드](/guide/)는 준비 기간이 짧으면 이 목록의 **일부**, 보통이면 **많은** 문제, 길면 **대부분**을 검토하라고 권합니다. 해설이 있는 [시스템 설계 면접 문제](/system-design/)를 먼저 풀고 이 목록으로 넘어가면 좋습니다.
- 비슷한 해설이 있는 문제는 설계를 마친 뒤 해설과 비교해 보세요. 예를 들어 Bitly 같은 URL 단축 시스템은 [Pastebin.com (또는 Bit.ly) 설계](/system-design/pastebin/), 검색 엔진과 웹 크롤러는 [웹 크롤러 설계](/system-design/web-crawler/), Facebook 뉴스 피드·타임라인은 [Twitter 타임라인과 검색 설계](/system-design/twitter/)와 이어집니다.
- 시스템 설계 면접은 **열린 대화**이고, 대화는 여러분이 이끌어야 합니다. 혼자 연습할 때도 요구 사항을 묻고 가정을 정리하는 과정을 소리 내어 말해 보세요.
- 모든 것은 트레이드오프입니다. 참고 자료를 읽을 때는 정답을 외우기보다 병목이 어디서 생기고 어떤 방법으로 해결했는지, 그 대가는 무엇인지에 집중하세요.
:::
