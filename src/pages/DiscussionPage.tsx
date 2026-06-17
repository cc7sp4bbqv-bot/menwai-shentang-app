import { useState, useEffect } from "react";
import { useAppStore, ChatMessage } from "../lib/store";
import { getDayContent, getTotalDays } from "../lib/sampleData";
import { generateId, now } from "../lib/database";
import { requestMentor, MentorResponse, MentorScores } from "../lib/mentorApi";

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
    depth: "思考深度",
    connection: "知识关联",
    practicality: "实践性",
    self_awareness: "自我觉察",
    actionability: "行动力",
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

export default function DiscussionPage() {
  const { currentDay, userContext, dailyProgress, chatHistory, addChatMessage, updateProgress, setCurrentDay, loadChatHistory } = useAppStore();
  const content = getDayContent(currentDay);
  const totalDays = getTotalDays();
  const [answers, setAnswers] = useState<string[]>(
    content.discussionQuestions.map(() => "")
  );
  const [submitted, setSubmitted] = useState(false);
  const [mentorReply, setMentorReply] = useState<string | null>(null);
  const [mentorScores, setMentorScores] = useState<MentorScores | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChatHistory(currentDay);
    setSubmitted(false);
    setMentorReply(null);
    setMentorScores(null);
    setApiError(null);
  }, [currentDay]);

  const todayProgress = dailyProgress.find((p) => p.dayNum === currentDay);
  const isDiscussionCompleted = todayProgress?.discussionCompleted || false;

  const handleSubmit = async () => {
    if (answers.some((a) => !a.trim())) return;
    setSubmitted(true);
    setLoading(true);
    setApiError(null);

    answers.forEach((answer, idx) => {
      addChatMessage({
        id: generateId(),
        dayNum: currentDay,
        role: "user",
        content: `**问题${idx + 1}：** ${content.discussionQuestions[idx]}\n\n**我的回答：** ${answer}`,
        createdAt: now(),
      });
    });

    try {
      const discussionQA = content.discussionQuestions.map((q, idx) => ({
        question: q,
        answer: answers[idx],
      }));

      const result: MentorResponse = await requestMentor({
        type: "discussion",
        userContext,
        currentDay,
        discussionQA,
      });

      if (!result.content) {
        setApiError("文渊先生暂时离席，请稍后重试");
      } else {
        setMentorReply(result.content);
        if (result.scores) setMentorScores(result.scores);

        addChatMessage({
          id: generateId(),
          dayNum: currentDay,
          role: "mentor",
          content: result.content,
          createdAt: now(),
        });
      }

      updateProgress({
        dayNum: currentDay,
        readingCompleted: todayProgress?.readingCompleted || false,
        discussionCompleted: true,
        reflectionCompleted: todayProgress?.reflectionCompleted || false,
        streakDays: todayProgress?.streakDays || 0,
        completedAt: null,
      });
    } catch (err) {
      console.error("[DiscussionPage] submit error:", err);
      setApiError("文渊先生暂时离席，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const dayMessages = chatHistory.filter((m) => m.dayNum === currentDay);

  return (
    <div className="page">
      <h1 className="page-title">Day {currentDay} 讨论</h1>

      <div className="card" style={{ background: "var(--color-primary-bg)", border: "none" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          💬 今日讨论问题
        </div>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
          逐题回答后提交，文渊先生会逐题点评并追问深化
        </div>
      </div>

      {!submitted && !isDiscussionCompleted ? (
        <div>
          {content.discussionQuestions.map((question, idx) => (
            <div key={idx} className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--color-primary)" }}>
                问题 {idx + 1}
              </div>
              <div style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.7 }}>
                {question}
              </div>
              <textarea
                className="form-textarea"
                placeholder="写下你的思考..."
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
            {loading ? "文渊先生思考中..." : "提交讨论"}
          </button>
        </div>
      ) : (
        <div className="chat-container">
          {isDiscussionCompleted && !submitted && (
            <div className="card" style={{ textAlign: "center", color: "var(--color-success)", border: "1px solid var(--color-success)" }}>
              ✅ 讨论已完成
            </div>
          )}

          {dayMessages
            .filter((m) => m.role === "user")
            .map((msg) => (
              <div key={msg.id} className="chat-bubble user">
                {msg.content.split("\n\n").map((line, i) => (
                  <p key={i} style={{ marginBottom: i < 2 ? 8 : 0 }}>
                    {line.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
            ))}

          {loading ? (
            <div className="chat-bubble mentor">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🤔</span>
                <span>文渊先生正在思考中...</span>
              </div>
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
          ) : mentorReply ? (
            <div className="chat-bubble mentor">
              <div style={{ fontSize: 13, color: "var(--color-primary)", marginBottom: 8, fontWeight: 600 }}>
                文渊先生
              </div>
              {mentorReply.split("\n\n").map((para, i) => (
                <p key={i} style={{ marginBottom: 10 }}>
                  {para}
                </p>
              ))}
            </div>
          ) : null}

          {!loading && mentorScores && <ScoresPanel scores={mentorScores} />}

          {!loading && mentorReply && (
            <FollowUpInput
              dayNum={currentDay}
              userContext={userContext}
              currentDay={currentDay}
            />
          )}
        </div>
      )}
    </div>
  );
}

function FollowUpInput({
  dayNum,
  userContext,
  currentDay,
}: {
  dayNum: number;
  userContext: any;
  currentDay: number;
}) {
  const [followUp, setFollowUp] = useState("");
  const { addChatMessage, chatHistory } = useAppStore();
  const [replies, setReplies] = useState<Array<{ content: string; followUp: string | null }>>([]);
  const [loading, setLoading] = useState(false);

  const handleFollowUp = async () => {
    if (!followUp.trim() || loading) return;

    const question = followUp;
    setFollowUp("");
    setLoading(true);

    addChatMessage({
      id: generateId(),
      dayNum,
      role: "user",
      content: question,
      createdAt: now(),
    });

    try {
      const dayMessages = chatHistory.filter((m) => m.dayNum === dayNum);
      const previousMessages = dayMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await requestMentor({
        type: "followup",
        userContext,
        currentDay,
        previousMessages,
        followUpQuestion: question,
      });

      const replyContent = result.content || "这个问题很好，让我想想...";

      addChatMessage({
        id: generateId(),
        dayNum,
        role: "mentor",
        content: replyContent,
        createdAt: now(),
      });

      setReplies([...replies, { content: replyContent, followUp: result.follow_up_question }]);
    } catch (err) {
      console.error("[FollowUp] error:", err);
      const fallback = "文渊先生暂时离席，请稍后重试";
      setReplies([...replies, { content: fallback, followUp: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      {replies.map((reply, idx) => (
        <div key={idx}>
          <div className="chat-bubble mentor" style={{ marginBottom: 8 }}>
            {reply.content.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: 8 }}>{para}</p>
            ))}
          </div>
          {reply.followUp && (
            <div className="card" style={{ background: "var(--color-primary-bg)", border: "none", marginBottom: 8, fontSize: 13 }}>
              💡 <strong>文渊先生追问：</strong>{reply.followUp}
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="chat-bubble mentor" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>🤔</span>
            <span>文渊先生思考中...</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="form-input"
          placeholder="追问或说'还没懂'..."
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFollowUp()}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          onClick={handleFollowUp}
          disabled={loading || !followUp.trim()}
          style={{ padding: "8px 16px" }}
        >
          发送
        </button>
      </div>
    </div>
  );
}
