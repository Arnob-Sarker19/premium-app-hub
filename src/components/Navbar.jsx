import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { Sun, Moon, Menu, X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Fetch username from Firestore
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          } else {
            setUsername(""); // fallback
          }
        } catch (err) {
          console.error("Error fetching username:", err);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    const html = document.documentElement;
    if (!darkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
      {user && (
        <>
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-400">
            Home
          </Link>
          <Link to="/request-app" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-400">
            Request App
          </Link>
          {user.email === "admin@arnob.com" && (
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-400 font-semibold">
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
          >
            Logout
          </button>
        </>
      )}
      {!user && (
        <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:text-indigo-400">
          Login
        </Link>
      )}
    </div>
  );

  return (
    <nav className="bg-blue-300 dark:bg-blue-300 text-blue-600 dark:text-pink-500 px-6 py-4 flex justify-between items-center shadow-md relative z-50">
      <div className="flex items-center gap-4">
<<<<<<< HEAD
        <img className="w-7" src="./public/shortcut-script-app.png" alt="Premium Apps Hub" />
=======
        <img className="w-7" src="./public/shortcut-script-app.png" alt="logo" />
>>>>>>> d81804717613c2f0f23a312249a039f70af6b34a
        <Link to="/" className="text-2xl font-bold hover:text-indigo-400">
          Premium Apps Hub
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        <NavLinks />
        <button onClick={toggleTheme} className="p-2">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
          <div className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
            {username || user.email}
          </div>
        )}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center gap-2">
        <button onClick={toggleTheme}>
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 px-6 py-4 flex flex-col gap-4 shadow-md md:hidden">
          <NavLinks />
          {user && (
            <div className="text-sm bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded">
              {username || user.email}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
