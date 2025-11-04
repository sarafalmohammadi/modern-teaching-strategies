import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase/config'
import { useAuth } from '../firebase/AuthContext'
import { CheckCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function SubmitStrategy() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    definition: '',
    objectives: '',
    steps: '',
    teacherRole: '',
    studentRole: '',
    advantages: '',
    situations: '',
    videoURL: ''
  })

  // ✅ المراجع كمصفوفة
  const [references, setReferences] = useState([
    { author: '', year: '', title: '', source: '', pages: '' }
  ])
  const [openRef, setOpenRef] = useState(0)

  // ✅ الأسئلة (Quiz)
  const [quiz, setQuiz] = useState([
    { question: '', options: ['', '', '', ''], correct: 0 }
  ])

  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // ✅ تعديل مرجع معين
  const handleRefChange = (i, field, value) => {
    const updated = [...references]
    updated[i][field] = value
    setReferences(updated)
  }

  // ✅ إضافة مرجع جديد
  const addReference = () => {
    setReferences([...references, { author: '', year: '', title: '', source: '', pages: '' }])
    setOpenRef(references.length) // فتح المرجع الجديد تلقائيًا
  }

  // ✅ تعديل سؤال معين
  const handleQuizChange = (i, field, value) => {
    const updated = [...quiz]
    updated[i][field] = value
    setQuiz(updated)
  }

  // ✅ تعديل خيار داخل سؤال
  const handleOptionChange = (qi, oi, value) => {
    const updated = [...quiz]
    updated[qi].options[oi] = value
    setQuiz(updated)
  }

  // ✅ إضافة سؤال جديد
  const addQuestion = () => {
    setQuiz([...quiz, { question: '', options: ['', '', '', ''], correct: 0 }])
  }

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    let worksheetURL = ''
    try {
      // ✅ التحقق من الحقول الإلزامية (باستثناء الفيديو)
      for (const [key, value] of Object.entries(form)) {
        if (key !== 'videoURL' && !value.trim()) {
          setMsg('⚠️ يرجى تعبئة جميع الحقول قبل الإرسال')
          setLoading(false)
          return
        }
      }

      if (file) {
        const r = ref(storage, `worksheets/${Date.now()}-${file.name}`)
        const limit = 20 * 1024 * 1024
        if (file.size > limit) {
          setMsg('⚠️ حجم الملف يتجاوز الحد المسموح (20 ميغابايت)')
          setLoading(false)
          return
        }
        await uploadBytes(r, file)
        worksheetURL = await getDownloadURL(r)
      }

      await addDoc(collection(db, 'strategies'), {
        ...form,
        references,
        quiz,
        worksheetURL,
        status: 'pending',
        submittedBy: user.displayName || user.email,
        timestamp: serverTimestamp()
      })

      setSuccess(true)
      setMsg('')
      setForm({
        name: '',
        definition: '',
        objectives: '',
        steps: '',
        teacherRole: '',
        studentRole: '',
        advantages: '',
        situations: '',
        videoURL: ''
      })
      setReferences([{ author: '', year: '', title: '', source: '', pages: '' }])
      setQuiz([{ question: '', options: ['', '', '', ''], correct: 0 }])
      setFile(null)
    } catch (e) {
      setMsg(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <CheckCircle className="text-qassimIndigo mb-4" size={80} />
        <h2 className="text-2xl font-bold text-qassimDark mb-2">
          تم إرسال الاستراتيجية بنجاح!
        </h2>
        <p className="text-gray-600">
          شكراً لمساهمتك في تطوير الاستراتيجيات الحديثة.  
          سيتم مراجعة النموذج قريبًا من قبل الفريق المختص.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-6 px-6 py-2 bg-qassimIndigo text-white rounded-lg hover:bg-qassimLight transition"
        >
          إضافة استراتيجية جديدة
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-md rounded-2xl p-8 max-w-3xl mx-auto mt-8 border border-gray-100">
      <h2 className="text-xl font-bold text-qassimDark mb-6 text-center">إضافة استراتيجية</h2>

      <form onSubmit={submit} className="space-y-6">
        <Field label="اسم الاستراتيجية" name="name" value={form.name} onChange={change} required />
        <Field label="تعريفها العلمي" name="definition" value={form.definition} onChange={change} multiline required />
        <Field label="أهدافها" name="objectives" value={form.objectives} onChange={change} multiline required />
        <Field label="خطوات تطبيقها الصفية" name="steps" value={form.steps} onChange={change} multiline rows={5} required />
        <Field label="دور المعلم" name="teacherRole" value={form.teacherRole} onChange={change} multiline required />
        <Field label="دور المتعلم" name="studentRole" value={form.studentRole} onChange={change} multiline required />
        <Field label="مميزاتها التربوية" name="advantages" value={form.advantages} onChange={change} multiline required />
        <Field label="متى تُستخدم؟ (المواقف التعليمية المناسبة)" name="situations" value={form.situations} onChange={change} multiline required />

        {/* ✅ المراجع */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-qassimDark">
              المراجع (بصيغة APA)
            </label>
            <button type="button" onClick={addReference} className="flex items-center gap-1 text-qassimIndigo hover:text-qassimLight text-sm">
              <Plus size={16} /> إضافة مرجع
            </button>
          </div>
          {references.map((ref, i) => (
            <div key={i} className="border rounded-lg mb-3 bg-white">
              <button
                type="button"
                onClick={() => setOpenRef(openRef === i ? null : i)}
                className="w-full flex justify-between items-center px-4 py-2 font-semibold text-qassimDark text-sm bg-gray-100 rounded-t-lg"
              >
                <span>المرجع {i + 1}</span>
                {openRef === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openRef === i && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                  <input type="text" placeholder="اسم المؤلف" value={ref.author} onChange={(e) => handleRefChange(i, 'author', e.target.value)} required className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
                  <input type="text" placeholder="سنة النشر" value={ref.year} onChange={(e) => handleRefChange(i, 'year', e.target.value)} required className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
                  <input type="text" placeholder="عنوان المرجع" value={ref.title} onChange={(e) => handleRefChange(i, 'title', e.target.value)} required className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
                  <input type="text" placeholder="اسم المجلة أو الناشر أو الرابط" value={ref.source} onChange={(e) => handleRefChange(i, 'source', e.target.value)} required className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
                  <input type="text" placeholder="رقم الصفحات (اختياري)" value={ref.pages} onChange={(e) => handleRefChange(i, 'pages', e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ✅ الاختبار القصير */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold text-qassimDark">اختبار قصير</label>
            <button type="button" onClick={addQuestion} className="flex items-center gap-1 text-qassimIndigo hover:text-qassimLight text-sm">
              <Plus size={16} /> إضافة سؤال
            </button>
          </div>

          {quiz.map((q, i) => (
            <div key={i} className="border rounded-lg p-4 mb-3 bg-white">
              <input
                type="text"
                placeholder={`السؤال ${i + 1}`}
                value={q.question}
                onChange={(e) => handleQuizChange(i, 'question', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3 focus:ring-2 focus:ring-qassimLight outline-none"
              />
              {q.options.map((opt, oi) => (
                <input
                  key={oi}
                  type="text"
                  placeholder={`الخيار ${oi + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, oi, e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2 focus:ring-2 focus:ring-qassimLight outline-none"
                />
              ))}
              <label className="text-xs text-gray-600">رقم الخيار الصحيح (0-3)</label>
              <input
                type="number"
                min="0"
                max="3"
                value={q.correct}
                onChange={(e) => handleQuizChange(i, 'correct', parseInt(e.target.value))}
                className="w-20 border border-gray-300 rounded-lg p-1 text-sm ml-2"
              />
            </div>
          ))}
        </div>

        {/* الفيديو ورفع الملفات */}
        <Field label="رابط الفيديو التوضيحي (YouTube)" name="videoURL" value={form.videoURL} onChange={change} />
        <div>
          <label className="block text-sm font-semibold text-qassimDark mb-1">ورقة العمل (PDF/Word) — حد 20MB</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm border border-gray-300 rounded-lg p-2" />
        </div>

        <button disabled={loading} className={`w-full flex justify-center items-center py-3 font-semibold rounded-lg shadow-sm transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-qassimIndigo text-white hover:bg-qassimLight'}`}>
          {loading ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
        </button>
      </form>

      {msg && <p className="mt-4 text-center text-red-600">{msg}</p>}
    </div>
  )
}

function Field({ label, name, value, onChange, multiline = false, rows = 3, required = false }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-qassimDark mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} required={required} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
      ) : (
        <input id={name} name={name} value={value} onChange={onChange} required={required} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-qassimLight outline-none" />
      )}
    </div>
  )
}
