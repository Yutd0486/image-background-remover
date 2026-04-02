# 定价系统集成指南

## 已实现的文件

### 1. 核心库文件

#### `src/lib/pricing.ts`
- 定价常量和配置
- 用户配额计算函数
- 功能权限检查函数
- 成本对比计算函数

#### `src/lib/auth-middleware.ts`
- 认证上下文提取
- 配额检查中间件
- 功能权限检查中间件

### 2. API 路由

#### `src/app/api/pricing/credits/route.ts`
- GET：获取可用的积分包
- POST：创建积分包购买订单

#### `src/app/api/pricing/subscription/route.ts`
- GET：获取当前订阅信息
- POST：创建或升级订阅
- DELETE：取消订阅

### 3. 页面

#### `src/app/pricing/page.tsx`
- 定价页面
- 成本对比计算器
- 积分包和订阅卡片

#### `src/app/subscription/page.tsx`
- 个人中心订阅管理
- 使用统计
- 账单历史

### 4. 组件

#### `src/components/QuotaExhaustedModal.tsx`
- 额度用尽提示弹窗

---

## 集成步骤

### Step 1: 数据库设置

如果使用 Prisma，复制 `prisma/schema.prisma.example` 中的 schema 到你的 `prisma/schema.prisma`：

```bash
# 创建迁移
npx prisma migrate dev --name add_pricing_schema

# 生成 Prisma 客户端
npx prisma generate
```

### Step 2: 环境变量

在 `.env.local` 中添加支付网关配置：

```env
# Alipay
ALIPAY_APP_ID=your_app_id
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key

# WeChat Pay
WECHAT_MCH_ID=your_mch_id
WECHAT_API_KEY=your_api_key
WECHAT_CERT_PATH=path_to_cert
```

### Step 3: 支付网关集成

在 `src/lib/payment.ts` 中实现支付逻辑（示例）：

```typescript
// src/lib/payment.ts
import Alipay from 'alipay-sdk'

const alipay = new Alipay({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  publicKey: process.env.ALIPAY_PUBLIC_KEY,
})

export async function createAlipayOrder(
  orderId: string,
  amount: number,
  subject: string
) {
  return await alipay.pageExecute('alipay.trade.page.pay', {
    out_trade_no: orderId,
    total_amount: amount,
    subject: subject,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
  })
}
```

### Step 4: 在 remove-bg API 中集成权限检查

修改 `src/app/api/remove-bg/route.ts`：

```typescript
import { withQuotaCheck } from '@/lib/auth-middleware'
import { PRICING } from '@/lib/pricing'

export const POST = withQuotaCheck(async (req, context) => {
  // 处理图片
  const result = await removeBackground(imageBuffer)

  // 消耗配额
  if (context.monthlyLimit > 0) {
    // 从订阅配额消耗
    await updateSubscriptionUsage(context.userId, 1)
  } else {
    // 从积分消耗
    await deductCredits(context.userId, 1)
  }

  return NextResponse.json(result)
})
```

### Step 5: 在首页添加定价链接

修改 `src/app/page.tsx`：

```typescript
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* ... existing content ... */}
      
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          免费试用
        </button>
        <Link
          href="/pricing"
          className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg"
        >
          查看定价
        </Link>
      </div>
    </div>
  )
}
```

### Step 6: 在处理结果页面添加升级提示

修改 `src/app/page.tsx` 的结果显示部分：

```typescript
import QuotaExhaustedModal from '@/components/QuotaExhaustedModal'

export default function HomePage() {
  const [showQuotaModal, setShowQuotaModal] = useState(false)

  const handleDownload = async () => {
    try {
      // 下载逻辑
      const response = await fetch('/api/remove-bg', { /* ... */ })
      
      if (response.status === 403) {
        // 配额不足
        setShowQuotaModal(true)
        return
      }
      
      // 下载文件
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div>
      {/* ... existing content ... */}
      
      <button onClick={handleDownload}>
        下载
      </button>

      <QuotaExhaustedModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />
    </div>
  )
}
```

---

## 支付流程

### 支付宝流程

1. 用户点击"购买"
2. 调用 `POST /api/pricing/credits`
3. 后端创建订单，调用支付宝 API
4. 返回支付 URL 或 QR 码
5. 用户扫码/跳转支付
6. 支付宝回调 `POST /api/payment/callback`
7. 验证签名，更新订单状态
8. 添加积分到用户账户

### 微信支付流程

类似支付宝，但使用微信支付 API

---

## 测试

### 本地测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问定价页面：
```
http://localhost:3000/pricing
```

3. 测试成本计算器
4. 测试 API 端点：
```bash
# 获取积分包
curl http://localhost:3000/api/pricing/credits

# 获取订阅信息
curl http://localhost:3000/api/pricing/subscription
```

### 支付测试

使用支付网关的沙箱环境：

- **支付宝沙箱**：https://openhome.alipay.com/platform/appDaily.htm
- **微信支付沙箱**：https://pay.weixin.qq.com/wiki

---

## 后续优化

### 短期（1-2 周）
- [ ] 集成真实支付网关
- [ ] 实现支付回调处理
- [ ] 添加订单管理后台
- [ ] 实现自动续费

### 中期（2-4 周）
- [ ] 添加发票功能
- [ ] 实现推荐返利
- [ ] 添加优惠券系统
- [ ] 实现用户分析

### 长期（1-3 月）
- [ ] 支持 PayPal
- [ ] 支持 Stripe
- [ ] 实现企业级 SLA
- [ ] 添加团队管理

---

## 常见问题

**Q: 如何处理支付失败？**
A: 在支付回调中检查支付状态，如果失败则不添加积分，用户可重试。

**Q: 如何处理订阅续费？**
A: 使用定时任务（cron job）在续费日期检查并自动续费。

**Q: 如何处理退款？**
A: 在后台创建退款订单，调用支付网关退款 API，更新用户积分。

**Q: 如何防止积分被滥用？**
A: 实现速率限制、IP 限制、异常检测等安全措施。

---

## 支持

如有问题，请查看：
- 定价策略文档：`PRICING_STRATEGY.md`
- API 文档：`API.md`（待创建）
