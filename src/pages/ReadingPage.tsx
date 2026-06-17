import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useAppStore, Term } from "../lib/store";
import { getDayContent, getTotalDays } from "../lib/sampleData";

export default function ReadingPage() {
  const { currentDay, userContext, dailyProgress, terms, updateTerm, updateProgress, setCurrentDay } = useAppStore();
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const content = useMemo(() => getDayContent(currentDay), [currentDay]);
  const readingRef = useRef<HTMLDivElement>(null);
  const totalDays = getTotalDays();

  const [perfResult, setPerfResult] = useState<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    content.terms.forEach((t) => {
      content.readingContent.includes(t.term);
    });
    const elapsed = performance.now() - start;
    setPerfResult(Math.round(elapsed * 100) / 100);
  }, [content]);

  const highlightedContent = useMemo(() => {
    let html = content.readingContent;
    const sortedTerms = [...content.terms].sort(
      (a, b) => b.term.length - a.term.length
    );
    sortedTerms.forEach((term) => {
      const isMastered = terms.find((t) => t.id === term.id)?.mastered;
      const cls = isMastered ? "term-highlight mastered" : "term-highlight";
      const regex = new RegExp(
        `(?<![<\\/\\w])${term.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "g"
      );
      html = html.replace(regex, `<span class="${cls}" data-term-id="${term.id}">${term.term}</span>`);
    });
    html = html.replace(/^## (.+)$/gm, '<h3 style="font-family:var(--font-serif);font-size:18px;margin:20px 0 10px;color:var(--color-primary);">$1</h3>');
    html = html
      .split("\n\n")
      .map((p) => {
        if (p.startsWith("<h3")) return p;
        return `<p style="margin-bottom:16px;">${p}</p>`;
      })
      .join("");
    return html;
  }, [content, terms]);

  const handleTermClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("term-highlight")) {
        const termId = target.getAttribute("data-term-id");
        const term = content.terms.find((t) => t.id === termId);
        if (term) {
          setSelectedTerm(term);
          const existing = terms.find((t) => t.id === term.id);
          updateTerm({
            ...term,
            viewCount: (existing?.viewCount || 0) + 1,
          });
        }
      }
    },
    [content.terms, terms, updateTerm]
  );

  const todayProgress = dailyProgress.find((p) => p.dayNum === currentDay);
  const isReadingCompleted = todayProgress?.readingCompleted || false;
  const isDayCompleted = todayProgress?.readingCompleted && todayProgress?.discussionCompleted && todayProgress?.reflectionCompleted;

  const handleMarkComplete = () => {
    updateProgress({
      dayNum: currentDay,
      readingCompleted: true,
      discussionCompleted: todayProgress?.discussionCompleted || false,
      reflectionCompleted: todayProgress?.reflectionCompleted || false,
      streakDays: todayProgress?.streakDays || 0,
      completedAt: null,
    });
  };

  const handleGoNextDay = () => {
    if (currentDay < totalDays) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleGoPrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h1 className="page-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
          Day {currentDay} 阅读
        </h1>
        {perfResult !== null && (
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            高亮耗时: {perfResult}ms
          </span>
        )}
      </div>

      {/* Day navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          className="btn btn-outline"
          style={{ flex: 1, fontSize: 13, padding: "6px 0" }}
          onClick={handleGoPrevDay}
          disabled={currentDay <= 1}
        >
          ← Day {currentDay - 1}
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="progress-bar" style={{ width: "100%" }}>
            <div className="progress-fill" style={{ width: `${(currentDay / totalDays) * 100}%` }} />
          </div>
        </div>
        <button
          className="btn btn-outline"
          style={{ flex: 1, fontSize: 13, padding: "6px 0" }}
          onClick={handleGoNextDay}
          disabled={currentDay >= totalDays}
        >
          Day {currentDay + 1} →
        </button>
      </div>

      <div className="card" style={{ background: "var(--color-primary-bg)", border: "none" }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          📖 {content.readingTitle}
        </div>
        <div style={{ fontSize: 12, color: "var(--color-primary)", marginTop: 4 }}>
          来源：《架构整洁之道》Day {currentDay}/{totalDays}
        </div>
      </div>

      {userContext && (
        <div className="card" style={{ borderLeft: "3px solid var(--color-primary)" }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
            🎯 你的学习场景
          </div>
          <div style={{ fontSize: 14 }}>
            项目：{userContext.projectName}
            {userContext.vendorName && ` | 供应商：${userContext.vendorName}`}
          </div>
        </div>
      )}

      <div
        ref={readingRef}
        className="reading-content card"
        onClick={handleTermClick}
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />

      <div className="card">
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>📝 今日术语 ({content.terms.length})</h3>
        {content.terms.map((term) => {
          const record = terms.find((t) => t.id === term.id);
          return (
            <div
              key={term.id}
              onClick={() => setSelectedTerm(term)}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid var(--color-border)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>{term.term}</span>
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {term.english}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
                {term.definition.slice(0, 50)}...
              </div>
              {record && record.viewCount > 0 && (
                <div style={{ fontSize: 11, color: "var(--color-primary)", marginTop: 2 }}>
                  已查阅 {record.viewCount} 次
                  {record.mastered && " ✅ 已掌握"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isReadingCompleted && (
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          onClick={handleMarkComplete}
        >
          ✅ 标记阅读完成
        </button>
      )}
      {isReadingCompleted && !isDayCompleted && (
        <div className="card" style={{ textAlign: "center", color: "var(--color-success)", border: "1px solid var(--color-success)" }}>
          ✅ 阅读已完成
        </div>
      )}
      {isDayCompleted && currentDay < totalDays && (
        <button
          className="btn btn-primary"
          style={{ width: "100%", marginTop: 8 }}
          onClick={handleGoNextDay}
        >
          🚀 进入 Day {currentDay + 1}
        </button>
      )}

      {selectedTerm && (
        <div className="term-popup-overlay" onClick={() => setSelectedTerm(null)}>
          <div className="term-popup" onClick={(e) => e.stopPropagation()}>
            <div className="term-popup-title">{selectedTerm.term}</div>
            <div className="term-popup-english">{selectedTerm.english}</div>
            <div className="term-popup-body">
              <p style={{ marginBottom: 12 }}>{selectedTerm.definition}</p>
              <div style={{ background: "var(--color-primary-bg)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--color-primary)", marginBottom: 4 }}>💡 举例</div>
                <div style={{ fontSize: 14 }}>{selectedTerm.example}</div>
              </div>
              {selectedTerm.relatedTerms.length > 0 && (
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
                  🔗 相关术语：{selectedTerm.relatedTerms.join("、")}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, fontSize: 13, padding: "8px 0" }}
                onClick={() => {
                  updateTerm({ ...selectedTerm, bookmarked: true });
                  setSelectedTerm(null);
                }}
              >
                ⭐ 收藏
              </button>
              {(() => {
                const isTermMastered = terms.find((t) => t.id === selectedTerm.id)?.mastered || false;
                return (
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, fontSize: 13, padding: "8px 0", borderColor: isTermMastered ? "var(--color-success)" : undefined, color: isTermMastered ? "var(--color-success)" : undefined }}
                    onClick={() => {
                      updateTerm({ ...selectedTerm, mastered: !isTermMastered });
                    }}
                  >
                    {isTermMastered ? "✅ 已掌握" : "✅ 标记已掌握"}
                  </button>
                );
              })()}
              <button
                className="btn btn-primary"
                style={{ flex: 1, fontSize: 13, padding: "8px 0" }}
                onClick={() => setSelectedTerm(null)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
