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
        {Object.keys(registers ? registers : {})
          ?.filter((k) => k != "M")
          ?.map((r) => (
            <div className="memory-element" key={r}>
              <div className="memory-address">{r.toUpperCase()}</div>
              <div className="memory-data">
                {registers[r].length >= 3
                  ? registers[r].slice(1)
                  : registers[r].padStart(2, "0")}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Registers;
