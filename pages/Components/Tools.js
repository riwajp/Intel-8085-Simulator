import React, { useState } from "react";
import { isHex } from "../../utils";

const Tools = ({ memory, setMemory }) => {
  const [memory_form_data, setMemoryFormData] = useState({
    address: "",
    data: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("ss");

    if (isHex(memory_form_data.address, 4) && isHex(memory_form_data.data, 2)) {
      setMemory({
        ...memory,
        [memory_form_data.address]: memory_form_data.data,
      });
      setMemoryFormData({ address: "", data: "" });
    }
  };
  return (
    <div className="tools-container">
      <div className="memory-container-title">Tools</div>
      <div className="memory-slots">
        <div className="tool-block">
          <div className="tool-title">Edit Memory</div>
          <form onSubmit={handleSubmit}>
            <input
              value={memory_form_data.address}
              onChange={(e) =>
                setMemoryFormData({
                  ...memory_form_data,
                  address: e.target.value,
                })
              }
              maxLength={4}
              placeholder="Memory Address"
              className="tool-input"
            />
          </form>
          <form onSubmit={handleSubmit}>
            <input
              value={memory_form_data.data}
              onChange={(e) =>
                setMemoryFormData({ ...memory_form_data, data: e.target.value })
              }
              maxLength={2}
              placeholder="Data"
              className="tool-input"
            />
            <input type="Submit" value="Enter" className="tool-input-submit" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Tools;
