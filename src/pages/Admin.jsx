import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";

export default function Admin() {
  const [apps, setApps] = useState([]);

  // For download stats: { appId: { count: number, users: [ { email, name } ] } }
  const [downloadStats, setDownloadStats] = useState({});

  const [form, setForm] = useState({
    id: null,
    title: "",
    description: "",
    iconURL: "",
    apkURL: "",
    category: "App",
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch apps + downloads stats
  const fetchAppsAndStats = async () => {
    // Fetch apps
    const appsSnapshot = await getDocs(collection(db, "apps"));
    const appsData = appsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setApps(appsData);

    // Fetch downloads stats for each app
    const stats = {};
    for (const app of appsData) {
      const downloadsQuery = query(
        collection(db, "downloads"),
        where("appId", "==", app.id)
      );
      const downloadsSnapshot = await getDocs(downloadsQuery);

      // Use a Map to avoid duplicate users (by userId or email)
      const usersMap = new Map();

      downloadsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const key = data.userId || data.userEmail || `anon_${doc.id}`;
        if (!usersMap.has(key)) {
          usersMap.set(key, {
            email: data.userEmail || "Unknown",
            name: data.userName || "Unknown",
          });
        }
      });

      stats[app.id] = {
        count: downloadsSnapshot.size,
        users: Array.from(usersMap.values()),
      };
    }
    setDownloadStats(stats);
  };

  useEffect(() => {
    fetchAppsAndStats();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.iconURL || !form.apkURL || !form.category) {
      alert(
        "Please fill required fields: Title, Icon URL, APK URL, and Category"
      );
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "apps"), {
        title: form.title,
        description: form.description,
        iconURL: form.iconURL,
        apkURL: form.apkURL,
        category: form.category,
        createdAt: serverTimestamp(),
      });
      alert("App added successfully!");
      setForm({
        id: null,
        title: "",
        description: "",
        iconURL: "",
        apkURL: "",
        category: "App",
      });
      await fetchAppsAndStats();
    } catch (err) {
      alert("Error adding app: " + err.message);
    }
    setLoading(false);
  };

  const startEdit = (app) => {
    setForm(app);
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form.id) return;
    setLoading(true);
    try {
      const docRef = doc(db, "apps", form.id);
      await updateDoc(docRef, {
        title: form.title,
        description: form.description,
        iconURL: form.iconURL,
        apkURL: form.apkURL,
        category: form.category,
        updatedAt: serverTimestamp(),
      });
      alert("App updated successfully!");
      setForm({
        id: null,
        title: "",
        description: "",
        iconURL: "",
        apkURL: "",
        category: "App",
      });
      setIsEditing(false);
      await fetchAppsAndStats();
    } catch (err) {
      alert("Error updating app: " + err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this app?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "apps", id));
      await fetchAppsAndStats();
    } catch (err) {
      alert("Error deleting app: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl text-green-600 font-bold mb-6 text-center">
        Admin Panel - Manage Apps
      </h2>

      <form
        onSubmit={isEditing ? handleUpdate : handleAdd}
        className="mb-8 space-y-4 bg-white p-6 rounded shadow"
      >
        <input
          type="text"
          name="title"
          placeholder="App Title *"
          value={form.title}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          rows={3}
        />
        <input
          type="url"
          name="iconURL"
          placeholder="Icon URL *"
          value={form.iconURL}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <input
          type="url"
          name="apkURL"
          placeholder="APK Download URL *"
          value={form.apkURL}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-3 border rounded"
          required
        >
          <option value="App">App</option>
          <option value="Game">Game</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
        >
          {loading ? "Saving..." : isEditing ? "Update App" : "Add App"}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setForm({
                id: null,
                title: "",
                description: "",
                iconURL: "",
                apkURL: "",
                category: "App",
              });
              setIsEditing(false);
            }}
            className="w-full mt-2 bg-gray-500 text-white p-3 rounded hover:bg-gray-600 transition"
          >
            Cancel Edit
          </button>
        )}
      </form>

      <div className="space-y-6">
        {apps.map((app) => (
          <div
            key={app.id}
            className="bg-white p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div>
              <h3 className="font-semibold text-lg">{app.title}</h3>
              <p className="text-gray-600">{app.description}</p>
              <p className="italic text-sm text-gray-400 mb-1">
                Category: {app.category}
              </p>
              <p className="text-sm font-semibold">
                Total Downloads: {downloadStats[app.id]?.count || 0}
              </p>
              {downloadStats[app.id]?.users?.length > 0 && (
                <details className="text-sm mt-1 cursor-pointer">
                  <summary className="underline text-blue-600">
                    Downloaded by users ({downloadStats[app.id].users.length})
                  </summary>
                  <ul className="list-disc list-inside max-h-32 overflow-auto mt-1">
                    {downloadStats[app.id].users.map(({ name, email }, i) => (
                      <li key={i}>
                        {name} {email && `<${email}>`}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => startEdit(app)}
                className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(app.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
