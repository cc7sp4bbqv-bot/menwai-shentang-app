import { useAppStore } from "../lib/store";
import { getTotalDays } from "../lib/sampleData";

export default function ProfilePage() {
  const { userContext, currentDay, dailyProgress, terms } = useAppStore();
  const totalDays = getTotalDays();

  const totalTermsViewed = terms.filter((t) => t.viewCount > 0).length;
  const totalTermsMastered = terms.filter((t) => t.mastered).length;
  const totalBookmarked = terms.filter((t) => t.bookmarked).length;

  const completedDays = dailyProgress.filter(
    (p) => p.readingCompleted && p.discussionCompleted && p.reflectionCompleted
  ).length;

  const streakDays = dailyProgress.reduce((max, p) => {
    if (p.readingCompleted && p.discussionCompleted && p.reflectionCompleted) {
      return Math.max(max, p.streakDays);
    }
    return max;
  }, 0);

  return (
    <div className="page">
      <h1 className="page-title">我的学习</h1>

      {userContext && (
        <div className="card" style={{ borderLeft: "3px solid var(--color-primary)" }}>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            🎯 我的项目背景
          </div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{userContext.projectName}</div>
          {userContext.vendorName && (
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
              供应商：{userContext.vendorName}
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>
            痛点：{userContext.painPoint}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📊 学习进度</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            已完成 {completedDays}/{totalDays} 天
          </span>
          <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600 }}>
            {Math.round((completedDays / totalDays) * 100)}%
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(completedDays / totalDays) * 100}%` }} />
        </div>
        <div className="score-grid" style={{ marginTop: 12 }}>
          <div className="score-item">
            <div className="score-value">{currentDay}</div>
            <div className="score-label">当前天数</div>
          </div>
          <div className="score-item">
            <div className="score-value">{completedDays}</div>
            <div className="score-label">已完成</div>
          </div>
          <div className="score-item">
            <div className="score-value">{streakDays}</div>
            <div className="score-label">连续天数 🔥</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>📝 术语掌握</div>
        <div className="score-grid">
          <div className="score-item">
            <div className="score-value">{totalTermsViewed}</div>
            <div className="score-label">已查阅</div>
          </div>
          <div className="score-item">
            <div className="score-value">{totalBookmarked}</div>
            <div className="score-label">已收藏</div>
          </div>
          <div className="score-item">
            <div className="score-value">{totalTermsMastered}</div>
            <div className="score-label">已掌握</div>
          </div>
        </div>
      </div>

      {terms.filter((t) => t.bookmarked).length > 0 && (
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>⭐ 收藏的术语</div>
          {terms
            .filter((t) => t.bookmarked)
            .map((term) => (
              <div
                key={term.id}
                style={{
                  padding: "8px 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{term.term}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {term.english}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="card" style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>
        <div style={{ fontSize: 13 }}>门外审堂 · 读书学习系统</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>V1.0 MVP · Tauri 2.0 + React</div>
      </div>
    </div>
  );
}
