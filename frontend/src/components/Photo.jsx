import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePhoto, getPhoto } from "../api";
import Home from "./Home";

const Photo = () => {
  let { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getPhoto(id);
        setPhoto(data[0]);
      } catch (error) {
        console.error("Error in Photo component:", error.message);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async (id) => {
    try {
      const result = await deletePhoto(id);

      if (result.success) {
        navigate("/");
      }
      console.log(result.message);
    } catch (error) {
      console.error("Error deleting photo:", error.message);
    }
  };

  return photo ? (
    <div>
      <h2 className="text-2xl font-bold mb-2 text-slate-700 ml-4">
        Photo Details
      </h2>
      <div className="flex items-start justify-between bg-gray-100 p-2 rounded my-2 mb-4 drop-shadow">
        <div>
          <div className="flex gap-2 items-center">
            <span className="text-slate-100 inline-block h-12 w-12 flex items-center justify-center rounded-full uppercase font-bold bg-slate-700">
              {photo.username[0]}
            </span>
            <div>
              <p className="capitalize text-xl font-semibold">
                {photo.username}
              </p>
              <p className="text-sm text-slate-500">
                {new Date(photo.last_updated).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </p>
            </div>
          </div>
          <p className="font-semibold mt-4 ml-4 text-slate-600">
            PhotoID: {id}
          </p>

          {!!photo.tags.length && (
            <div className="flex gap-1 my-1 ml-4 items-center">
              <p className="font-semibold text-slate-600">Tags: </p>
              {photo.tags.map((t, i) => (
                <span
                  key={i}
                  className="bg-red-400 text-slate-100 rounded-full p-0.5 px-3 text-xs py-0.25 px-1.5"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => handleDelete(photo.id)}
          className="bg-slate-700 hover:bg-slate-900 text-white font-bold py-1 px-3 rounded"
        >
          Delete
        </button>
      </div>
      <div key={photo.id} className="drop-shadow">
        <img src={photo.image_url} alt={photo.id} className="w-full rounded" />
      </div>
      <p className="text-2xl font-bold mt-4 mb-2 text-slate-700">View More...</p>
      <Home excludeId={photo.id} />
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default Photo;
