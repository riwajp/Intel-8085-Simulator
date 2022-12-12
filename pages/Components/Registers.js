import React from "react";

function Registers({ registers }) {
  return (
    <div>
      <h2>Registers</h2>
      {Object.keys(registers).map((k) => (
        <div>
          {k}: {registers[k]}
        </div>
      ))}
    </div>
  );
}

export default Registers;
