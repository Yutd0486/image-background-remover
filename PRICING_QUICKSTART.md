# 定价系统快速开始

## 已实现的功能

✅ **定价策略**
- 积分包：¥1.50/次（按需购买）
- Pro 订阅：¥29/月（100 次/月）
- Pro Plus 订阅：¥79/月（300 次/月）

✅ **权限系统**
- 免费版：3 次（注册赠送）
- Pro：100 次/月 + 4K 分辨率 + 自定义背景色
- Pro Plus：300 次/月 + 8K 分辨率 + 批量处理

✅ **核心功能**
- 配额检查中间件
- 功能权限检查
- 成本对比计算器
- 额度用尽提示

✅ **页面和 API**
- `/pricing` - 定价页面
- `/subscription` - 订阅管理
- `/api/pricing/credits` - 积分包 API
- `/api/pricing/subscription` - 订阅 API

---

## 下一步集成

### 1. 数据库集成（必需）

```bash
# 如果使用 Prisma
cp prisma/schema.prisma.example prisma/schema.prisma
npx prisma migrate dev --name add_pricing
```

### 2. 支付网关集成（必需）

选择一个支付方案：

**方案 A：支付宝**
```bash
npm install alipay-sdk
```

**方案 B：微信支付**
```bash
npm install wechat-pay
```

**方案 C：Stripe（国际）**
```bash
npm install stripe
```

### 3. 在 remove-bg API 中添加权限检查

修改 `src/app/api/remove-bg/route.ts`：

```typescript
import { withQuotaCheck } from '@/lib/auth-middleware'

export const POST = withQuotaCheck(async (req, context) => {
  // 你的处理逻辑
  const result = await removeBackground(imageBuffer)
  
  // 消耗配额
  await deductQuota(context.userId, 1)
  
  return NextResponse.json(result)
})
```

### 4. 在首页添加定价链接

```typescript
import Link from 'next/link'

<Link href="/pricing" className="...">
  查看定价
</Link>
```

---

## 文件结构

```
src/
├── app/
│   ├── api/
│   │   └── pricing/
│   │       ├── credits/route.ts      # 积分包 API
│   │       └── subscription/route.ts # 订阅 API
│   ├── pricing/
│   │   └── page.tsx                  # 定价页面
│   └── subscription/
│       └── page.tsx                  # 订阅管理
├── components/
│   └── QuotaExhaustedModal.tsx       # 额度用尽弹窗
└── lib/
    ├── pricing.ts                    # 定价常量和工具
    └── auth-middleware.ts            # 权限检查中间件

prisma/
└── schema.prisma.example             # 数据库 schema

PRICING_STRATEGY.md                   # 定价策略文档
PRICING_IMPLEMENTATION.md             # 实现指南
```

---

## 关键代码示例

### 检查用户配额

```typescript
import { checkQuota, getAuthContext } from '@/lib/auth-middleware'

const context = getAuthContext(request)
const quota = checkQuota(context, 1) // 需要 1 个配额

if (!quota.allowed) {
  return NextResponse.json(
    { error: quota.reason },
    { status: 403 }
  )
}
```

### 检查功能权限

```typescript
import { checkFeature } from '@/lib/auth-middleware'

const featureCheck = checkFeature(context, '4k')
if (!featureCheck.allowed) {
  return NextResponse.json(
    { error: 'Upgrade to Pro to use 4K resolution' },
    { status: 403 }
  )
}
```

### 计算成本对比

```typescript
import { calculateSavings } from '@/lib/pricing'

const savings = calculateSavings(50, 'pro')
// { creditCost: 70, subscriptionCost: 29, savings: 41 }
```

---

## 测试 URL

- 定价页面：`http://localhost:3000/pricing`
- 订阅管理：`http://localhost:3000/subscription`
- 积分包 API：`http://localhost:3000/api/pricing/credits`
- 订阅 API：`http://localhost:3000/api/pricing/subscription`

---

## 部署检查清单

- [ ] 数据库迁移完成
- [ ] 支付网关配置完成
- [ ] 环境变量设置完成
- [ ] remove-bg API 集成权限检查
- [ ] 首页添加定价链接
- [ ] 测试所有支付流程
- [ ] 测试所有权限检查
- [ ] 部署到生产环境

---

## 成本估算

### 月度成本（假设 1000 MAU）

| 指标 | 数值 |
|------|------|
| 月活用户 | 1000 |
| 付费用户占比 | 10% |
| 平均使用次数 | 50 |
| API 成本 | ¥0.70/次 |
| **总 API 成本** | **¥3,500** |
| **预期收入** | **¥8,000+** |
| **利润率** | **56%+** |

---

## 常见问题

**Q: 如何测试支付流程？**
A: 使用支付网关的沙箱环境，参考 `PRICING_IMPLEMENTATION.md`

**Q: 如何处理支付失败？**
A: 在支付回调中检查状态，失败则不添加积分

**Q: 如何自动续费？**
A: 使用定时任务（cron）在续费日期自动续费

**Q: 如何处理退款？**
A: 在后台创建退款订单，调用支付 API，更新用户积分

---

## 需要帮助？

查看详细文档：
- `PRICING_STRATEGY.md` - 完整的定价策略
- `PRICING_IMPLEMENTATION.md` - 详细的实现指南
