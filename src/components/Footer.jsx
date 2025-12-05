export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-6 py-8 grid gap-6 sm:grid-cols-3 text-center sm:text-right">
        {/* 🟣 القسم الأول */}
        <div>
          <h3 className="text-lg font-bold text-qassimIndigo mb-2">استراتيجياتنا التعليمية</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            تعلم، طبّق، أبدع!  
            <br />
            منصة معرفية تفاعلية لتمكين المعلمات والمتدربات من تطبيق
            الاستراتيجيات الحديثة بطريقة واقعية وممتعة.
          </p>
        </div>

        {/* 🧭 القسم الثاني */}
        <div>
          <h3 className="text-lg font-bold text-qassimIndigo mb-2">روابط سريعة</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li><a href="/" className="hover:text-qassimIndigo transition">الرئيسية</a></li>
            <li><a href="/strategies" className="hover:text-qassimIndigo transition">الاستراتيجيات</a></li>
            <li><a href="/about" className="hover:text-qassimIndigo transition">عن المشروع</a></li>
            <li><a href="/submit" className="hover:text-qassimIndigo transition">أضف استراتيجية</a></li>
          </ul>
        </div>

        {/* 🏫 القسم الثالث */}
        <div>
          <h3 className="text-lg font-bold text-qassimIndigo mb-2">حقوق النشر</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            © {new Date().getFullYear()} كلية التربية - جامعة القصيم
            <br />
            تصميم وتنفيذ: <span className="text-qassimIndigo font-semibold">فريق المقرر</span>
          </p>
        </div>
      </div>

      {/* خط سفلي بسيط */}
      <div className="border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        نسخة تجريبية – جميع الحقوق محفوظة © {new Date().getFullYear()}
      </div>
    </footer>
  )
}
