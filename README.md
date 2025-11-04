# الاستراتيجيات الحديثة في التدريس — Prototype v1

واجهة عربية عصرية متوافقة مع شعار جامعة القصيم، تعمل محليًا باستخدام React + Vite وFirebase.

## المتطلبات
- Node.js v18+
- حساب Firebase

## التشغيل محليًا
```bash
npm install
cp .env.example .env
# حرري القيم في .env
npm run dev
```

## ملف البيئة `.env`
انسخي هذا المحتوى:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## إعداد Firebase سريع
1) أنشئي مشروعًا من Firebase Console.
2) من **Build → Authentication** فعّلي Sign-in method: Email/Password.
3) من **Firestore Database** أنشئي قاعدة بيانات (Production mode).
4) من **Storage** فعّلي التخزين وحددي الحد الأقصى من واجهة الكود (20MB مضمّن بالعميل).
5) من **Project settings → Web app** انسخي مفاتيح التهيئة للصقها في `.env`.

### تعيين الدكتورة (المشرفة)
- افتحي `src/firebase/config.js` وعدّلي مصفوفة `ADMIN_EMAILS` بوضع بريد الدكتورة.
- أنشئي حسابًا بهذا البريد عبر صفحة "تسجيل" أو من قسم Authentication في Firebase Console.

## قواعد الأمان (اختياري — مبدئية)
اذهبي إلى Firestore Rules وأضيفي التالي كتأمين مبدئي أثناء العرض المحلي:
```
// Allow reads for all, writes for authenticated users.
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /strategies/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{document=**} {
      allow read: if true;
    }
  }
}
```
> لاحقًا يمكن تقييد الكتابة للطالبات فقط، والموافقة للإدارة فقط عبر Cloud Functions.

## إدراج بيانات تجريبية
- سجّلي الدخول بحساب الدكتورة (مدرج ضمن `ADMIN_EMAILS`).
- ادخلي صفحة **لوحة الدكتورة** واضغطي زر **"إدراج 3 استراتيجيات تجريبية"**.

## حد التحميل
- الرفع مقيّد إلى 20MB داخل صفحة "إضافة استراتيجية".

## بنية المشروع
انظري المجلد `src/` (صفحات، مكونات، تكوين Firebase).

## ملاحظات
- الاتجاه RTL افتراضي، الخط Tajawal.
- الواجهة مبدئية قابلة للتوسع (مراجع، اتصل بنا، إلخ).
