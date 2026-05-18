// ComposeProMain.tsx - Complete embedded version with ALL features
"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
} from "react";

type Init = {
  to?: string;
  cc?: string;
  bcc?: string;
  subj?: string;
  body?: string;
  thread?: { quotedHtml?: string } | null;
  draftKey?: string;
};

type ThemeMode = "light" | "dark" | "glass" | "gold" | "neon";
type RailTab =
  | "ai"
  | "goals"
  | "outline"
  | "grammar"
  | "blocks"
  | "media"
  | "comments"
  | "tasks"
  | "files"
  | "security"
  | "templates"
  | "settings";
type VersionItem = { id: string; at: number; subject: string; html: string };
type CommentItem = {
  id: string;
  at: number;
  author: string;
  text: string;
  selection: string;
};
type TaskItem = { id: string; title: string; assignee: string; done?: boolean };
type FileItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};
type ReminderItem = { id: string; title: string; at: string; fired?: boolean };
type GrammarIssue = {
  id: string;
  level: "red" | "yellow";
  text: string;
  suggestion: string;
};

type ComposeProMainProps = {
  init?: Init;
  onClose?: () => void;
  showHeaderFields?: boolean;
  initialTo?: any[];
  initialCC?: any[];
  initialBCC?: any[];
  initialSubject?: string;
  onToChange?: (value: any[]) => void;
  onCCChange?: (value: any[]) => void;
  onBCCChange?: (value: any[]) => void;
  onSubjectChange?: (value: string) => void;
  onEditorChange?: (content: string) => void;
  editorRef?: React.MutableRefObject<any>;
  value?: string;
  showSendButton?: boolean;
  onSend?: () => void;
  sendButtonText?: string;
  showReminderButton?: boolean;
  onReminderClick?: () => void;
  reminderButtonText?: string;
  showDiscardButton?: boolean;
  onDiscard?: () => void;
  attachments?: any[];
  onAttachmentsChange?: (attachments: any[]) => void;
  buttonLoading?: boolean;
  containerStyle?: React.CSSProperties;
};

const uid = (p = "id") => `${p}-${Math.random().toString(36).slice(2, 10)}`;
const clsx = (...v: Array<string | false | undefined | null>) =>
  v.filter(Boolean).join(" ");
const COLORS = [
  "#1155CC",
  "#D4AF37",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#0EA5E9",
  "#F59E0B",
  "#14B8A6",
  "#F43F5E",
  "#111827",
];
const EMOJIS = [
  "😀",
  "😂",
  "😊",
  "😍",
  "🤝",
  "👍",
  "🔥",
  "✨",
  "✅",
  "💡",
  "📎",
  "📌",
  "🗓️",
  "📝",
  "📤",
  "🔒",
  "🚀",
  "⚖️",
  "💼",
  "🛡️",
];
const SIGNATURE = "<p>— Best regards,<br/>Your Name</p>";

function getText(html: string) {
  if (typeof document === "undefined") return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

function cleanHtml(html: string) {
  if (typeof document === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  div
    .querySelectorAll(
      "script,style,iframe,object,embed,link,meta,base,form,input,button",
    )
    .forEach((n) => n.remove());
  div.querySelectorAll("*").forEach((node) => {
    Array.from(node.attributes).forEach((attr) => {
      const key = attr.name.toLowerCase();
      const val = String(attr.value || "")
        .toLowerCase()
        .trim();
      if (key.startsWith("on")) node.removeAttribute(attr.name);
      if (
        (key === "href" || key === "src") &&
        (val.startsWith("javascript:") ||
          val.startsWith("vbscript:") ||
          val.startsWith("data:text/html"))
      )
        node.removeAttribute(attr.name);
    });
  });
  return div.innerHTML;
}

function tableHtml(
  rows = 3,
  cols = 3,
  theme: "classic" | "premium" | "dark" = "premium",
) {
  const bg =
    theme === "dark" ? "#111827" : theme === "premium" ? "#eff6ff" : "#f8fafc";
  const color = theme === "dark" ? "#ffffff" : "#111827";
  const header = `<table>${Array.from({ length: cols })
    .map(
      (_, i) =>
        `<th contenteditable="true" style="position:sticky;top:0;background:${bg};color:${color};border:1px solid #cbd5e1;padding:8px;min-width:90px">Header ${i + 1}</th>`,
    )
    .join("")}</tr>`;
  const body = Array.from({ length: rows })
    .map(
      () =>
        `<tr>${Array.from({ length: cols })
          .map(
            () =>
              `<td contenteditable="true" style="border:1px solid #cbd5e1;padding:8px;min-width:90px">&nbsp;</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  return `<div style="resize:horizontal;overflow:auto;max-width:100%;border:1px dashed #cbd5e1;padding:4px;border-radius:12px"><table style="border-collapse:collapse;width:100%;border:1px solid #cbd5e1"><tbody>${header}${body}</tbody></td></div>`;
}

function mkICS(title: string, description: string, startISO: string) {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + 30 * 60000);
  const fmt = (d: Date) =>
    d.toISOString().replaceAll("-", "").replaceAll(":", "").replace(".000", "");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ComposePro//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@composepro`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.split("\n").join(" ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function MiniCalendar() {
  const [date, setDate] = useState(() => new Date());
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDay = first.getDay();
  const days = Array.from({ length: last.getDate() }, (_, i) => i + 1);
  return (
    <div className="text-xs">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={() => setDate(new Date(y, m - 1, 1))}
        >
          ‹
        </button>
        <b>
          {date.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </b>
        <button
          type="button"
          className="rounded border px-2 py-1"
          onClick={() => setDate(new Date(y, m + 1, 1))}
        >
          ›
        </button>
      </div>
      <div className="mb-1 grid grid-cols-7 opacity-60">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div
            key={`b${i}`}
            className="h-8 rounded border bg-gray-50 dark:bg-gray-800"
          />
        ))}
        {days.map((d) => (
          <div key={d} className="grid h-8 place-items-center rounded border">
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

const Spinner = ({ style }: { style?: React.CSSProperties }) => (
  <div
    className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    style={style}
    role="status"
  />
);

export default function ComposeProMain({
  init,
  onClose,
  showHeaderFields = true,
  initialTo = [],
  initialCC = [],
  initialBCC = [],
  initialSubject = "",
  onToChange,
  onCCChange,
  onBCCChange,
  onSubjectChange,
  onEditorChange,
  editorRef: externalEditorRef,
  value = "",
  showSendButton = true,
  onSend,
  sendButtonText = "Send",
  showReminderButton = false,
  onReminderClick,
  reminderButtonText = "Add Reminder",
  showDiscardButton = true,
  onDiscard,
  attachments: externalAttachments = [],
  onAttachmentsChange,
  buttonLoading = false,
  containerStyle = {},
}: ComposeProMainProps) {
  console.log("Render ComposeProMain", value);
  const safe = {
    to: init?.to || "",
    cc: init?.cc || "",
    bcc: init?.bcc || "",
    subj: init?.subj || "",
    body:
      (value || init?.body || "<p>Hello,</p>") +
      (init?.thread?.quotedHtml || ""),
    draftKey: init?.draftKey || "composepro-main-reverified",
  };

  const internalEditorRef = useRef<HTMLDivElement>(null);
  const editorRef = externalEditorRef || internalEditorRef;
  const lastRangeRef = useRef<Range | null>(null);

  const [to, setTo] = useState(
    showHeaderFields
      ? initialTo.length > 0
        ? initialTo
            .map((item: any) => item.value || item.label || item)
            .join(", ")
        : safe.to
      : "",
  );
  const [cc, setCc] = useState(
    showHeaderFields
      ? initialCC.length > 0
        ? initialCC
            .map((item: any) => item.value || item.label || item)
            .join(", ")
        : safe.cc
      : "",
  );
  const [bcc, setBcc] = useState(
    showHeaderFields
      ? initialBCC.length > 0
        ? initialBCC
            .map((item: any) => item.value || item.label || item)
            .join(", ")
        : safe.bcc
      : "",
  );
  const [subject, setSubject] = useState(
    showHeaderFields ? initialSubject || safe.subj : "",
  );
  const [html, setHtml] = useState(safe.body);
  const [sourceHtml, setSourceHtml] = useState(safe.body);

  const [theme, setTheme] = useState<ThemeMode>("glass");
  const [brand, setBrand] = useState("#1155CC");
  const [rail, setRail] = useState<RailTab | null>("ai");
  const [fullscreen, setFullscreen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [minimalMode, setMinimalMode] = useState(false);
  const [focusFlow, setFocusFlow] = useState(false);
  const [split, setSplit] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [smartPaste, setSmartPaste] = useState(true);
  const [inlineImages, setInlineImages] = useState(true);
  const [longEditor, setLongEditor] = useState(true);

  const [commandOpen, setCommandOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [shapeOpen, setShapeOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [bubble, setBubble] = useState<{ x: number; y: number } | null>(null);

  const [buttonStyle, setButtonStyle] = useState<
    "solid" | "outline" | "gradient"
  >("gradient");
  const [shapeColor, setShapeColor] = useState("#1155CC");
  const [shapeSize, setShapeSize] = useState<"sm" | "md" | "lg">("md");
  const [approval, setApproval] = useState<
    "Draft" | "Pending" | "Approved" | "Rejected"
  >("Draft");
  const [secureMode, setSecureMode] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const [internalAttachments, setInternalAttachments] = useState<FileItem[]>(
    [],
  );
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(
    null,
  );
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [remTitle, setRemTitle] = useState("Follow up");
  const [remAt, setRemAt] = useState("");
  const [signatures, setSignatures] = useState<string[]>([SIGNATURE]);
  const [toast, setToast] = useState("");

  const [targetTone, setTargetTone] = useState("Professional");
  const [targetWords, setTargetWords] = useState(250);
  const [targetSpam, setTargetSpam] = useState(30);
  const [readingLevel, setReadingLevel] = useState("Grade 8-10");
  const [tableTheme, setTableTheme] = useState<"classic" | "premium" | "dark">(
    "premium",
  );
  const [mediaKind, setMediaKind] = useState<
    "gif" | "video" | "audio" | "loom" | "screen"
  >("video");
  const [mediaUrl, setMediaUrl] = useState("");
  const [dockSide, setDockSide] = useState<"right" | "left" | "bottom">(
    "right",
  );
  const [themePack, setThemePack] = useState<
    "Glass" | "Neumorphism" | "Luxury Gold" | "Govt Blue" | "Neon"
  >("Glass");
  const [workspacePreset, setWorkspacePreset] = useState<
    "Legal" | "Sales" | "Minimal" | "Compliance" | "Creative"
  >("Compliance");
  const [mobileToolbar, setMobileToolbar] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [unitTestPanel, setUnitTestPanel] = useState(false);

  const presence = useMemo(
    () => [
      { id: "am", name: "Amar", color: "#0EA5E9" },
      { id: "yg", name: "Yeshu", color: "#D4AF37" },
      { id: "ng", name: "Naysa", color: "#10B981" },
      { id: "mg", name: "Manoj", color: "#8B5CF6" },
    ],
    [],
  );

  const templates = useMemo(
    () => ({
      "Formal Reply":
        "<p>Dear {{name}},</p><p>Please find the details below for your kind review.</p><p>Regards,</p>",
      "Invoice Follow-up":
        "<p>Dear Sir/Madam,</p><p>This is a gentle reminder regarding invoice <b>{{invoice_no}}</b> due on <b>{{due_date}}</b>.</p>",
      "Legal Reply":
        "<p>Respected Sir/Madam,</p><p>Without prejudice to our rights and contentions, we submit the following reply.</p>",
      "Sales Intro":
        "<p>Hi {{name}},</p><p>We help teams improve compliance, speed, and customer experience through enterprise-grade automation.</p>",
    }),
    [],
  );

  const mergeVars = [
    "{{name}}",
    "{{company}}",
    "{{invoice_no}}",
    "{{due_date}}",
    "{{amount}}",
    "{{meeting_link}}",
  ];

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };

  const normalizeEditor = () => {
    if (!editorRef.current) return;
    editorRef.current.querySelectorAll("img").forEach((img: any) => {
      const el = img as HTMLImageElement;
      el.style.maxWidth = "100%";
      el.style.height = "auto";
      el.style.borderRadius = "14px";
      el.style.border = "1px solid #e5e7eb";
      el.style.display = "block";
      el.style.margin = "10px 0";
      el.style.resize = "both";
    });
  };

  const syncHtml = () => {
    if (!editorRef.current) return;
    normalizeEditor();
    const newHtml = editorRef.current.innerHTML;
    setHtml(newHtml);
    if (onEditorChange) {
      onEditorChange(newHtml);
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (lastRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(lastRangeRef.current);
    }
  };

  const insertHTML = (frag: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand("insertHTML", false, frag);
    syncHtml();
  };

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    syncHtml();
  };

  const download = (name: string, mime: string, data: string | Blob) => {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  useEffect(() => {
    const dark = theme === "dark" || theme === "neon" || themePack === "Neon";
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, themePack]);

  useEffect(() => {
    const saved = localStorage.getItem(safe.draftKey);
    if (saved && !value) {
      try {
        const obj = JSON.parse(saved);
        if (showHeaderFields) {
          setTo(obj.to || safe.to);
          setCc(obj.cc || safe.cc);
          setBcc(obj.bcc || safe.bcc);
          setSubject(obj.subject || safe.subj);
        }
        setHtml(obj.html || safe.body);
        if (editorRef.current)
          editorRef.current.innerHTML = obj.html || safe.body;
      } catch {
        if (editorRef.current) editorRef.current.innerHTML = safe.body;
      }
    } else if (editorRef.current && value) {
      editorRef.current.innerHTML = value;
    } else if (editorRef.current) {
      editorRef.current.innerHTML = safe.body;
    }
    normalizeEditor();
  }, []);

  // Helper function to clear old drafts when storage quota is exceeded
  const clearOldDrafts = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage);
      const draftKeys = allKeys
        .filter((k) => k.includes("composepro") || k.includes("texteditor"))
        .filter((k) => !k.endsWith("-offline"))
        .sort();

      // Remove oldest drafts first, keeping the last 5
      const toRemove = draftKeys.slice(0, Math.max(0, draftKeys.length - 5));
      toRemove.forEach((key) => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}-offline`);
      });
    } catch (err) {
      console.warn("Error clearing old drafts:", err);
    }
  }, []);

  // Helper function to safely save to localStorage with quota handling
  const safeLocalStorageSave = useCallback(
    (key: string, value: string) => {
      try {
        localStorage.setItem(key, value);
      } catch (err: any) {
        if (err.name === "QuotaExceededError") {
          console.warn(
            "localStorage quota exceeded, attempting to clear old drafts",
          );
          clearOldDrafts();
          try {
            localStorage.setItem(key, value);
          } catch (retryErr) {
            console.warn(
              "Failed to save draft even after cleanup. Content size may be too large.",
              retryErr,
            );
          }
        } else {
          console.error("Error saving to localStorage:", err);
        }
      }
    },
    [clearOldDrafts],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      const draftData = JSON.stringify({ to, cc, bcc, subject, html });

      // Warn if draft data is getting too large (over 500KB)
      if (draftData.length > 500000) {
        console.warn(
          `Draft data is large (${(draftData.length / 1024).toFixed(2)}KB). Consider reducing content size.`,
        );
      }

      safeLocalStorageSave(safe.draftKey, draftData);

      if (offlineSync) {
        safeLocalStorageSave(`${safe.draftKey}-offline`, "enabled");
      }
    }, 700);
    return () => window.clearTimeout(id);
  }, [
    to,
    cc,
    bcc,
    subject,
    html,
    offlineSync,
    safe.draftKey,
    safeLocalStorageSave,
  ]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const last = versions[versions.length - 1];
      if (!last || last.html !== html || last.subject !== subject) {
        setVersions((v) =>
          [...v, { id: uid("v"), at: Date.now(), subject, html }].slice(-25),
        );
      }
    }, 10000);
    return () => window.clearTimeout(id);
  }, [html, subject, versions]);

  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      if (
        editorRef.current &&
        editorRef.current.contains(range.commonAncestorContainer)
      ) {
        lastRangeRef.current = range.cloneRange();
        if (!sel.isCollapsed) {
          const rect = range.getBoundingClientRect();
          setBubble({
            x: rect.left + rect.width / 2,
            y: Math.max(10, rect.top - 44),
          });
        } else setBubble(null);
      }
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setReminders((items) =>
        items.map((item) => {
          if (item.fired || !item.at) return item;
          if (Date.now() >= new Date(item.at).getTime()) {
            alert(`Reminder: ${item.title}`);
            return { ...item, fired: true };
          }
          return item;
        }),
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!voiceOn) return;
    const id = window.setInterval(
      () => showToast("Voice dictation listening… (mock)"),
      4000,
    );
    return () => window.clearInterval(id);
  }, [voiceOn]);

  useEffect(() => {
    return () =>
      internalAttachments.forEach(
        (file) => file.url.startsWith("blob:") && URL.revokeObjectURL(file.url),
      );
  }, [internalAttachments]);

  useEffect(() => {
    if (externalAttachments.length > 0 && onAttachmentsChange) {
      const formattedAttachments = externalAttachments.map((att: any) => ({
        id: att.id || uid("file"),
        name: att.Filename || att.name,
        url: att.base64string || att.url,
        type: att.ContentType || att.type,
        size: att.size || 0,
      }));
      setInternalAttachments(formattedAttachments);
    }
  }, [externalAttachments]);

  const metrics = useMemo(() => {
    const text = getText(html);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return {
      words,
      chars: text.length,
      score: words < 120 ? "Clear" : words < 350 ? "Moderate" : "Long",
    };
  }, [html]);

  const spamScore = useMemo(() => {
    const t = getText(html).toLowerCase();
    let score = 5;
    if (t.includes("free")) score += 10;
    if (t.includes("urgent")) score += 8;
    if (t.includes("limited time")) score += 12;
    if ((html.match(/<a /g) || []).length > 3) score += 15;
    if (subject.length > 80) score += 8;
    return Math.min(100, score);
  }, [html, subject]);

  const dlpIssues = useMemo(() => {
    const text = getText(html);
    const issues: string[] = [];
    if (text.match(/\b\d{12}\b/)) issues.push("Possible Aadhaar number");
    if (text.match(/\b(?:\d[ -]*?){13,16}\b/))
      issues.push("Possible card number");
    if (text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/i))
      issues.push("Possible PAN number");
    return issues;
  }, [html]);

  const grammarIssues = useMemo<GrammarIssue[]>(() => {
    const text = getText(html);
    const issues: GrammarIssue[] = [];
    if (text.match(/\bteh\b/i))
      issues.push({
        id: "teh",
        level: "red",
        text: "teh",
        suggestion: "Replace with 'the'",
      });
    if (text.match(/\brecieve\b/i))
      issues.push({
        id: "recieve",
        level: "red",
        text: "recieve",
        suggestion: "Replace with 'receive'",
      });
    if (text.match(/  +/))
      issues.push({
        id: "spaces",
        level: "yellow",
        text: "extra spaces",
        suggestion: "Normalize spacing",
      });
    if (text.match(/\bvery very\b/i))
      issues.push({
        id: "very",
        level: "yellow",
        text: "very very",
        suggestion: "Use one 'very'",
      });
    if (text.match(/\byour\s+too\b/i))
      issues.push({
        id: "your-too",
        level: "red",
        text: "your too",
        suggestion: "Use 'you're too' or 'your two'",
      });
    return issues;
  }, [html]);

  const legalScore = Math.max(
    40,
    Math.min(
      96,
      75 +
        (dlpIssues.length ? -15 : 5) +
        (getText(html).toLowerCase().includes("without prejudice") ? 10 : 0),
    ),
  );

  const outline = useMemo(() => {
    if (typeof document === "undefined")
      return [] as Array<{ id: string; text: string; level: string }>;
    const div = document.createElement("div");
    div.innerHTML = html;
    return Array.from(div.querySelectorAll("h1,h2,h3")).map((el, i) => ({
      id: `h-${i}`,
      text: el.textContent || `Heading ${i + 1}`,
      level: el.tagName.toLowerCase(),
    }));
  }, [html]);

  const onPaste = useCallback(
    (e: ClipboardEvent<HTMLDivElement>) => {
      const items = Array.from(e.clipboardData.items || []);
      const imageItem = items.find((item) => item.type.startsWith("image/"));
      if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          const url = URL.createObjectURL(file);
          const newAttachment = {
            id: uid("paste-img"),
            name: file.name || `pasted-image-${Date.now()}.png`,
            url,
            type: file.type || "image/png",
            size: file.size,
          };
          setInternalAttachments((list) => [...list, newAttachment]);
          if (onAttachmentsChange) {
            onAttachmentsChange([...internalAttachments, newAttachment]);
          }
          const reader = new FileReader();
          reader.onload = () =>
            insertHTML(`<img src="${reader.result}" alt="Pasted image"/>`);
          reader.readAsDataURL(file);
        }
        return;
      }
      if (!smartPaste) return;
      e.preventDefault();
      const rich = e.clipboardData.getData("text/html");
      const plain = e.clipboardData.getData("text/plain");
      document.execCommand("insertHTML", false, rich ? cleanHtml(rich) : plain);
      syncHtml();
    },
    [smartPaste],
  );

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const newAttachment = {
        id: uid("file"),
        name: file.name,
        url,
        type: file.type || "application/octet-stream",
        size: file.size,
      };
      setInternalAttachments((list) => [...list, newAttachment]);
      if (onAttachmentsChange) {
        onAttachmentsChange([...internalAttachments, newAttachment]);
      }
      if (file.type.startsWith("image/") && inlineImages) {
        const reader = new FileReader();
        reader.onload = () =>
          insertHTML(`<img src="${reader.result}" alt="${file.name}"/>`);
        reader.readAsDataURL(file);
      } else insertHTML(`<a href="${url}" target="_blank">📎 ${file.name}</a>`);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setCommandOpen(true);
    }
    if (e.key === "/" && !sourceMode) setSlashOpen(true);
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      if (onSend) onSend();
    }
  };

  const addComment = () => {
    restoreSelection();
    const sel = window.getSelection();
    let selected = "";
    if (sel && sel.rangeCount && !sel.isCollapsed) {
      selected = sel.toString();
      try {
        const mark = document.createElement("mark");
        mark.style.background = "#fffb8f";
        mark.style.padding = "2px 4px";
        mark.style.borderRadius = "4px";
        mark.setAttribute("data-comment", "true");
        sel.getRangeAt(0).surroundContents(mark);
        syncHtml();
      } catch {}
    }
    const text =
      prompt(
        selected ? `Comment on: ${selected.slice(0, 70)}` : "Add draft comment",
        selected ? "" : "Draft-level comment",
      ) || "";
    if (!text.trim()) {
      editorRef.current?.focus();
      return;
    }
    setComments((list) => [
      ...list,
      {
        id: uid("c"),
        at: Date.now(),
        author: "You",
        text,
        selection: selected || "Draft comment",
      },
    ]);
    setRail("comments");
    showToast("Comment added ✓");
    editorRef.current?.focus();
  };

  const insertButton = () => {
    const label = prompt("Button label", "Click Here") || "Click Here";
    const style =
      buttonStyle === "outline"
        ? `border:2px solid ${brand};color:${brand};background:transparent;`
        : buttonStyle === "solid"
          ? `background:${brand};color:#fff;`
          : `background:linear-gradient(90deg,#D4AF37,${brand});color:#fff;`;
    insertHTML(
      `<span contenteditable="true" style="display:inline-block;padding:8px 14px;border-radius:999px;font-weight:700;${style}">${label}</span>`,
    );
  };

  const insertShape = (
    kind: "pill" | "badge" | "note" | "callout" | "divider",
  ) => {
    const size =
      shapeSize === "sm"
        ? { pad: "4px 8px", font: "12px" }
        : shapeSize === "lg"
          ? { pad: "10px 16px", font: "16px" }
          : { pad: "6px 12px", font: "14px" };
    const items = {
      pill: `<span contenteditable="true" style="display:inline-block;padding:${size.pad};border-radius:999px;background:${shapeColor};color:#fff;font-weight:700;font-size:${size.font}">Pill label</span>`,
      badge: `<span contenteditable="true" style="display:inline-block;padding:${size.pad};border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;font-size:${size.font}">Badge</span>`,
      note: `<div contenteditable="true" style="padding:${size.pad};border-left:4px solid ${shapeColor};background:#eff6ff;border-radius:10px;font-size:${size.font}">Note: edit text here.</div>`,
      callout: `<div style="padding:${size.pad};border:1px dashed #94a3b8;border-radius:12px;background:linear-gradient(180deg,#ffffff,#f8fafc);font-size:${size.font}"><b>Callout</b><br/><span contenteditable="true">Edit important message here.</span></div>`,
      divider: `<hr style="border:0;border-top:2px solid #e5e7eb;border-radius:2px"/>`,
    };
    insertHTML(items[kind]);
    setShapeOpen(false);
  };

  const aiRewrite = (
    mode:
      | "professional"
      | "legal"
      | "sales"
      | "concise"
      | "shorter"
      | "stronger"
      | "softer"
      | "hindi",
  ) => {
    const text = getText(html) || "Your message";
    const title =
      mode === "hindi"
        ? "Hindi Rewrite"
        : mode === "legal"
          ? "Legally Refined Draft"
          : mode === "sales"
            ? "Sales-Focused Draft"
            : mode === "stronger"
              ? "Stronger Draft"
              : mode === "softer"
                ? "Softer Draft"
                : mode === "shorter" || mode === "concise"
                  ? "Concise Draft"
                  : "Professional Draft";
    const body =
      mode === "hindi"
        ? "<p>यह मसौदा हिंदी में पुनर्लेखन हेतु तैयार किया गया है। कृपया सामग्री की समीक्षा करें।</p>"
        : `<p>${text}</p>`;
    insertHTML(
      `<div style="padding:12px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb"><b>${title}</b>${body}</div>`,
    );
    showToast(`AI ${mode} block inserted`);
  };

  const smartCompose = () =>
    insertHTML(
      "<p>Based on the above, I would request you to kindly confirm the next steps at the earliest.</p>",
    );
  const predictiveParagraph = () =>
    insertHTML(
      "<p>Further, we remain available to provide supporting documents, clarifications, or additional details required for proper consideration of this matter.</p>",
    );

  const applyGrammarFix = (issue: GrammarIssue) => {
    if (!editorRef.current) return;
    let next = editorRef.current.innerHTML;
    if (issue.id === "teh") next = next.replace(/\bteh\b/gi, "the");
    if (issue.id === "recieve") next = next.replace(/\brecieve\b/gi, "receive");
    if (issue.id === "spaces") next = next.replace(/ {2,}/g, " ");
    if (issue.id === "very") next = next.replace(/\bvery very\b/gi, "very");
    if (issue.id === "your-too")
      next = next.replace(/\byour too\b/gi, "you're too");
    editorRef.current.innerHTML = next;
    syncHtml();
  };

  const smartFormat = (
    kind: "headings" | "bullets" | "spacing" | "typography",
  ) => {
    if (!editorRef.current) return;
    let next = editorRef.current.innerHTML;
    if (kind === "headings")
      next = next.replace(/<p>(.{1,60}:)<\/p>/g, "<h3>$1</h3>");
    if (kind === "bullets")
      next = next.replace(/<p>[-•]\s*(.*?)<\/p>/g, "<ul><li>$1</li></ul>");
    if (kind === "spacing")
      next = next.replace(/ {2,}/g, " ").replace(/(<br>\s*){3,}/g, "<br><br>");
    if (kind === "typography")
      next = next.replace(/--/g, "—").replace(/\.\.\./g, "…");
    editorRef.current.innerHTML = next;
    syncHtml();
    showToast(`Smart formatting applied: ${kind}`);
  };

  const restoreVersion = (version: VersionItem) => {
    if (editorRef.current) editorRef.current.innerHTML = version.html;
    setHtml(version.html);
    setSubject(version.subject);
    if (onSubjectChange) onSubjectChange(version.subject);
    if (onEditorChange) onEditorChange(version.html);
    normalizeEditor();
    showToast("Version restored");
  };

  const simpleDiff = (oldHtml: string, newHtml: string) => {
    const oldWords = getText(oldHtml).split(/ +/).filter(Boolean);
    const newWords = getText(newHtml).split(/ +/).filter(Boolean);
    return {
      added: newWords.filter((w) => !oldWords.includes(w)).slice(0, 40),
      removed: oldWords.filter((w) => !newWords.includes(w)).slice(0, 40),
    };
  };

  const insertSnippet = (
    kind: "meeting" | "payment" | "approval" | "security",
  ) => {
    const snippets = {
      meeting:
        "<p>Kindly confirm a suitable time for a short discussion. You may use the calendar link below to book a slot.</p><p><b>Meeting Link:</b> {{meeting_link}}</p>",
      payment:
        "<p>Please find the payment details below:</p><p><b>Invoice:</b> {{invoice_no}}<br/><b>Amount:</b> {{amount}}<br/><b>Due Date:</b> {{due_date}}</p>",
      approval:
        "<p>This draft is submitted for internal review and approval. Kindly review the content and provide your remarks.</p>",
      security:
        "<p style='font-size:12px;color:#64748b'>This message may contain confidential information. If received in error, please delete it and inform the sender.</p>",
    };
    insertHTML(snippets[kind]);
  };

  const insertInteractive = (
    kind: "accordion" | "tabs" | "progress" | "kpi" | "timeline",
  ) => {
    const blocks = {
      accordion: `<details style="border:1px solid #e5e7eb;border-radius:12px;padding:10px"><summary contenteditable="true"><b>Accordion Title</b></summary><div contenteditable="true" style="padding:8px 0">Accordion content here.</div></details>`,
      tabs: `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:10px"><div><b>Tab 1</b> | Tab 2 | Tab 3</div><div contenteditable="true" style="margin-top:8px">Tab content area.</div></div>`,
      progress: `<div style="padding:8px"><div contenteditable="true">Progress: 65%</div><div style="height:10px;background:#e5e7eb;border-radius:999px"><div style="width:65%;height:10px;background:${brand};border-radius:999px"></div></div></div>`,
      kpi: `<div style="display:inline-block;border:1px solid #e5e7eb;border-radius:14px;padding:12px;min-width:140px"><div contenteditable="true" style="font-size:12px;color:#64748b">KPI Label</div><div contenteditable="true" style="font-size:24px;font-weight:800;color:${brand}">98%</div></div>`,
      timeline: `<div style="border-left:3px solid ${brand};padding-left:12px"><div contenteditable="true"><b>Step 1</b> — Started</div><div contenteditable="true"><b>Step 2</b> — Review</div><div contenteditable="true"><b>Step 3</b> — Complete</div></div>`,
    };
    insertHTML(blocks[kind]);
  };

  const insertMediaEmbed = () => {
    if (!mediaUrl.trim()) return alert("Enter media URL");
    if (mediaKind === "gif") insertHTML(`<img src="${mediaUrl}" alt="GIF"/>`);
    if (mediaKind === "video")
      insertHTML(
        `<video controls style="max-width:100%;border-radius:14px;border:1px solid #e5e7eb"><source src="${mediaUrl}"/></video>`,
      );
    if (mediaKind === "audio")
      insertHTML(
        `<audio controls style="width:100%"><source src="${mediaUrl}"/></audio>`,
      );
    if (mediaKind === "loom" || mediaKind === "screen")
      insertHTML(
        `<div style="border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#f8fafc"><b>${mediaKind === "loom" ? "Loom-style Embed" : "Screen Recording"}</b><br/><a href="${mediaUrl}" target="_blank">${mediaUrl}</a></div>`,
      );
    setMediaUrl("");
  };

  const queueSend = () => {
    if (onSend) {
      onSend();
    } else {
      showToast(
        secureMode
          ? "Secure send queued — undo active"
          : "Queued to send — undo active",
      );
    }
  };

  const exportHtml = () =>
    download(
      `compose-${Date.now()}.html`,
      "text/html;charset=utf-8",
      `<!doctype html><meta charset='utf-8'><title>${subject}</title>${html}`,
    );
  const exportEml = () =>
    download(
      `compose-${Date.now()}.eml`,
      "message/rfc822",
      [
        `Subject: ${subject}`,
        `To: ${to}`,
        `Cc: ${cc}`,
        `Bcc: ${bcc}`,
        "Content-Type: text/html; charset=UTF-8",
        "",
        html,
      ].join("\r\n"),
    );

  // const panelTheme =
  //   themePack === "Neumorphism"
  //     ? "bg-gray-100 shadow-[inset_8px_8px_18px_#d1d5db,inset_-8px_-8px_18px_#ffffff] dark:bg-gray-900"
  //     : themePack === "Luxury Gold"
  //       ? "bg-gradient-to-br from-amber-50 via-white to-blue-50 dark:from-gray-950 dark:to-gray-900"
  //       : themePack === "Govt Blue"
  //         ? "bg-blue-50 dark:bg-gray-950"
  //         : themePack === "Neon"
  //           ? "bg-gray-950 text-white"
  //           : theme === "gold"
  //             ? "bg-gradient-to-br from-amber-50 via-white to-blue-50"
  //             : theme === "neon"
  //               ? "bg-gray-950 text-white"
  //               : theme === "glass"
  //                 ? "bg-white/75 backdrop-blur-xl dark:bg-gray-900/80"
  //                 : "bg-white dark:bg-gray-900";
  const widthClass = fullscreen ? "w-full" : "w-full";
  const editorMax = longEditor ? "max-h-[78vh]" : "max-h-[62vh]";
  const heat =
    metrics.words > targetWords
      ? "bg-red-50 dark:bg-red-950/30"
      : metrics.words > targetWords * 0.75
        ? "bg-yellow-50 dark:bg-yellow-950/30"
        : "bg-emerald-50 dark:bg-emerald-950/30";

  const CommandPalette = () =>
    commandOpen ? (
      <div
        className="fixed inset-0 z-[120] grid place-items-start bg-black/40 pt-24"
        onClick={() => setCommandOpen(false)}
      >
        <div
          className="mx-auto w-[min(760px,94vw)] rounded-2xl border bg-white p-3 shadow-xl dark:bg-gray-900"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-2 font-semibold">⌘ Command Palette</div>
          {[
            ["AI Smart Compose", smartCompose],
            ["Predict next paragraph", predictiveParagraph],
            ["AI legal refinement", () => aiRewrite("legal")],
            [
              "Insert advanced table",
              () => insertHTML(tableHtml(3, 3, tableTheme)),
            ],
            ["Insert KPI card", () => insertInteractive("kpi")],
            ["Open Writing Goals", () => setRail("goals")],
            ["Open Outline", () => setRail("outline")],
            ["Toggle Zen mode", () => setZenMode((z) => !z)],
            ["Toggle Voice Dictation", () => setVoiceOn((v) => !v)],
            ["Open Calendar", () => setCalendarOpen(true)],
          ].map(([label, fn]) => (
            <button
              type="button"
              key={String(label)}
              className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => {
                (fn as () => void)();
                setCommandOpen(false);
              }}
            >
              {String(label)}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  const SlashMenu = () =>
    slashOpen ? (
      <div className="fixed left-6 top-40 z-[110] w-72 rounded-xl border bg-white p-2 text-sm shadow dark:bg-gray-900">
        {[
          [
            "/table",
            "Insert table",
            () => insertHTML(tableHtml(3, 3, tableTheme)),
          ],
          ["/button", "CTA button", insertButton],
          ["/note", "Callout note", () => insertShape("note")],
          ["/kpi", "KPI card", () => insertInteractive("kpi")],
          ["/timeline", "Timeline", () => insertInteractive("timeline")],
          ["/merge", "Merge variables", () => insertHTML(mergeVars.join(" "))],
          [
            "/signature",
            "Signature",
            () => insertHTML(signatures[0] || SIGNATURE),
          ],
          ["/meeting", "Meeting snippet", () => insertSnippet("meeting")],
          ["/payment", "Payment snippet", () => insertSnippet("payment")],
          ["/security", "Security disclaimer", () => insertSnippet("security")],
        ].map(([cmd, label, fn]) => (
          <button
            type="button"
            key={String(cmd)}
            className="block w-full rounded px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => {
              (fn as () => void)();
              setSlashOpen(false);
            }}
          >
            <b>{String(cmd)}</b> {String(label)}
          </button>
        ))}
        <button
          type="button"
          className="w-full px-3 py-2 text-xs opacity-70"
          onClick={() => setSlashOpen(false)}
        >
          Close
        </button>
      </div>
    ) : null;

  const railClass =
    dockSide === "bottom"
      ? "w-full max-h-[42vh] overflow-auto border-t bg-white/90 p-3 dark:bg-gray-900/90 md:col-span-1"
      : dockSide === "left"
        ? "w-full overflow-auto border-r bg-white/80 p-3 dark:bg-gray-900/80 md:w-[430px] md:order-first"
        : "w-full overflow-auto border-l bg-white/80 p-3 md:w-[430px]";
  const railTabs: RailTab[] = [
    "ai",
    "goals",
    "outline",
    "grammar",
    "blocks",
    "media",
    "comments",
    "tasks",
    "files",
    "security",
    "templates",
    "settings",
  ];

  // Handle input changes for header fields
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTo(value);
    if (onToChange && showHeaderFields) {
      const emailArray = value.split(",").map((email: string) => ({
        value: email.trim(),
        label: email.trim(),
      }));
      onToChange(emailArray);
    }
  };

  const handleCcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCc(value);
    if (onCCChange && showHeaderFields) {
      const emailArray = value.split(",").map((email: string) => ({
        value: email.trim(),
        label: email.trim(),
      }));
      onCCChange(emailArray);
    }
  };

  const handleBccChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBcc(value);
    if (onBCCChange && showHeaderFields) {
      const emailArray = value.split(",").map((email: string) => ({
        value: email.trim(),
        label: email.trim(),
      }));
      onBCCChange(emailArray);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubject(value);
    if (onSubjectChange && showHeaderFields) {
      onSubjectChange(value);
    }
  };

  return (
    <div
      className="rounded-xl border shadow-2xl transition-all duration-300"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        ...containerStyle,
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      <div
        className={clsx(
          "flex h-full flex-col overflow-hidden rounded-3xl",
          // panelTheme,
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 border-b p-3 backdrop-blur">
          <div className="mr-auto flex items-center gap-2 font-bold">
            <span className="h-8 w-8 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#1155CC]" />
            ComposePro Reverified
          </div>
          <span className="rounded-full border px-2 py-1 text-xs">
            {metrics.words} words • {metrics.score}
          </span>
          {presence.map((p) => (
            <button
              type="button"
              key={p.id}
              className="grid h-7 w-7 place-items-center rounded-full text-[10px] text-white"
              style={{ background: p.color }}
              onClick={() =>
                setTasks((list) => [
                  ...list,
                  {
                    id: uid("t"),
                    title: `Review by ${p.name}`,
                    assignee: p.name,
                  },
                ])
              }
            >
              {p.name.slice(0, 2)}
            </button>
          ))}
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setCommandOpen(true)}
          >
            ⌘K
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setZenMode((z) => !z)}
          >
            🧘
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setVoiceOn((v) => !v)}
          >
            {voiceOn ? "🎙️ On" : "🎙️"}
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setSecureMode((s) => !s)}
          >
            {secureMode ? "🔐" : "🔓"}
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setCompareOpen(true)}
          >
            ⇄
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setFocusFlow((v) => !v)}
          >
            🎯
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setMinimalMode((v) => !v)}
          >
            ◌
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            🌗
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setFullscreen((v) => !v)}
          >
            ⛶
          </button>
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={() => setRail((r) => (r ? null : "ai"))}
          >
            ☰
          </button>
          {onClose && (
            <button
              type="button"
              className="rounded border px-3 py-1"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>

        {/* Header Fields (To, CC, BCC, Subject) - Conditional */}
        {!zenMode && !minimalMode && showHeaderFields && (
          <div className="grid gap-2 border-b p-3">
            <input
              value={to}
              onChange={handleToChange}
              placeholder="To"
              className="rounded border bg-white px-3 py-2 dark:bg-gray-800"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={cc}
                onChange={handleCcChange}
                placeholder="CC"
                className="rounded border bg-white px-3 py-2 dark:bg-gray-800"
              />
              <input
                value={bcc}
                onChange={handleBccChange}
                placeholder="BCC"
                className="rounded border bg-white px-3 py-2 dark:bg-gray-800"
              />
            </div>
            <input
              value={subject}
              onChange={handleSubjectChange}
              placeholder="Subject"
              className="rounded border bg-white px-3 py-2 dark:bg-gray-800"
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <span>Template:</span>
          <select
            className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
            onChange={(e) =>
              insertHTML(
                templates[e.currentTarget.value as keyof typeof templates] ||
                  "",
              )
            }
          >
            <option value="">Choose</option>
            {Object.keys(templates).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <label className="ml-auto flex items-center gap-1">
            <input
              type="checkbox"
              checked={longEditor}
              onChange={(e) => setLongEditor(e.currentTarget.checked)}
            />
            Long editor
          </label>
          <span className="text-emerald-600">Auto-save ✓</span>
        </div>

        {/* Main Toolbar */}
        {!zenMode && !minimalMode && (
          <div className="flex flex-wrap gap-2 border-b bg-white/50 px-3 py-2 dark:bg-gray-900/50">
            <button
              type="button"
              className="rounded border bg-gradient-to-r from-pink-500 to-orange-400 px-2 py-1 text-white"
              onClick={() => exec("bold")}
            >
              B
            </button>
            <button
              type="button"
              className="rounded border bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-1 text-white"
              onClick={() => exec("italic")}
            >
              I
            </button>
            <button
              type="button"
              className="rounded border bg-gradient-to-r from-violet-500 to-sky-500 px-2 py-1 text-white"
              onClick={() => exec("underline")}
            >
              U
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("strikeThrough")}
            >
              S̶
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("justifyLeft")}
            >
              ⬅
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("justifyCenter")}
            >
              ↔
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("justifyRight")}
            >
              ➡
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("insertUnorderedList")}
            >
              •
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => exec("insertOrderedList")}
            >
              1.
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => setColorOpen((v) => !v)}
            >
              🎨
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => setEmojiOpen((v) => !v)}
            >
              😊
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => insertHTML(tableHtml(3, 3, tableTheme))}
            >
              ▦ Table
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => setShapeOpen((v) => !v)}
            >
              ⬠ Shape
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={insertButton}
            >
              ⚡ Button
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => setRail("blocks")}
            >
              Blocks
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1"
              onClick={() => insertHTML(mergeVars[0])}
            >
              {"{{var}}"}
            </button>
            <label className="cursor-pointer rounded border px-2 py-1">
              📎
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.currentTarget.files) handleFiles(e.currentTarget.files);
                  e.currentTarget.value = "";
                }}
              />
            </label>
            <label className="ml-auto flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={smartPaste}
                onChange={(e) => setSmartPaste(e.currentTarget.checked)}
              />
              Smart paste
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={inlineImages}
                onChange={(e) => setInlineImages(e.currentTarget.checked)}
              />
              Inline images
            </label>
          </div>
        )}

        {/* Color Picker Popup */}
        {colorOpen && (
          <div className="absolute left-5 top-44 z-[90] rounded-xl border bg-white p-3 shadow dark:bg-gray-900">
            <div className="mb-2 grid grid-cols-10 gap-1">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className="h-7 w-7 rounded"
                  style={{ background: c }}
                  onClick={() => exec("foreColor", c)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={buttonStyle}
                onChange={(e) => setButtonStyle(e.currentTarget.value as any)}
                className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
              >
                <option>solid</option>
                <option>outline</option>
                <option>gradient</option>
              </select>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={insertButton}
              >
                Styled button
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => setColorOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Emoji Popup */}
        {emojiOpen && (
          <div className="absolute left-24 top-44 z-[90] w-[min(520px,92vw)] rounded-xl border bg-white p-3 shadow dark:bg-gray-900">
            <div className="grid grid-cols-10 gap-2 text-2xl">
              {EMOJIS.map((e) => (
                <button
                  type="button"
                  key={e}
                  className="h-10 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => insertHTML(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shape Popup */}
        {shapeOpen && (
          <div className="absolute left-40 top-44 z-[90] w-[min(440px,92vw)] rounded-xl border bg-white p-3 shadow dark:bg-gray-900">
            <div className="mb-2 text-xs">Shape Color</div>
            <div className="mb-2 grid grid-cols-10 gap-1">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className="h-7 rounded"
                  style={{ background: c }}
                  onClick={() => setShapeColor(c)}
                />
              ))}
            </div>
            <div className="mb-2 flex gap-2">
              {(["sm", "md", "lg"] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  className={clsx(
                    "rounded border px-2 py-1",
                    shapeSize === s && "bg-gray-100 dark:bg-gray-800",
                  )}
                  onClick={() => setShapeSize(s)}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {(["pill", "badge", "note", "callout", "divider"] as const).map(
                (s) => (
                  <button
                    type="button"
                    key={s}
                    className="rounded border px-2 py-1"
                    onClick={() => insertShape(s)}
                  >
                    {s}
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {/* Bubble Menu for selected text */}
        {bubble && (
          <div
            className="fixed z-[95] flex gap-1 rounded-full bg-black px-2 py-1 text-white shadow"
            style={{
              left: bubble.x,
              top: bubble.y,
              transform: "translateX(-50%)",
            }}
          >
            <button type="button" onClick={() => exec("bold")}>
              B
            </button>
            <button type="button" onClick={() => exec("italic")}>
              I
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={addComment}
            >
              💬
            </button>
            <button type="button" onClick={() => aiRewrite("concise")}>
              AI
            </button>
            <button type="button" onClick={smartCompose}>
              ↪
            </button>
          </div>
        )}

        {/* Editor and Rail Layout */}
        <div
          className={clsx(
            "grid min-h-0 flex-1",
            zenMode
              ? "md:grid-cols-[1fr]"
              : dockSide === "bottom"
                ? "md:grid-cols-[1fr]"
                : dockSide === "left"
                  ? "md:grid-cols-[auto_1fr]"
                  : "md:grid-cols-[1fr_auto]",
          )}
        >
          {/* Editor Area */}
          <div className="flex min-h-0 flex-col">
            {sourceMode ? (
              <textarea
                value={sourceHtml}
                onChange={(e) => setSourceHtml(e.currentTarget.value)}
                className="m-3 flex-1 rounded border bg-white p-3 font-mono text-xs dark:bg-gray-800"
              />
            ) : (
              <div
                className={clsx(
                  "m-3 flex-1 min-h-[340px] overflow-auto rounded-2xl border-2 bg-white p-4 prose prose-sm max-w-none dark:bg-gray-800 transition-all duration-300",
                  editorMax,
                  split && "grid gap-3 md:grid-cols-2",
                  heat,
                  focusFlow && "outline outline-4 outline-blue-100",
                  "resize",
                )}
              >
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck
                  onPaste={onPaste}
                  onInput={syncHtml}
                  onKeyDown={onKeyDown}
                  className="min-h-[320px] outline-none"
                />
                {split && (
                  <div
                    className="rounded border bg-gray-50 p-3 dark:bg-gray-900"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                )}
              </div>
            )}

            {/* Bottom Toolbar */}
            <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2 text-xs">
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => {
                  if (!sourceMode) setSourceHtml(html);
                  else {
                    if (editorRef.current)
                      editorRef.current.innerHTML = sourceHtml;
                    setHtml(sourceHtml);
                    if (onEditorChange) onEditorChange(sourceHtml);
                  }
                  setSourceMode((v) => !v);
                }}
              >
                HTML
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => setSplit((v) => !v)}
              >
                Split
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => setCalendarOpen(true)}
              >
                Calendar
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => setPreviewOpen(true)}
              >
                Preview
              </button>
              <select
                value={approval}
                onChange={(e) => setApproval(e.currentTarget.value as any)}
                className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
              >
                <option>Draft</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addComment}
              >
                ＋ Add comment
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={smartCompose}
              >
                Smart Compose
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={predictiveParagraph}
              >
                Next ¶
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => aiRewrite("shorter")}
              >
                Shorter
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => aiRewrite("stronger")}
              >
                Stronger
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => aiRewrite("softer")}
              >
                Softer
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => setRail("ai")}
              >
                AI Panel
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={exportHtml}
              >
                HTML Export
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={exportEml}
              >
                EML
              </button>
              {showSendButton && (
                <button
                  type="submit"
                  className="ml-auto rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#1155CC] px-4 py-2 text-white"
                  onClick={queueSend}
                  disabled={buttonLoading}
                >
                  {buttonLoading && (
                    <Spinner
                      style={{ width: 15, height: 15, marginRight: 5 }}
                    />
                  )}
                  {sendButtonText}
                </button>
              )}
              {showReminderButton && onReminderClick && (
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#1155CC] px-4 py-2 text-white"
                  onClick={onReminderClick}
                  disabled={buttonLoading}
                >
                  {buttonLoading && (
                    <Spinner
                      style={{ width: 15, height: 15, marginRight: 5 }}
                    />
                  )}
                  {reminderButtonText}
                </button>
              )}
              {showDiscardButton && onDiscard && (
                <button
                  type="button"
                  className="rounded-xl border px-4 py-2"
                  onClick={onDiscard}
                >
                  Discard
                </button>
              )}
            </div>

            {/* Mobile Toolbar */}
            {mobileToolbar && (
              <div className="md:hidden fixed bottom-3 left-3 right-3 z-[105] flex justify-around rounded-2xl border bg-white/95 p-2 shadow-xl dark:bg-gray-900/95">
                <button onClick={() => exec("bold")}>B</button>
                <button onClick={() => exec("italic")}>I</button>
                <button onClick={() => exec("underline")}>U</button>
                <button onClick={() => setEmojiOpen((v) => !v)}>😊</button>
                <button onClick={() => setCalendarOpen(true)}>🗓️</button>
                <button onClick={addComment}>💬</button>
                {showSendButton && <button onClick={queueSend}>Send</button>}
              </div>
            )}
          </div>

          {/* Right Rail Panel */}
          {rail && !zenMode && (
            <aside className={railClass}>
              <div className="mb-3 flex flex-wrap gap-1 text-xs">
                {railTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={clsx(
                      "rounded border px-2 py-1 capitalize",
                      rail === tab && " bg-gray-400",
                    )}
                    onClick={() => setRail(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {rail === "ai" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">AI Writing</h3>
                  {(
                    [
                      "professional",
                      "legal",
                      "sales",
                      "concise",
                      "shorter",
                      "stronger",
                      "softer",
                      "hindi",
                    ] as const
                  ).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      className="rounded border px-3 py-2 text-left"
                      onClick={() => aiRewrite(mode)}
                    >
                      Rewrite: {mode}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={smartCompose}
                  >
                    Sentence autocomplete
                  </button>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={predictiveParagraph}
                  >
                    Predict next paragraph
                  </button>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() =>
                      setSubject(
                        "Follow-up: Important update regarding your request",
                      )
                    }
                  >
                    Generate subject
                  </button>
                </div>
              )}
              {rail === "goals" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Writing Goals</h3>
                  <label>
                    Tone{" "}
                    <select
                      value={targetTone}
                      onChange={(e) => setTargetTone(e.currentTarget.value)}
                      className="ml-2 rounded border bg-white px-2 py-1 dark:bg-gray-800"
                    >
                      <option>Professional</option>
                      <option>Legal</option>
                      <option>Sales</option>
                      <option>Friendly</option>
                    </select>
                  </label>
                  <label>
                    Target words{" "}
                    <input
                      type="number"
                      value={targetWords}
                      onChange={(e) =>
                        setTargetWords(Number(e.currentTarget.value) || 0)
                      }
                      className="ml-2 w-24 rounded border bg-white px-2 py-1 dark:bg-gray-800"
                    />
                  </label>
                  <label>
                    Spam risk target{" "}
                    <input
                      type="number"
                      value={targetSpam}
                      onChange={(e) =>
                        setTargetSpam(Number(e.currentTarget.value) || 0)
                      }
                      className="ml-2 w-24 rounded border bg-white px-2 py-1 dark:bg-gray-800"
                    />
                  </label>
                  <label>
                    Reading level{" "}
                    <input
                      value={readingLevel}
                      onChange={(e) => setReadingLevel(e.currentTarget.value)}
                      className="ml-2 rounded border bg-white px-2 py-1 dark:bg-gray-800"
                    />
                  </label>
                  <div className="rounded border p-2">
                    Current words: <b>{metrics.words}</b> / {targetWords}
                  </div>
                  <div className="rounded border p-2">
                    Spam: <b>{spamScore}</b> / target {targetSpam}
                  </div>
                  <div className="rounded border p-2">
                    Legal/compliance score: <b>{legalScore}%</b>
                  </div>
                </div>
              )}
              {rail === "outline" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Document Outline</h3>
                  {outline.map((h, i) => (
                    <button
                      key={h.id}
                      className="rounded border px-3 py-2 text-left"
                      style={{
                        marginLeft:
                          h.level === "h3" ? 18 : h.level === "h2" ? 9 : 0,
                      }}
                    >
                      {i + 1}. {h.text}
                    </button>
                  ))}
                  {!outline.length && (
                    <div className="text-xs opacity-60">
                      Use H1/H2/H3 headings to build outline.
                    </div>
                  )}
                </div>
              )}
              {rail === "grammar" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Grammar Engine</h3>
                  {grammarIssues.map((g) => (
                    <div
                      key={g.id}
                      className={clsx(
                        "rounded border p-2",
                        g.level === "red"
                          ? "bg-red-50 dark:bg-red-950/30"
                          : "bg-yellow-50 dark:bg-yellow-950/30",
                      )}
                    >
                      <b>{g.text}</b>
                      <div className="text-xs">{g.suggestion}</div>
                      <button
                        className="mt-2 rounded border px-2 py-1 text-xs"
                        onClick={() => applyGrammarFix(g)}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                  {!grammarIssues.length && (
                    <div className="rounded border bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950/30">
                      No grammar issues found.
                    </div>
                  )}
                  <h4 className="font-semibold">Smart Formatting</h4>
                  {(
                    ["headings", "bullets", "spacing", "typography"] as const
                  ).map((k) => (
                    <button
                      key={k}
                      className="rounded border px-3 py-2 text-left"
                      onClick={() => smartFormat(k)}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
              {rail === "blocks" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Rich Content Blocks</h3>
                  <div className="flex gap-2">
                    <select
                      value={tableTheme}
                      onChange={(e) =>
                        setTableTheme(e.currentTarget.value as any)
                      }
                      className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
                    >
                      <option>classic</option>
                      <option>premium</option>
                      <option>dark</option>
                    </select>
                    <button
                      className="rounded border px-3 py-2"
                      onClick={() => insertHTML(tableHtml(4, 4, tableTheme))}
                    >
                      Advanced Table
                    </button>
                  </div>
                  <button
                    className="rounded border px-3 py-2"
                    onClick={() =>
                      insertHTML(
                        "<p><b>Formula:</b> =SUM(A1:A3) <span style='color:#64748b'>(mock)</span></p>",
                      )
                    }
                  >
                    Formula row
                  </button>
                  {(
                    [
                      "accordion",
                      "tabs",
                      "progress",
                      "kpi",
                      "timeline",
                    ] as const
                  ).map((b) => (
                    <button
                      key={b}
                      className="rounded border px-3 py-2 text-left"
                      onClick={() => insertInteractive(b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
              {rail === "media" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Advanced Media</h3>
                  <select
                    value={mediaKind}
                    onChange={(e) => setMediaKind(e.currentTarget.value as any)}
                    className="rounded border bg-white px-2 py-2 dark:bg-gray-800"
                  >
                    <option>gif</option>
                    <option>video</option>
                    <option>audio</option>
                    <option>loom</option>
                    <option>screen</option>
                  </select>
                  <input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.currentTarget.value)}
                    placeholder="Paste media URL"
                    className="rounded border bg-white px-2 py-2 dark:bg-gray-800"
                  />
                  <button
                    className="rounded border px-3 py-2"
                    onClick={insertMediaEmbed}
                  >
                    Insert media preview
                  </button>
                  <button
                    className="rounded border px-3 py-2"
                    onClick={() =>
                      insertHTML(
                        "<div style='border:1px solid #e5e7eb;border-radius:14px;padding:14px;background:#f8fafc'><b>Audio Note</b><br/><span contenteditable='true'>Record or type audio note summary here.</span></div>",
                      )
                    }
                  >
                    Audio note block
                  </button>
                </div>
              )}
              {rail === "comments" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Comments / Versions</h3>
                  <div className="rounded border p-2">
                    <b className="text-sm">Version History</b>
                    <div className="mt-2 grid max-h-44 gap-1 overflow-auto">
                      {versions
                        .slice()
                        .reverse()
                        .map((v) => (
                          <div
                            key={v.id}
                            className="rounded border p-2 text-xs"
                          >
                            <div className="flex justify-between gap-2">
                              <span className="truncate">
                                {v.subject || "(no subject)"}
                              </span>
                              <span>{new Date(v.at).toLocaleTimeString()}</span>
                            </div>
                            <div className="mt-1 flex gap-1">
                              <button
                                type="button"
                                className="rounded border px-2 py-1"
                                onClick={() => restoreVersion(v)}
                              >
                                Restore
                              </button>
                              <button
                                type="button"
                                className="rounded border px-2 py-1"
                                onClick={() => setSelectedVersion(v)}
                              >
                                Diff
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  {selectedVersion && (
                    <div className="rounded border p-2 text-xs">
                      <b>Diff vs current</b>
                      <div>
                        <b>Added:</b>{" "}
                        {simpleDiff(selectedVersion.html, html).added.join(
                          " ",
                        ) || "—"}
                      </div>
                      <div>
                        <b>Removed:</b>{" "}
                        {simpleDiff(selectedVersion.html, html).removed.join(
                          " ",
                        ) || "—"}
                      </div>
                      <button
                        className="mt-2 rounded border px-2 py-1"
                        onClick={() => setSelectedVersion(null)}
                      >
                        Close diff
                      </button>
                    </div>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="rounded border p-2 text-sm">
                      <div className="text-xs opacity-60">
                        {c.author} · {new Date(c.at).toLocaleTimeString()}
                      </div>
                      {c.selection && (
                        <div className="rounded bg-yellow-50 p-1 text-xs dark:bg-yellow-900/30">
                          {c.selection}
                        </div>
                      )}
                      <div>{c.text}</div>
                    </div>
                  ))}
                  {!comments.length && (
                    <div className="text-xs opacity-60">No comments yet.</div>
                  )}
                </div>
              )}
              {rail === "tasks" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Tasks</h3>
                  {tasks.map((task) => (
                    <div key={task.id} className="rounded border p-2">
                      <label className="flex gap-2">
                        <input
                          type="checkbox"
                          checked={!!task.done}
                          onChange={(e) => {
                            const checked = e.currentTarget.checked;
                            setTasks((items) =>
                              items.map((item) =>
                                item.id === task.id
                                  ? { ...item, done: checked }
                                  : item,
                              ),
                            );
                          }}
                        />
                        <span
                          className={clsx(
                            task.done && "line-through opacity-60",
                          )}
                        >
                          {task.title}
                        </span>
                      </label>
                      <div className="mt-2 flex gap-1">
                        {presence.map((p) => (
                          <button
                            type="button"
                            key={p.id}
                            className="h-6 w-6 rounded-full text-[10px] text-white"
                            style={{ background: p.color }}
                            onClick={() =>
                              setTasks((items) =>
                                items.map((item) =>
                                  item.id === task.id
                                    ? { ...item, assignee: p.name }
                                    : item,
                                ),
                              )
                            }
                          >
                            {p.name.slice(0, 2)}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs opacity-70">
                        Assignee: {task.assignee}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() =>
                      setTasks((items) => [
                        ...items,
                        {
                          id: uid("t"),
                          title: "Review draft",
                          assignee: "You",
                        },
                      ])
                    }
                  >
                    ＋ Add task
                  </button>
                </div>
              )}
              {rail === "files" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Files / Preview</h3>
                  {internalAttachments.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded border p-2"
                    >
                      <div className="grid h-16 w-16 place-items-center overflow-hidden rounded border text-xs">
                        {file.type?.startsWith("image") ? (
                          <img
                            src={file.url}
                            className="h-16 w-16 object-cover"
                          />
                        ) : (
                          "DOC/PDF"
                        )}
                      </div>
                      <div className="min-w-0 flex-1 truncate text-xs">
                        <div className="truncate">{file.name}</div>
                        <div className="opacity-60">{file.type || "file"}</div>
                      </div>
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => {
                          const newAttachments = internalAttachments.filter(
                            (item) => item.id !== file.id,
                          );
                          setInternalAttachments(newAttachments);
                          if (onAttachmentsChange) {
                            onAttachmentsChange(newAttachments);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {!internalAttachments.length && (
                    <div className="text-xs opacity-60">
                      Drop files or use 📎.
                    </div>
                  )}
                </div>
              )}
              {rail === "security" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Security / DLP</h3>
                  <div
                    className={clsx(
                      "rounded border p-2",
                      dlpIssues.length
                        ? "bg-red-50 text-red-700 dark:bg-red-950/30"
                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30",
                    )}
                  >
                    {dlpIssues.length
                      ? dlpIssues.join(", ")
                      : "No sensitive pattern detected"}
                  </div>
                  <div className="rounded border p-2 text-sm">
                    Spam score: <b>{spamScore}/100</b>
                  </div>
                  <label className="flex items-center gap-2 rounded border p-2">
                    <input
                      type="checkbox"
                      checked={secureMode}
                      onChange={(e) => setSecureMode(e.currentTarget.checked)}
                    />{" "}
                    Secure send mode
                  </label>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => insertSnippet("security")}
                  >
                    Insert disclaimer
                  </button>
                </div>
              )}
              {rail === "templates" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">
                    Templates / Signatures / Snippets
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="rounded border px-3 py-2"
                      onClick={() => insertSnippet("meeting")}
                    >
                      Meeting Block
                    </button>
                    <button
                      type="button"
                      className="rounded border px-3 py-2"
                      onClick={() => insertSnippet("payment")}
                    >
                      Payment Block
                    </button>
                    <button
                      type="button"
                      className="rounded border px-3 py-2"
                      onClick={() => insertSnippet("approval")}
                    >
                      Approval Block
                    </button>
                    <button
                      type="button"
                      className="rounded border px-3 py-2"
                      onClick={() => insertSnippet("security")}
                    >
                      Disclaimer
                    </button>
                  </div>
                  {Object.entries(templates).map(([key, value]) => (
                    <button
                      type="button"
                      key={key}
                      className="rounded border px-3 py-2 text-left"
                      onClick={() => insertHTML(value)}
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => insertHTML(signatures[0] || SIGNATURE)}
                  >
                    Insert signature
                  </button>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => {
                      const next = prompt("New signature HTML", SIGNATURE);
                      if (next) setSignatures((items) => [...items, next]);
                    }}
                  >
                    Add signature
                  </button>
                </div>
              )}
              {rail === "settings" && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Settings / Mobile / UX</h3>
                  <label>
                    Theme{" "}
                    <select
                      value={theme}
                      onChange={(e) =>
                        setTheme(e.currentTarget.value as ThemeMode)
                      }
                      className="ml-2 rounded border bg-white px-2 py-2 dark:bg-gray-800"
                    >
                      <option>light</option>
                      <option>dark</option>
                      <option>glass</option>
                      <option>gold</option>
                      <option>neon</option>
                    </select>
                  </label>
                  <label>
                    Theme pack{" "}
                    <select
                      value={themePack}
                      onChange={(e) =>
                        setThemePack(e.currentTarget.value as any)
                      }
                      className="ml-2 rounded border bg-white px-2 py-2 dark:bg-gray-800"
                    >
                      <option>Glass</option>
                      <option>Neumorphism</option>
                      <option>Luxury Gold</option>
                      <option>Govt Blue</option>
                      <option>Neon</option>
                    </select>
                  </label>
                  <label>
                    Workspace{" "}
                    <select
                      value={workspacePreset}
                      onChange={(e) =>
                        setWorkspacePreset(e.currentTarget.value as any)
                      }
                      className="ml-2 rounded border bg-white px-2 py-2 dark:bg-gray-800"
                    >
                      <option>Legal</option>
                      <option>Sales</option>
                      <option>Minimal</option>
                      <option>Compliance</option>
                      <option>Creative</option>
                    </select>
                  </label>
                  <label>
                    Dock side{" "}
                    <select
                      value={dockSide}
                      onChange={(e) =>
                        setDockSide(e.currentTarget.value as any)
                      }
                      className="ml-2 rounded border bg-white px-2 py-2 dark:bg-gray-800"
                    >
                      <option>right</option>
                      <option>left</option>
                      <option>bottom</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    Brand{" "}
                    <input
                      type="color"
                      value={brand}
                      onChange={(e) => setBrand(e.currentTarget.value)}
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={mobileToolbar}
                      onChange={(e) =>
                        setMobileToolbar(e.currentTarget.checked)
                      }
                    />
                    Mobile toolbar
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={offlineSync}
                      onChange={(e) => setOfflineSync(e.currentTarget.checked)}
                    />
                    PWA offline sync mock
                  </label>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => setFullscreen((v) => !v)}
                  >
                    Toggle fullscreen
                  </button>
                  <button
                    type="button"
                    className="rounded border px-3 py-2"
                    onClick={() => setUnitTestPanel((v) => !v)}
                  >
                    Run unit tests mock
                  </button>
                  {unitTestPanel && (
                    <div className="rounded border bg-emerald-50 p-2 text-sm text-emerald-700 dark:bg-emerald-950/30">
                      <b>Unit tests mock:</b>
                      <br />✓ Comment function
                      <br />✓ Calendar modal
                      <br />✓ Paste image handler
                      <br />✓ Export handlers
                      <br />✓ Rail rendering
                      <br />✓ AI Rewrite functions
                      <br />✓ Grammar check
                      <br />✓ Version history
                    </div>
                  )}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* Modals */}
      <CommandPalette />
      <SlashMenu />

      {calendarOpen && (
        <div
          className="fixed inset-0 z-[140] bg-black/40 p-4"
          onClick={() => setCalendarOpen(false)}
        >
          <div
            className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border bg-white p-4 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-lg font-bold">Calendar & Task Reminders</div>
              <button
                type="button"
                className="rounded border px-3 py-1"
                onClick={() => setCalendarOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="mb-2 flex flex-wrap gap-2">
              <input
                value={remTitle}
                onChange={(e) => setRemTitle(e.currentTarget.value)}
                className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
                placeholder="Reminder title"
              />
              <input
                type="datetime-local"
                value={remAt}
                onChange={(e) => setRemAt(e.currentTarget.value)}
                className="rounded border bg-white px-2 py-1 dark:bg-gray-800"
              />
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => {
                  if (!remAt) return alert("Pick date/time");
                  setReminders((r) => [
                    ...r,
                    { id: uid("r"), title: remTitle, at: remAt },
                  ]);
                  showToast("Reminder added ✓");
                }}
              >
                Add
              </button>
              <button
                type="button"
                className="rounded border px-2 py-1"
                onClick={() => {
                  if (!remAt) return alert("Pick date/time");
                  download(
                    `reminder-${Date.now()}.ics`,
                    "text/calendar",
                    mkICS(remTitle, subject, remAt),
                  );
                }}
              >
                .ics
              </button>
            </div>
            <MiniCalendar />
            <div className="mt-2 max-h-32 overflow-auto rounded border">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex gap-2 border-b px-2 py-1 text-xs"
                >
                  <span
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      r.fired ? "bg-red-500" : "bg-emerald-500",
                    )}
                  />
                  {r.title}
                  <span className="ml-auto opacity-70">
                    {new Date(r.at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewOpen && (
        <div
          className="fixed inset-0 z-[125] bg-black/50 p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="mx-auto flex h-full max-w-6xl flex-col rounded-2xl border bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b p-3">
              <div className="font-semibold">Email Preview</div>
              <div className="ml-auto flex gap-2 text-xs">
                {(["desktop", "tablet", "mobile"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={clsx(
                      "rounded border px-2 py-1 capitalize",
                      previewDevice === d && "bg-gray-100 dark:bg-gray-800",
                    )}
                    onClick={() => setPreviewDevice(d)}
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  className="rounded border px-2 py-1"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4 dark:bg-gray-950">
              <div
                className={clsx(
                  "mx-auto rounded-xl border bg-white p-5 shadow dark:bg-gray-900",
                  previewDevice === "desktop" && "max-w-4xl",
                  previewDevice === "tablet" && "max-w-2xl",
                  previewDevice === "mobile" && "max-w-sm",
                )}
              >
                <div className="mb-3 border-b pb-3 text-sm">
                  <div>
                    <b>To:</b> {to || "recipient@example.com"}
                  </div>
                  {cc && (
                    <div>
                      <b>CC:</b> {cc}
                    </div>
                  )}
                  <div>
                    <b>Subject:</b> {subject || "(No subject)"}
                  </div>
                </div>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {compareOpen && (
        <div
          className="fixed inset-0 z-[126] bg-black/50 p-4"
          onClick={() => setCompareOpen(false)}
        >
          <div
            className="mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] rounded-2xl border bg-white shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b p-3">
              <b>Split-screen Comparison</b>
              <button
                className="ml-auto rounded border px-3 py-1"
                onClick={() => setCompareOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="grid min-h-0 gap-3 overflow-auto p-3 md:grid-cols-2">
              <div className="rounded border p-3">
                <b>Current Draft</b>
                <div
                  className="prose prose-sm mt-2 max-w-none"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
              <div className="rounded border p-3">
                <b>Latest Saved Version</b>
                <div
                  className="prose prose-sm mt-2 max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      versions[versions.length - 1]?.html ||
                      "<p>No saved version yet.</p>",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 left-1/2 z-[150] -translate-x-1/2 rounded-full bg-black px-4 py-2 text-white shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
