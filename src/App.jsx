import { useState, useEffect } from "react";

const brokers = [
  {
    id: 1,
    name: "Jayson Singh",
    avatar: "JS",
    office: "Manchester",
    leads: 34,
    contacted: 31,
    followUps: 28,
    conversions: 7,
    avgResponseHrs: 1.2,
    pipelineValue: 2340000,
    coldLeads: 3,
    lastActivity: "2 hours ago",
    trend: "up",
    deals: ["Trafford Gardens x2", "Willow Court", "Angel Gardens x4"],
  },
  {
    id: 2,
    name: "Charleigh Cooper",
    avatar: "CC",
    office: "London",
    leads: 28,
    contacted: 26,
    followUps: 22,
    conversions: 9,
    avgResponseHrs: 0.8,
    pipelineValue: 3150000,
    coldLeads: 2,
    lastActivity: "45 mins ago",
    trend: "up",
    deals: ["Greenwich Peninsula x3", "Priors Gate x2", "Smithfield House x4"],
  },
  {
    id: 3,
    name: "Ricky Ellson",
    avatar: "RE",
    office: "Liverpool",
    leads: 22,
    contacted: 18,
    followUps: 12,
    conversions: 3,
    avgResponseHrs: 6.4,
    pipelineValue: 980000,
    coldLeads: 8,
    lastActivity: "1 day ago",
    trend: "down",
    deals: ["Dockside Residences x2", "Angel Gardens x1"],
  },
  {
    id: 4,
    name: "Shannice Brown",
    avatar: "SB",
    office: "Manchester",
    leads: 19,
    contacted: 17,
    followUps: 15,
    conversions: 5,
    avgResponseHrs: 2.1,
    pipelineValue: 1620000,
    coldLeads: 4,
    lastActivity: "3 hours ago",
    trend: "up",
    deals: ["Trafford Gardens x3", "Waterhouse Gardens x2"],
  },
  {
    id: 5,
    name: "Martyn Taylor",
    avatar: "MT",
    office: "London",
    leads: 15,
    contacted: 10,
    followUps: 6,
    conversions: 2,
    avgResponseHrs: 11.2,
    pipelineValue: 640000,
    coldLeads: 9,
    lastActivity: "3 days ago",
    trend: "down",
    deals: ["Sailmakers Lofts x2"],
  },
  {
    id: 6,
    name: "Kelly Dawson",
    avatar: "KD",
    office: "London",
    leads: 25,
    contacted: 23,
    followUps: 20,
    conversions: 6,
    avgResponseHrs: 1.9,
    pipelineValue: 1980000,
    coldLeads: 2,
    lastActivity: "1 hour ago",
    trend: "up",
    deals: ["Greenwich Peninsula x2", "Smithfield House x2", "Priors Gate x2"],
  },
];

const totalLeads = brokers.reduce((s, b) => s + b.leads, 0);
const totalConversions = brokers.reduce((s, b) => s + b.conversions, 0);
const totalPipeline = brokers.reduce((s, b) => s + b.pipelineValue, 0);
const totalCold = brokers.reduce((s, b) => s + b.coldLeads, 0);

function fmt(n) {
  if (n >= 1000000) return `£${(n / 1000000).toFixed(2)}m`;
  if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
  return `£${n}`;
}

function scoreColor(score) {
  if (score >= 80) return "#00e5a0";
  if (score >= 55) return "#f5c842";
  return "#ff4d6d";
}

function calcScore(b) {
  const contactRate = (b.contacted / b.leads) * 100;
  const convRate = (b.conversions / b.leads) * 100;
  const responseScore = Math.max(0, 100 - b.avgResponseHrs * 6);
  const coldPenalty = (b.coldLeads / b.leads) * 30;
  return Math.round((contactRate * 0.3 + convRate * 3 + responseScore * 0.3) - coldPenalty);
}

export default function App() {
  const [selected, setSelected] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const sorted = [...brokers].sort((a, b) => calcScore(b) - calcScore(a));

  async function runAI() {
    setLoading(true);
    setAiText("");
    setActiveTab("ai");

    const summary = brokers.map(b => {
      const score = calcScore(b);
      return `${b.name} (${b.office}): ${b.leads} leads, ${b.conversions} conversions, avg response ${b.avgResponseHrs}hrs, ${b.coldLeads} cold leads, pipeline ${fmt(b.pipelineValue)}, performance score ${score}/100`;
    }).join("\n");

    const prompt = `You are an AI sales performance analyst for Flambard Williams, a UK property investment firm.

Here is this week's broker performance data:
${summary}

Write a sharp, executive-level performance briefing for the Managing Director. Include:
1. A 2-sentence overall assessment of the team
2. Top performer callout with reason why
3. Two brokers who need urgent attention and exactly what they should do differently
4. One specific action the MD should take this week
5. A one-line prediction for next month if nothing changes

Be direct, specific, and commercial. No fluff. Max 200 words.`;

    try {
      // Route through Netlify function to keep API key server-side
      const res = await fetch("/.netlify/functions/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "Unable to generate analysis.";
      let i = 0;
      const interval = setInterval(() => {
        setAiText(text.slice(0, i));
        i += 3;
        if (i > text.length) { setAiText(text); clearInterval(interval); }
      }, 16);
    } catch {
      setAiText("Error connecting to AI. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c14",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8eaf0",
      padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0d1526 0%, #0a1020 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img
              src="data:image/png;base64,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"
              alt="Flambard Williams"
              style={{
                height: 48,
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "screen",
              }}
            />
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 16 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                Broker Performance Agent
              </div>
              <div style={{ fontSize: 11, color: "#5a6480", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Live Intelligence Dashboard
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#00e5a0",
            boxShadow: "0 0 8px #00e5a0",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ fontSize: 12, color: "#00e5a0", fontWeight: 500 }}>Live</span>
        </div>
      </div>

      <div style={{ padding: "28px 32px" }}>

        {/* KPI Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}>
          {[
            { label: "Total Leads", value: totalLeads, sub: "This week", color: "#4a9eff" },
            { label: "Conversions", value: totalConversions, sub: `${Math.round(totalConversions/totalLeads*100)}% rate`, color: "#00e5a0" },
            { label: "Pipeline Value", value: fmt(totalPipeline), sub: "Active", color: "#c9a84c" },
            { label: "Cold Leads", value: totalCold, sub: "Need attention", color: "#ff4d6d" },
          ].map((kpi, i) => (
            <div key={i} style={{
              background: "linear-gradient(135deg, #0f1824 0%, #0d1520 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: "20px 24px",
              opacity: animated ? 1 : 0,
              transform: animated ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.5s ease ${i * 0.1}s`,
            }}>
              <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 8 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
              <div style={{ fontSize: 12, color: "#3a4460", marginTop: 4 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {["overview", "pipeline", "ai"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              background: activeTab === tab ? "rgba(201,168,76,0.15)" : "transparent",
              color: activeTab === tab ? "#c9a84c" : "#5a6480",
              borderBottom: activeTab === tab ? "2px solid #c9a84c" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              {tab === "overview" ? "Team Overview" : tab === "pipeline" ? "Pipeline" : "AI Analysis"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sorted.map((b, i) => {
              const score = calcScore(b);
              const convRate = Math.round((b.conversions / b.leads) * 100);
              const isSelected = selected?.id === b.id;

              return (
                <div key={b.id}
                  onClick={() => setSelected(isSelected ? null : b)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, #131e30, #0f1a28)"
                      : "linear-gradient(135deg, #0f1824, #0d1520)",
                    border: isSelected
                      ? "1px solid rgba(201,168,76,0.3)"
                      : "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    cursor: "pointer",
                    opacity: animated ? 1 : 0,
                    transform: animated ? "translateX(0)" : "translateX(-20px)",
                    transition: `all 0.4s ease ${i * 0.08}s`,
                  }}>

                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 28, textAlign: "center",
                      fontSize: 13, fontWeight: 700,
                      color: i === 0 ? "#c9a84c" : i === 1 ? "#8899aa" : "#3a4460",
                      fontFamily: "'Syne', sans-serif",
                    }}>#{i + 1}</div>

                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `linear-gradient(135deg, ${scoreColor(score)}22, ${scoreColor(score)}44)`,
                      border: `1.5px solid ${scoreColor(score)}66`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: scoreColor(score),
                      flexShrink: 0,
                    }}>{b.avatar}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#e8eaf0" }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: "#5a6480" }}>{b.office} · {b.lastActivity}</div>
                    </div>

                    <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                      {[
                        { label: "Leads", value: b.leads },
                        { label: "Conv.", value: `${b.conversions} (${convRate}%)` },
                        { label: "Response", value: `${b.avgResponseHrs}h` },
                        { label: "Cold", value: b.coldLeads, warn: b.coldLeads >= 6 },
                      ].map((s, j) => (
                        <div key={j} style={{ textAlign: "center", minWidth: 56 }}>
                          <div style={{
                            fontSize: 16, fontWeight: 700,
                            color: s.warn ? "#ff4d6d" : "#e8eaf0",
                            fontFamily: "'Syne', sans-serif",
                          }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: "#3a4460", textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ textAlign: "center", marginLeft: 16 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        border: `3px solid ${scoreColor(score)}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexDirection: "column",
                        background: `${scoreColor(score)}11`,
                      }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: scoreColor(score), fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{score}</div>
                        <div style={{ fontSize: 8, color: scoreColor(score), opacity: 0.7 }}>SCORE</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 18, marginLeft: 8 }}>
                      {b.trend === "up" ? "↑" : "↓"}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      marginTop: 20,
                      paddingTop: 20,
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 20,
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Active Deals</div>
                        {b.deals.map((d, j) => (
                          <div key={j} style={{
                            padding: "6px 12px",
                            background: "rgba(201,168,76,0.08)",
                            borderRadius: 6,
                            fontSize: 13,
                            color: "#c9a84c",
                            marginBottom: 6,
                          }}>• {d}</div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#5a6480", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Performance Breakdown</div>
                        {[
                          { label: "Contact Rate", value: Math.round(b.contacted / b.leads * 100), green: 80, amber: 60 },
                          { label: "Conversion Rate", value: Math.round(b.conversions / b.leads * 100), green: 20, amber: 10 },
                          { label: "Follow-up Rate", value: Math.round(b.followUps / b.leads * 100), green: 75, amber: 50 },
                        ].map((bar, j) => {
                          const barColor = bar.value >= bar.green ? "#00e5a0" : bar.value >= bar.amber ? "#f5c842" : "#ff4d6d";
                          return (
                            <div key={j} style={{ marginBottom: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: "#8899aa" }}>{bar.label}</span>
                                <span style={{ fontSize: 12, color: barColor, fontWeight: 600 }}>{bar.value}%</span>
                              </div>
                              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                                <div style={{
                                  height: "100%",
                                  width: `${bar.value}%`,
                                  background: barColor,
                                  borderRadius: 2,
                                  transition: "width 1s ease",
                                }} />
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#5a6480", marginBottom: 4 }}>Pipeline Value</div>
                          <div style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#c9a84c" }}>{fmt(b.pipelineValue)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pipeline Tab */}
        {activeTab === "pipeline" && (
          <div style={{
            background: "linear-gradient(135deg, #0f1824, #0d1520)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 28,
          }}>
            <div style={{ fontSize: 14, color: "#5a6480", marginBottom: 24 }}>Pipeline value by broker</div>
            {sorted.map((b, i) => {
              const pct = Math.round((b.pipelineValue / totalPipeline) * 100);
              const score = calcScore(b);
              return (
                <div key={b.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${scoreColor(score)}22`,
                        border: `1px solid ${scoreColor(score)}44`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, color: scoreColor(score),
                      }}>{b.avatar}</div>
                      <span style={{ fontSize: 14, color: "#e8eaf0" }}>{b.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#5a6480" }}>{pct}%</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", fontFamily: "'Syne', sans-serif" }}>{fmt(b.pipelineValue)}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: animated ? `${pct}%` : "0%",
                      background: `linear-gradient(90deg, ${scoreColor(score)}, ${scoreColor(score)}88)`,
                      borderRadius: 4,
                      transition: `width 1s ease ${i * 0.1}s`,
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{
              marginTop: 28,
              padding: "16px 20px",
              background: "rgba(201,168,76,0.06)",
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 14, color: "#8899aa" }}>Total Active Pipeline</span>
              <span style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#c9a84c" }}>{fmt(totalPipeline)}</span>
            </div>
          </div>
        )}

        {/* AI Tab */}
        {activeTab === "ai" && (
          <div style={{
            background: "linear-gradient(135deg, #0f1824, #0d1520)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 28,
            minHeight: 320,
          }}>
            {!aiText && !loading && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
                  AI Performance Briefing
                </div>
                <div style={{ fontSize: 14, color: "#5a6480", marginBottom: 32, maxWidth: 360, margin: "0 auto 32px" }}>
                  Generate an executive-level analysis of your broker team — ready to act on immediately.
                </div>
                <button onClick={runAI} style={{
                  padding: "14px 36px",
                  background: "linear-gradient(135deg, #c9a84c, #e8c96a)",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#080c14",
                  cursor: "pointer",
                  fontFamily: "'Syne', sans-serif",
                  letterSpacing: "0.3px",
                  boxShadow: "0 4px 24px rgba(201,168,76,0.3)",
                }}>
                  Generate AI Briefing
                </button>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 14, color: "#5a6480" }}>Analysing broker performance...</div>
                <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#c9a84c",
                      animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {aiText && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "linear-gradient(135deg, #c9a84c22, #c9a84c44)",
                    border: "1px solid rgba(201,168,76,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>🤖</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c9a84c" }}>AI Performance Analyst</div>
                    <div style={{ fontSize: 11, color: "#3a4460" }}>Executive Briefing · Just now</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 14,
                  color: "#c8d0e0",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                  padding: "20px 24px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}>{aiText}</div>
                <button onClick={runAI} style={{
                  marginTop: 20,
                  padding: "10px 24px",
                  background: "transparent",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#c9a84c",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>Regenerate</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}
