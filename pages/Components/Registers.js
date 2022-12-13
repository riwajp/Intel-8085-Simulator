import React from "react";

function Registers({ registers }) {
  return (
    <div className="registers-container">
      <div className="memory-container-title">Registers</div>
      <div className="memory-slots">
        <div className="memory-slots-title-container">
          <div className="memory-slots-title-address">Register</div>
          <div className="memory-slots-title-data">Data</div>
        </div>
        {Object.keys(registers).map((r) => (
          <div className="memory-element">
            <div className="memory-address">{r.toUpperCase()}</div>
            <div className="memory-data">{registers[r]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Registers;
