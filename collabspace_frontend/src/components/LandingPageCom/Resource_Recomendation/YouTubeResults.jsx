import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaYoutube } from "react-icons/fa";

const YouTubeResults = ({ query }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    const fetchYouTube = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              q: query,
              type: "video",
              maxResults: 5,
              key: import.meta.env.VITE_YOUTUBE_API_KEY,
            },
          }
        );

        // ✅ safe handling
        setVideos(res.data.items || []);
      } catch (err) {
        console.error("Error fetching YouTube videos:", err);
        setError("Failed to fetch YouTube videos.");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchYouTube();
  }, [query]);

  return (
    <div className="resource-container youtube bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaYoutube className="mr-2 text-red-500" /> 📺 YouTube Videos
      </h2>

      {loading && <p className="text-gray-500">Loading videos...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && videos.length > 0 ? (
        <ul className="resource-list space-y-3">
          {videos.map((video) => (
            <li key={video.id.videoId} className="hover:bg-gray-100 rounded-md p-2">
              <a
                href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {video.snippet.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        !error && (
          <p className="text-gray-500">No videos found for this query.</p>
        )
      )}
    </div>
  );
};

export default YouTubeResults;