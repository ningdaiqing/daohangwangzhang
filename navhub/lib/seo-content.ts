// 程序化 SEO 内容生成器
// 根据产品数据自动生成结构化内容，覆盖长尾搜索词

import type { Product, Category, Tag } from "./data";

export interface SeoSection {
  /** H2 标题 */
  heading: string;
  /** 段落正文 */
  paragraphs: string[];
  /** 可选的要点列表 */
  bullets?: string[];
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoContent {
  sections: SeoSection[];
  faqs: SeoFaqItem[];
}

export function generateSeoContent(
  product: Product,
  category?: Category,
  tags: Tag[] = []
): SeoContent {
  const name = product.name;
  const cat = category?.name ?? "AI";
  const tagNames = tags.map((t) => t.name);

  // ===== 1. 什么是 {name} =====
  const whatIs = {
    heading: `什么是 ${name}？`,
    paragraphs: [
      `${product.tagline}。${product.description}`,
      `${name} 属于「${cat}」分类，是一款面向${tagAudience(tagNames)}的 AI 工具。${pricingSentence(name, product.pricing)}`,
    ],
  };

  // ===== 2. 核心功能 =====
  const features = {
    heading: `${name} 的核心功能`,
    paragraphs: [
      `${name} 提供以下核心能力：`,
    ],
    bullets: buildFeatures(product, category, tagNames),
  };

  // ===== 3. 如何使用 =====
  const howToUse = {
    heading: `如何使用 ${name}？`,
    paragraphs: [
      `${howToUseStep1(product)}`,
      `${howToUseStep2(product)}`,
      `${howToUseStep3(product)}`,
    ],
  };

  // ===== 4. 定价方案 =====
  const pricing = {
    heading: `${name} 的定价方案`,
    paragraphs: [pricingDetail(name, product.pricing)],
  };

  // ===== 5. 适合人群 =====
  const audience = {
    heading: `${name} 适合什么人？`,
    paragraphs: [
      `${name} 适合以下场景和人群：`,
    ],
    bullets: buildAudience(tagNames, category),
  };

  // ===== 6. 替代品 =====
  const alternatives = {
    heading: `${name} 的替代品有哪些？`,
    paragraphs: [
      `如果你正在考虑 ${name}，也可以看看同分类下的其他工具。在「${cat}」分类中，我们收录了多款同类产品，你可以根据功能、价格和使用场景来选择最适合的工具。`,
    ],
  };

  // ===== FAQ =====
  const faqs: SeoFaqItem[] = [
    {
      question: `${name} 是什么？`,
      answer: `${product.tagline}。${product.description}`,
    },
    {
      question: `${name} 是免费的吗？`,
      answer: pricingDetail(name, product.pricing),
    },
    {
      question: `${name} 适合什么人使用？`,
      answer: `${name} 适合${tagAudience(tagNames)}使用，特别适合${tagNames.slice(0, 2).join("、")}等场景。`,
    },
    {
      question: `${name} 支持哪些平台？`,
      answer: buildPlatformAnswer(tagNames),
    },
    {
      question: `${name} 和同类工具相比有什么优势？`,
      answer: `${name} 的特点在于${product.tagline.replace(/^，|,$/g, "")}。建议根据你的具体需求、预算和使用场景来选择。你可以在本站「${cat}」分类中对比同类产品。`,
    },
  ];

  return {
    sections: [whatIs, features, howToUse, pricing, audience, alternatives],
    faqs,
  };
}

// ===== 辅助函数 =====

function pricingSentence(name: string, pricing: string): string {
  switch (pricing) {
    case "free":
      return `${name} 完全免费使用，无需付费。`;
    case "freemium":
      return `${name} 提供免费版本，同时有付费高级功能可选。`;
    case "paid":
      return `${name} 为付费产品，需订阅使用。`;
    default:
      return "";
  }
}

function pricingDetail(name: string, pricing: string): string {
  switch (pricing) {
    case "free":
      return `${name} 是完全免费的 AI 工具，注册即可使用全部功能，无需付费。适合个人用户和预算有限的团队。`;
    case "freemium":
      return `${name} 采用免费增值模式（Freemium）：基础功能免费使用，高级功能（如更高额度、团队协作、企业级安全等）需要付费订阅。建议先免费试用，确认满足需求后再升级付费版本。`;
    case "paid":
      return `${name} 为付费产品，需要订阅才能使用。具体价格请访问官网查看最新方案。建议在购买前先了解是否有试用退款政策。`;
    default:
      return `具体定价请访问 ${name} 官网查看。`;
  }
}

function buildFeatures(
  product: Product,
  category?: Category,
  tagNames: string[] = []
): string[] {
  const features: string[] = [];

  // 从标签推导功能点
  if (tagNames.includes("开源")) features.push("开源免费，可自行部署和定制");
  if (tagNames.includes("本地部署")) features.push("支持本地私有化部署，数据不出域");
  if (tagNames.includes("IDE 插件")) features.push("深度集成 IDE，编码效率倍增");
  if (tagNames.includes("命令行")) features.push("提供 CLI 命令行工具，适合终端操作");
  if (tagNames.includes("浏览器")) features.push("提供浏览器扩展，随时可用");
  if (tagNames.includes("移动端")) features.push("支持移动端使用，随时随地创作");
  if (tagNames.includes("企业级")) features.push("提供企业级功能：SSO、审计、权限管理");
  if (tagNames.includes("免费可用")) features.push("提供免费额度，零门槛上手");
  if (tagNames.includes("中文友好")) features.push("对中文场景友好，中文理解和生成为强项");
  if (tagNames.includes("语音合成")) features.push("高质量文字转语音，支持多语言");
  if (tagNames.includes("语音克隆")) features.push("AI 语音克隆，几秒复制音色");
  if (tagNames.includes("音乐生成")) features.push("AI 作曲与音乐生成");
  if (tagNames.includes("搜索引擎")) features.push("AI 驱动搜索，答案带引用来源");
  if (tagNames.includes("RAG")) features.push("支持文档上传与 RAG 检索问答");
  if (tagNames.includes("零代码")) features.push("无代码可视化编排，无需编程基础");
  if (tagNames.includes("SEO")) features.push("SEO 内容优化，提升搜索排名");
  if (tagNames.includes("会议")) features.push("会议转录、总结与行动项提取");
  if (tagNames.includes("API")) features.push("提供 API 接口，方便开发者集成");
  if (tagNames.includes("设计工具")) features.push("AI 辅助设计，一键生成视觉素材");
  if (tagNames.includes("广告营销")) features.push("营销文案与广告素材自动生成");

  // 从分类补充
  if (category) {
    switch (category.slug) {
      case "chat":
        features.push("自然语言对话，支持上下文记忆与追问");
        break;
      case "coding":
        features.push("智能代码补全、生成与重构");
        break;
      case "image":
        features.push("文生图、图像编辑与风格迁移");
        break;
      case "video":
        features.push("视频生成、剪辑与数字人");
        break;
      case "office":
        features.push("文档写作、PPT 生成与效率提升");
        break;
      case "agent":
        features.push("自主任务规划与多步骤执行");
        break;
      case "audio":
        features.push("音频处理与语音/音乐生成");
        break;
      case "marketing":
        features.push("营销内容自动化与数据驱动优化");
        break;
      case "research":
        features.push("文献检索、论文分析与学术辅助");
        break;
    }
  }

  // 兜底
  if (features.length < 3) {
    features.push(`${product.tagline}`);
    features.push("持续迭代更新，功能不断增强");
  }

  return features.slice(0, 6);
}

function howToUseStep1(product: Product): string {
  return `1. 访问 ${product.name} 官网（${product.url}），注册或登录账号。`;
}

function howToUseStep2(product: Product): string {
  if (product.pricing === "free") {
    return `2. ${product.name} 完全免费，注册后即可直接使用全部功能。`;
  }
  if (product.pricing === "freemium") {
    return `2. ${product.name} 提供免费版本，建议先从免费版开始体验核心功能。`;
  }
  return `2. ${product.name} 为付费产品，建议先查看是否有免费试用，再选择合适的订阅方案。`;
}

function howToUseStep3(product: Product): string {
  return `3. 根据你的需求，在 ${product.name} 中选择对应的功能模块，输入内容或上传素材，即可获得 AI 生成结果。建议多尝试不同参数和提示词，以获得最佳效果。`;
}

function tagAudience(tagNames: string[]): string {
  const audiences: string[] = [];
  if (tagNames.includes("设计师")) audiences.push("设计师");
  if (tagNames.includes("写作者")) audiences.push("内容创作者");
  if (tagNames.includes("企业级")) audiences.push("企业团队");
  if (tagNames.includes("开源")) audiences.push("开发者");
  if (tagNames.includes("IDE 插件") || tagNames.includes("命令行")) audiences.push("程序员");
  if (tagNames.includes("学术")) audiences.push("研究人员");
  if (tagNames.includes("移动端")) audiences.push("移动端用户");
  if (audiences.length === 0) audiences.push("各类用户");
  return audiences.join("、");
}

function buildAudience(tagNames: string[], category?: Category): string[] {
  const items: string[] = [];

  if (tagNames.includes("设计师")) items.push("设计师与创意工作者，需要快速生成视觉素材");
  if (tagNames.includes("写作者")) items.push("内容创作者、文案与自媒体运营，需要提升写作效率");
  if (tagNames.includes("企业级")) items.push("企业团队，需要安全、可控的 AI 工具");
  if (tagNames.includes("开源")) items.push("开发者与技术团队，需要可自定义、可部署的方案");
  if (tagNames.includes("IDE 插件") || tagNames.includes("命令行")) items.push("程序员与开发者，追求编码效率提升");
  if (tagNames.includes("学术")) items.push("科研人员与学生，需要文献分析和学术辅助");
  if (tagNames.includes("移动端")) items.push("移动端用户，随时随地进行创作");
  if (tagNames.includes("SEO")) items.push("SEO 从业者与营销团队，需要内容优化工具");
  if (tagNames.includes("会议")) items.push("频繁开会的职场人士，需要自动转录与总结");

  if (category) {
    switch (category.slug) {
      case "chat":
        items.push("日常对话、问答与写作需求的用户");
        break;
      case "coding":
        items.push("需要 AI 辅助编程、代码审查与测试的开发者");
        break;
      case "image":
        items.push("需要文生图、图像编辑与品牌设计的创作者");
        break;
      case "video":
        items.push("需要视频生成、剪辑与数字人的内容创作者");
        break;
      case "office":
        items.push("需要提升办公效率、PPT 生成与文档处理的职场人士");
        break;
      case "agent":
        items.push("需要自动化工作流与任务执行的企业与个人");
        break;
      case "audio":
        items.push("需要语音合成、配音与音乐生成的创作者");
        break;
      case "marketing":
        items.push("营销与增长团队，需要自动化内容生产与优化");
        break;
      case "research":
        items.push("研究人员与学生，需要文献检索与论文分析");
        break;
    }
  }

  if (items.length < 3) {
    items.push("对 AI 工具感兴趣、希望提升效率的各类用户");
  }

  return items.slice(0, 5);
}

function buildPlatformAnswer(tagNames: string[]): string {
  const platforms: string[] = ["网页版（浏览器直接使用）"];
  if (tagNames.includes("移动端")) platforms.push("移动端 App");
  if (tagNames.includes("IDE 插件")) platforms.push("IDE 插件（VS Code / JetBrains）");
  if (tagNames.includes("命令行")) platforms.push("命令行工具（CLI）");
  if (tagNames.includes("浏览器")) platforms.push("浏览器扩展");
  if (tagNames.includes("API")) platforms.push("API 接口（供开发者集成）");
  return `${platforms.join("、")}。具体支持情况请以官网为准。`;
}
