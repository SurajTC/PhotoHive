import { useEffect, useState } from "react";
import { getPhotos, deletePhoto } from "../api";
import { Link } from "react-router-dom";
import DeleteIcon from "../asset/delete.svg";
import PropTypes from "prop-types";
import SearchIcon from "../asset/search.svg";

function sortByDescending(a, b) {
  const dateA = new Date(a.last_updated);
  const dateB = new Date(b.last_updated);

  return dateB - dateA;
}

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Home = ({ excludeId }) => {
  const [photos, setPhotos] = useState([]);
  const [photosValid, setPhotosValid] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (photosValid) {
          const { data } = await getPhotos(debouncedSearchTerm);
          const sortedData = data.slice().sort(sortByDescending);
          if (excludeId) {
            setPhotos(sortedData.filter((i) => i.id !== excludeId));
          } else {
            setPhotos(sortedData);
          }
        }
      } catch (error) {
        console.error("Error in ImageGallery component:", error.message);
      }
    };

    fetchData();
  }, [photosValid, debouncedSearchTerm, excludeId]);

  const handleDelete = async (id) => {
    try {
      setPhotosValid(false);

      const result = await deletePhoto(id);

      console.log(result.message);

      if (result.success) {
        setPhotosValid(true);
      }
    } catch (error) {
      console.error("Error deleting photo:", error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      {!excludeId && (
        <>
          <div className="flex gap-2 items-start justify-center">
            <div className="bg-slate-700 rounded p-2 drop-shadow">
              <img src={SearchIcon} alt="Search" className="w-6 h-6" />
            </div>
            <input
              type="text"
              placeholder="Search by username or topic.."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 mb-4 rounded drop-shadow bg-gray-100 accent-teal-700"
            />
          </div>
        </>
      )}
      {photos.length ? (
        <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 [&>div:not(:first-child)]:mt-4 px-4 lg:px-0">
          {photos.map((p) => (
            <div
              key={p.id}
              className="rounded group overflow-hidden  cursor-pointer  relative"
            >
              <Link to={`/photos/${p.id}`}>
                <img
                  src={p.thumb_url}
                  alt={p.id}
                  className="w-full rounded drop-shadow group-hover:drop-shadow-xl"
                />
              </Link>
              <div className="bottom-0 left-0 px-2 pt-1">
                <Link to={`/photos/${p.id}`}>
                  <div className="flex gap-2 items-center">
                    <span className="text-slate-300 inline-block h-9 w-9 flex items-center justify-center rounded-full uppercase font-bold bg-slate-700">
                      {p.username[0]}
                    </span>
                    <div>
                      <p className="capitalize text-lg font-semibold text-slate-900">
                        {p.username}
                      </p>
                      <p className="text-xs text-slate-700">
                        {new Date(p.last_updated).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {!!p.tags.length && (
                    <div className="flex gap-1 pt-2 items-center mb-1">
                      {p.tags.map((t, i) => (
                        <span
                          key={i}
                          className="bg-red-400 text-slate-100 p-0.5 px-3 rounded-full text-xs py-0.25 px-1.5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-0 right-0 bg-slate-700 hover:bg-red-400 p-1.5 m-2 rounded-full"
              >
                <img src={DeleteIcon} alt="Delete" className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center text-2xl font-bold">
          Loading...
        </div>
      )}
    </div>
  );
};

Home.propTypes = {
  excludeId: PropTypes.string,
};

export default Home;
