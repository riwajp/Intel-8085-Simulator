import React, { useRef } from "react";

const CodeEditor = ({ execute }) => {
  const div_ref = useRef();
  return (
    <div className="code-container">
      <div className="code-container-head">
        <div className="code-container-title">Code Editor</div>
        <button
          onClick={() => execute(div_ref.current.innerText)}
          className="execute-button"
        >
          Execute
        </button>
      </div>
      <div contentEditable={true} ref={div_ref} className="code-editor">
        <br />
        hlt
      </div>
    </div>
  );
};

export default CodeEditor;
