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
    }
  };
  return (
    <div className="tools-container">
      <div className="memory-container-title">Tools</div>
      <div className="memory-slots">
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
          />
        </form>
        <form onSubmit={handleSubmit}>
          <input
            value={memory_form_data.data}
            onChange={(e) =>
              setMemoryFormData({ ...memory_form_data, data: e.target.value })
            }
            maxLength={2}
          />
        </form>
      </div>
    </div>
  );
};

export default Tools;
