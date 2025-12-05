// src/pages/Preview.jsx
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Pencil, ExternalLink } from "lucide-react";
import Quiz from "../components/Quiz";

export default function Preview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const userId = params.get("u"); // 🔥 مهم جداً: نجيب UID من الرابط

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (!userId) {
          console.error("❌ Missing userId in URL (u=)");
          setLoading(false);
          return;
        }

        // 🔥 المسار الجديد فقط
        const ref = doc(db, "users", userId, "strategies", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setData({ id, ...snap.data() });
        }
      } catch (err) {
        console.error("Preview Error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, userId]);

  const toEmbedURL = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      if (u.hostname.includes("youtu.be"))
        return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
      return url;
    } catch {
      return url;
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">جاري التحميل...</p>;

  if (!data)
    return (
      <p className="text-center mt-10 text-red-600">
        ❌ لم يتم العثور على الاستراتيجية
      </p>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md mt-10 text-gray-900">
      <button
        onClick={() => navigate(-1)}
        className="text-sm mb-3 border px-3 py-1 rounded-md hover:bg-gray-50"
      >
        ← رجوع
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-qassimDark">{data.name}</h1>

        <button
          onClick={() => navigate(`/submit?id=${data.id}&u=${userId}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-400 hover:bg-gray-100"
        >
          <Pencil className="w-4 h-4" />
          تعديل
        </button>
      </div>

      <div className="space-y-6 leading-relaxed">
        {data.definition && <p><strong>التعريف:</strong> {data.definition}</p>}
        {data.objectives && <p><strong>الأهداف:</strong> {data.objectives}</p>}
        {data.steps && (
          <div>
            <strong>الخطوات:</strong>
            <div className="whitespace-pre-line mt-1">{data.steps}</div>
          </div>
        )}

        {data.teacherRole && (
          <p><strong>دور المعلم:</strong> {data.teacherRole}</p>
        )}

        {data.studentRole && (
          <p><strong>دور المتعلم:</strong> {data.studentRole}</p>
        )}

        {data.advantages && (
          <p><strong>مميزاتها:</strong> {data.advantages}</p>
        )}

        {data.disadvantages && (
          <p><strong>عيوبها:</strong> {data.disadvantages}</p>
        )}

        {data.situations && (
          <p><strong>متى تُستخدم:</strong> {data.situations}</p>
        )}

        {/* المراجع */}
        {Array.isArray(data.references) && data.references.length > 0 && (
          <div>
            <strong>المراجع (APA):</strong>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              {data.references.map((ref, i) => (
                <li key={i}>
                  {typeof ref === "string"
                    ? ref
                    : `${ref.author || ""} ${ref.year ? `(${ref.year}).` : ""} ${
                        ref.title || ""
                      }. ${ref.source || ""} ${ref.pages || ""}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* الفيديو */}
        {data.videoURL && data.videoURL.includes("http") && (
          <div className="rounded-xl overflow-hidden shadow-md mt-6">
            <strong className="block mb-2 text-qassimDark">الفيديو التوضيحي:</strong>
            <div className="aspect-video w-full rounded-lg overflow-hidden border">
              <iframe
                src={toEmbedURL(data.videoURL)}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* ورقة العمل */}
        {data.worksheetURL && (
          <div>
            <strong>ورقة العمل:</strong>
            <a
              href={data.worksheetURL}
              target="_blank"
              className="mt-1 flex items-center gap-1 text-qassimIndigo hover:underline"
            >
              فتح المرفق <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* الكويز */}
        {Array.isArray(data.quiz) && data.quiz.length > 0 && (
          <div>
            <strong className="block mb-2">الاختبار القصير:</strong>
            <Quiz
              questions={data.quiz.map((q) => ({
                question: q.question,
                options: q.options,
                correctIndex: Number(q.correct ?? 1) - 1,
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
