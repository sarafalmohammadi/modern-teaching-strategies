import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";

export default function Strategies() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | az | za

  const navigate = useNavigate();

  // ===============================
  // تحميل المستخدمين (مرة واحدة)
  // ===============================
  useEffect(() => {
    const loadUsersAndStrategies = async () => {
      setLoading(true);
      try {
        // 1) users مرة وحدة
        const usersSnap = await getDocs(collection(db, "users"));
        const usersArr = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(usersArr);

        // 2) جلب strategies لكل user بشكل parallel batching
        const all = [];

        // سوينا batches عشان ما نفتح 1000 request دفعة وحدة لو العدد كبير
        const batchSize = 25;
        for (let i = 0; i < usersSnap.docs.length; i += batchSize) {
          const chunk = usersSnap.docs.slice(i, i + batchSize);

          const promises = chunk.map(async (userDoc) => {
            const uid = userDoc.id;

            // ✅ Query يقلل reads: يجيب المعتمد فقط
            // hidden: هنا ما نحطه where لأن بعض الدوكمنتات ممكن ما فيها hidden
            // نخليه فلترة بالفرونت (data.hidden !== true)
            const q = query(
              collection(db, "users", uid, "strategies"),
              where("status", "==", "approved")
            );

            const strategiesSnap = await getDocs(q);

            strategiesSnap.forEach((doc2) => {
              const data = doc2.data();

              // ✅ تجاهل المخفية (يشمل undefined باعتباره غير مخفي)
              if (data.hidden === true) return;

              all.push({
                id: doc2.id,
                userId: uid,
                source: "new",
                ...data,
              });
            });
          });

          await Promise.all(promises);
        }

        setItems(all);
      } catch (err) {
        console.error("Error loading strategies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUsersAndStrategies();
  }, []);

  // ===== اسم صاحب الاستراتيجية =====
  const getUserName = (uid) => {
    const u = users.find((x) => x.id === uid);
    return u?.name || "—";
  };

  const formatDate = (seconds) => {
    if (!seconds) return "—";
    const date = new Date(seconds * 1000);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ===== Filter + Sort (بدون ما نلمس الداتا) =====
  const filteredAndSorted = useMemo(() => {
    const s = search.trim().toLowerCase();

    let arr = items;

    if (s) {
      arr = arr.filter((it) => (it.name || "").toLowerCase().includes(s));
    }

    const getTs = (x) => x?.timestamp?.seconds || 0;

    arr = [...arr].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return getTs(a) - getTs(b);
        case "az":
          return (a.name || "").localeCompare(b.name || "", "ar");
        case "za":
          return (b.name || "").localeCompare(a.name || "", "ar");
        case "newest":
        default:
          return getTs(b) - getTs(a);
      }
    });

    return arr;
  }, [items, search, sort]);

  if (loading) {
    return (
      <p className="text-center text-gray-600 mt-8">
        جارٍ تحميل الاستراتيجيات...
      </p>
    );
  }

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold text-qassimDark mb-4 text-center">
        قائمة الاستراتيجيات المعتمدة
      </h2>

      {/* 🔍 البحث + الفرز */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <input
          type="text"
          placeholder="ابحث باسم الاستراتيجية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-qassimIndigo"
        />

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="newest">الأحدث أولًا</option>
          <option value="oldest">الأقدم أولًا</option>
          <option value="az">ترتيب أبجدي A-Z</option>
          <option value="za">ترتيب أبجدي Z-A</option>
        </select>
      </div>

      {filteredAndSorted.length === 0 ? (
        <p className="text-center text-gray-600">
          لا توجد استراتيجيات مطابقة لبحثك.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSorted.map((it) => (
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
                  {it.definition || "—"}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <p>
                  مقدمة من:{" "}
                  <span className="font-semibold">{getUserName(it.userId)}</span>
                </p>
                <p>{formatDate(it.timestamp?.seconds)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
