import React, { useState, useEffect } from "react";
import { useUserContext } from "../../../context/user/user.context";
import { useAuth } from "../../../context/auth.context";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileForm = ({ name: initialName, email: initialEmail }) => {
  const { updateUserPartial, getUserById } = useUserContext();
  const { user } = useAuth();

  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [deleteProfileImage, setDeleteProfileImage] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      if (user && user.data && user.data.id) {
        const userData = await getUserById(user.data.id);
        setUserId(userData._id);
        setName(userData.username);
        setEmail(userData.email);

        if (userData.userImage) {
          setPreviewProfileImage(transformCloudinaryURL(userData.userImage));
        }
      }
    };

    fetchUserId();
  }, [getUserById, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        const userData = {
          username: name,
          email,
          userImage: deleteProfileImage ? null : profileImage,
        };

        await updateUserPartial(userId, userData);
        toast.success("Changes saved successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        if (deleteProfileImage) {
          setProfileImage(null);
          setPreviewProfileImage(null);
          setDeleteProfileImage(false); // Reset flag after saving changes
        }

        window.location.reload();
      } catch (error) {
        toast.error("Failed to save changes. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      console.error("Couldn't get user ID");
    }
  };

  const handleImageChange = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      setProfileImage(imageFile);
      setPreviewProfileImage(URL.createObjectURL(imageFile));
      setDeleteProfileImage(false); // Reset delete flag if new image is selected
    }
  };

  const handleDeleteImage = async () => {
    setProfileImage(null);
    setPreviewProfileImage(null);
    setDeleteProfileImage(true);

    try {
      if (userId) {
        await updateUserPartial(userId, { userImage: null });
        toast.success("Image deleted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error("Failed to delete image. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    window.location.reload();
  };
  const transformCloudinaryURL = (imageUrl) => {
    return imageUrl; // Transformación si es necesario
  };

  return (
    <div className="md:mt-3 mt-5 mx-4 mb-2 flex  rounded-lg">
      <ToastContainer />
      <div className="max-w-lg mx-auto bg-gradient-to-b from-purple-500 to-blue-500 rounded-lg shadow-lg py-4 px-6 md:px-10">
        <h1 className="text-center font-black text-white md:text-xl lg:text-2xl">
          Edit Profile
        </h1>
        {previewProfileImage && (
          <div className="flex justify-center items-center space-x-4 mt-2">
            <div className="w-20 h-20">
              <img
                src={previewProfileImage}
                alt="Preview"
                className="w-full h-full rounded-full"
              />
            </div>
          </div>
        )}
        <div className="flex justify-center mt-2">
          <button
            type="button"
            className=" bg-red-500 text-white rounded-lg w-28 hover:bg-red-600 h-6 font-semibold"
            onClick={handleDeleteImage}
          >
            Delete Image
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label htmlFor="name" className="text-base font-bold text-black">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="mt-2 p-1 text-sm w-full border-gray-300 rounded-md focus:outline-none focus:ring-purple-300 focus:border-purple-300 hover:bg-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="email" className="text-base font-bold text-black">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-2 p-1 w-full text-sm border-gray-300 rounded-md focus:outline-none focus:ring-purple-300 focus:border-purple-300 hover:bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="profileImage"
              className="text-base font-bold text-sblack "
            >
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              className="mt-2 w-full border text-sm border-white bg-white hover:bg-gray-100"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex items-center justify-center mt-5">
            <button
              className="bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-900 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
