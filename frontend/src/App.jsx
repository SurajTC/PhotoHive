import { useEffect, useState } from "react";
import "./App.css";
import { getPhotos, putPhoto, deletePhoto } from "./api";
import ImageUpload from "./components/ImageUpload";

function sortByDescending(a, b) {
  const dateA = new Date(a.last_updated);
  const dateB = new Date(b.last_updated);

  // Compare the dates in descending order
  return dateB - dateA;
}

// Custom hook for debounce
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

const App = () => {
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
          setPhotos(sortedData);
        }
      } catch (error) {
        console.error("Error in ImageGallery component:", error.message);
      }
    };

    fetchData();
  }, [photosValid, debouncedSearchTerm]);

  const handleUpload = async (image, username, tags) => {
    setPhotosValid(false);

    const result = await putPhoto(image, username, tags);

    console.log(result.message);

    if (result.success) {
      setPhotosValid(true);
    }
  };

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
    <main>
      <h2>PhotoHive - Photo Gallery App</h2>

      <div>
        <input
          type="text"
          placeholder="Search photos..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <ImageUpload onUpload={handleUpload} />

      <div>
        {photos.map((p) => (
          <div key={p.id}>
            <img src={p.thumb_url} alt={p.id} />
            <p>{p.username}</p>
            <p>{p.id}</p>
            <div>
              {p.tags.map((t, i) => (
                <span key={i}>{t}&emsp;</span>
              ))}
            </div>
            <button onClick={() => handleDelete(p.id)}>Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default App;
