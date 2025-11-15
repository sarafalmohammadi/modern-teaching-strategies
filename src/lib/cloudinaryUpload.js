// src/lib/cloudinaryUpload.js

export async function uploadToCloudinary(file, userEmail) {
  if (!file) {
    throw new Error("لم يتم اختيار أي ملف.");
  }

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error("إعدادات Cloudinary غير موجودة في ملف .env");
  }

  // مجلد باسم المستخدم
  const folderName = (userEmail || "anonymous")
    .replace("@", "_")
    .replace(/\./g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "");

  // الأنواع المسموحة
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("❌ يُسمح فقط بملفات PDF و Word و ZIP.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);
  formData.append("folder", `strategies/${folderName}`);

  try {
    // ⚠️ أهم نقطة: نستخدم auto (Cloudinary يحدد النوع)
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || "فشل في رفع الملف.";
      throw new Error(msg);
    }

    // نعتمد الرابط كما هو بدون أي تعديل
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw new Error(err.message || "حدث خطأ أثناء رفع الملف.");
  }
}
