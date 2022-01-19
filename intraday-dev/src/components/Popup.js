import React, { useContext } from "react";
import { GlobalContext } from "../context/GlobalState";

export const Popup = () => {
  const { loading, imageUrl, setImageUrl } = useContext(GlobalContext);

  return (
    <div className="image-zoom-container">
      <img
        key={imageUrl}
        src={String(imageUrl)}
        onClick={() => {
          document.querySelector(".image-zoom-container").classList.remove(("block"));
        }}
      />
    </div>
  );
};
