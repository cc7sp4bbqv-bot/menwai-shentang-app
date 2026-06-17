import { useState } from "react";
import { useAppStore, UserContext } from "../lib/store";
import { now } from "../lib/database";

export default function OnboardingPage() {
  const { setUserContext } = useAppStore();
  const [projectName, setProjectName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [painPoint, setPainPoint] = useState("");
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "欢迎来到门外审堂",
      subtitle: "7天，读透一本书，变成你的能力",
      content: (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 24, marginBottom: 12 }}>
            门外审堂
          </h2>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
            不是读完一本书<br />
            而是把书里的知识<br />
            变成你工作中的能力
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 32, width: "100%" }}
            onClick={() => setStep(1)}
          >
            开始设置
          </button>
        </div>
      ),
    },
    {
      title: "你的项目背景",
      subtitle: "告诉我们你在做什么，我们会用你的真实场景来讨论",
      content: (
        <div style={{ padding: "20px 0" }}>
          <div className="form-group">
            <label className="form-label">你当前负责/参与的项目名称</label>
            <input
              className="form-input"
              placeholder="例如：某公司ERP系统升级项目"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">主要供应商/合作方（选填）</label>
            <input
              className="form-input"
              placeholder="例如：用友、金蝶、SAP"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 16 }}
            onClick={() => setStep(2)}
            disabled={!projectName.trim()}
          >
            下一步
          </button>
        </div>
      ),
    },
    {
      title: "你的痛点",
      subtitle: "我们用它来定制讨论问题",
      content: (
        <div style={{ padding: "20px 0" }}>
          <div className="form-group">
            <label className="form-label">你工作中最大的挑战是什么？</label>
            <textarea
              className="form-textarea"
              placeholder="例如：供应商交付质量不稳定，验收标准不清晰，经常扯皮..."
              value={painPoint}
              onChange={(e) => setPainPoint(e.target.value)}
              rows={4}
            />
          </div>
          <button
            className="btn btn-primary"
            style={{ width: "100%", marginTop: 16 }}
            onClick={async () => {
              const ctx: UserContext = {
                projectName: projectName.trim(),
                vendorName: vendorName.trim(),
                painPoint: painPoint.trim(),
                createdAt: now(),
              };
              await setUserContext(ctx);
            }}
            disabled={!painPoint.trim()}
          >
            开始学习之旅 🚀
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="app-container">
      <div className="onboarding-container">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            style={{
              background: "none",
              border: "none",
              fontSize: 14,
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            ← 上一步
          </button>
        )}
        <div className="onboarding-logo">{steps[step].title}</div>
        <div className="onboarding-subtitle">{steps[step].subtitle}</div>
        {steps[step].content}
      </div>
    </div>
  );
}
