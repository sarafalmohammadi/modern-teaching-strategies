import { useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import { auth, db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import { UserCircle, Mail, Lock, Save } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName || "");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      setLoading(true);

      const oldName = user.displayName;

      // ===============================
      // 1️⃣ تحديث الاسم في Firebase Auth
      // ===============================
      if (name.trim() && name !== oldName) {
        await updateProfile(auth.currentUser, { displayName: name });

        // ===============================
        // 2️⃣ تحديث الاسم داخل users/{uid}
        // ===============================
        await updateDoc(doc(db, "users", user.uid), {
          name: name
        });

        // ===============================
        // 3️⃣ تحديث submittedBy داخل:
        //     users/{uid}/strategies/*
        // ===============================
        const strategiesSnap = await getDocs(
          collection(db, "users", user.uid, "strategies")
        );

        for (const docSnap of strategiesSnap.docs) {
          await updateDoc(docSnap.ref, { submittedBy: name });
        }
      }

      // ===============================
      // 4️⃣ تغيير كلمة المرور
      // ===============================
      if (oldPass || newPass || confirmPass) {
        if (!oldPass || !newPass || !confirmPass) {
          throw new Error("⚠️ يجب تعبئة جميع حقول كلمة المرور.");
        }
        if (newPass !== confirmPass) {
          throw new Error("⚠️ كلمة المرور الجديدة غير متطابقة.");
        }
        if (newPass.length < 6) {
          throw new Error("⚠️ كلمة المرور الجديدة يجب أن تكون 6 أحرف فأكثر.");
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          oldPass
        );

        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPass);
      }

      setMsg("✅ تم تحديث بياناتك بنجاح.");
    } catch (err) {
      console.error("PROFILE ERROR:", err);

      if (err.code === "auth/invalid-credential") {
        setMsg("❌ كلمة المرور الحالية غير صحيحة.");
      } else if (err.code === "auth/weak-password") {
        setMsg("⚠️ كلمة المرور الجديدة ضعيفة.");
      } else {
        setMsg(err.message || "حدث خطأ.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10 border border-gray-100">

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <img
          src="/avatar1.jpg"
          className="w-20 h-20 rounded-full object-cover"
          alt="avatar"
        />

        <p className="mt-3 text-qassimDark font-semibold text-lg">
          حسابك الشخصي
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">

        {/* الاسم */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-qassimDark">
            الاسم
          </label>
          <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
            <UserCircle className="text-qassimIndigo" size={20} />
            <input
              className="w-full bg-transparent focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* البريد */}
        <div>
          <label className="block mb-1 text-sm font-semibold text-qassimDark">
            البريد الإلكتروني (غير قابل للتعديل)
          </label>
          <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-100">
            <Mail className="text-gray-400" size={20} />
            <input
              className="w-full bg-transparent text-gray-500"
              value={user?.email}
              disabled
            />
          </div>
        </div>

        {/* كلمة المرور */}
        <div className="border-t pt-4">
          <p className="font-semibold text-qassimDark mb-3">
            تغيير كلمة المرور
          </p>

          <div className="space-y-4">
            {/* القديمة */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-qassimDark">
                كلمة المرور الحالية
              </label>
              <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                <Lock className="text-qassimIndigo" size={20} />
                <input
                  type="password"
                  className="w-full bg-transparent focus:outline-none"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                />
              </div>
            </div>

            {/* الجديدة */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-qassimDark">
                كلمة المرور الجديدة
              </label>
              <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                <Lock className="text-qassimIndigo" size={20} />
                <input
                  type="password"
                  className="w-full bg-transparent focus:outline-none"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
            </div>

            {/* تأكيد */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-qassimDark">
                تأكيد كلمة المرور الجديدة
              </label>
              <div className="flex items-center gap-2 border rounded-lg p-2 bg-gray-50">
                <Lock className="text-qassimIndigo" size={20} />
                <input
                  type="password"
                  className="w-full bg-transparent focus:outline-none"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* زر الحفظ */}
        <button
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition text-white
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-qassimIndigo hover:bg-qassimLight"
            }`}
          disabled={loading}
        >
          <Save size={18} />
          {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>

        {/* الرسالة */}
        {msg && (
          <p
            className={`text-center text-sm mt-2 ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
