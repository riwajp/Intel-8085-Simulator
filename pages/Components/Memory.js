import React from "react";

function Memory({ memory }) {
  console.log(memory);
  return (
    <div className="memory-container">
      <div className="memory-container-title">Memory</div>
      <div className="memory-slots">
        <div className="memory-slots-title-container">
          <div className="memory-slots-title-address">Address</div>
          <div className="memory-slots-title-data">Data</div>
        </div>
        {Object.keys(memory).map((m) => (
          <div className="memory-element">
            <div className="memory-address">{m.toUpperCase()}</div>
            <div className="memory-data">{memory[m]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Memory;
