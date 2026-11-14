// src/pages/SharedWithMe.jsx
import { useState, useEffect } from "react";
import { Users, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DocumentsList from "../components/DocumentsList";

export default function SharedWithMe() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await API.get("/documents");
        const sharedDocs = res.data.filter((doc) => {
          const ownerId = typeof doc.owner === "object" ? doc.owner._id : doc.owner;
          return ownerId !== currentUser.id;
        });
        setDocs(sharedDocs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, []);

  const handleUpdate = (id, updatedDoc) => {
    if (updatedDoc) {
      setDocs(docs.map((d) => (d._id === id ? updatedDoc : d)));
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 shadow-sm">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#202020]">Shared with me</h1>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Documents from workspaces you're a member of · {docs.length} {docs.length === 1 ? "document" : "documents"}
            </p>
          </div>
        </div>
      </div>

      <DocumentsList
        documents={docs}
        onUpdate={handleUpdate}
        emptyIcon={Users}
        emptyTitle="Nothing shared with you yet"
        emptyDescription="When someone invites you to their workspace, their documents will appear here."
        emptyAction={{
          label: "Go to Workspaces",
          onClick: () => navigate("/workspaces"),
        }}
      />
    </div>
  );
}