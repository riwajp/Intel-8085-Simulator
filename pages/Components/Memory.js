import React, { useEffect, useState, useRef, memo } from "react";
import { isHex, inr } from "../../utils";

function Memory({ address, memory, setMemory, setCurrentAddress }) {
  const [data, setData] = useState(memory[address]);

  useEffect(() => {
    setData(memory[address] ? memory[address] : "");
  }, [address]);

  useEffect(() => {
    if (isHex(data, 2)) {
      setMemory({ ...memory, [address]: data.padStart(2, "0") });
    }
  }, [data]);
  return (
    <div>
      <h2>Memory</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isHex(data, 2)) {
            setCurrentAddress(inr(address));
          }
        }}
      >
        <div>Address: {address}</div>
        Data: <input onChange={(e) => setData(e.target.value)} value={data} />
      </form>
    </div>
  );
}

export default Memory;
