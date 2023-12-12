import PropTypes from "prop-types";
import Logo from "../asset/favicon.svg";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ImageUpload from "./ImageUpload";
import { putPhoto } from "../api";

const Modal = ({ showModal, closeModal }) => {
  const navigate = useNavigate();
  const handleUpload = async (image, username, tags) => {
    const result = await putPhoto(image, username, tags);

    if (result.success) {
      console.log(result.message);
      closeModal();
      navigate("/");
    }
  };
  return showModal ? (
    <div>
      <div className="fixed block w-full h-full top-0 left-0 bg-black opacity-50 z-10"></div>
      <div className="fixed block w-full h-full top-0 left-0 z-20">
        <div className="relative max-w-screen-lg w-2/4 bg-white mt-36 rounded p-4 mx-auto ">
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-slate-600">Upload Photo</p>
            <div
              className="cursor-pointer hover:bg-slate-200 text-slate-600 font-bold p-1 rounded-full"
              onClick={closeModal}
            >
              <span className="flex w-4 h-4 items-center justify-center">
                X
              </span>
            </div>
          </div>
          <ImageUpload onUpload={handleUpload} />
        </div>
      </div>
    </div>
  ) : null;
};

// flex items-center justify-center
const Shell = ({ children }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <main className="min-h-screen max-h-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
      <div className="bg-gray-100 z-30">
        <section className="max-w-screen-lg mx-auto py-2 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <img src={Logo} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">PhotoHive</h2>
                <p className="text-xs">Photo Gallery App</p>
              </div>
            </div>
          </Link>
          <button
            className="bg-red-400 hover:bg-red-500 text-slate-100 font-bold py-1 px-3 rounded"
            onClick={openModal}
          >
            Upload
          </button>
        </section>
      </div>
      <section className="min-w-full overflow-y-scroll">
        <div className="max-w-screen-lg mx-auto p-0.5 py-4">{children}</div>
      </section>
      <Modal showModal={showModal} closeModal={closeModal} />
    </main>
  );
};

Shell.propTypes = {
  children: PropTypes.node,
};

Modal.propTypes = {
  showModal: PropTypes.bool,
  closeModal: PropTypes.func,
};

export default Shell;
