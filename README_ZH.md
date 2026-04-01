# Claude Code v2.1.88 — 原始碼分析

> **免責聲明**: 本儲存庫中所有原始碼版權屬於 **Anthropic 和 Claude** 所有。本儲存庫僅供技術研究和科研愛好者交流學習參考，**嚴禁任何個人、機構及組織將其用於商業用途、營利性活動、非法用途及其他未經授權的場景。** 若內容涉及侵犯您的合法權益、智慧財產權或存在其他侵權問題，請務必聯繫我們，我們將第一時間核實並予以刪除處理。

> 從 npm 套件 `@anthropic-ai/claude-code` **2.1.88** 版本中擷取。
> 發布的套件只有一個打包後的 `cli.js`（~12MB）。本儲存庫的 `src/` 目錄包含從 npm 套件中解包的 **TypeScript 原始碼**。

**語言**: [English](README.md) | **中文**

---

## 目錄

- [深度分析文件 (`docs/`)](#深度分析文件-docs) — 遙測、模型代號、臥底模式、遠端控制、未來路線圖
- [缺失模組說明](#缺失模組說明108-個模組) — 108 個被 feature gate 移除的模組
- [架構概覽](#架構概覽) — 入口 → 查詢引擎 → 工具/服務/狀態
- [建置說明](#建置說明) — 為什麼不能直接編譯

---

## 深度分析文件 (`docs/`)

基於 v2.1.88 反編譯原始碼的分析報告，中英雙語。

```
docs/
├── en/                                        # English
│   ├── [01-telemetry-and-privacy.md]          # Telemetry & Privacy — what's collected, why you can't opt out
│   ├── [02-hidden-features-and-codenames.md]  # Codenames (Capybara/Tengu/Numbat), feature flags, internal vs external
│   ├── [03-undercover-mode.md]                # Undercover Mode — hiding AI authorship in open-source repos
│   ├── [04-remote-control-and-killswitches.md]# Remote Control — managed settings, killswitches, model overrides
│   └── [05-future-roadmap.md]                 # Future Roadmap — Numbat, KAIROS, voice mode, unreleased tools
│
└── zh/                                        # 中文
    ├── [01-遙測與隱私分析.md]                    # 遙測與隱私 — 收集了什麼，為什麼無法退出
    ├── [02-隱藏功能與模型代號.md]                # 隱藏功能 — 模型代號，feature flag，內外使用者差異
    ├── [03-臥底模式分析.md]                     # 臥底模式 — 在開源專案中隱藏 AI 身份
    ├── [04-遠端控制與緊急開關.md]                # 遠端控制 — 託管設定，緊急開關，模型覆寫
    └── [05-未來路線圖.md]                       # 未來路線圖 — Numbat，KAIROS，語音模式，未上線工具
```

> 點擊檔名即可跳轉到對應報告。

| # | 主題 | 核心發現 | 連結 |
|---|------|---------|------|
| 01 | **遙測與隱私** | 雙層分析管道（1P→Anthropic, Datadog）。環境指紋、程序指標、每個事件攜帶工作階段/使用者 ID。**沒有面向使用者的退出開關**。`OTEL_LOG_TOOL_DETAILS=1` 可記錄完整工具輸入。 | [EN](docs/en/01-telemetry-and-privacy.md) · [中文](docs/zh/01-遙測與隱私分析.md) |
| 02 | **隱藏功能與代號** | 動物代號體系（Capybara v8, Tengu, Fennec→Opus 4.6, **Numbat** 下一代）。Feature flag 用隨機詞對掩蓋用途。內部使用者獲得更好的 prompt 和驗證代理。隱藏指令：`/btw`、`/stickers`。 | [EN](docs/en/02-hidden-features-and-codenames.md) · [中文](docs/zh/02-隱藏功能與模型代號.md) |
| 03 | **臥底模式** | Anthropic 員工在公開儲存庫自動進入臥底模式。模型指令："**不要暴露你的掩護身份**" — 剝離所有 AI 歸屬，commit 看起來像人類寫的。**沒有強制關閉選項。** | [EN](docs/en/03-undercover-mode.md) · [中文](docs/zh/03-臥底模式分析.md) |
| 04 | **遠端控制與 Killswitch** | 每小時輪詢 `/api/claude_code/settings`。危險變更彈出阻斷對話框 — **拒絕 = 程式退出**。6+ 緊急開關（繞過權限、快速模式、語音模式、分析 sink）。GrowthBook 可無同意改變任何使用者行為。 | [EN](docs/en/04-remote-control-and-killswitches.md) · [中文](docs/zh/04-遠端控制與緊急開關.md) |
| 05 | **未來路線圖** | **Numbat** 代號確認。Opus 4.7 / Sonnet 4.8 開發中。**KAIROS** = 完全自主代理模式，心跳 `<tick>`、推播通知、PR 訂閱。語音模式（push-to-talk）已就緒。發現 17 個未上線工具。 | [EN](docs/en/05-future-roadmap.md) · [中文](docs/zh/05-未來路線圖.md) |

---

## 缺失模組說明（108 個模組）

> **原始碼不完整。** 108 個被 `feature()` 閘控的模組**未包含**在 npm 套件中。
> 它們僅存在於 Anthropic 的內部 monorepo 中，在編譯時被死程式碼消除。
> **無法**從 `cli.js`、`sdk-tools.d.ts` 或任何已發布的成品中復原。

### Anthropic 內部程式碼（~70 個模組，從未發布）

這些模組在 npm 套件中沒有任何原始檔。它們是 Anthropic 內部基礎設施。

<details>
<summary>點擊展開完整列表</summary>

| Module | Purpose | Feature Gate |
|--------|---------|-------------|
| `daemon/main.js` | 後台守護程序管理器 | `DAEMON` |
| `daemon/workerRegistry.js` | 守護程序 worker 註冊 | `DAEMON` |
| `proactive/index.js` | 主動通知系統 | `PROACTIVE` |
| `contextCollapse/index.js` | 內文折疊服務（實驗性） | `CONTEXT_COLLAPSE` |
| `contextCollapse/operations.js` | 折疊操作 | `CONTEXT_COLLAPSE` |
| `contextCollapse/persist.js` | 折疊持久化 | `CONTEXT_COLLAPSE` |
| `skillSearch/featureCheck.js` | 遠端技能特性檢查 | `EXPERIMENTAL_SKILL_SEARCH` |
| `skillSearch/remoteSkillLoader.js` | 遠端技能載入器 | `EXPERIMENTAL_SKILL_SEARCH` |
| `skillSearch/remoteSkillState.js` | 遠端技能狀態 | `EXPERIMENTAL_SKILL_SEARCH` |
| `skillSearch/telemetry.js` | 技能搜尋遙測 | `EXPERIMENTAL_SKILL_SEARCH` |
| `skillSearch/localSearch.js` | 本地技能搜尋 | `EXPERIMENTAL_SKILL_SEARCH` |
| `skillSearch/prefetch.js` | 技能預取 | `EXPERIMENTAL_SKILL_SEARCH` |
| `coordinator/workerAgent.js` | 多代理協調器 worker | `COORDINATOR_MODE` |
| `bridge/peerSessions.js` | 橋接對等工作階段管理 | `BRIDGE_MODE` |
| `assistant/index.js` | KAIROS 助手模式 | `KAIROS` |
| `assistant/AssistantSessionChooser.js` | 助手工作階段選擇器 | `KAIROS` |
| `compact/reactiveCompact.js` | 響應式內文壓縮 | `CACHED_MICROCOMPACT` |
| `compact/snipCompact.js` | 基於裁剪的壓縮 | `HISTORY_SNIP` |
| `compact/snipProjection.js` | 裁剪投影 | `HISTORY_SNIP` |
| `compact/cachedMCConfig.js` | 快取微壓縮設定 | `CACHED_MICROCOMPACT` |
| `sessionTranscript/sessionTranscript.js` | 工作階段轉錄服務 | `TRANSCRIPT_CLASSIFIER` |
| `commands/agents-platform/index.js` | 內部代理平台 | `ant` (內部) |
| `commands/assistant/index.js` | 助手指令 | `KAIROS` |
| `commands/buddy/index.js` | Buddy 系統通知 | `BUDDY` |
| `commands/fork/index.js` | Fork 子代理指令 | `FORK_SUBAGENT` |
| `commands/peers/index.js` | 多對等指令 | `BRIDGE_MODE` |
| `commands/proactive.js` | 主動指令 | `PROACTIVE` |
| `commands/remoteControlServer/index.js` | 遠端控制伺服器 | `DAEMON` + `BRIDGE_MODE` |
| `commands/subscribe-pr.js` | GitHub PR 訂閱 | `KAIROS_GITHUB_WEBHOOKS` |
| `commands/torch.js` | 內部除錯工具 | `TORCH` |
| `commands/workflows/index.js` | 工作流程指令 | `WORKFLOW_SCRIPTS` |
| `jobs/classifier.js` | 內部任務分類器 | `TEMPLATES` |
| `memdir/memoryShapeTelemetry.js` | 記憶形狀遙測 | `MEMORY_SHAPE_TELEMETRY` |
| `services/sessionTranscript/sessionTranscript.js` | 工作階段轉錄 | `TRANSCRIPT_CLASSIFIER` |
| `tasks/LocalWorkflowTask/LocalWorkflowTask.js` | 本地工作流程任務 | `WORKFLOW_SCRIPTS` |
| `protectedNamespace.js` | 內部命名空間守衛 | `ant` (內部) |
| `protectedNamespace.js` (envUtils) | 受保護命名空間執行時 | `ant` (內部) |
| `coreTypes.generated.js` | 生成的核心類型 | `ant` (內部) |
| `devtools.js` | 內部開發工具 | `ant` (內部) |
| `attributionHooks.js` | 內部歸屬鉤子 | `COMMIT_ATTRIBUTION` |
| `systemThemeWatcher.js` | 系統主題監視器 | `AUTO_THEME` |
| `udsClient.js` / `udsMessaging.js` | UDS 訊息用戶端 | `UDS_INBOX` |

</details>

### Feature-Gated 工具（~20 個模組）

這些工具有類型簽名，但實作被編譯時移除。

<details>
<summary>點擊展開完整列表</summary>

| Tool | Purpose | Feature Gate |
|------|---------|-------------|
| `REPLTool` | 互動式 REPL（VM 沙箱） | `ant` (內部) |
| `SnipTool` | 內文裁剪 | `HISTORY_SNIP` |
| `SleepTool` | 代理迴圈中的休眠/延遲 | `PROACTIVE` / `KAIROS` |
| `MonitorTool` | MCP 監控 | `MONITOR_TOOL` |
| `OverflowTestTool` | 溢位測試 | `OVERFLOW_TEST_TOOL` |
| `WorkflowTool` | 工作流程執行 | `WORKFLOW_SCRIPTS` |
| `WebBrowserTool` | 瀏覽器自動化 | `WEB_BROWSER_TOOL` |
| `TerminalCaptureTool` | 終端機擷取 | `TERMINAL_PANEL` |
| `TungstenTool` | 內部效能監控 | `ant` (內部) |
| `VerifyPlanExecutionTool` | 計劃驗證 | `CLAUDE_CODE_VERIFY_PLAN` |
| `SendUserFileTool` | 向使用者傳送檔案 | `KAIROS` |
| `SubscribePRTool` | GitHub PR 訂閱 | `KAIROS_GITHUB_WEBHOOKS` |
| `SuggestBackgroundPRTool` | 建議背景 PR | `KAIROS` |
| `PushNotificationTool` | 推播通知 | `KAIROS` |
| `CtxInspectTool` | 內文檢查 | `CONTEXT_COLLAPSE` |
| `ListPeersTool` | 列出活躍對等方 | `UDS_INBOX` |
| `DiscoverSkillsTool` | 技能發現 | `EXPERIMENTAL_SKILL_SEARCH` |

</details>

### 文字/Prompt 資源（~6 個檔案）

| File | Purpose |
|------|---------|
| `yolo-classifier-prompts/auto_mode_system_prompt.txt` | 自動模式分類器系統提示 |
| `yolo-classifier-prompts/permissions_anthropic.txt` | Anthropic 內部權限提示 |
| `yolo-classifier-prompts/permissions_external.txt` | 外部使用者權限提示 |
| `verify/SKILL.md` | 驗證技能文件 |
| `verify/examples/cli.md` | CLI 驗證範例 |
| `verify/examples/server.md` | 伺服器端驗證範例 |

### 為什麼缺失

```
  Anthropic 內部 Monorepo              發布的 npm 套件
  ──────────────────────               ─────────────────────
  feature('DAEMON') → true    ──建置──→   feature('DAEMON') → false
  ↓                                         ↓
  daemon/main.js  ← 包含        ──打包──→  daemon/main.js  ← 刪除 (DCE)
  tools/REPLTool  ← 包含        ──打包──→  tools/REPLTool  ← 刪除 (DCE)
  proactive/      ← 包含        ──打包──→  （被引用但 src/ 中不存在）
```

  Bun 的 `feature()` 是**編譯時內建函式**：
  - 在 Anthropic 內部建置中返回 `true` → 程式碼保留在 bundle 中
  - 在發布建置中返回 `false` → 程式碼被死程式碼消除
  - 108 個模組在已發布的成品中根本不存在

---

## 版權與免責聲明

```
Copyright (c) Anthropic. All rights reserved.

本儲存庫中所有原始碼均為 Anthropic 和 Claude 的智慧財產權。
本儲存庫僅用於技術研究和教育目的。嚴禁商業使用。

如果您是版權所有者並認為本儲存庫侵犯了您的權利，
請聯繫儲存庫所有者立即刪除。
```

---

## 統計資料

| 項目 | 數量 |
|------|------|
| 原始檔 (.ts/.tsx) | ~1,884 |
| 程式碼行數 | ~512,664 |
| 最大單一檔案 | `query.ts` (~785KB) |
| 內建工具 | ~40+ |
| 斜線指令 | ~80+ |
| 相依套件 (node_modules) | ~192 個套件 |
| 執行環境 | Bun（編譯為 Node.js >= 18 bundle）|

---

## 代理模式

```
                    核心迴圈
                    ========

    使用者 --> messages[] --> Claude API --> 回應
                                          |
                                stop_reason == "tool_use"?
                               /                          \
                             是                           否
                              |                             |
                        執行工具                        傳回文字
                        追加 tool_result
                        迴圈退回 -----------------> messages[]


    這就是最小的代理迴圈。Claude Code 在此迴圈上
    包裹了生產等級束縛：權限、串流、並行、
    壓縮、子代理、持久化和 MCP。
```

---

## 目錄參考

```
src/
├── main.tsx                 # REPL 引導程式，4,683 行
├── QueryEngine.ts           # SDK/headless 查詢生命週期引擎
├── query.ts                 # 主代理迴圈 (785KB，最大檔案)
├── Tool.ts                  # 工具介面 + buildTool 工廠
├── Task.ts                  # 任務類型、ID、狀態基類
├── tools.ts                 # 工具註冊、預設、過濾
├── commands.ts              # 斜線指令定義
├── context.ts               # 使用者輸入內文
├── cost-tracker.ts          # API 成本累積
├── setup.ts                 # 首次執行設定流程
│
├── bridge/                  # Claude Desktop / 遠端橋接
│   ├── bridgeMain.ts        #   工作階段生命週期管理器
│   ├── bridgeApi.ts         #   HTTP 用戶端
│   ├── bridgeConfig.ts      #   連線設定
│   ├── bridgeMessaging.ts   #   訊息中繼
│   ├── sessionRunner.ts     #   程序生成
│   ├── jwtUtils.ts          #   JWT 重新整理
│   ├── workSecret.ts        #   認證權杖
│   └── capacityWake.ts      #   基於容量的喚醒
│
├── cli/                     # CLI 基礎設施
│   ├── handlers/            #   指令處理器
│   └── transports/          #   I/O 傳輸 (stdio, structured)
│
├── commands/                # ~80 個斜線指令
├── components/              # React/Ink 終端機 UI
├── entrypoints/             # 應用程式進入點
├── hooks/                   # React hooks
├── services/                # 業務邏輯層
├── state/                   # 應用程式狀態
├── tasks/                   # 任務實作
├── tools/                   # 40+ 工具實作
├── types/                   # 類型定義
├── utils/                   # 工具函式（最大目錄）
└── vendor/                  # 原生模組原始碼存根
```

---

## 架構概覽

```
┌─────────────────────────────────────────────────────────────────────┐
│                         進入層                                      │
│  cli.tsx ──> main.tsx ──> REPL.tsx (互動式)                        │
│                     └──> QueryEngine.ts (headless/SDK)              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       查詢引擎                                      │
│  submitMessage(prompt) ──> AsyncGenerator<SDKMessage>               │
│    ├── fetchSystemPromptParts()    ──> 組裝系統提示詞               │
│    ├── processUserInput()          ──> 處理 /指令                   │
│    ├── query()                     ──> 主代理迴圈                   │
│    │     ├── StreamingToolExecutor ──> 並行工具執行                  │
│    │     ├── autoCompact()         ──> 內文壓縮                   │
│    │     └── runTools()            ──> 工具編排                     │
│    └── yield SDKMessage            ──> 串流傳輸給消費者             │
└──────────────────────────────┬──────────────────────────────────────┘
```

---

## 建置說明

本原始碼**不能直接從本儲存庫編譯**：

- 缺少 `tsconfig.json`、建置腳本和 Bun bundler 設定
- `feature()` 呼叫是 Bun 編譯時內建函式 — 在打包時解析
- `MACRO.VERSION` 在建置時注入
- `process.env.USER_TYPE === 'ant'` 部分是 Anthropic 內部的
- 編譯後的 `cli.js` 是一個自包含的 12MB bundle，只需 Node.js >= 18

**建置說明詳見 [QUICKSTART.md](QUICKSTART.md)。**

---

## 授權條款

本儲存庫中所有原始碼版權屬於 **Anthropic 和 Claude** 所有。本儲存庫僅用於技術研究和教育目的。完整授權條款請參閱原始 npm 套件。
