"use client";

import { Activity, BookOpen, MessageSquareCode, ExternalLink } from "lucide-react";

export default function AdminSystemsPage() {
  const systemLinks = [
    {
      name: "Grafana 모니터링",
      description: "DATT 생태계의 인프라 상태, JVM 매트릭, 트래픽을 실시간으로 관제합니다.",
      href: process.env.NEXT_PUBLIC_GRAFANA_URL || "http://localhost:3001",
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      hoverBorder: "hover:border-orange-500/50",
    },
    {
      name: "DATT Swagger API",
      description: "DATT 코어 플랫폼의 REST API 명세서 및 테스트 환경입니다.",
      href: process.env.NEXT_PUBLIC_DATT_SWAGGER_URL || "https://datt-prd.xyz/datt-swagger/swagger-ui/index.html",
      icon: BookOpen,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      hoverBorder: "hover:border-green-500/50",
    },
    {
      name: "WAVE Swagger API",
      description: "WAVE 실시간 메시징 마이크로서비스의 API 명세서입니다.",
      href: process.env.NEXT_PUBLIC_WAVE_SWAGGER_URL || "https://datt-prd.xyz/wave-swagger/swagger-ui/index.html",
      icon: MessageSquareCode,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      hoverBorder: "hover:border-blue-500/50",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white">시스템 링크 관리</h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">
          DATT 플랫폼과 연동된 외부 시스템 및 인프라 모니터링 도구로 빠르게 이동할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col h-full p-6 rounded-3xl border ${link.border} ${link.hoverBorder} bg-slate-900/50 hover:bg-slate-800 transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${link.bg}`}>
                  <Icon className={`w-6 h-6 ${link.color}`} />
                </div>
                <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{link.name}</h2>
              <p className="text-xs text-slate-400 leading-relaxed flex-1">
                {link.description}
              </p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
