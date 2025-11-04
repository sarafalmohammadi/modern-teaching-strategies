import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ تعديل المسار الأساسي لحل مشكلة الصفحة البيضاء
export default defineConfig({
  base: './',
  plugins: [react()],
})
