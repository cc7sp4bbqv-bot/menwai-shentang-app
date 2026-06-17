import { useState } from "react";
import { useAppStore } from "../lib/store";
import { getDayContent, getTotalDays } from "../lib/sampleData";
import { generateId, now } from "../lib/database";
import { requestMentor, MentorScores } from "../lib/mentorApi";

function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
      <span style={{ minWidth: 56, color: "var(--color-text-secondary)" }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "var(--color-border)", borderRadius: 3 }}>
        <div
          style={{
            width: `${(value / max) * 100}%`,
            height: "100%",
            background: "var(--color-primary)",
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span style={{ minWidth: 24, fontWeight: 600, color: "var(--color-primary)" }}>{value}</span>
    </div>
  );
}

function ScoresPanel({ scores }: { scores: MentorScores }) {
  const labelMap: Record<string, string> = {
    self_awareness: "自我觉察",
    actionability: "行动力",
    depth: "深度",
  };

  return (
    <div className="card" style={{ background: "var(--color-primary-bg)", border: "1px solid var(--color-primary)", marginTop: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: "var(--color-primary)" }}>
        📊 评分
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(scores).map(([key, val]) => (
          <ScoreBar key={key} label={labelMap[key] || key} value={val} />
        ))}
      </div>
    </div>
  );
}

export default function ReflectionPage() {
  const { currentDay, userContext, dailyProgress, addChatMessage, updateProgress, setCurrentDay } = useAppStore();
  const content = getDayContent(currentDay);
  const totalDays = getTotalDays();
  const [answers, setAnswers] = useState<string[]>(
    content.reflectionPrompts.map(() => "")
  );
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scores, setScores] = useState<MentorScores | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const todayProgress = dailyProgress.find((p) => p.dayNum === currentDay);
  const isReflectionCompleted = todayProgress?.reflectionCompleted || false;

  const handleSubmit = async () => {
    if (answers.some((a) => !a.trim())) return;
    setSubmitted(true);
    setLoading(true);
    setApiError(null);

    try {
      const reflectionQA = content.reflectionPrompts.map((p, idx) => ({
        prompt: p,
        answer: answers[idx],
      }));

      const result = await requestMentor({
        type: "reflection",
        userContext,
        currentDay,
        reflectionQA,
      });

      if (!result.content) {
        setApiError("文渊先生暂时离席，请稍后重试");
      } else {
        setFeedback(result.content);
        if (result.scores) setScores(result.scores);

        await addChatMessage({
          id: generateId(),
          dayNum: currentDay,
          role: "mentor",
          content: `[Day ${currentDay} 复盘反馈] ${result.content}`,
          createdAt: now(),
        });
      }

      await updateProgress({
        dayNum: currentDay,
        readingCompleted: todayProgress?.readingCompleted || false,
        discussionCompleted: todayProgress?.discussionCompleted || false,
        reflectionCompleted: true,
        streakDays: todayProgress?.streakDays || 0,
        completedAt: now(),
      });
    } catch (err) {
      console.error("[ReflectionPage] submit error:", err);
      setApiError("文渊先生暂时离席，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const isDayCompleted = todayProgress?.readingCompleted && todayProgress?.discussionCompleted && (submitted ? true : todayProgress?.reflectionCompleted);

  return (
    <div className="page">
      <h1 className="page-title">Day {currentDay} 复盘</h1>

      <div className="card" style={{ background: "var(--color-primary-bg)", border: "none" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          🪞 今日复盘
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          复盘不是总结，而是把今天的知识与你已有的经验建立连接
        </div>
      </div>

      {!submitted && !isReflectionCompleted ? (
        <div>
          {content.reflectionPrompts.map((prompt, idx) => (
            <div key={idx} className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--color-primary)" }}>
                反思 {idx + 1}
              </div>
              <div style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.7 }}>
                {prompt}
              </div>
              <textarea
                className="form-textarea"
                placeholder="写下你的反思..."
                value={answers[idx]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[idx] = e.target.value;
                  setAnswers(newAnswers);
                }}
                rows={4}
              />
            </div>
          ))}

          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 8 }}
            onClick={handleSubmit}
            disabled={answers.some((a) => !a.trim()) || loading}
          >
            {loading ? "文渊先生审阅中..." : "提交复盘"}
          </button>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤔</div>
              <div>文渊先生正在审阅你的复盘...</div>
            </div>
          ) : apiError ? (
            <div className="card" style={{ textAlign: "center", color: "var(--color-text-secondary)", border: "1px dashed var(--color-border)" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🍵</div>
              <div>{apiError}</div>
              <button
                className="btn btn-primary"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setApiError(null);
                  setSubmitted(false);
                }}
              >
                重试
              </button>
            </div>
          ) : (feedback || isReflectionCompleted) ? (
            <div>
              {(feedback || isReflectionCompleted) && (
                <div className="chat-bubble mentor" style={{ maxWidth: "100%" }}>
                  <div style={{ fontSize: 13, color: "var(--color-primary)", marginBottom: 8, fontWeight: 600 }}>
                    文渊先生 · 复盘反馈
                  </div>
                  {(feedback || "你的复盘已完成！继续保持！").split("\n\n").map((para, i) => (
                    <p key={i} style={{ marginBottom: 10 }}>{para}</p>
                  ))}
                </div>
              )}

              {scores && <ScoresPanel scores={scores} />}

              <div className="card" style={{ marginTop: 16, textAlign: "center", border: "2px solid var(--color-primary)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-primary)" }}>
                  Day {currentDay} 完成！
                </div>
                <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 8 }}>
                  阅读 ✅ · 讨论 ✅ · 复盘 ✅
                </div>
                <div className="streak-badge" style={{ marginTop: 12 }}>
                  🔥 连续学习 {currentDay} 天
                </div>
                {currentDay < totalDays && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: 16, width: "100%" }}
                    onClick={() => setCurrentDay(currentDay + 1)}
                  >
                    🚀 进入 Day {currentDay + 1}
                  </button>
                )}
                {currentDay >= totalDays && (
                  <div style={{ marginTop: 16, fontSize: 16, fontWeight: 600, color: "var(--color-primary)" }}>
                    🏆 恭喜完成全部 7 天学习！
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
