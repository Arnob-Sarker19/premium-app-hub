import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import AppCard from "../components/AppCard";

export default function Home() {
  const [apps, setApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All"); // New state

  useEffect(() => {
    const fetchApps = async () => {
      const querySnapshot = await getDocs(collection(db, "apps"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApps(data);
    };
    fetchApps();
  }, []);

  // Filter apps by search and category
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || app.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Category filter dropdown */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="All">All Categories</option>
          <option value="App">Apps</option>
          <option value="Game">Games</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => <AppCard key={app.id} app={app} />)
        ) : (
          <p className="text-center text-gray-500 col-span-full">No apps found.</p>
        )}
      </div>
    </div>
  );
}
