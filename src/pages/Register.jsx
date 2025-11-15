import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');

    try {
      // إنشاء الحساب في Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(res.user, { displayName: name });

      // ✅ إنشاء المستخدم في Firestore (سيُنشئ Collection تلقائيًا إذا ما كان موجود)
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name,
        email: email.toLowerCase(),
        role: 'student',
        createdAt: serverTimestamp(),
        active: true,
      });

      setMsg('✅ تم إنشاء الحساب بنجاح 🎉');
      setTimeout(() => nav('/'), 1000);
    } catch (e) {
      console.error('❌ Register Error:', e.code);
      switch (e.code) {
        case 'auth/email-already-in-use':
          setMsg('⚠️ هذا البريد مستخدم مسبقًا.');
          break;
        case 'auth/invalid-email':
          setMsg('❌ البريد الإلكتروني غير صالح.');
          break;
        case 'auth/weak-password':
          setMsg('⚠️ كلمة المرور ضعيفة جدًا (6 أحرف على الأقل).');
          break;
        case 'auth/network-request-failed':
          setMsg('⚠️ خطأ في الاتصال، تحقق من الإنترنت.');
          break;
        default:
          setMsg('حدث خطأ غير متوقع، حاول لاحقًا.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto card p-6 mt-10 shadow bg-white rounded-xl">
      <h2 className="text-xl font-bold mb-4 text-center text-qassimDark">تسجيل طالبة</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="الاسم الكامل"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="البريد الإلكتروني"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="كلمة المرور"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary w-full py-2 font-semibold bg-qassimIndigo hover:bg-qassimDark text-white rounded transition"
        >
          تسجيل
        </button>
      </form>

      {msg && (
        <p
          className={`text-sm mt-4 text-center ${
            msg.startsWith('✅')
              ? 'text-green-600'
              : msg.startsWith('⚠️')
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
