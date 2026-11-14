// src/pages/Templates.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, FileSpreadsheet, Presentation, StickyNote, Loader2 } from "lucide-react";
import API from "../api/axios";

export default function Templates() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const templates = [
    {
      id: "blank",
      title: "Blank Document",
      desc: "Start with a clean slate.",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
      type: "document",
    },
    {
      id: "meeting-notes",
      title: "Meeting Notes",
      desc: "Agenda, attendees, action items.",
      icon: StickyNote,
      color: "text-amber-600",
      bg: "bg-amber-50",
      type: "document",
    },
    {
      id: "college-report",
      title: "College Project Report",
      desc: "Cover page, headings, references.",
      icon: FileSpreadsheet,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      type: "report",
      popular: true,
    },
    {
      id: "pitch-deck",
      title: "Startup Pitch Deck",
      desc: "Problem, solution, team, market.",
      icon: Presentation,
      color: "text-pink-600",
      bg: "bg-pink-50",
      type: "presentation",
    },
  ];

  const handleCreate = async (template) => {
  setLoading(template.id);
  try {
    let newDoc;

    if (template.id === "blank") {
      const res = await API.post("/documents", {
        title: "Untitled Document",
        type: "document",
      });
      newDoc = res.data;
    } else {
      const res = await API.post("/documents/template", {
        templateId: template.id,
        title: template.title,
      });
      newDoc = res.data;
    }

    // Route to presentation editor for decks
    navigate(
      newDoc.type === "presentation" 
        ? `/presentation/${newDoc._id}` 
        : `/doc/${newDoc._id}`
    );
  } catch (error) {
    console.error(error);
    alert("Failed to create from template");
  } finally {
    setLoading(null);
  }
};

  return (
    <div className="mx-auto max-w-5xl p-8">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">
          Start with a template
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">
          Skip the blank page. Finish something amazing.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {templates.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => !loading && handleCreate(t)}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10"
          >
            {t.popular && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
                Popular
              </span>
            )}

            {/* Thumbnail Preview */}
            <div className="flex h-40 items-center justify-center border-b border-gray-100 bg-[#faf9f6]">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ${t.color} transition group-hover:scale-110`}>
                <t.icon size={28} />
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition">
                {t.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{t.desc}</p>
            </div>

            {/* Loading overlay */}
            {loading === t.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <Loader2 className="animate-spin text-violet-600" size={24} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}