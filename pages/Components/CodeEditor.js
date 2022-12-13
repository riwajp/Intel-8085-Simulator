import React, { useRef, useState, useEffect } from "react";
import { dec, hex, isHex } from "../../utils";

const CodeEditor = ({ execute, setCurrentAddress, current_address }) => {
  let handleChange = (val) => {
    if (val.length <= 4) {
      setCurrentAddress(val);
    }
  };
  const [lines, setLines] = useState([]);

  const div_ref = useRef();
  useEffect(() => {
    let code = div_ref?.current.innerText;
    let code_array = code?.split("\n");
    setLines(code_array);
    document.addEventListener("keyup", () => {
      let code = div_ref?.current.innerText;
      console.log(code);
      let code_array = code?.split("\n");
      console.log(code_array);
      setLines(code_array);
    });
  }, []);
  return (
    <div className="code-container">
      <div className="code-container-head">
        <div className="code-container-title">Code Editor</div>
        <div className="start-from-container">
          <div className="address-label">Start Address</div>
          <input
            onChange={(e) => handleChange(e.target.value)}
            value={current_address}
            className="address-input"
          />
        </div>
        <button
          onClick={() => execute(div_ref.current.innerText)}
          className="execute-button"
        >
          Execute
        </button>
      </div>
      <div className="code-editor">
        <div className="line-number">
          {lines?.map((l, i) => (
            <div>{i + 1}</div>
          ))}
        </div>
        <div
          contentEditable={true}
          ref={div_ref}
          className="code-editor-editable"
        >
          <br />
          hlt
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
