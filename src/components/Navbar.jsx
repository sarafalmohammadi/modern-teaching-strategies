import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../firebase/AuthContext'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const active = ({ isActive }) =>
    isActive ? 'text-qassimIndigo font-bold' : 'text-gray-700'

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 w-full z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* شعار الموقع */}
        <Link to="/" className="flex items-center gap-4" onClick={closeMenu}>
  {/* شعار الجامعة */}
  <img
    src="/logo-qassim.png"
    alt="شعار جامعة القصيم"
    className="h-8 sm:h-9 w-auto object-contain"
  />

  {/* اسم الموقع + الشعار النصي */}
  <div className="flex flex-col items-start leading-tight">
    <span className="font-bold text-qassimDark text-sm sm:text-base">
      استراتيجياتنا التعليمية
    </span>
    <span className="text-xs text-qassimLight hidden sm:block">
      تعلم، طبّق، أبدع!
    </span>
  </div>
</Link>



        {/* قائمة سطح المكتب */}
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/" className={active}>الرئيسية</NavLink>
          <NavLink to="/strategies" className={active}>الاستراتيجيات</NavLink>
          {user && <NavLink to="/submit" className={active}>إضافة استراتيجية</NavLink>}
          {user && <NavLink to="/admin" className={active}>لوحة التحكم</NavLink>}

          {/* استبدال "عن المشروع" بـ "من نحن" وتكون آخر شيء */}
          <NavLink to="/about" className={active}>من نحن</NavLink>

          {!user ? (
            <NavLink to="/login" className="btn btn-primary">تسجيل الدخول</NavLink>
          ) : (
            <button onClick={() => signOut(auth)} className="btn btn-light">تسجيل الخروج</button>
          )}
        </div>

        {/* زر القائمة للجوال */}
        <button
          className="md:hidden text-qassimDark"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* القائمة الجانبية للجوال */}
      <div
        className={`fixed top-0 right-0 h-full w-3/4 max-w-xs bg-white shadow-xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <span className="font-bold text-qassimDark text-lg">القائمة</span>
          <button onClick={closeMenu} className="text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-start gap-4 px-6 py-4">
          <NavLink to="/" onClick={closeMenu} className={active}>الرئيسية</NavLink>
          <NavLink to="/strategies" onClick={closeMenu} className={active}>الاستراتيجيات</NavLink>
          {user && <NavLink to="/submit" onClick={closeMenu} className={active}>إضافة استراتيجية</NavLink>}
          {user && <NavLink to="/admin" onClick={closeMenu} className={active}>لوحة التحكم</NavLink>}
          
          {/* من نحن آخر خيار في القائمة */}
          <NavLink to="/about" onClick={closeMenu} className={active}>من نحن</NavLink>

          {!user ? (
            <NavLink to="/login" onClick={closeMenu} className="btn btn-primary w-full text-center">تسجيل الدخول</NavLink>
          ) : (
            <button onClick={() => { signOut(auth); closeMenu(); }} className="btn btn-light w-full">تسجيل الخروج</button>
          )}
        </div>
      </div>

      {/* خلفية مظللة عند فتح القائمة */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={closeMenu}
        ></div>
      )}
    </header>
  )
}
