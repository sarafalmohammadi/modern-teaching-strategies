import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Strategies() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const q = query(collection(db, 'strategies'), where('status', '==', 'approved'))
        const snap = await getDocs(q)
        const arr = []
        snap.forEach(doc => {
          const data = doc.data()
          if (!data.hidden) arr.push({ id: doc.id, ...data })
        })
        setItems(arr)
      } catch (err) {
        console.error('Error loading strategies:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStrategies()
  }, [])

  const formatDate = (seconds) => {
    if (!seconds) return '—'
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredItems = items.filter(it =>
    it.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <p className="text-center text-gray-600 mt-8">جارٍ تحميل الاستراتيجيات...</p>
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-qassimDark mb-4 text-center">
        قائمة الاستراتيجيات المعتمدة
      </h2>

      {/* 🔍 مربع البحث */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="ابحث باسم الاستراتيجية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-qassimIndigo"
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-600">لا توجد استراتيجيات مطابقة لبحثك.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((it) => (
            <div
              key={it.id}
              onClick={() => navigate(`/strategies/${it.id}`)} // ✅ تم تصحيح المسار
              className="cursor-pointer bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-qassimIndigo mb-1 line-clamp-1">
                  {it.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {it.definition || '—'}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <p>مقدمة من: {it.submittedBy || '—'}</p>
                <p>{formatDate(it.timestamp?.seconds)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
