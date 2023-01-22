import React, { useRef, useState, useEffect } from "react";

const CodeEditor = ({
  execute,
  setCurrentAddress,
  current_address,
  speed,
  setSpeed,
  code_div_ref,
}) => {
  let handleChange = (val) => {
    if (val.length <= 4) {
      setCurrentAddress(val);
    }
  };
  const [lines, setLines] = useState([]);
  const [code, setCode] = useState("mvi a 90\ninr a\nhlt");

  const div_ref = code_div_ref;
  useEffect(() => {
    execute(div_ref.current?.innerText);

    let code = div_ref?.current?.innerText;
    let code_array = code?.split("\n");
    setLines(code_array);
    document.addEventListener("keyup", () => {
      let code = div_ref?.current?.innerText;
      let code_array = code?.split("\n");
      setLines(code_array);
    });
  }, []);

  const dispatchExecute = () => {
    let code = div_ref?.current?.innerText;
    let code_array = code?.split("\n");
    code_array = code_array.filter((c) => c != "");

    let new_code = code_array.join("\n");
    div_ref.current.innerText = new_code;
    execute(div_ref.current.innerText);
  };
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

        <div className="start-from-container">
          <div className="address-label">Speed</div>
          <input
            onChange={(e) => setSpeed(e.target.value)}
            value={speed}
            className="address-input"
          />
        </div>
        <button onClick={() => dispatchExecute()} className="execute-button">
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
          spellCheck={false}
        >
          mvi a 69
          <br />
          hlt
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
