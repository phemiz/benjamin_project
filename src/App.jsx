import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList
} from "recharts";
import { supabase } from "./supabaseClient";

const PLATFORMS = ["Google Classroom", "Moodle", "Microsoft Teams", "Zoom", "Canvas", "Other"];
const CHALLENGES = ["Poor internet connectivity", "High cost of data", "Power failure", "Technical difficulties", "Lack of digital skills", "Other"];
const LIKERT = ["Strongly Agree", "Agree", "Undecided", "Disagree", "Strongly Disagree"];
const LIKERT_SCORE = { "Strongly Agree": 5, "Agree": 4, "Undecided": 3, "Disagree": 2, "Strongly Disagree": 1 };
const STATEMENTS = [
  { key: "improves", text: "E-Learning improves my learning experience." },
  { key: "easy", text: "The platform is easy to use." },
  { key: "saves", text: "Online learning saves time." },
  { key: "accessible", text: "Learning materials are easily accessible." },
  { key: "satisfied", text: "I am satisfied with the E-Learning platform I use." },
];
const EFFECTIVENESS = ["Very Effective", "Effective", "Fairly Effective", "Ineffective"];
const SATISFACTION = ["Highly Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Highly Dissatisfied"];
const PALETTE = ["#1e3a5f", "#2f5f8a", "#5b8fb9", "#9dc0dd", "#c9dcec", "#e8b04b"];

const emptyForm = {
  gender: "", ageGroup: "", status: "", department: "", level: "",
  awareness: "", platform: "", platformOther: "", frequency: "",
  effectiveness: "", likert: {}, challenge: "", challengeOther: "",
  satisfaction: "", suggestions: "",
};

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-lg text-slate-900 border-b border-slate-300 pb-2 mb-4">{title}</h2>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function RadioGroup({ label, options, value, onChange, required }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-800 mb-2">{label}{required && <span className="text-amber-600"> *</span>}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              value === opt
                ? "bg-blue-900 text-white border-blue-900"
                : "bg-white text-slate-700 border-slate-300 hover:border-blue-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyForm({ onSubmitted }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const setLikert = (key, value) => setForm(f => ({ ...f, likert: { ...f.likert, [key]: value } }));

  const isValid = () => {
    if (!form.gender || !form.ageGroup || !form.status) return false;
    if (!form.awareness || !form.platform || !form.frequency) return false;
    if (!form.effectiveness) return false;
    if (STATEMENTS.some(s => !form.likert[s.key])) return false;
    if (!form.challenge || !form.satisfaction) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      setError("Please answer all required fields (marked *) before submitting.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, submittedAt: new Date().toISOString() };
      const { error: insertError } = await supabase.from("responses").insert({ data: payload });
      if (insertError) throw insertError;
      setForm(emptyForm);
      onSubmitted();
    } catch (e) {
      setError("Something went wrong saving your response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 sm:p-8">
        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          This questionnaire collects information on the awareness, usage, effectiveness, challenges, and
          satisfaction of E-Learning platforms among students and lecturers of Crestoak College of Health
          Management and Technology. Responses are anonymous and used strictly for academic purposes.
        </p>

        <Section title="Section A — Demographic Information">
          <RadioGroup label="Gender" options={["Male", "Female"]} value={form.gender} onChange={v => set("gender", v)} required />
          <RadioGroup label="Age" options={["Below 18", "18–22", "23–27", "Above 27"]} value={form.ageGroup} onChange={v => set("ageGroup", v)} required />
          <RadioGroup label="Status" options={["Student", "Lecturer"]} value={form.status} onChange={v => set("status", v)} required />
          <div>
            <label className="text-sm font-medium text-slate-800 mb-1 block">Department</label>
            <input
              type="text" value={form.department} onChange={e => set("department", e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Computer Science"
            />
          </div>
          {form.status === "Student" && (
            <RadioGroup label="Level" options={["100", "200", "300", "400", "500"]} value={form.level} onChange={v => set("level", v)} />
          )}
        </Section>

        <Section title="Section B — Awareness and Usage">
          <RadioGroup label="Are you aware of E-Learning platforms?" options={["Yes", "No"]} value={form.awareness} onChange={v => set("awareness", v)} required />
          <RadioGroup label="Which platform do you use most often?" options={PLATFORMS} value={form.platform} onChange={v => set("platform", v)} required />
          {form.platform === "Other" && (
            <input
              type="text" value={form.platformOther} onChange={e => set("platformOther", e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Please specify"
            />
          )}
          <RadioGroup label="How often do you use E-Learning platforms?" options={["Daily", "Weekly", "Occasionally", "Rarely"]} value={form.frequency} onChange={v => set("frequency", v)} required />
        </Section>

        <Section title="Section C — Effectiveness">
          <RadioGroup label="Overall, how effective is the platform for your learning or teaching?" options={EFFECTIVENESS} value={form.effectiveness} onChange={v => set("effectiveness", v)} required />
          <div className="space-y-4 pt-2">
            {STATEMENTS.map(s => (
              <div key={s.key}>
                <p className="text-sm text-slate-800 mb-2">{s.text}<span className="text-amber-600"> *</span></p>
                <div className="flex flex-wrap gap-2">
                  {LIKERT.map(opt => (
                    <button
                      type="button" key={opt} onClick={() => setLikert(s.key, opt)}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        form.likert[s.key] === opt
                          ? "bg-blue-900 text-white border-blue-900"
                          : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Section D — Challenges">
          <RadioGroup label="What is the major challenge you experience?" options={CHALLENGES} value={form.challenge} onChange={v => set("challenge", v)} required />
          {form.challenge === "Other" && (
            <input
              type="text" value={form.challengeOther} onChange={e => set("challengeOther", e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Please specify"
            />
          )}
        </Section>

        <Section title="Section E — Satisfaction and Recommendations">
          <RadioGroup label="Level of satisfaction with the E-Learning platform you use" options={SATISFACTION} value={form.satisfaction} onChange={v => set("satisfaction", v)} required />
          <div>
            <label className="text-sm font-medium text-slate-800 mb-1 block">What improvements would you like to see? (optional)</label>
            <textarea
              value={form.suggestions} onChange={e => set("suggestions", e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </Section>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleSubmit} disabled={submitting}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-3 rounded transition-colors"
        >
          {submitting ? "Submitting…" : "Submit Response"}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
      <div className="font-serif text-3xl text-blue-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function ChartCard({ title, children, tableRows }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="font-serif text-base text-slate-900 mb-3">{title}</h3>
      <div style={{ height: 260 }}>{children}</div>
      {tableRows && (
        <table className="w-full text-xs mt-3 border-t border-slate-200 pt-2">
          <tbody>
            {tableRows.map(([k, v, pct]) => (
              <tr key={k} className="border-b border-slate-100 last:border-0">
                <td className="py-1 text-slate-600">{k}</td>
                <td className="py-1 text-right text-slate-800 font-medium">{v}</td>
                <td className="py-1 text-right text-slate-400 w-14">{pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function count(arr, key) {
  const c = {};
  arr.forEach(r => { const v = r[key] || "Unspecified"; c[v] = (c[v] || 0) + 1; });
  return c;
}

function toTableRows(counts, total, order) {
  const keys = order || Object.keys(counts);
  return keys.filter(k => counts[k]).map(k => [k, counts[k], total ? Math.round((counts[k] / total) * 100) : 0]);
}

function toChartData(counts, order) {
  const keys = order || Object.keys(counts);
  return keys.filter(k => counts[k]).map(k => ({ name: k, value: counts[k] }));
}

function Dashboard() {
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: selectError } = await supabase
        .from("responses")
        .select("data, created_at")
        .order("created_at", { ascending: true });
      if (selectError) throw selectError;
      setResponses((data || []).map(row => row.data));
    } catch (e) {
      setError("Could not load responses yet — try refreshing after the first submission.");
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="text-center text-slate-500 py-16">Loading results…</div>;
  }

  const total = responses.length;

  if (total === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-slate-500 mb-4">{error || "No responses yet. Submit the survey to see results here."}</p>
        <button onClick={load} className="text-sm text-blue-900 underline">Refresh</button>
      </div>
    );
  }

  const genderCounts = count(responses, "gender");
  const ageCounts = count(responses, "ageGroup");
  const statusCounts = count(responses, "status");
  const awarenessCounts = count(responses, "awareness");
  const platformCounts = count(responses, "platform");
  const effCounts = count(responses, "effectiveness");
  const challengeCounts = count(responses, "challenge");
  const satCounts = count(responses, "satisfaction");

  const avgLikert = STATEMENTS.map(s => {
    const scores = responses.map(r => LIKERT_SCORE[r.likert?.[s.key]]).filter(Boolean);
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { name: s.text.length > 28 ? s.text.slice(0, 26) + "…" : s.text, value: Math.round(avg * 10) / 10 };
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">Live results — updates as new responses arrive.</p>
        <button onClick={load} className="text-sm text-blue-900 underline">Refresh</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Responses" value={total} />
        <StatCard label="Students" value={statusCounts["Student"] || 0} />
        <StatCard label="Lecturers" value={statusCounts["Lecturer"] || 0} />
        <StatCard label="Aware of E-Learning" value={`${Math.round(((awarenessCounts["Yes"] || 0) / total) * 100)}%`} />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Gender Distribution" tableRows={toTableRows(genderCounts, total, ["Male", "Female"])}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={toChartData(genderCounts, ["Male", "Female"])} dataKey="value" nameKey="name" outerRadius={85} label>
                {toChartData(genderCounts).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution" tableRows={toTableRows(ageCounts, total, ["Below 18", "18–22", "23–27", "Above 27"])}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toChartData(ageCounts, ["Below 18", "18–22", "23–27", "Above 27"])}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[1]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Frequently Used Platforms" tableRows={toTableRows(platformCounts, total)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toChartData(platformCounts)} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[0]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Perceived Effectiveness" tableRows={toTableRows(effCounts, total, EFFECTIVENESS)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toChartData(effCounts, EFFECTIVENESS)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Major Challenges" tableRows={toTableRows(challengeCounts, total)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toChartData(challengeCounts)} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
              <Tooltip />
              <Bar dataKey="value" fill={PALETTE[5]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Level of Satisfaction" tableRows={toTableRows(satCounts, total, SATISFACTION)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={toChartData(satCounts, SATISFACTION)} dataKey="value" nameKey="name" outerRadius={85} label={{ fontSize: 10 }}>
                {toChartData(satCounts, SATISFACTION).map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Average Agreement per Statement (Section C, 1–5 scale)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={avgLikert} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={180} />
            <Tooltip />
            <Bar dataKey="value" fill={PALETTE[1]} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="value" position="right" style={{ fontSize: 11 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("survey");
  const [justSubmitted, setJustSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <p className="text-xs uppercase tracking-widest text-blue-200 mb-1">Crestoak College of Health Management and Technology</p>
          <h1 className="font-serif text-xl sm:text-2xl">E-Learning Platforms Survey</h1>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 -mb-px">
            {["survey", "results"].map(t => (
              <button
                key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
                  tab === t ? "bg-slate-50 text-blue-900" : "text-blue-200 hover:text-white"
                }`}
              >
                {t === "survey" ? "Take Survey" : "View Results"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        {tab === "survey" && (
          <>
            {justSubmitted && (
              <div className="max-w-2xl mx-auto mb-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded px-4 py-3">
                Thank you — your response was recorded. You can submit again on behalf of another respondent, or switch to "View Results".
              </div>
            )}
            <SurveyForm onSubmitted={() => { setJustSubmitted(true); setTimeout(() => setJustSubmitted(false), 5000); }} />
          </>
        )}
        {tab === "results" && <Dashboard />}
      </main>

      <footer className="text-center text-xs text-slate-400 py-6">
        Department of Computer Science — Undergraduate Research Project
      </footer>
    </div>
  );
}
