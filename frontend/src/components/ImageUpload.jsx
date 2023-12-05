import { useState } from "react";
import PropTypes from "prop-types";

const ImageUpload = ({ onUpload }) => {
  const [image, setImage] = useState(null);
  const [username, setUsername] = useState("");
  const [tags, setTags] = useState([]);

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

  const handleTagsChange = (e) => {
    // Assuming that tags are entered as a comma-separated string
    const tagsArray = e.target.value.split(",").map((tag) => tag.trim());
    setTags(tagsArray);
  };

  const handleUpload = async () => {
    onUpload(image, username, tags);

    setImage(null);
    setUsername("");
    setTags([]);
  };

  return (
    <div>
      <h1>Image Upload</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <br />
      <label>Username:</label>
      <input type="text" value={username} onChange={handleUsernameChange} />
      <br />
      <label>Tags (comma-separated):</label>
      <input type="text" value={tags.join(",")} onChange={handleTagsChange} />
      <br />
      <button onClick={handleUpload}>Upload Image</button>
    </div>
  );
};

ImageUpload.propTypes = {
  onUpload: PropTypes.func.isRequired,
};

export default ImageUpload;
