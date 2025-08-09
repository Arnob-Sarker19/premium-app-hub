import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Star } from "lucide-react";

export default function AppCard({ app }) {
  const [rating, setRating] = useState(0); // hover preview
  const [userRating, setUserRating] = useState(null); // actual user rating

  const fetchUserRating = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "ratings"),
      where("appId", "==", app.id),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      setUserRating(data.rating);
      setRating(data.rating);
    }
  };

  useEffect(() => {
    fetchUserRating();
  }, []);

  const handleRate = async (value) => {
    const user = auth.currentUser;
    if (!user) return alert("Login required to rate");

    const q = query(
      collection(db, "ratings"),
      where("appId", "==", app.id),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update rating
      const docRef = doc(db, "ratings", querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        rating: value,
      });
    } else {
      // Create new rating
      await addDoc(collection(db, "ratings"), {
        userId: user.uid,
        userEmail: user.email,
        appId: app.id,
        rating: value,
      });
    }

    setUserRating(value);
    setRating(value);
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to download this app.");
      return;
    }

    try {
      await addDoc(collection(db, "downloads"), {
        appId: app.id,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email || "Unknown",
        downloadedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging download:", error);
    }

    // Open download link after logging
    window.open(app.apkURL, "_blank");
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-full max-w-sm mx-auto relative">
      {/* Category Badge */}
      {app.category && (
        <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {app.category}
        </div>
      )}

      <img
        src={app.iconURL}
        alt={app.title}
        className="w-full h-40 object-cover rounded-md mb-4"
      />
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {app.title}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
        {app.description}
      </p>

      {/* Rating System */}
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            onClick={() => handleRate(i)}
            onMouseEnter={() => setRating(i)}
            onMouseLeave={() => setRating(userRating || 0)}
            className={`w-6 h-6 cursor-pointer transition ${
              i <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        {userRating && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            You rated: {userRating}⭐
          </span>
        )}
      </div>

      <a
        href={app.apkURL}
        onClick={handleDownloadClick}
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Download
      </a>
    </div>
  );
}
