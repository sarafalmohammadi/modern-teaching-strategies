import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const explainAuthError = (code) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return '❌ كلمة المرور غير صحيحة، حاول مرة أخرى.';
      case 'auth/user-not-found':
        return '❌ لا يوجد مستخدم بهذا البريد الإلكتروني.';
      case 'auth/invalid-email':
        return '❌ البريد الإلكتروني غير صالح.';
      case 'auth/missing-password':
        return '⚠️ الرجاء إدخال كلمة المرور.';
      case 'auth/too-many-requests':
        return '⚠️ تم حظر المحاولات مؤقتًا، حاول لاحقًا.';
      case 'auth/network-request-failed':
        return '⚠️ خطأ في الاتصال، تحقق من الإنترنت.';
      default:
        return 'حدث خطأ غير متوقع، حاول مجددًا لاحقًا.';
    }
  };

  const submit = async (e) => {
  e.preventDefault();
  setMsg('');
  if (!email || !password) {
    return setMsg('⚠️ الرجاء تعبئة البريد وكلمة المرور.');
  }

  try {
    setLoading(true);

    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const u = cred.user;

    // ✅ حاول أنشئ/حدّث users/{uid}
    try {
      const userRef = doc(db, "users", u.uid);

      await setDoc(
        userRef,
        {
          uid: u.uid,
          email: u.email,
          name: u.displayName || u.email,
          role: "student",
          active: true,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (fireErr) {
      console.error("❌ USERS DOC WRITE FAILED:", fireErr?.code, fireErr?.message, fireErr);
      // هذا بالذات يثبت إنها Rules
      setMsg("⚠️ تم تسجيل الدخول لكن تعذر حفظ بيانات المستخدم في Firestore (تحققي من Rules).");
      // كمّلي الدخول عادي حتى ما تنكسر التجربة
    }

    setMsg('✅ تم تسجيل الدخول بنجاح، جاري التحميل...');
    setTimeout(() => nav('/'), 800);
  } catch (err) {
    console.error('[Login Error]', err.code, err.message);
    setMsg(explainAuthError(err.code));
  } finally {
    setLoading(false);
  }
};


  const reset = async () => {
    if (!email) return setMsg('⚠️ أدخل بريدك الإلكتروني أولًا.');
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('📩 تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.');
    } catch {
      setMsg('⚠️ تعذر إرسال رابط إعادة التعيين، تحقق من البريد.');
    }
  };

  return (
    <div className="max-w-md mx-auto card p-8 mt-10 shadow-lg bg-white rounded-2xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-qassimDark">تسجيل الدخول</h2>

      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-qassimIndigo transition"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-qassimIndigo transition"
          placeholder="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className={`btn btn-primary w-full py-2 rounded-lg font-bold transition ${
            loading ? 'opacity-60 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>

      <button
        onClick={reset}
        className="text-sm text-qassimIndigo mt-3 hover:underline"
      >
        نسيت كلمة المرور؟
      </button>

      <p className="text-sm mt-3 text-center">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="text-qassimDark hover:underline">
          إنشاء حساب جديد
        </Link>
      </p>

      {msg && (
        <p
          className={`mt-4 text-sm text-center ${
            msg.startsWith('✅')
              ? 'text-green-600'
              : msg.startsWith('📩')
              ? 'text-blue-600'
              : 'text-red-600'
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
