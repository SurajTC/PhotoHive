import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getTags } from "../api";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [tags, setTags] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);

  useEffect(() => {
    // Fetch tag suggestions based on the current input
    const fetchTagSuggestions = async () => {
      try {
        const { data } = await getTags(tag);
        console.log("HERE", data);
        setTagSuggestions(data);
      } catch (error) {
        console.error("Error fetching tag suggestions:", error);
      }
    };

    // Call the API only if there are tags
    if (tag.length > 0) {
      fetchTagSuggestions();
    } else {
      setTagSuggestions([]);
    }
  }, [tag]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Add tag when Enter key is pressed
    if (e.key === "Enter" && tag.trim() !== "") {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };

  const handleAddButtonClick = () => {
    // Add tag when the "Add" button is clicked
    if (tag.trim() !== "") {
      setTags([...tags, tag.trim()]);
      setTag("");
    }
  };

  const handleTagSelect = (selectedTag) => {
    setTags((prev) => [...prev, selectedTag]);
    setTag("");
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  // const handleTagsChange = (e) => {
  //   // Assuming that tags are entered as a comma-separated string
  //   const tagsArray = e.target.value.split(",").map((tag) => tag.trim());
  //   setTags(tagsArray);
  // };

  const handleUpload = async () => {
    onUpload(image, username, tags);

    setImage(null);
    setUsername("");
    setTags([]);
  };

  return (
    <div className="p-4">
      <label className="text-slate-800 my-2 flex items-center justify-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="accent-teal-700 grow bg-slate-100 text-slate-600 p-1 my-2 drop-shadow file:hidden 
          "
        />
        <span className="bg-slate-700 hover:bg-slate-900 text-slate-100 font-bold py-1 px-3 rounded">
          Choose File
        </span>
      </label>
      <label className="text-slate-800 my-2">
        Username
        <input
          type="text"
          value={username}
          onChange={handleUsernameChange}
          className="accent-teal-700 bg-slate-100 w-full p-1 my-2 drop-shadow"
        />
      </label>
      <label className="text-slate-800 ">
        Tags:
        <div className="flex gap-2 my-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="flex items-center justify-center bg-red-400 text-slate-100 rounded-full p-0.5 px-3 text-sm py-0.25 px-1.5"
            >
              <span>{tag}</span>
              <span
                className="text-red-300 font-bold ml-1 cursor-pointer"
                onClick={() => handleRemoveTag(tag)}
              >
                x
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={tag}
            onChange={handleTagChange}
            onKeyDown={handleKeyDown}
            className="accent-teal-700 bg-slate-100 w-full p-1 my-2 drop-shadow"
          />
          <button
            onClick={handleAddButtonClick}
            className="bg-slate-700 hover:bg-slate-900 text-slate-100 font-bold py-1 px-3 rounded"
          >
            Add
          </button>
        </div>
        <div className="relative w-full">
          <div className="absolute bg-slate-100 text-slate-500 w-full top-0 rounded overflow-hidden drop-shadow">
            {tagSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-0.5 px-2 hover:bg-slate-300 hover:text-slate-900 cursor-pointer"
                onClick={() => handleTagSelect(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
        {/* <div>
          {tagSuggestions.map((suggestion, index) => (
            <span key={index} className="">
              {suggestion}
            </span>
          ))}
        </div> */}
      </label>
      <button
        onClick={handleUpload}
        className="bg-red-400 mt-6 w-full hover:bg-red-500 text-white font-bold py-1 px-3 rounded"
      >
        Upload
      </button>
    </div>
  );
};

ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default ImageUpload;
