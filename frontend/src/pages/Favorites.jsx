// src/pages/Favorites.jsx
import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DocumentsList from "../components/DocumentsList";

export default function Favorites() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await API.get("/documents");
        setDocs(res.data.filter((doc) => doc.isFavorite));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleUpdate = (id, updatedDoc) => {
    if (updatedDoc) {
      if (!updatedDoc.isFavorite) {
        setDocs(docs.filter((d) => d._id !== id));
      } else {
        setDocs(docs.map((d) => (d._id === id ? updatedDoc : d)));
      }
    } else {
      setDocs(docs.filter((d) => d._id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* PAGE HEADER */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-500 shadow-sm">
            <Star size={24} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">Favorites</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Your starred documents for quick access · {docs.length} {docs.length === 1 ? "document" : "documents"}
            </p>
          </div>
        </div>
      </div>

      <DocumentsList
        documents={docs}
        onUpdate={handleUpdate}
        emptyIcon={Star}
        emptyTitle="No favorites yet"
        emptyDescription="Star a document to keep it here for quick access."
        emptyAction={{
          label: "Browse My Documents",
          onClick: () => navigate("/documents"),
        }}
      />
    </div>
  );
}