const URL = "https://31mjo24vcl.execute-api.us-east-1.amazonaws.com/prod";

const getPhotos = async (search) => {
  try {
    const response = await fetch(`${URL}/photos?search=${search}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching photos:", error.message);
    throw error;
  }
};

const getPhoto = async (id) => {
  try {
    const response = await fetch(`${URL}/photos/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching photos:", error.message);
    throw error;
  }
};

const putPhoto = async (image, username, tags) => {
  try {
    // Convert image to base64 string
    const base64Image = image.split(",")[1];

    // Prepare the request body
    const requestBody = {
      image: base64Image,
      metadata: {
        username,
        tags,
      },
    };

    // Send PUT request to the API
    const response = await fetch(`${URL}/photos`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return { success: true, message: "Image uploaded successfully!" };
  } catch (error) {
    console.error("Error uploading image:", error.message);
    return { success: false, message: "Error uploading image" };
  }
};

const deletePhoto = async (id) => {
  try {
    const response = await fetch(`${URL}/photos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Add any additional headers if needed
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }

    const { data } = await response.json();

    return { success: true, message: `${data} deleted successfully!` };
  } catch (error) {
    console.error("Error deleting photo:", error.message);
    throw error;
  }
};

const getTags = async (search) => {
  try {
    const response = await fetch(`${URL}/tags?search=${search}`);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching photos:", error.message);
    throw error;
  }
};

export { getPhotos, putPhoto, deletePhoto, getPhoto, getTags };
