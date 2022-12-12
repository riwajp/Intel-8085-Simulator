import React, { useState } from "react";
import { dec, isHex } from "../../utils";

function Controls({ setCurrentAddress }) {
  const [addr, setAddr] = useState();
  return (
    <div>
      <h2>Controls</h2>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isHex(addr, 4)) {
              setCurrentAddress(addr.padStart(4, "0"));
            }
          }}
        >
          Goto:
          <input
            placeholder="Go To"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}

export default Controls;
