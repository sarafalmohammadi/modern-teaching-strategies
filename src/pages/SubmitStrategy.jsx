// src/pages/SubmitStrategy.jsx
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase/config";
import { useAuth } from "../firebase/AuthContext";
import { CheckCircle, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { uploadToCloudinary } from "../lib/cloudinaryUpload";

export default function SubmitStrategy() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const editId = params.get("id");

  const [loaded, setLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    definition: "",
    objectives: "",
    steps: "",
    teacherRole: "",
    studentRole: "",
    advantages: "",
    disadvantages: "",
    situations: "",
    videoURL: "",
  });

  const [references, setReferences] = useState([
    { author: "", year: "", title: "", source: "", pages: "" },
  ]);
  const [openRef, setOpenRef] = useState(0);

  const [quiz, setQuiz] = useState([
    { question: "", options: ["", "", "", ""], correct: 1 },
  ]);

  const [file, setFile] = useState(null); 
  const [existingFile, setExistingFile] = useState(null); 

  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // تعبئة الحقول عند التعديل
  useEffect(() => {
    async function load() {
      if (!editId) {
        setLoaded(true);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid, "strategies", editId));
        if (snap.exists()) {
          const data = snap.data();

          setForm({
            name: data.name || "",
            definition: data.definition || "",
            objectives: data.objectives || "",
            steps: data.steps || "",
            teacherRole: data.teacherRole || "",
            studentRole: data.studentRole || "",
            advantages: data.advantages || "",
            disadvantages: data.disadvantages || "",
            situations: data.situations || "",
            videoURL: data.videoURL || "",
          });

          setReferences(
            data.references?.length
              ? data.references
              : [{ author: "", year: "", title: "", source: "", pages: "" }]
          );

          setQuiz(
            Array.isArray(data.quiz) && data.quiz.length > 0
              ? data.quiz.map(q => ({
                  question: q.question,
                  options: q.options,
                  correct: q.correct
                }))
              : [{ question: "", options: ["", "", "", ""], correct: 1 }]
          );

          if (data.worksheetURL) {
            setExistingFile(data.worksheetURL);
          }
        }
      } catch (e) {
        console.error("LOAD EDIT ERROR:", e);
      } finally {
        setLoaded(true);
      }
    }

    load();
  }, [editId]);

  const change = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRefChange = (i, field, value) => {
    const updated = [...references];
    updated[i][field] = value;
    setReferences(updated);
  };

  const addReference = () => {
    setReferences([
      ...references,
      { author: "", year: "", title: "", source: "", pages: "" },
    ]);
    setOpenRef(references.length);
  };

  const handleQuizChange = (i, field, value) => {
    const updated = [...quiz];
    updated[i][field] = value;
    setQuiz(updated);
  };

  const handleOptionChange = (qi, oi, value) => {
    const updated = [...quiz];
    updated[qi].options[oi] = value;
    setQuiz(updated);
  };

  const addQuestion = () => {
    setQuiz([...quiz, { question: "", options: ["", "", "", ""], correct: 1 }]);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    /** 🔥 التعديل الوحيد هنا 🔥 **/
   /** 🔥 التعديل يبدأ هنا 🔥 **/
let worksheetURL = existingFile ?? null;

try {
  // validation
  for (const [key, value] of Object.entries(form)) {
    if (key !== "videoURL" && !value.trim()) {
      setMsg("⚠️ يرجى تعبئة جميع الحقول قبل الإرسال");
      setLoading(false);
      return;
    }
  }

  for (const q of quiz) {
    if (!q.question.trim()) {
      setMsg("⚠️ يرجى كتابة كل الأسئلة");
      setLoading(false);
      return;
    }
    if (q.correct < 1 || q.correct > 4) {
      setMsg("⚠️ الإجابة الصحيحة يجب أن تكون بين 1–4");
      setLoading(false);
      return;
    }
  }

  // رفع ملف جديد فقط إذا رفع المستخدم ملف جديد
  if (file) {
    const max = 20 * 1024 * 1024;
    if (file.size > max) {
      setMsg("⚠️ حجم الملف يتجاوز 20MB");
      setLoading(false);
      return;
    }

    worksheetURL = await uploadToCloudinary(file, user.email);
  }

  /** --------------------------------------
   * 🔥 تعديل → المسار الجديد فقط ONLY
   * -------------------------------------- **/
  if (editId) {
    const uid = params.get("u") || user.uid; // fallback لو ما مرّرت src=u

    const ref = doc(db, "users", uid, "strategies", editId);

    await updateDoc(ref, {
      ...form,
      references,
      quiz,
      worksheetURL,
      updatedAt: serverTimestamp(),
    });

  } else {
    /** --------------------------------------
     * 🔥 إضافة جديدة → المسار الجديد ONLY
     * -------------------------------------- **/
    await addDoc(collection(db, "users", user.uid, "strategies"), {
      ...form,
      references,
      quiz,
      worksheetURL,
      status: "pending",
      submittedBy: user.displayName || user.email,
      userId: user.uid,
      timestamp: serverTimestamp(),
    });
  }

  setSuccess(true);

} catch (err) {
  setMsg(err.message || "حدث خطأ غير متوقع.");
} finally {
  setLoading(false);
}

  };

  if (!loaded) return <p className="text-center mt-20">جاري التحميل...</p>;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <CheckCircle className="text-qassimIndigo mb-4" size={80} />
        <h2 className="text-2xl font-bold text-qassimDark mb-2">
          {editId ? "تم تعديل الاستراتيجية بنجاح!" : "تم إرسال الاستراتيجية بنجاح!"}
        </h2>

        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2 bg-qassimIndigo text-white rounded-lg hover:bg-qassimLight transition"
        >
          {editId ? "تعديل آخر" : "إضافة استراتيجية جديدة"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-8 max-w-3xl mx-auto mt-8 border border-gray-100">
      <h2 className="text-xl font-bold text-qassimDark mb-6 text-center">
        {editId ? "تعديل استراتيجية" : "إضافة استراتيجية"}
      </h2>

      <form onSubmit={submit} className="space-y-6">

        <Field label="اسم الاستراتيجية" name="name" value={form.name} onChange={change} required />
        <Field label="تعريفها العلمي" name="definition" value={form.definition} onChange={change} multiline required />
        <Field label="أهدافها" name="objectives" value={form.objectives} onChange={change} multiline required />
        <Field label="خطوات تطبيقها الصفية" name="steps" value={form.steps} onChange={change} multiline rows={5} required />
        <Field label="دور المعلم" name="teacherRole" value={form.teacherRole} onChange={change} multiline required />
        <Field label="دور المتعلم" name="studentRole" value={form.studentRole} onChange={change} multiline required />
        <Field label="مميزاتها التربوية" name="advantages" value={form.advantages} onChange={change} multiline required />
        <Field
          label="عيوب الاستراتيجية"
          name="disadvantages"
          value={form.disadvantages}
          onChange={change}
          multiline
          required
        />
        <Field label="متى تُستخدم؟" name="situations" value={form.situations} onChange={change} multiline required />

        {/* References */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-qassimDark">المراجع (APA)</label>
            <button type="button" onClick={addReference} className="flex items-center gap-1 text-qassimIndigo hover:text-qassimLight text-sm">
              <Plus size={16} /> إضافة مرجع
            </button>
          </div>

          {references.map((ref, i) => (
            <div key={i} className="border rounded-lg mb-3 bg-white">
              <button type="button" onClick={() => setOpenRef(openRef === i ? null : i)} className="w-full flex justify-between items-center px-4 py-2 font-semibold text-qassimDark text-sm bg-gray-100 rounded-t-lg">
                <span>المرجع {i + 1}</span>
                {openRef === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {openRef === i && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                  <input type="text" placeholder="اسم المؤلف" value={ref.author} onChange={(e) => handleRefChange(i, "author", e.target.value)} required className="border rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="سنة النشر" value={ref.year} onChange={(e) => handleRefChange(i, "year", e.target.value)} required className="border rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="عنوان المرجع" value={ref.title} onChange={(e) => handleRefChange(i, "title", e.target.value)} required className="border rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="المجلة / الناشر / الرابط" value={ref.source} onChange={(e) => handleRefChange(i, "source", e.target.value)} required className="border rounded-lg p-2 text-sm" />
                  <input type="text" placeholder="رقم الصفحات (اختياري)" value={ref.pages} onChange={(e) => handleRefChange(i, "pages", e.target.value)} className="border rounded-lg p-2 text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quiz */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-qassimDark">اختبار قصير</label>
            <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-qassimIndigo hover:text-qassimLight text-sm">
              <Plus size={16} /> إضافة سؤال
            </button>
          </div>

          {quiz.map((q, i) => (
            <div key={i} className="border rounded-lg p-4 mb-3 bg-white">
              <input type="text" placeholder={`السؤال ${i + 1}`} value={q.question} onChange={(e) => handleQuizChange(i, "question", e.target.value)} required className="w-full mb-3 border rounded-lg p-2 text-sm" />

              {q.options.map((opt, oi) => (
                <input key={oi} type="text" placeholder={`الخيار ${oi + 1}`} value={opt} onChange={(e) => handleOptionChange(i, oi, e.target.value)} className="w-full mb-2 border rounded-lg p-2 text-sm" />
              ))}

              <label className="text-xs text-gray-600">رقم الإجابة الصحيحة (1–4)</label>
              <input type="number" min="1" max="4" value={q.correct} onChange={(e) => handleQuizChange(i, "correct", Number(e.target.value))} className="border rounded-lg p-2 w-20 text-sm mt-1" />
            </div>
          ))}
        </div>

        <Field label="رابط الفيديو (YouTube)" name="videoURL" value={form.videoURL} onChange={change} />

        {/* FILE */}
        <div>
          <label className="block text-sm font-semibold text-qassimDark mb-1">ورقة العمل (PDF/Word)</label>

          {existingFile && !file && (
            <p className="text-sm text-green-700 mb-2">📄 يوجد ملف مرفوع مسبقًا وسيبقى كما هو ما لم ترفع ملفًا جديدًا</p>
          )}

          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm border rounded-lg p-2" />
        </div>

        <button
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg shadow-sm transition 
            text-center flex justify-center items-center
            ${loading ? "bg-gray-400" : "bg-qassimIndigo text-white hover:bg-qassimLight"}
          `}
        >
          {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "إرسال للمراجعة"}
        </button>

        {msg && <p className="text-center text-red-600 mt-3">{msg}</p>}
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, multiline = false, rows = 3, required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-qassimDark mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {multiline ? (
        <textarea name={name} value={value} onChange={onChange} rows={rows} required={required} className="w-full border rounded-lg p-3 text-sm focus:ring-qassimLight" />
      ) : (
        <input name={name} value={value} onChange={onChange} required={required} className="w-full border rounded-lg p-3 text-sm focus:ring-qassimLight" />
      )}
    </div>
  );
}
