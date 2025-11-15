import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import Quiz from '../components/Quiz'
import { ArrowLeft } from 'lucide-react'

export default function StrategyDetails() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const ref = doc(db, 'strategies', id)
        const snap = await getDoc(ref)
        if (snap.exists()) setItem({ id: snap.id, ...snap.data() })
      } catch (err) {
        console.error('Error loading strategy details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStrategy()
  }, [id])

  const formatDate = (seconds) => {
    if (!seconds) return '—'
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatAPA = (ref) => {
    if (!ref) return null
    const author = ref.author || ref.refAuthor || ''
    const year = ref.year || ref.refYear || ''
    const title = ref.title || ref.refTitle || ''
    const source = ref.source || ref.refSource || ''
    const pages = ref.pages || ref.refPages || ''
    return (
      <>
        {author && <span>{author}. </span>}
        {year && <span>({year}). </span>}
        {title && <i>{title}. </i>}
        {source && <span>{source}. </span>}
        {pages && <span>ص. {pages}</span>}
      </>
    )
  }

  const extractReferences = (it) => {
    if (Array.isArray(it.references)) return it.references
    if (typeof it.references === 'string' && it.references.trim()) return [it.references.trim()]
    return []
  }

  const toEmbedURL = (url) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v'))
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
      if (u.hostname.includes('youtu.be'))
        return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`
      return url
    } catch {
      return url
    }
  }

  if (loading) return <p className="text-center text-gray-600 mt-8">جارٍ تحميل التفاصيل...</p>
  if (!item) return <p className="text-center text-gray-600 mt-8">لم يتم العثور على هذه الاستراتيجية.</p>

  return (
    <section className="p-6 max-w-4xl mx-auto">
      {/* زر الرجوع */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-qassimIndigo hover:text-qassimLight mb-6 text-sm font-semibold"
      >
        <ArrowLeft size={16} /> الرجوع إلى القائمة
      </button>

      {/* العنوان */}
      <h2 className="text-3xl font-bold text-qassimDark mb-3 text-center">{item.name}</h2>
      <p className="text-center text-gray-600 mb-4">{item.definition}</p>

      {/* معلومات فرعية */}
      <div className="text-xs text-gray-500 text-center mb-6">
        <p>مقدمة من: {item.submittedBy || '—'}</p>
        <p>تاريخ النشر: {formatDate(item.timestamp?.seconds)}</p>
      </div>

      {/* تفاصيل الأقسام */}
      <div className="space-y-5">
        {[
          { label: 'أهدافها', value: item.objectives },
          { label: 'خطوات تطبيقها الصفية', value: item.steps },
          { label: 'دور المعلم', value: item.teacherRole },
          { label: 'دور المتعلم', value: item.studentRole },
          { label: 'مميزاتها التربوية', value: item.advantages },
          { label: 'المواقف التعليمية المناسبة', value: item.situations },
        ].map(
          (sec, i) =>
            sec.value && (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-lg font-semibold text-qassimIndigo mb-2">{sec.label}</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{sec.value}</p>
              </div>
            )
        )}

        {/* المراجع */}
        {extractReferences(item).length > 0 && (
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-qassimIndigo mb-2">المراجع (APA)</h3>
            <ul className="list-disc pr-6 space-y-1 text-sm text-gray-700">
              {extractReferences(item).map((r, i) => (
                <li key={i}>{formatAPA(r)}</li>
              ))}
            </ul>
          </div>
        )}

         {/* الفيديو */}
{item.videoURL &&
  typeof item.videoURL === "string" &&
  item.videoURL.trim() !== "" &&
  item.videoURL.includes("http") && (
    <div className="rounded-xl overflow-hidden shadow-md mt-6">
      <strong className="block mb-2 text-qassimDark">الفيديو التوضيحي:</strong>
      <div className="aspect-video w-full rounded-lg overflow-hidden border">
        <iframe
          src={toEmbedURL(item.videoURL)}
          title="strategy-video"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
)}


       {/* المرفق */}
{item.worksheetURL && (
  <div className="text-center">
    <a
      href={item.worksheetURL}   
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 bg-qassimIndigo text-white px-5 py-2 rounded-lg text-sm hover:bg-qassimLight transition"
    >
      📄 عرض ورقة العمل المرفقة
    </a>
  </div>
)}



 {/* الكويز */}
{Array.isArray(item.quiz) && item.quiz.length > 0 && (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-qassimIndigo mb-4">
      اختبار تقويمي قصير
    </h3>

    <Quiz
  questions={item.quiz.map((q) => ({
    question: q.question,
    options: q.options,
    correctIndex: (q.answer ?? 1) - 1, // 🔥 التحويل الصحيح (من 1–4 إلى 0–3)
  }))}
/>

  </div>

        )}
      </div>
    </section>
  )
}
