import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Strategies() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  // ===============================
  // تحميل المستخدمين لجلب الاسم الصحيح
  // ===============================
  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, 'users'))
      const arr = []
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }))
      setUsers(arr)
    }
    loadUsers()
  }, [])

  useEffect(() => {
  const fetchStrategies = async () => {
    try {
      const all = [];

      // نجيب كل المستخدمين
      const usersSnap = await getDocs(collection(db, "users"));

      for (const userDoc of usersSnap.docs) {
        const uid = userDoc.id;

        const strategiesSnap = await getDocs(
          collection(db, "users", uid, "strategies")
        );

        strategiesSnap.forEach((doc2) => {
          const data = doc2.data();

          // ❌ تجاهل الاستراتيجيات غير المعتمدة
          if (data.status !== "approved") return;

          // ❌ تجاهل الاستراتيجيات المخفية
          if (data.hidden === true) return;

          all.push({
            id: doc2.id,
            userId: uid,
            source: "new",
            ...data,
          });
        });
      }

      setItems(all);
    } catch (err) {
      console.error("Error loading strategies:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchStrategies();
}, [])

  // إحضار الاسم الحقيقي من users/{uid}
  const getUserName = (uid) => {
    const u = users.find((x) => x.id === uid)
    return u?.name || '—'
  }

  const formatDate = (seconds) => {
    if (!seconds) return '—'
    const date = new Date(seconds * 1000)
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filtered = items.filter((it) =>
    it.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-8">
        جارٍ تحميل الاستراتيجيات...
      </p>
    )
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-qassimDark mb-4 text-center">
        قائمة الاستراتيجيات المعتمدة
      </h2>

      {/* 🔍 البحث */}
      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="ابحث باسم الاستراتيجية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-qassimIndigo"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">
          لا توجد استراتيجيات مطابقة لبحثك.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((it) => (
            <div
              key={it.userId + "-" + it.id}
              onClick={() =>
                navigate(`/strategies/${it.id}?src=new&u=${it.userId}`)
              }
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
                <p>
                  مقدمة من: <span className='font-semibold'>{getUserName(it.userId)}</span>
                </p>
                <p>{formatDate(it.timestamp?.seconds)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
