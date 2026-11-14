// src/pages/PresentationEditor.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Trash2, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

const BG_COLORS = ["#ffffff", "#f3f4f6", "#fef3c7", "#dcfce7", "#dbeafe", "#fce7f3", "#1e1e1e"];
const TEXT_COLORS = ["#111827", "#ffffff"];

export default function PresentationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch document
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await API.get(`/documents/${id}`);
        setTitle(res.data.title);
        const slideData = res.data.slides?.length > 0 
          ? res.data.slides 
          : [{ id: "1", content: "Welcome to your presentation!", bg: "#ffffff" }];
        setSlides(slideData);
      } catch (error) {
        alert("Failed to load presentation");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  // Save to backend (debounced)
  useEffect(() => {
    if (loading || slides.length === 0) return;
    
    setSaving(true);
    const timeout = setTimeout(async () => {
      try {
        await API.patch(`/documents/${id}`, { slides });
        setSaving(false);
      } catch (err) {
        console.error(err);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [slides, id, loading]);

  const addSlide = () => {
    const newSlide = { id: Date.now().toString(), content: "New slide", bg: "#ffffff" };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
  };

  const deleteSlide = (index) => {
    if (slides.length === 1) return alert("At least one slide is required");
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    setActiveSlide(Math.max(0, index - 1));
  };

  const updateSlideContent = (index, newContent) => {
    const newSlides = [...slides];
    newSlides[index].content = newContent;
    setSlides(newSlides);
  };

  const updateSlideBg = (index, color) => {
    const newSlides = [...slides];
    newSlides[index].bg = color;
    setSlides(newSlides);
  };

  const updateTitle = async (newTitle) => {
    setTitle(newTitle);
    await API.patch(`/documents/${id}`, { title: newTitle });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#faf9f6]">
        <Loader2 className="animate-spin text-violet-600" size={40} />
      </div>
    );
  }

  const currentSlide = slides[activeSlide];
  const isDarkSlide = currentSlide?.bg === "#1e1e1e";

  return (
    <div className="flex h-screen flex-col bg-[#faf9f6]">
      {/* Topbar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <button onClick={() => navigate("/documents")} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100">
          <ArrowLeft size={16} /> Back
        </button>
        <input 
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          className="mx-auto w-1/2 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-center text-sm font-semibold outline-none hover:border-gray-200 focus:border-violet-500"
        />
        <span className={`text-xs font-semibold ${saving ? "text-amber-500" : "text-emerald-600"}`}>
          {saving ? "Saving..." : "✓ Saved"}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Slide Thumbnails */}
        <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white p-4 overflow-y-auto">
          <button onClick={addSlide} className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 py-2 text-xs font-semibold text-gray-500 hover:border-violet-400 hover:text-violet-600">
            <Plus size={14} /> Add Slide
          </button>
          <div className="space-y-3">
            <AnimatePresence>
              {slides.map((slide, i) => (
                <motion.div
                  key={slide.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setActiveSlide(i)}
                  className={`group relative cursor-pointer rounded-lg border-2 transition ${
                    activeSlide === i ? "border-violet-600 ring-2 ring-violet-100" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md p-2" style={{ background: slide.bg }}>
                    <p className={`line-clamp-3 text-center text-[8px] font-bold ${slide.bg === "#1e1e1e" ? "text-white" : "text-gray-800"}`}>
                      {slide.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between px-1 py-0.5">
                    <span className="text-[10px] font-bold text-gray-500">Slide {i + 1}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} className="rounded p-0.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex flex-1 flex-col items-center justify-center bg-[#e5e7eb] p-8">
          <div 
            className="w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl transition-all"
            style={{ 
              aspectRatio: "16 / 9", 
              background: currentSlide.bg,
            }}
          >
            <textarea
              value={currentSlide.content}
              onChange={(e) => updateSlideContent(activeSlide, e.target.value)}
              className={`h-full w-full resize-none border-none bg-transparent p-12 text-center text-4xl font-bold leading-tight outline-none md:p-20 md:text-5xl ${
                isDarkSlide ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-300"
              }`}
              placeholder="Type your slide content here..."
            />
          </div>
        </main>

        {/* Right Sidebar: Properties */}
        <aside className="w-64 shrink-0 border-l border-gray-200 bg-white p-5">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Palette size={14} /> Background
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => updateSlideBg(activeSlide, color)}
                className={`h-8 w-8 rounded-lg border-2 transition ${
                  currentSlide.bg === color ? "border-violet-600 ring-2 ring-violet-100 scale-110" : "border-gray-200 hover:scale-105"
                }`}
                style={{ background: color }}
              />
            ))}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Layout Tip</h3>
            <p className="text-xs leading-relaxed text-gray-500">
              Keep it simple. One idea per slide. Use the text field to write your headline and content.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}