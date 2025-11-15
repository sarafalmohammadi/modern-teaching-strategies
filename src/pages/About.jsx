export default function About() {
  return (
    <div className="max-w-5xl mx-auto p-8 text-right leading-relaxed space-y-16">

      {/* العنوان الرئيسي */}
      <div className="space-y-3 text-right">
        <h1 className="text-4xl font-bold text-[#1a4a9a]">فريق عمل "استراتيجياتنا التعليمية"</h1>
        <p className="text-gray-600 text-lg max-w-3xl ml-auto">
          يُمثّل هذا العمل نتاج تعاون علمي وتطبيقي لطالبات برنامج دكتوراه الفلسفة في المناهج وطرق التدريس العامة، وفق منهجية حديثة تسعى لرفع جودة المحتوى التربوي وتطوير الممارسات التعليمية بما ينسجم مع احتياجات القرن الحادي والعشرين.
        </p>
      </div>

      {/* قسم فريق العمل */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200 space-y-6 text-right">
        <h2 className="text-2xl font-semibold text-[#1a4a9a] border-b pb-3">فريق العمل</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 text-gray-800 text-lg gap-3 pr-4 list-disc list-inside">
          <li>الطالبة: أحلام فهيد المطيري</li>
          <li>الطالبة: أصالة سعود القثامي</li>
          <li>الطالبة: أماني صالح أحمد المالكي</li>
          <li>الطالبة: أمل عبدالله عبدالكريم اللحيدان</li>
          <li>الطالبة: تغريد شليويح الخريصي</li>
          <li>الطالبة: رقية علي عبدالله الهلالي</li>
          <li>الطالبة: زانة فرحان خليف الشمري</li>
          <li>الطالبة: ساره عبيد حمدان العتيبي</li>
          <li>الطالبة: شعاع عبيريد عايض الرشيدي</li>
          <li>الطالبة: عائشة عبدالله العنزي</li>
          <li>الطالبة: عفاف عبيد المحرول</li>
          <li>الطالبة: ماوه نائف زيد الحربي</li>
          <li>الطالبة: نادية خالد سالم الحربي</li>
          <li>الطالبة: نداء محمد عبدالله الرفاعي</li>
          <li>الطالبة: هدى غويزي منور الفهيدي</li>
        </ul>
      </div>

      {/* الإشراف */}
      <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200 space-y-4 text-right">
        <h2 className="text-2xl font-semibold text-[#1a4a9a] border-b pb-3">الإشراف</h2>
        <p className="text-gray-700 text-lg leading-loose">
          الدكتورة الفاضلة: د. لطيفة عبدالله خالد الحربي<br />
          أستاذ مشارك – قسم المناهج وطرق التدريس<br />
          كلية التربية – جامعة القصيم
        </p>
      </div>

      {/* الجهة الأكاديمية */}
      <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200 space-y-4 text-right">
        <h2 className="text-2xl font-semibold text-[#1a4a9a] border-b pb-3">الجهة الأكاديمية</h2>
        <p className="text-gray-700 text-lg leading-loose">
          جامعة القصيم<br />
          كلية التربية<br />
          قسم دكتوراه الفلسفة في المناهج وطرق التدريس العامة
        </p>
      </div>

      {/* كلمة ختامية */}
      <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200 space-y-4 text-right mb-10">
        <h2 className="text-2xl font-semibold text-[#1a4a9a] border-b pb-3">كلمة ختامية</h2>
        <p className="text-gray-700 text-lg leading-loose">
          يعبّر هذا الموقع عن رؤية تربوية تهدف إلى تمكين المعلمين والمعلمات من استراتيجيات تدريس حديثة، ترتقي بجودة التعليم داخل الصفوف، وتؤسس لبيئة تعلم أكثر تفاعلاً وابتكارًا، بما ينسجم مع تطلعات التعليم الرقمي المتقدم.
        </p>
      </div>

    </div>
  );
}
