import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import axios from "axios";

const GitHubResults = ({ query }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;

    const fetchRepos = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `https://api.github.com/search/repositories`,
          {
            params: {
              q: `${query} in:name`,
              per_page: 5,
            },
          }
        );

        setRepos(res.data.items || []);
      } catch (err) {
        console.error("Error fetching GitHub Repos:", err);
        setError("Failed to fetch GitHub repositories.");
        setRepos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [query]);

  return (
    <div className="resource-container github bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <FaGithub className="mr-2 text-gray-700" /> 🧑‍💻 GitHub Repositories
      </h2>

      {loading && <p className="text-gray-500">Loading repositories...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && repos.length > 0 ? (
        <ul className="resource-list space-y-3">
          {repos.map((repo) => (
            <li key={repo.id} className="hover:bg-gray-100 rounded-md p-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline flex items-center"
              >
                {repo.full_name}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        !loading &&
        !error && (
          <p className="text-gray-500">
            No repositories found for this query.
          </p>
        )
      )}
    </div>
  );
};

export default GitHubResults;