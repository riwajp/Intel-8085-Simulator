import React from "react";
import { dec } from "../../utils";

function Memory({ memory, compilation_memory }) {
  return (
    <div className="memory-container">
      <div className="memory-container-title">Memory</div>
      <div className="memory-slots">
        <div className="memory-slots-title-container">
          <div className="memory-slots-title-address">Address</div>
          <div className="memory-slots-title-data">Data</div>
        </div>
        {Object.keys(memory ? memory : {})
          ?.sort((m, n) => dec(m) - dec(n))
          ?.map((m) => (
            <div
              className={`memory-element ${
                Object.keys(compilation_memory).includes(m) ? "compilation" : ""
              }`}
            >
              <div className="memory-address">{m.toUpperCase()}</div>
              <div className="memory-data">{memory[m]}</div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Memory;
