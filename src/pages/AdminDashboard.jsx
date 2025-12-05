// src/pages/AdminDashboard.jsx
import { useEffect, useState, useMemo } from 'react'
import {
  collection,
  collectionGroup,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore'
import { db, ADMIN_EMAILS } from '../firebase/config'
import { useAuth } from '../firebase/AuthContext'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Quiz from '../components/Quiz' // عدّلي المسار إذا كان مختلفًا

export default function AdminDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState('strategies')
  const [sortOption, setSortOption] = useState('newest')
  const [preview, setPreview] = useState(null)
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)
  const auth = getAuth()

  // ================================
  // تحميل الاستراتيجيات (من المسار الجديد فقط)
  // users/{uid}/strategies/{strategyId}
  // ================================
  useEffect(() => {
    const loadStrategies = async () => {
      try {
        console.log('📌 بدأ تحميل الاستراتيجيات (collectionGroup)...')

        const snap = await getDocs(collectionGroup(db, 'strategies'))
        const arr = []

        snap.forEach((d) => {
          const parent = d.ref.parent.parent // المفروض يكون users/{uid}

          // لو كانت من الكولكشن القديم "strategies" نتجاهلها
          if (!parent) return

          const data = d.data()
          arr.push({
            id: d.id,
            userId: parent.id, // هذا هو الـ uid لصاحب الاستراتيجية
            ...data,
          })
        })

        console.log('📌 عدد الاستراتيجيات التي تم تحميلها:', arr.length)
        setItems(arr)
      } catch (err) {
        console.error('❌ خطأ في تحميل الاستراتيجيات:', err)
      }
    }

    loadStrategies()
  }, [])

  // تحميل المستخدمين من Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        const arr = []
        snap.forEach((dc) => arr.push({ id: dc.id, ...dc.data() }))
        setUsers(arr)
      } catch (err) {
        console.error('Error loading users', err)
      }
    }
    if (isAdmin) fetchUsers()
  }, [user, isAdmin])

  const showMessage = (text, color = 'text-gray-700') => {
    setMsg({ text, color })
    setTimeout(() => setMsg(''), 3000)
  }

  // ===== اسم صاحب الاستراتيجية من users =====
  const getSubmittedName = (strategy) => {
    if (!strategy?.userId) {
      return strategy.submittedBy || '—'
    }

    const u =
      users.find((x) => x.id === strategy.userId || x.uid === strategy.userId) ||
      null

    // الأولوية لاسم المستخدم من كولكشن users
    return u?.name || strategy.submittedBy || u?.email || '—'
  }

  // ========================
  // اعتماد / رفض
  // ========================
  const act = async (userId, id, status) => {
    try {
      await updateDoc(doc(db, 'users', userId, 'strategies', id), { status })

      setItems((prev) =>
        prev.map((it) =>
          it.id === id && it.userId === userId ? { ...it, status } : it,
        ),
      )

      const label = status === 'approved' ? 'تم الاعتماد' : 'تم الرفض'
      showMessage(label, status === 'approved' ? 'text-green-700' : 'text-red-700')
    } catch (err) {
      console.error('❌ act error:', err)
      showMessage('حدث خطأ أثناء تعديل الحالة.', 'text-red-700')
    }
  }

  // ========================
  // إخفاء/إظهار من الموقع
  // ========================
  const hideStrategy = async (userId, id, hidden = true) => {
    try {
      await updateDoc(doc(db, 'users', userId, 'strategies', id), { hidden })

      setItems((prev) =>
        prev.map((it) =>
          it.id === id && it.userId === userId ? { ...it, hidden } : it,
        ),
      )

      showMessage(
        hidden ? 'تم إخفاء الاستراتيجية من الموقع' : 'تم إظهار الاستراتيجية',
        'text-blue-700',
      )
    } catch (err) {
      console.error('❌ hideStrategy error:', err)
      showMessage('حدث خطأ أثناء تحديث الإخفاء.', 'text-red-700')
    }
  }

  // ========================
  // حذف نهائي
  // ========================
  const deleteStrategy = async (userId, id) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'strategies', id))

      setItems((prev) =>
        prev.filter((it) => !(it.id === id && it.userId === userId)),
      )

      showMessage('تم حذف الاستراتيجية نهائيًا', 'text-gray-800')
    } catch (err) {
      console.error('❌ deleteStrategy error:', err)
      showMessage('تعذر حذف الاستراتيجية.', 'text-red-700')
    }
  }

  // فرز
  const sortedItems = useMemo(() => {
    const arr = [...items]
    return arr.sort((a, b) => {
      switch (sortOption) {
        case 'oldest':
          return (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0)
        case 'az':
          return (a.name || '').localeCompare(b.name || '')
        case 'za':
          return (b.name || '').localeCompare(a.name || '')
        default:
          return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
      }
    })
  }, [items, sortOption])

  // تنسيق التاريخ
  const formatDate = (seconds) => {
    if (!seconds) return '—'
    const date = new Date(seconds * 1000)
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // إدارة المستخدمين
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      showMessage(`تم إرسال رابط إعادة التعيين إلى ${email}`, 'text-blue-700')
    } catch {
      showMessage('تعذر إعادة التعيين، تحقق من البريد.', 'text-red-700')
    }
  }

  const removeUser = async (uid) => {
    try {
      await deleteDoc(doc(db, 'users', uid)) // حذف من Firestore
      setUsers((users) => users.filter((u) => u.id !== uid))
      showMessage('✅ تم حذف المستخدم نهائيًا من قاعدة البيانات', 'text-gray-700')
    } catch (err) {
      console.error('Delete user error:', err)
      showMessage('❌ تعذر حذف المستخدم.', 'text-red-700')
    }
  }

  const toggleUserStatus = async (uid, currentStatus) => {
    try {
      const newStatus = !currentStatus
      await updateDoc(doc(db, 'users', uid), { active: newStatus })
      setUsers((users) =>
        users.map((u) => (u.id === uid ? { ...u, active: newStatus } : u)),
      )
      showMessage(
        newStatus ? '✅ تم تفعيل المستخدم' : '🚫 تم تعطيل المستخدم',
        newStatus ? 'text-green-700' : 'text-red-700',
      )
    } catch (err) {
      console.error('Toggle status error:', err)
      showMessage('❌ حدث خطأ أثناء تعديل الحالة.', 'text-red-700')
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return <span className="text-green-700 font-semibold">معتمدة</span>
      case 'rejected':
        return <span className="text-red-700 font-semibold">مرفوضة</span>
      default:
        return <span className="text-gray-600 font-medium">قيد المراجعة</span>
    }
  }

  // ==== أدوات العرض في نافذة المعاينة ====

  const formatAPA = (ref) => {
    if (!ref) return null
    if (typeof ref === 'string') return ref

    const author = ref.author || ref.refAuthor || ''
    const year = ref.year || ref.refYear || ''
    const title = ref.title || ref.refTitle || ''
    const source = ref.source || ref.refSource || ''
    const pages = ref.pages || ref.refPages || ''

    const parts = []
    if (author) parts.push(author)
    if (year) parts.push(`(${year}).`)
    if (title) parts.push(<i key="t">{title}</i>)
    if (source) parts.push(source)
    if (pages) parts.push(`ص. ${pages}`)

    return parts.map((p, i) => (
      <span key={i} className="inline">
        {i > 0 ? ' ' : ''}
        {p}
      </span>
    ))
  }

  const extractReferences = (it) => {
    const refs = []

    if (Array.isArray(it?.references)) {
      return it.references
    }

    if (typeof it?.references === 'string' && it.references.trim()) {
      refs.push(it.references.trim())
    }

    const combinedRefFields =
      it?.refAuthor || it?.refYear || it?.refTitle || it?.refSource || it?.refPages
        ? {
            author: it.refAuthor,
            year: it.refYear,
            title: it.refTitle,
            source: it.refSource,
            pages: it.refPages,
          }
        : null

    if (
      combinedRefFields &&
      (combinedRefFields.author ||
        combinedRefFields.title ||
        combinedRefFields.source)
    ) {
      refs.push(combinedRefFields)
    }

    return refs
  }

  const toEmbedURL = (url) => {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
      }
      if (u.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${u.pathname.replace('/', '')}`
      }
      return url
    } catch {
      return url
    }
  }

  if (!isAdmin) {
    return (
      <p className="p-6 text-center text-gray-600">
        هذه الصفحة خاصة بمدير النظام فقط.
      </p>
    )
  }

  return (
    <section className="container-responsive p-6">
      {/* التبويبات */}
      <div className="flex gap-3 mb-6 border-b pb-2">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'strategies'
              ? 'text-qassimDark border-b-2 border-qassimDark'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('strategies')}
        >
          إدارة الاستراتيجيات
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'users'
              ? 'text-qassimDark border-b-2 border-qassimDark'
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          إدارة المستخدمين
        </button>
      </div>

      {msg && (
        <p className={`mb-4 text-sm font-medium ${msg.color}`}>{msg.text}</p>
      )}

      {/* تبويب إدارة الاستراتيجيات */}
      {activeTab === 'strategies' && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-qassimDark">
              الاستراتيجيات الحديثة
            </h2>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">الأحدث أولًا</option>
              <option value="oldest">الأقدم أولًا</option>
              <option value="az">ترتيب أبجدي تصاعدي</option>
              <option value="za">ترتيب أبجدي تنازلي</option>
            </select>
          </div>

          <div className="grid gap-4">
            {sortedItems.map((it) => (
              <div
                key={`${it.userId}-${it.id}`}
                className="p-5 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-qassimIndigo mb-1 truncate">
                      {it.name}
                    </h3>
                    <p className="text-sm text-gray-700 mb-1">
                      الحالة: {getStatusLabel(it.status)}
                    </p>
                    <p className="text-sm text-gray-800 mb-1">
                      مقدمة من:{' '}
                      <span className="font-semibold">
                        {getSubmittedName(it)}
                      </span>
                    </p>
                    {it.submittedEmail && (
                      <p className="text-sm text-gray-700 mb-1">
                        البريد الإلكتروني:{' '}
                        <span className="font-medium">
                          {it.submittedEmail}
                        </span>
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      تاريخ الإضافة:{' '}
                      {formatDate(it.timestamp?.seconds)}
                    </p>

                    {/* شارات مختصرة تُظهر وجود ملف/فيديو/كويز/مراجع */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {it.worksheetURL && (
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">
                          مرفق
                        </span>
                      )}
                      {it.videoURL && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          فيديو
                        </span>
                      )}
                      {extractReferences(it).length > 0 && (
                        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">
                          مراجع
                        </span>
                      )}
                      {Array.isArray(it.quiz?.questions) &&
                        it.quiz.questions.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                            كويز
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                     <button
                     onClick={() => navigate(`/preview/${it.id}?u=${it.userId}`)}
                    className="border border-gray-400 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition flex items-center gap-1"
                     >
                    <Eye className="w-4 h-4 text-gray-700" />
                    <span>معاينة</span>
                   </button>
                    {it.status === 'pending' ? (
                      <>
                        <button
                          onClick={() =>
                            act(it.userId, it.id, 'approved')
                          }
                          className="bg-qassimDark text-white px-3 py-1.5 rounded-md hover:bg-qassimIndigo transition"
                        >
                          اعتماد
                        </button>
                        <button
                          onClick={() =>
                            act(it.userId, it.id, 'rejected')
                          }
                          className="border border-qassimDark text-qassimDark px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
                        >
                          رفض
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            hideStrategy(it.userId, it.id, !it.hidden)
                          }
                          className="border border-gray-400 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition"
                        >
                          {it.hidden ? 'إظهار بالموقع' : 'إخفاء من الموقع'}
                        </button>
                        <button
                          onClick={() => deleteStrategy(it.userId, it.id)}
                          className="border border-red-500 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
                        >
                          حذف نهائي
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* تبويب إدارة المستخدمين */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-qassimDark mb-3">
            إدارة المستخدمين
          </h2>
          <div className="border border-gray-200 rounded-lg divide-y">
            {users.length === 0 ? (
              <p className="p-4 text-gray-600 text-center">
                لا يوجد مستخدمون حتى الآن.
              </p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="p-4 flex justify-between items-center bg-white hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-qassimIndigo">
                      {u.name || '—'}
                    </p>
                    <p className="text-sm text-gray-700">{u.email}</p>
                    <p className="text-xs text-gray-500">
                      {u.createdAt?.seconds
                        ? new Date(
                            u.createdAt.seconds * 1000,
                          ).toLocaleString('ar-SA')
                        : '—'}
                    </p>
                    <p
                      className={`text-xs ${
                        u.active ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {u.active ? 'نشط' : 'معطل'}
                    </p>
                  </div>
                  <div className="flex gap-2 admin-actions">
                    <button
                      onClick={() => toggleUserStatus(u.id, u.active)}
                      className={`border px-3 py-1 rounded-md ${
                        u.active
                          ? 'border-red-600 text-red-600 hover:bg-red-50'
                          : 'border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.active ? 'تعطيل' : 'تفعيل'}
                    </button>

                    <button
                      onClick={() => resetPassword(u.email)}
                      className="border border-blue-600 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50"
                    >
                      إعادة تعيين كلمة المرور
                    </button>

                    <button
                      onClick={() => removeUser(u.id)}
                      className="border border-red-600 text-red-600 px-3 py-1 rounded-md hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  )
}
