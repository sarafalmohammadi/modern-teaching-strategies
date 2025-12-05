import { Link } from 'react-router-dom'
import { useAuth } from '../firebase/AuthContext'
import { BookOpen, Lightbulb, Target, Video, FileText, Brain } from 'lucide-react'
import { Search, Plus } from "lucide-react";
import { Hand } from "lucide-react";



export default function Home() {
  const { user } = useAuth()

  return (
    <main className="text-center">
      {/* 🟣 القسم العلوي (Hero Section) */}
      <section className="rounded-2xl bg-gradient-to-br from-qassimIndigo to-qassimLight text-white p-10 shadow-lg mt-4">
        {user && (
          <p className="text-sm mb-3 text-qassimYellow/90 font-medium flex items-center gap-2">
  <Hand size={16} />
  مرحبًا، {user.displayName || user.email}
</p>

        )}
        <h1 className="text-4xl font-bold mb-2">استراتيجياتنا التعليمية</h1>
        <h2 className="text-lg font-semibold mb-4">تعلم، طبّق، أبدع!</h2>
        <p className="max-w-2xl mx-auto opacity-90 text-md leading-relaxed">
          من هنا تبدأ رحلة المعلم في الإبداع التدريسي — منصة معرفية وتطبيقية تفاعلية تجمع بين النظرية والممارسة داخل بيئة تعليمية مبتكرة.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
  to="/strategies"
  className="px-6 py-3 bg-white text-qassimIndigo font-semibold rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2"
>
  <Search size={20} />
  استكشف الاستراتيجيات
</Link>

<Link
  to="/submit"
  className="px-6 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-qassimIndigo transition flex items-center gap-2"
>
  <Plus size={20} />
  أضف استراتيجيتك
</Link>

        </div>
      </section>

      {/* 🌟 الرؤية، الرسالة، الأهداف */}
      <section className="mt-16 max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-qassimDark mb-8">رؤيتنا ورسالتنا وأهدافنا</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <Target className="mx-auto text-qassimIndigo mb-3" size={36} />
            <h3 className="font-bold text-lg mb-2 text-qassimDark">الرؤية</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              أن تكون "استراتيجياتنا التعليمية" المنصة العربية الرائدة في تمكين المعلمات من تطبيق
              الاستراتيجيات الحديثة بطرق مبتكرة وتفاعلية.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <Lightbulb className="mx-auto text-qassimIndigo mb-3" size={36} />
            <h3 className="font-bold text-lg mb-2 text-qassimDark">الرسالة</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              تقديم محتوى معرفي تطبيقي يربط بين النظرية والممارسة داخل الفصول الدراسية، من خلال
              مقاطع مرئية، وأوراق عمل، وتجارب صفية واقعية.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition">
            <BookOpen className="mx-auto text-qassimIndigo mb-3" size={36} />
            <h3 className="font-bold text-lg mb-2 text-qassimDark">الأهداف</h3>
            <ul className="text-sm text-gray-600 leading-relaxed list-disc pr-5 text-right">
              <li>نشر ثقافة الاستراتيجيات الحديثة في التعليم.</li>
              <li>تدريب المعلمات على تحويل المعرفة النظرية إلى ممارسات واقعية.</li>
              <li>تشجيع الإبداع والابتكار في عرض الدروس.</li>
              <li>إثراء المحتوى التعليمي التفاعلي.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 🧩 الأقسام التفاعلية */}
<section className="mt-20 max-w-6xl mx-auto px-4">
  <h2 className="text-2xl font-bold text-qassimDark mb-8">الأقسام التفاعلية</h2>
  <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
    {[
      { icon: BookOpen, text: 'استراتيجيات معتمدة' },
      { icon: Brain, text: 'اختبارات تفاعلية' },
      { icon: Video, text: 'أمثلة صفية بالفيديو' },
      { icon: FileText, text: 'أوراق عمل جاهزة' }
    ].map(({ icon: Icon, text }, i) => (
      <div
        key={i}
        className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition hover:-translate-y-1"
      >
        <Icon className="text-qassimIndigo mb-3" size={40} />
        <p className="text-sm font-semibold text-qassimDark">{text}</p>
      </div>
    ))}
  </div>
</section>


      {/* 🎥 نبذة ختامية */}
      <section className="mt-20 bg-gray-50 border-t border-gray-200 py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-qassimDark mb-4">لماذا استراتيجياتنا التعليمية؟</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            منصة معرفية تفاعلية تهدف إلى تمكين المعلمات والمتدربات من تحويل الفكر التربوي إلى ممارسة
            تعليمية واقعية، داخل بيئة رقمية آمنة وداعمة للإبداع.
          </p>
          <div className="mt-6">
            <Link
              to="/about"
              className="inline-block px-6 py-3 bg-qassimIndigo text-white rounded-lg font-semibold hover:bg-qassimLight transition"
            >
              اعرف أكثر عن المشروع
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
