/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_PERPLEXITY_API_KEY: string;
  readonly VITE_NVIDIA_API_KEY: string;
  readonly VITE_EXA_API_KEY: string;
  readonly VITE_GROK_API_KEY: string;
  readonly VITE_GITHUB_TOKEN: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_MINIMAX_API_KEY: string;
  readonly VITE_MINIMAXI_API_KEY: string;
  readonly VITE_TENCENT_SECRET_ID: string;
  readonly VITE_TENCENT_SECRET_KEY: string;
  readonly VITE_ALIYUN_API_KEY: string;
  readonly VITE_API_SERVER_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
