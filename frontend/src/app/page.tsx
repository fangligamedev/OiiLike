import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="ml-[60px] min-h-screen flex flex-col items-center justify-center p-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-producer)] to-[var(--color-voidshaper)] text-white font-bold text-3xl mb-8 shadow-[var(--glow-pink)]">
            AG
          </div>

          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[var(--color-producer)] via-[var(--color-voidshaper)] to-[var(--color-codeweaver)] bg-clip-text text-transparent">
            AntiGravity
          </h1>

          <p className="text-xl text-[var(--text-secondary)] mb-8">
            多智能体协作平台 — 四位 AI 智能体协同为您创造
          </p>

          {/* Agent Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <AgentCard
              icon="🎬"
              name="Producer"
              chineseName="制作人"
              color="var(--color-producer)"
              description="统筹全局"
            />
            <AgentCard
              icon="🎨"
              name="VoidShaper"
              chineseName="虚空塑形者"
              color="var(--color-voidshaper)"
              description="视觉创造"
            />
            <AgentCard
              icon="⚙️"
              name="CodeWeaver"
              chineseName="代码编织者"
              color="var(--color-codeweaver)"
              description="逻辑构建"
            />
            <AgentCard
              icon="🔍"
              name="Inquisitor"
              chineseName="审判官"
              color="var(--color-inquisitor)"
              description="质量保障"
            />
          </div>

          {/* CTA Button */}
          <Link
            href="/space/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-producer)] text-white text-lg font-medium hover:scale-105 transition-transform shadow-[var(--glow-pink)]"
          >
            开始创造
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <FeatureCard
            title="自然语言交互"
            description="用简单的话描述您的需求，智能体会自动理解并分解任务。"
          />
          <FeatureCard
            title="可视化协作"
            description="实时看到每个智能体的工作进度，资产直接展示在画布上。"
          />
          <FeatureCard
            title="质量保障"
            description="Inquisitor 自动编写测试用例，确保每个功能都经过验证。"
          />
        </div>
      </main>
    </div>
  );
}

interface AgentCardProps {
  icon: string;
  name: string;
  chineseName: string;
  color: string;
  description: string;
}

function AgentCard({ icon, name, chineseName, color, description }: AgentCardProps) {
  return (
    <div
      className="p-4 rounded-xl border-2 transition-all hover:scale-105"
      style={{ borderColor: color, backgroundColor: `${color}10` }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-medium" style={{ color }}>{chineseName}</div>
      <div className="text-xs text-[var(--text-muted)]">{name}</div>
      <div className="text-xs text-[var(--text-secondary)] mt-1">{description}</div>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)]">
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
