"use client";

import { useEffect, useState } from "react";
import { X, FileText, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/common/Button";

interface DevNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DevNoteModal({ isOpen, onClose }: DevNoteModalProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedVersion, setSelectedVersion] = useState<string>("v2.0.1");

  useEffect(() => {
    if (!isOpen) {
      setSelectedVersion("v2.0.1");
      return;
    }

    async function fetchDevNote() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/next-api/dev-note?version=${selectedVersion}`);
        if (!res.ok) {
          throw new Error("개발자 노트를 불러오는 데 실패했습니다.");
        }
        const data = await res.json();
        setContent(data.content || "");
      } catch (err: any) {
        console.error(err);
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchDevNote();
  }, [isOpen, selectedVersion]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 md:p-6 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_30px_70px_rgba(15,23,42,0.25)] relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        {/* Header - Fixed */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col gap-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                DATT History
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-3 flex items-center gap-2">
                ⚓ DATT 개발자 노트
              </h3>
              <p className="text-xs font-semibold text-slate-450 mt-1.5 leading-relaxed">
                더 나은 서비스를 만들기 위해, DATT 크루가 차곡차곡 쌓아 올린 릴리즈 히스토리입니다.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-650 transition cursor-pointer p-1.5 rounded-xl hover:bg-slate-100/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Version Selector Tabs */}
          <div className="flex gap-2 border-t border-slate-50 pt-4">
            {["v2.0.1", "v2.0.0", "v1.0.0"].map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => setSelectedVersion(version)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  selectedVersion === version
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700"
                    : "text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-600 border border-transparent hover:border-indigo-100"
                }`}
              >
                {version} {version === "v2.0.1" ? "(Latest)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-0 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-bold text-slate-400">개발자 노트를 읽어오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-rose-600 font-bold text-xs">
              ⚠️ {error}
            </div>
          ) : (
            <MarkdownRenderer text={content} />
          )}
        </div>

        {/* Footer Button - Fixed */}
        <div className="p-6 border-t border-slate-100 flex justify-end shrink-0 bg-slate-55/50">
          <Button
            type="button"
            variant="primary"
            className="w-full sm:w-auto h-11 px-8 rounded-2xl font-bold shadow-md shadow-indigo-100 text-sm flex items-center justify-center"
            onClick={onClose}
          >
            기록 닫기
          </Button>
        </div>
      </div>
    </div>
  );
}

// 경량 마크다운 렌더러 컴포넌트
function MarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  
  // 간단한 inline bold, code, link 파서
  const parseInlineElements = (rawText: string) => {
    // 1. Link 파싱: [표시텍스트](경로) 형태 지원
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: any[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(rawText)) !== null) {
      const matchIndex = match.index;
      
      // 링크 이전 텍스트 처리
      if (matchIndex > lastIndex) {
        parts.push(...parseBoldAndCode(rawText.slice(lastIndex, matchIndex)));
      }

      const linkText = match[1];
      const linkUrl = match[2];

      parts.push(
        <span
          key={`link-${matchIndex}`}
          className="text-indigo-600 font-bold hover:underline"
        >
          {linkText}
        </span>
      );

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < rawText.length) {
      parts.push(...parseBoldAndCode(rawText.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : parseBoldAndCode(rawText);
  };

  const parseBoldAndCode = (rawText: string): any[] => {
    // 백틱으로 둘러싸인 inline code 블록 분할
    const codeParts = rawText.split(/`([^`]+)`/g);
    return codeParts.flatMap((part, i) => {
      if (i % 2 === 1) {
        return [
          <code 
            key={`code-${i}`} 
            className="font-mono text-[10px] text-pink-650 bg-slate-50 border border-slate-200/50 px-1.5 py-0.5 rounded-md mx-0.5 font-bold shadow-sm"
          >
            {part}
          </code>
        ];
      }
      return parseBold(part);
    });
  };

  const parseBold = (rawText: string) => {
    const parts = rawText.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-slate-900">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 font-sans text-xs text-slate-750 leading-relaxed">
      {lines.map((line, idx) => {
        // H1
        if (line.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-xl font-black text-slate-900 border-b border-slate-100 pb-2.5 mt-8 first:mt-0">
              {line.replace("# ", "")}
            </h1>
          );
        }
        // H2
        if (line.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-lg font-black text-slate-900 border-l-4 border-indigo-600 pl-3 mt-8 mb-4">
              {line.replace("## ", "")}
            </h2>
          );
        }
        // H3
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-indigo-600 mt-6 mb-3 flex items-center gap-1.5">
              {line.replace("### ", "")}
            </h3>
          );
        }
        // HR
        if (line.trim() === "---") {
          return <hr key={idx} className="border-slate-100 my-6" />;
        }
        // Blockquote
        if (line.startsWith("> ")) {
          return (
            <blockquote key={idx} className="p-4 my-4 bg-slate-50/70 border-l-4 border-indigo-200 rounded-r-2xl font-semibold text-slate-500 italic">
              {line.replace("> ", "")}
            </blockquote>
          );
        }
        // Bullet list item
        if (line.startsWith("* ") || line.startsWith("- ") || line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
          const depth = line.search(/\S/); // 들여쓰기 깊이 감지
          const cleanLine = line.trim().replace(/^[\*\-]\s+/, "");
          return (
            <div 
              key={idx} 
              className="flex items-start gap-2 text-slate-650"
              style={{ paddingLeft: `${depth * 8 + 12}px` }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-2"></span>
              <span className="font-medium text-slate-650">{parseInlineElements(cleanLine)}</span>
            </div>
          );
        }
        // Empty lines
        if (line.trim() === "") {
          return <div key={idx} className="h-1.5" />;
        }
        // Normal paragraphs
        return (
          <p key={idx} className="font-medium text-slate-650">
            {line.startsWith("    ") || line.startsWith("\t") ? (
              <span className="pl-6 block">{parseInlineElements(line.trim())}</span>
            ) : (
              parseInlineElements(line)
            )}
          </p>
        );
      })}
    </div>
  );
}
