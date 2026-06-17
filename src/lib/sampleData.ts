import { DailyContent, Term } from "./store";

// ============================================================
// Day 1: 架构整洁之道 — 什么是整洁的架构？
// ============================================================
const day1Terms: Term[] = [
  {
    id: "term-001",
    term: "架构整洁",
    english: "Clean Architecture",
    definition: "由Robert C. Martin提出的软件架构设计原则，核心思想是将业务逻辑与框架、数据库、UI等外部关注点分离，通过依赖反转原则使系统各层只依赖抽象接口而非具体实现。",
    example: "一个电商系统，业务规则层不依赖任何Web框架，即使从Express迁移到Fastify，核心逻辑无需修改。",
    relatedTerms: ["依赖反转", "关注点分离"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-002",
    term: "依赖反转原则",
    english: "Dependency Inversion Principle (DIP)",
    definition: "SOLID五原则之一。高层模块不应依赖低层模块，两者都应依赖抽象；抽象不应依赖细节，细节应依赖抽象。目的是解耦模块间的直接依赖关系。",
    example: "订单服务不直接调用MySQL数据库类，而是调用IRepository接口，具体数据库实现由注入决定。",
    relatedTerms: ["架构整洁", "控制反转"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-003",
    term: "关注点分离",
    english: "Separation of Concerns (SoC)",
    definition: "将软件系统划分为多个互不重叠的功能区域，每个区域只负责一个明确的关注点。目的是降低复杂度，使每个部分可独立理解和修改。",
    example: "将用户认证逻辑从业务逻辑中分离出来，形成独立的AuthService模块。",
    relatedTerms: ["架构整洁", "单一职责原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-004",
    term: "单一职责原则",
    english: "Single Responsibility Principle (SRP)",
    definition: "SOLID五原则之一。一个模块应该只有一个引起它变化的原因。换句话说，一个模块只负责一个职责，避免将不相关的功能耦合在一起。",
    example: "一个User类只管理用户数据，不负责发送邮件通知——后者应由独立的NotificationService处理。",
    relatedTerms: ["关注点分离", "高内聚"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-005",
    term: "控制反转",
    english: "Inversion of Control (IoC)",
    definition: "一种设计范式，将程序中对象的创建和依赖关系的管理权从程序代码转移给外部容器或框架。依赖注入（DI）是控制反转最常见的实现方式。",
    example: "Spring框架通过IoC容器管理Bean的生命周期和依赖关系，开发者只需声明依赖，无需手动new对象。",
    relatedTerms: ["依赖反转原则", "依赖注入"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day1Content: DailyContent = {
  dayNum: 1,
  readingTitle: "Day 1：架构整洁之道 — 什么是整洁的架构？",
  readingContent: `今天我们来读《架构整洁之道》的第一章和第二章的核心内容。这本书的作者是被誉为"代码大叔"的Robert C. Martin（简称Uncle Bob），他是SOLID原则的提出者之一，也是敏捷宣言的签署者。

## 为什么要谈架构整洁？

Uncle Bob在书中开篇就提出了一个尖锐的问题：为什么软件架构师们花费大量时间讨论框架、数据库、UI技术，却很少讨论最重要的东西——业务逻辑？

这就是架构整洁的核心命题：架构的首要目标是支撑业务，而不是支撑技术选型。一个架构整洁的系统，其业务逻辑应该像一颗钻石——无论外面包裹什么框架、什么数据库、什么UI，核心业务规则始终清晰、独立、可测试。

## 关注点分离：架构的第一性原理

Uncle Bob认为，软件架构的本质就是关注点分离。将系统划分为多个独立的模块，每个模块只负责一个明确的职责。这听起来简单，但在实际工程中，我们常常看到这样的代码：

一个Controller类里既有HTTP请求解析，又有业务逻辑判断，还有数据库查询和邮件发送。这就是典型的关注点混杂——一个模块承担了太多职责，任何一个变化都会影响整个模块。

## 依赖反转原则：让架构"倒"过来

传统的分层架构中，高层模块依赖低层模块：Controller依赖Service，Service依赖Repository，Repository依赖Database。这种依赖方向意味着：业务逻辑被数据库技术绑架了。

Uncle Bob提出的依赖反转原则要求我们反转这个方向：所有层都依赖抽象接口。Service不依赖具体的MySQL Repository，而是依赖IRepository接口。这样，当你需要把MySQL换成PostgreSQL时，Service层一行代码都不用改。

这就是"整洁"的含义：业务逻辑不被任何外部细节污染。

## 控制反转：框架的正确使用方式

控制反转是依赖反转的技术实现。不是你的代码调用框架，而是框架调用你的代码。你只需要实现框架定义的接口，框架负责在正确的时机调用你。

这就像一家公司：不是CEO亲自做每件事（直接依赖），而是CEO定义岗位职责（接口），然后 hire 合适的人来填充（依赖注入）。

## 今日小结

架构整洁的核心，是让业务逻辑成为系统的中心，所有外部技术都是可替换的"插件"。这不是一个技术决策，而是一个业务决策——它保护的是企业最核心的资产：业务规则。`,
  discussionQuestions: [
    "在你当前的项目中，业务逻辑和框架/数据库的耦合程度如何？请举一个具体的例子。",
    "依赖反转原则要求'所有层都依赖抽象接口'——你认为在实际项目中，哪些层最容易被忽视？为什么？",
    "Uncle Bob说'架构的首要目标是支撑业务'。在你的采购系统项目中，有哪些业务规则是你认为必须与任何技术选型解耦的？",
  ],
  reflectionPrompts: [
    "今天学到的三个核心概念（关注点分离、依赖反转、控制反转）中，哪一个对你触动最大？为什么？",
    "回顾你过去写过的代码，有没有哪个模块违反了单一职责原则？如果重新设计，你会怎么改？",
  ],
  terms: day1Terms,
};

// ============================================================
// Day 2: SOLID 原则深度解析
// ============================================================
const day2Terms: Term[] = [
  {
    id: "term-006",
    term: "开闭原则",
    english: "Open-Closed Principle (OCP)",
    definition: "SOLID五原则之一。软件实体（类、模块、函数等）应该对扩展开放，对修改关闭。即在不修改已有代码的前提下，通过扩展来增加新功能。",
    example: "一个报表导出功能，通过定义IExportStrategy接口，新增Excel导出时只需实现新类，无需修改原有的导出调度器。",
    relatedTerms: ["策略模式", "依赖反转原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-007",
    term: "里氏替换原则",
    english: "Liskov Substitution Principle (LSP)",
    definition: "SOLID五原则之一。子类型必须能够替换其基类型而不改变程序的正确性。如果S是T的子类型，那么在所有使用T的地方都可以用S替换，而不会产生错误。",
    example: "如果Bird类有fly()方法，Penguin继承Bird但不能飞，就违反了LSP。正确做法是将飞行能力抽取为IFlyable接口。",
    relatedTerms: ["接口隔离原则", "多态"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-008",
    term: "接口隔离原则",
    english: "Interface Segregation Principle (ISP)",
    definition: "SOLID五原则之一。客户端不应该被迫依赖它不使用的接口。应该将大接口拆分为多个小接口，每个接口只包含客户端实际需要的方法。",
    example: "一个IWorker接口拆分为IWorkable和IEatable，因为机器人不需要吃饭。这样实现类只需依赖自己需要的接口。",
    relatedTerms: ["单一职责原则", "依赖反转原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-009",
    term: "策略模式",
    english: "Strategy Pattern",
    definition: "一种行为型设计模式，定义一系列算法（策略），把它们封装起来并使它们可以互相替换。策略模式让算法的变化独立于使用算法的客户端。",
    example: "电商系统的折扣计算：定义IDiscountStrategy接口，有满减策略、会员折扣策略、无折扣策略等，运行时按需切换。",
    relatedTerms: ["开闭原则", "多态"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-010",
    term: "SOLID原则",
    english: "SOLID Principles",
    definition: "面向对象设计的五个基本原则的缩写：S-单一职责、O-开闭、L-里氏替换、I-接口隔离、D-依赖反转。由Robert C. Martin在21世纪初系统整理提出，是整洁架构的理论基石。",
    example: "在设计一个采购审批系统时，用SRP拆分职责、用OCP支持新审批规则、用LSP确保审批类型可替换、用ISP精简接口、用DIP解耦数据库。",
    relatedTerms: ["架构整洁", "单一职责原则", "开闭原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day2Content: DailyContent = {
  dayNum: 2,
  readingTitle: "Day 2：SOLID 原则深度解析 — 从 OCP 到 DIP",
  readingContent: `昨天我们了解了架构整洁的全貌，今天深入SOLID五原则中的后四个——开闭原则、里氏替换原则、接口隔离原则和依赖反转原则的实践细节。

## 开闭原则：架构的"可进化性"

开闭原则（OCP）是Uncle Bob认为最重要的原则。它的核心思想是：系统的行为应该可以通过扩展来改变，而不是通过修改已有代码。

这听起来很理想化，但Uncle Bob指出，OCP的关键在于"抽象"。当你面对一个会变化的需求时，不要直接修改已有代码，而是引入一个抽象接口，让变化发生在接口的实现层。

举个例子：你的采购系统需要支持多种审批流程——普通采购、紧急采购、大额采购。如果直接在审批Service里写if-else，每次新增审批类型都要改代码。但如果你定义IApprovalStrategy接口，每种审批类型实现自己的策略，新增类型就只需要添加新类。

## 里氏替换原则：继承的正确使用

里氏替换原则（LSP）经常被忽视，但它对架构的影响很大。Uncle Bob在书中用了一个经典例子：正方形继承矩形。

矩形的setHeight和setWidth方法会分别改变宽和高。但正方形继承矩形后，setHeight会同时改变宽和高——这违反了矩形的行为契约。当你把正方形当作矩形使用时，程序行为就不正确了。

LSP告诉我们：子类不能改变父类的行为契约。在架构层面，这意味着你的模块之间通过接口交互时，任何实现都必须遵守接口定义的行为规范。

## 接口隔离原则：小而精的契约

接口隔离原则（ISP）要求我们将大接口拆分为小接口。Uncle Bob指出，接口隔离不仅仅是"方法少一点"，更重要的是"按角色分离"。

在你的供应商管理系统中，一个ISupplier接口可能包含：提交报价、查看订单、对账结算、质量投诉。但一个临时供应商可能只需要"提交报价"。把大接口拆分为ISupplierQuoter、ISupplierViewer等小接口，每个角色只依赖自己需要的部分。

## 依赖反转原则的深层含义

昨天我们初步了解了DIP，今天Uncle Bob进一步指出：依赖反转不仅仅是"面向接口编程"，它更是一种架构分层的策略。

在整洁架构中，所有的依赖方向都指向内——指向业务规则。外层的框架、数据库、UI都依赖内层的接口，而不是反过来。这就是为什么我们说"业务逻辑是系统的中心"。

具体到代码层面：你的Repository接口定义在业务层（内层），而具体的MySQL实现放在基础设施层（外层）。外层依赖内层的接口，内层完全不知道外层的存在。

## 今日小结

SOLID原则不是五个孤立的规则，而是一个相互支撑的体系。SRP让你找到变化的原因，OCP让你能扩展而非修改，LSP让你能安全地替换实现，ISP让你定义精确的契约，DIP让你反转依赖方向。当这五个原则一起作用时，你就得到了一个"整洁的架构"。`,
  discussionQuestions: [
    "开闭原则要求'对扩展开放，对修改关闭'。在你的项目中，有没有一个模块是你每次改需求都必须修改的？如果引入策略模式，你会怎么重构它？",
    "里氏替换原则强调'行为契约'。你能想到一个例子，是子类违反了父类的行为约定导致bug的吗？",
    "接口隔离原则和单一职责原则看起来很相似。你认为它们的核心区别是什么？在实际项目中，你是如何决定接口粒度的？",
  ],
  reflectionPrompts: [
    "SOLID五个原则中，你觉得哪一个在你的日常开发中最容易被忽视？为什么？",
    "如果让你用一句话向同事解释开闭原则，你会怎么说？请结合你项目中的一个真实场景。",
  ],
  terms: day2Terms,
};

// ============================================================
// Day 3: 组件原则与架构边界
// ============================================================
const day3Terms: Term[] = [
  {
    id: "term-011",
    term: "组件内聚原则",
    english: "Component Cohesion Principles",
    definition: "指导如何将类和模块组织成组件的三个原则：REP（复用/发布等价原则）、CCP（共同闭包原则）、CRP（共同复用原则）。它们描述了组件内模块应该如何选择和组合。",
    example: "将用户认证相关的所有Service、Repository、Model放在同一个auth组件中发布，它们通常一起变化、一起被复用。",
    relatedTerms: ["组件耦合原则", "关注点分离"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-012",
    term: "共同闭包原则",
    english: "Common Closure Principle (CCP)",
    definition: "组件中的所有类应该对同一种变化保持封闭。当某个变化发生时，组件内所有类都应该受到影响，而只有一个或少数几个类受影响是不好的组件设计。",
    example: "订单处理组件包含OrderService、OrderValidator、OrderRepository——当订单规则变化时，这三个类通常一起修改。",
    relatedTerms: ["开闭原则", "组件内聚原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-013",
    term: "稳定依赖原则",
    english: "Stable Dependencies Principle (SDP)",
    definition: "组件应该只依赖比它更稳定的组件。依赖方向必须指向稳定方向。不稳定的组件（容易变化）不应该被稳定的组件（不易变化）所依赖。",
    example: "核心业务规则组件（非常稳定）不应该依赖UI组件（经常变化）。但UI组件可以依赖业务规则组件。",
    relatedTerms: ["稳定抽象原则", "架构边界"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-014",
    term: "架构边界",
    english: "Architecture Boundary",
    definition: "系统中不同关注点之间的分隔线。边界定义了哪些模块属于同一层、哪些属于不同层。边界通过接口来跨越，依赖方向从外层指向内层。",
    example: "业务逻辑层与数据库访问层之间的边界：业务层定义IRepository接口，数据库层实现它，边界就是那个接口。",
    relatedTerms: ["依赖反转原则", "稳定依赖原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-015",
    term: "组件耦合原则",
    english: "Component Coupling Principles",
    definition: "指导组件之间如何建立依赖关系的三个原则：ADP（无环依赖原则）、SDP（稳定依赖原则）、SAP（稳定抽象原则）。它们确保组件之间的依赖关系是健康和可维护的。",
    example: "如果A依赖B、B依赖C、C又依赖A，就形成了依赖环。ADP要求打破这种环，通常通过引入接口或DIP来解耦。",
    relatedTerms: ["稳定依赖原则", "无环依赖原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day3Content: DailyContent = {
  dayNum: 3,
  readingTitle: "Day 3：组件原则与架构边界 — 从类到系统",
  readingContent: `前两天的学习聚焦在类和方法层面——SOLID原则告诉我们如何设计好的类。今天Uncle Bob把视角拉高，讨论如何把类组织成组件（Component），以及组件之间如何划分边界。

## 什么是组件？

在Uncle Bob的定义中，组件是软件的可独立部署和复发的最小单元。在Java中它是JAR包，在.NET中它是DLL，在Node.js中它是npm包。组件是架构的基本构建块。

组件的设计比类的设计更难，因为它涉及到"哪些东西应该放在一起"和"哪些东西应该分开"这两个核心问题。

## 组件内聚三原则

Uncle Bob提出了三个组件内聚原则，它们之间存在张力：

REP（复用/发布等价原则）：被复用的组件必须是可发布的。这意味着组件要有版本号、有文档、有变更日志。

CCP（共同闭包原则）：组件中的类应该对同一种变化保持封闭。当需求变化时，一个组件里的类应该一起变化。这和SRP在组件层面的对应。

CRP（共同复用原则）：不需要的东西不要放在一起。一个组件的消费者不应该被迫引入它不需要的东西。这和ISP在组件层面的对应。

有趣的是，CCP和CRP是互相对立的——CCP倾向于把一起变化的东西放一起，CRP倾向于把不一起用的东西分开。架构设计就是在这些张力中找到平衡。

## 架构边界：系统的"护城河"

Uncle Bob在书中用"边界"（Boundary）这个概念来描述架构的分层。边界不是物理的隔离，而是逻辑的分隔。

在整洁架构中，最重要的边界是"业务规则"与"外部细节"之间的边界。这条边界通过接口来定义——业务规则定义接口（内层），外部细节实现接口（外层）。

想想你的采购系统：采购审批的业务规则（审批流程、金额阈值、权限要求）是核心，而Web框架、数据库、消息队列都是外部细节。边界就是那些接口——IApprovalService、IPurchaseRepository等。

## 稳定依赖原则

组件之间的依赖不是随意的，而是有方向的。稳定依赖原则（SDP）要求：依赖方向必须指向更稳定的组件。

什么是"稳定"？一个被很多组件依赖、但自己不依赖太多其他组件的模块就是稳定的。业务规则组件通常是最稳定的——它很少变化，且被UI、数据库、API等多个组件依赖。

## 今日小结

从SOLID到组件原则，Uncle Bob展示了一个从微观到宏观的架构思维框架。类层面的SOLID保证代码质量，组件层面的原则保证系统结构健康。而架构边界，就是你在系统中画下的那些"不可逾越"的分隔线——它们保护着最核心的业务逻辑。`,
  discussionQuestions: [
    "在你的项目中，哪些模块是'一起变化'的？如果按照共同闭包原则重新划分组件，你会怎么组织？",
    "稳定依赖原则要求依赖指向更稳定的组件。在你的系统中，哪个组件是最稳定的？哪个是最不稳定的？这种依赖方向是否正确？",
    "Uncle Bob说CCP和CRP之间存在张力。在你的项目中，有没有遇到过'为了复用而把不相关的东西放在一起'的情况？",
  ],
  reflectionPrompts: [
    "如果把你的项目画成组件依赖图，你预期会是什么样子？实际的依赖方向和SDP原则一致吗？",
    "架构边界的核心是接口。请列出你项目中最关键的3个接口，说明它们分别分隔了什么。",
  ],
  terms: day3Terms,
};

// ============================================================
// Day 4: 架构模式 — 分层、组件与整洁架构
// ============================================================
const day4Terms: Term[] = [
  {
    id: "term-016",
    term: "分层架构",
    english: "Layered Architecture",
    definition: "最经典的架构模式，将系统按职责划分为若干水平层（如表现层、业务层、数据层），每层只与相邻层交互。优点：结构简单、易于理解。缺点：容易变成'大泥球'，层间职责模糊。",
    example: "经典的三层架构：表现层（Controller）→ 业务逻辑层（Service）→ 数据访问层（Repository/DAO）。大多数企业应用的基础骨架。",
    relatedTerms: ["整洁架构", "组件架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-017",
    term: "边界控制",
    english: "Boundary Control",
    definition: "整洁架构中管理跨边界操作的设计模式。通过ViewModel/Presenter等中间角色来处理跨越架构边界的数据，确保业务逻辑不直接暴露给外部层。",
    example: "在MVC模式中，Controller就是边界控制角色——它从HTTP请求中提取数据，调用业务逻辑，再把结果格式化为HTTP响应。",
    relatedTerms: ["架构边界", "整洁架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-018",
    term: "部分边界",
    english: "Partial Boundary",
    definition: "在完整架构边界过于重量级时采用的简化方案。不创建独立的接口和实现类，而是在同一组件内用接口隔离来模拟边界效果。是架构设计中'恰到好处'的折中。",
    example: "在一个小型模块中，不创建IUserRepository接口+UserRepository实现，而是直接在UserService中定义方法签名，保持未来扩展为完整边界的可能性。",
    relatedTerms: ["架构边界", "过度设计"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-019",
    term: "服务架构",
    english: "Service-Oriented Architecture (SOA)",
    definition: "将系统拆分为多个独立部署的服务，每个服务通过消息或RPC通信。微服务是SOA的细化版本。Uncle Bob指出，服务架构的本质是用网络边界替代进程内边界。",
    example: "将采购系统拆分为：供应商服务、订单服务、库存服务、审批服务，各自独立部署，通过消息队列通信。",
    relatedTerms: ["微服务", "架构边界"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-020",
    term: "测试边界",
    english: "Test Boundary",
    definition: "用测试来验证架构边界的有效性。如果业务逻辑可以在不启动框架、不连接数据库的情况下被测试，说明边界设计是成功的。",
    example: "为OrderService编写单元测试时，用Mock的IRepository替代真实数据库——如果测试能通过，说明业务逻辑确实不依赖数据库。",
    relatedTerms: ["架构边界", "依赖反转原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day4Content: DailyContent = {
  dayNum: 4,
  readingTitle: "Day 4：架构模式 — 从分层到整洁架构",
  readingContent: `今天我们讨论Uncle Bob在书中详细分析的各种架构模式，以及他为什么认为"整洁架构"是这些模式的集大成者。

## 分层架构的功与过

分层架构是最广泛使用的架构模式。三层架构（表现层-业务层-数据层）几乎是每个企业应用的起点。Uncle Bob承认分层架构的价值，但也指出了它的致命缺陷。

分层架构最大的问题是：随着系统增长，层与层之间的界限越来越模糊。Controller里直接写SQL、Service里直接操作HTTP响应——这些"偷懒"的做法在分层架构中很难被阻止，因为分层只是一种"建议"，不是一种"强制"。

更深层的问题是：分层架构的依赖方向是单向的（从上到下），但它没有解决"业务逻辑到底属于哪一层"这个核心问题。

## 整洁架构：同心圆模型

Uncle Bob提出的整洁架构是一个同心圆模型：

最内层是"实体"（Entities）——企业级别的业务对象，包含最核心的业务规则。这些规则即使在没有计算机的时代也存在。

第二层是"用例"（Use Cases）——应用级别的业务逻辑，描述了系统如何与实体交互。用例包含了应用的特定业务规则。

第三层是"接口适配器"（Interface Adapters）——将用例的输入输出转换为外部格式。Presenter、ViewModel、Controller都属于这一层。

最外层是"框架与驱动"（Frameworks & Drivers）——数据库、Web框架、UI等最外部的细节。

关键规则：依赖方向只能从外向内。外层知道内层，内层完全不知道外层。

## 边界控制的艺术

在整洁架构中，跨越边界的操作需要精心设计。Uncle Bob提出了"边界控制"的概念：当数据需要跨越架构边界时，不应该直接传递内部数据结构，而应该转换为边界两侧都能理解的格式。

比如，业务逻辑层返回一个Order对象，但Web层不应该直接使用这个Order。应该有一个转换器，将Order转换为API响应DTO。这样，即使Order的内部结构变化，API契约也不会受影响。

## 部分边界：务实的选择

Uncle Bob也承认，不是所有地方都需要完整的架构边界。在小模块中，创建接口+实现+转换器可能过于重量级。他提出了"部分边界"的概念：先用接口隔离，但暂时不创建独立的实现类。等变化真正发生时，再补全边界。

这是一种务实的态度——架构设计不是教条，而是在"过度设计"和"设计不足"之间找到平衡。

## 今日小结

从分层到整洁架构，Uncle Bob展示了一个演进路径。分层架构是起点，但不是终点。整洁架构通过同心圆模型和严格的依赖方向，解决了分层架构的模糊性问题。而边界控制和部分边界，则是在实践中落地整洁架构的关键技巧。`,
  discussionQuestions: [
    "你的项目目前使用的是哪种架构模式？如果改用整洁架构的同心圆模型，你会如何划分'实体层'和'用例层'？",
    "Uncle Bob提到分层架构的依赖方向是'建议'而非'强制'。在你的项目中，有没有出现过'跨层调用'的情况？比如Controller直接调用DAO？",
    "部分边界是一种务实的折中。在你的项目中，有没有哪些地方你觉得'应该加边界但现在不需要'？你是如何判断的？",
  ],
  reflectionPrompts: [
    "画出你项目的'同心圆'：最内层的业务规则是什么？最外层的框架/数据库是什么？中间的边界在哪里？",
    "如果让你向团队推荐一种架构改进策略，基于今天的学习，你会从哪个具体的改动开始？",
  ],
  terms: day4Terms,
};

// ============================================================
// Day 5: 细节与策略 — 数据库、Web框架与业务规则
// ============================================================
const day5Terms: Term[] = [
  {
    id: "term-021",
    term: "数据库即工具",
    english: "Database as a Tool",
    definition: "整洁架构的核心观点之一：数据库只是存储数据的工具，不是架构的核心。业务逻辑不应该被数据库的表结构、SQL语法或ORM框架所绑架。数据库应该是可替换的。",
    example: "一个系统先用MySQL开发，后来因为性能需求换成Redis缓存+PostgreSQL持久化——如果业务逻辑不依赖SQL，这个切换就很平滑。",
    relatedTerms: ["架构整洁", "Repository模式"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-022",
    term: "Web即工具",
    english: "Web as a Tool",
    definition: "与'数据库即工具'类似，Web框架也只是交付业务逻辑的工具。业务规则不应该知道HTTP的存在。Controller应该尽可能薄，只做请求解析和响应格式化。",
    example: "一个计算订单折扣的函数discount(order)应该是纯函数，不接收HttpServletRequest，不返回ResponseEntity——它只接收业务数据，返回业务结果。",
    relatedTerms: ["数据库即工具", "关注点分离"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-023",
    term: "框架作者",
    english: "Framework Authors",
    definition: "Uncle Bob对框架使用者的提醒：框架作者不是你的业务权威。他们了解框架，但不了解你的业务。不要让框架的设计决策驱动你的业务建模。",
    example: "Django的ORM鼓励你按数据库表结构建模，但你的业务实体可能和数据库表完全不同——业务实体按业务规则建模，数据库表只是存储方案。",
    relatedTerms: ["Web即工具", "数据库即工具"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-024",
    term: "可插拔架构",
    english: "Pluggable Architecture",
    definition: "系统的核心功能不依赖任何具体实现，所有外部组件（数据库、消息队列、缓存、第三方API）都通过接口注入，可以像插件一样替换。这是整洁架构的最终目标。",
    example: "一个通知系统通过INotificationSender接口发送消息，可以有EmailSender、SmsSender、WechatSender等插件，核心逻辑不关心具体发送方式。",
    relatedTerms: ["依赖反转原则", "控制反转"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-025",
    term: "请求-响应模型",
    english: "Request-Response Model",
    definition: "Web应用的基本交互模型：客户端发送请求，服务端返回响应。Uncle Bob指出，这个模型应该只存在于架构的最外层，业务逻辑不应该知道'请求'和'响应'的概念。",
    example: "一个API接口接收POST /orders请求——Controller负责解析JSON请求体为OrderDTO，调用业务层createOrder(dto)，再把结果包装为HTTP 201响应。",
    relatedTerms: ["Web即工具", "边界控制"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day5Content: DailyContent = {
  dayNum: 5,
  readingTitle: "Day 5：细节与策略 — 数据库、Web框架与业务规则的关系",
  readingContent: `今天我们进入《架构整洁之道》中最具实践指导意义的章节——Uncle Bob详细讨论了数据库、Web框架这些"细节"与业务规则这些"策略"之间的关系。

## 数据库：是细节，不是策略

在很多开发者的认知中，数据库是系统的核心——先设计数据库表结构，然后围绕表结构写业务逻辑。Uncle Bob认为这是一种根本性的错误。

数据库是细节（Detail），不是策略（Policy）。策略是业务规则——它们在任何数据库存在之前就已经存在了。你的采购审批规则、供应商评分标准、合同校验逻辑——这些规则在你选择MySQL还是PostgreSQL之前就已经确定了。

Uncle Bob提出了一个激进但深刻的观点：如果你的系统不需要数据库，你的业务逻辑还能正常工作吗？如果答案是"能"，说明你的业务逻辑确实独立于数据库——这就是整洁架构的目标。

## Web框架：也是细节

和数据库一样，Web框架也是细节。HTTP请求、REST路由、JSON序列化——这些都是"如何交付业务结果"的技术细节，而不是"业务结果是什么"。

Uncle Bob建议：你的业务用例（Use Case）应该是一个纯函数——接收输入数据，返回输出数据，不知道HTTP的存在。Controller的工作就是：把HTTP请求翻译成业务输入，把业务输出翻译成HTTP响应。

## 框架作者不是你的业务权威

这是一个容易被忽视的观点。框架作者设计了框架的结构，但他们对你的业务一无所知。当你让框架的设计决策驱动你的业务建模时，你就失去了架构的控制权。

比如，Rails的ActiveRecord鼓励你让Model直接对应数据库表。但你的业务实体可能比数据库表复杂得多——一个Order实体可能包含多个值对象（Money、Address、DateRange），这些在数据库中可能是多张表，但在业务层是一个整体。

## 可插拔：整洁架构的终极目标

当数据库是细节、Web框架是细节、UI是细节——你的系统就变成了一个"可插拔"的架构。核心业务逻辑在中心，所有外部组件都通过接口插入。

想换数据库？换一个Repository实现。想从REST迁移到gRPC？换一个Controller。想加一个新的通知渠道？实现一个INotificationSender。核心业务逻辑一行都不用改。

## 今日小结

今天的核心信息是：区分"策略"和"细节"。策略是业务规则，是系统存在的理由；细节是实现方式，是可以替换的工具。架构师最重要的能力，就是识别哪些是策略、哪些是细节，然后用架构边界把它们分开。`,
  discussionQuestions: [
    "Uncle Bob说'数据库是细节不是策略'。在你的项目中，业务逻辑和数据库的耦合程度如何？有没有'离开数据库就无法运行的业务逻辑'？",
    "框架作者不是业务权威——你能想到一个例子，是因为框架的设计决策导致了业务建模失误的情况吗？",
    "如果你的项目要实现'可插拔架构'——比如从MySQL切换到MongoDB——你认为最困难的改动点在哪里？",
  ],
  reflectionPrompts: [
    "尝试列出你项目中的5个'策略'（业务规则）和5个'细节'（技术实现）。它们之间的边界清晰吗？",
    "如果让你设计一个'无数据库版本'的原型来验证业务逻辑，你会怎么做？",
  ],
  terms: day5Terms,
};

// ============================================================
// Day 6: 实现策略 — 测试、重构与演进式架构
// ============================================================
const day6Terms: Term[] = [
  {
    id: "term-026",
    term: "测试金字塔",
    english: "Test Pyramid",
    definition: "由Mike Cohn提出的测试策略模型：底层是大量单元测试（快、便宜），中间是适量集成测试，顶层是少量端到端测试（慢、贵）。整洁架构强调单元测试应该能独立于框架和数据库运行。",
    example: "一个订单系统：100个单元测试覆盖业务规则（不连数据库），30个集成测试覆盖API+数据库，10个E2E测试覆盖关键流程。",
    relatedTerms: ["测试边界", "整洁架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-027",
    term: "演进式架构",
    english: "Evolutionary Architecture",
    definition: "不追求一步到位的完美架构，而是通过持续的小步重构来逐步改善系统结构。每次改动都保持系统可工作，逐步向整洁架构演进。Uncle Bob称之为'让代码每次提交都变得更干净一点'。",
    example: "一个遗留系统，第一步：给Service层加接口；第二步：把数据库操作移到Repository；第三步：让Controller变薄。每一步都是安全的、可回退的。",
    relatedTerms: ["重构", "部分边界"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-028",
    term: "重构原则",
    english: "Refactoring Principles",
    definition: "在不改变外部行为的前提下改善代码内部结构。核心原则：每次只做一件事、有测试保护、小步前进。Uncle Bob强调重构不是重写——重构是在保持功能不变的前提下改善结构。",
    example: "将一个大方法拆分为多个小方法：先写测试覆盖原方法，然后逐步提取方法，每提取一个就运行测试确认没有破坏。",
    relatedTerms: ["演进式架构", "测试金字塔"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-029",
    term: "遗留代码",
    english: "Legacy Code",
    definition: "Uncle Bob对遗留代码的定义：没有测试的代码就是遗留代码。不管它多新、用了多先进的技术，只要没有测试保护，它就是遗留代码——因为你不敢改它。",
    example: "一个用最新框架写的系统，但所有业务逻辑都在Controller里，没有单元测试——每次修改都可能引入bug，这就是遗留代码。",
    relatedTerms: ["测试金字塔", "重构原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-030",
    term: "架构决策记录",
    english: "Architecture Decision Record (ADR)",
    definition: "记录重要架构决策的文档格式，包含：上下文、决策、理由、后果。目的是让团队理解'为什么这样设计'，避免后来者重复讨论或错误地推翻已有决策。",
    example: "ADR-003：选择PostgreSQL而非MongoDB——上下文：需要复杂查询和事务支持；决策：使用PostgreSQL；理由：采购审批涉及多表关联和金额精度要求。",
    relatedTerms: ["演进式架构", "架构边界"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day6Content: DailyContent = {
  dayNum: 6,
  readingTitle: "Day 6：实现策略 — 测试、重构与演进式架构",
  readingContent: `前五天我们讨论了整洁架构的理论和设计原则。今天Uncle Bob转向实践——如何在真实项目中实现和维护整洁架构？答案的三个关键词：测试、重构、演进。

## 测试：架构健康的晴雨表

Uncle Bob提出了一个惊人的观点：没有测试的代码就是遗留代码。不管它用了多新的框架、多优雅的设计，只要没有测试保护，它就是"不敢动的代码"。

更重要的是，测试是架构健康的晴雨表。如果你的业务逻辑很难测试——需要启动框架、连接数据库、Mock一堆依赖——那说明你的架构边界有问题。反过来，如果业务逻辑可以像纯函数一样被测试，说明你的依赖反转做得很好。

在整洁架构中，单元测试应该只测试内层（实体和用例），不需要任何外部依赖。集成测试测试边界 crossing。端到端测试测试整个系统。这就是测试金字塔。

## 重构：每次一小步

Uncle Bob强调，从"非整洁"到"整洁"不是一次性重写，而是持续的小步重构。每次重构遵循三个原则：

第一，每次只做一件事。不要同时移动数据库层和重构业务逻辑。一步一步来。

第二，必须有测试保护。重构之前先确保有足够的测试覆盖。如果代码没有测试，第一步不是重构，而是加测试。

第三，小步前进。每次改动后运行测试，确认没有破坏。如果测试失败，回退到上一个可工作的状态。

## 演进式架构：不追求完美

整洁架构不是目标，而是方向。你不需要第一天就画出完美的同心圆，然后严格按照它实现。相反，你应该让架构随着业务的发展而演进。

Uncle Bob建议的做法是：从简单的分层开始，在发现痛点时逐步引入边界。当你发现Service层开始依赖数据库细节时，引入Repository接口。当你发现Controller太厚时，引入Use Case层。每次改进都是被"痛点"驱动的，而不是"理论上应该"。

## 架构决策记录

在演进过程中，记录每一个重要的架构决策。Uncle Bob推荐使用ADR（Architecture Decision Record）格式：

上下文：我们面临什么问题？
决策：我们决定怎么做？
理由：为什么这样做而不是那样做？
后果：这个决策带来什么影响？

ADR的价值在于：三个月后，当你或你的同事问"为什么这里要用接口而不是直接调用"时，答案就在ADR里。

## 今日小结

架构不是一次性的设计，而是持续的实践。测试保护你的改动安全，重构让你的代码保持健康，演进让你的架构适应变化。整洁架构不是一个你要"到达"的终点，而是一个你要"持续走向"的方向。`,
  discussionQuestions: [
    "Uncle Bob说'没有测试的代码就是遗留代码'。在你的项目中，核心业务逻辑有测试覆盖吗？如果没有，你会如何开始添加第一组测试？",
    "演进式架构建议'从简单开始，在痛点处引入边界'。你的项目中，当前最大的'架构痛点'是什么？你会用什么具体步骤来改善它？",
    "架构决策记录（ADR）在你的团队中有实践吗？如果没有，你认为第一个应该记录的架构决策是什么？",
  ],
  reflectionPrompts: [
    "回顾这6天的学习，哪一个概念对你当前的工作最有直接指导意义？你打算如何在下周的工作中实践它？",
    "如果让你给你的项目写一份'架构健康诊断报告'，你会给出什么评分？最急需改善的一个点是什么？",
  ],
  terms: day6Terms,
};

// ============================================================
// Day 7: 成为架构师 — 总结与行动指南
// ============================================================
const day7Terms: Term[] = [
  {
    id: "term-031",
    term: "架构师角色",
    english: "The Architect Role",
    definition: "Uncle Bob对架构师的新定义：架构师不是画图纸的人，而是团队的领航员。架构师应该深度参与编码，保持对代码细节的感知，同时拥有全局视野来引导系统演进方向。",
    example: "一个优秀的架构师既能在白板上画系统全景图，也能在IDE里写Repository接口的实现——他们不脱离代码。",
    relatedTerms: ["演进式架构", "整洁架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-032",
    term: "架构成熟度模型",
    english: "Architecture Maturity Model",
    definition: "评估系统架构健康程度的框架。从Level 0（无架构意识）到Level 4（持续演进），每个级别有明确的特征和改进路径。帮助团队识别当前位置和下一步方向。",
    example: "Level 1：有分层但层间混乱；Level 2：引入接口隔离；Level 3：实现依赖反转；Level 4：持续测试+重构驱动演进。",
    relatedTerms: ["架构师角色", "演进式架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-033",
    term: "技术债务",
    english: "Technical Debt",
    definition: "为了快速交付而做出的技术妥协，就像金融债务一样需要'还本付息'。适度的技术债务是合理的（像贷款买房），但失控的技术债务会让系统无法维护。架构整洁是减少技术债务的根本方法。",
    example: "为了赶工期在Controller里直接写SQL——这是技术债务。如果之后不重构为Repository模式，每次改数据库都要改Controller，'利息'越来越高。",
    relatedTerms: ["重构原则", "演进式架构"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-034",
    term: "架构治理",
    english: "Architecture Governance",
    definition: "确保系统架构不随时间退化的机制。包括：代码审查中的架构检查、自动化依赖方向检测、ADR维护、定期架构回顾。好的治理是自动化的，不依赖人工记忆。",
    example: "在CI/CD中加入ArchUnit检查：自动验证所有Controller不直接依赖Repository实现类，只能依赖IRepository接口。违反则构建失败。",
    relatedTerms: ["架构决策记录", "技术债务"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
  {
    id: "term-035",
    term: "整洁代码",
    english: "Clean Code",
    definition: "Uncle Bob另一本经典著作的核心概念。整洁代码是架构整洁的基础——如果每个函数、每个类都是整洁的，那么由它们组成的架构自然更容易保持整洁。整洁代码的特征：可读、可测试、简单、直接。",
    example: "一个函数只做一件事、命名清晰表达意图、没有隐藏的副作用、可以被独立测试——这就是整洁代码。",
    relatedTerms: ["架构整洁", "重构原则"],
    viewCount: 0, bookmarked: false, mastered: false,
  },
];

const day7Content: DailyContent = {
  dayNum: 7,
  readingTitle: "Day 7：成为架构师 — 总结与行动指南",
  readingContent: `今天是7天学习的最后一天。让我们回顾整个旅程，把碎片拼成全景图，然后讨论最重要的问题：从明天开始，你应该做什么？

## 7天回顾：从碎片到全景

Day 1我们学到了架构整洁的核心命题：业务逻辑是系统的中心，外部技术是可替换的插件。

Day 2深入SOLID原则——五个相互支撑的设计原则，从类层面保证代码的可维护性。

Day 3上升到组件层面——如何把类组织成组件，如何在组件之间建立健康的依赖关系。

Day 4讨论了架构模式——从分层到整洁架构的同心圆模型，以及边界控制的艺术。

Day 5聚焦细节与策略的区分——数据库、Web框架、UI都是细节，业务规则才是策略。

Day 6转向实践——测试、重构、演进式架构，让整洁不是一次性工程而是持续实践。

今天，我们讨论的是"人"——架构师的角色、团队的成长、以及从今天开始的行动。

## 架构师：不是画图纸的人

Uncle Bob对架构师有一个颠覆性的定义：好的架构师不是脱离代码、只画架构图的人。真正的架构师应该深度参与编码，因为他们需要感知代码的细节——只有亲手写过Repository接口的人，才知道这个边界是否合理。

架构师的核心职责不是"设计"，而是"引导"——引导团队理解架构决策的原因，引导系统朝着更整洁的方向演进，引导每一次重构都保持系统可工作。

## 技术债务的真相

每个系统都有技术债务。关键不是消灭所有债务——那是不可能的——而是管理债务。

Uncle Bob把技术债务分为两种：鲁莽的技术债务（"我知道这样不好，但我赶时间"）和谨慎的技术债务（"我意识到这里有更好的做法，但现在这个方案足够用，我会在下个迭代偿还"）。

谨慎的技术债务是合理的——就像企业贷款。但关键是：你要知道债务在哪里，你要有偿还计划。架构决策记录（ADR）和代码中的TODO注释，都是管理技术债务的工具。

## 你的行动清单

7天的学习结束了，但真正的学习从明天开始。Uncle Bob的建议是从小处着手：

第一，给核心业务逻辑加测试。不需要100%覆盖率，先给最重要的3个用例加单元测试。如果你发现很难测试，那说明架构边界需要改善。

第二，识别一个最明显的"策略-细节"混淆点。比如Controller里直接写SQL、Service里直接操作HTTP响应。引入一个接口来分离它们。

第三，开始写ADR。每次做出重要的技术决策，花10分钟记录下来。三个月后你会感谢现在的自己。

第四，在团队中分享。把这7天学到的一个概念分享给同事。教是最好的学。

## 结语

架构整洁不是一个目的地，而是一段旅程。每一天，每一次代码提交，你都有机会让系统变得更整洁一点。这不是完美主义，而是职业素养。

正如Uncle Bob所说："The only way to go fast, is to go well."——唯一能快的方法，就是做得好。

恭喜你完成了7天的学习之旅！但这只是开始——真正的能力，来自于你把今天学到的东西应用到明天的工作中。`,
  discussionQuestions: [
    "回顾7天的学习，如果只能记住一句话，你会选择哪一句？为什么？",
    "Uncle Bob建议'从小处着手'。在你的项目中，你明天就可以开始做的第一个具体改动是什么？",
    "作为项目的负责人/参与者，你认为推动架构改善最大的阻力是什么？你会如何克服它？",
  ],
  reflectionPrompts: [
    "用一段话总结这7天你最大的认知变化。它如何改变了你对'好架构'的理解？",
    "写一封给3个月后自己的信：你希望到那时，你的项目架构已经改善了哪些方面？你计划如何确保这些改善发生？",
  ],
  terms: day7Terms,
};

// ============================================================
// Content Map & Accessor
// ============================================================
const allDayContents: Record<number, DailyContent> = {
  1: day1Content,
  2: day2Content,
  3: day3Content,
  4: day4Content,
  5: day5Content,
  6: day6Content,
  7: day7Content,
};

export function getDayContent(dayNum: number): DailyContent {
  const content = allDayContents[dayNum];
  if (content) return { ...content, dayNum };
  return { ...day1Content, dayNum };
}

export function getTotalDays(): number {
  return Object.keys(allDayContents).length;
}

export function getAllTerms(): Term[] {
  return Object.values(allDayContents).flatMap((c) => c.terms);
}
