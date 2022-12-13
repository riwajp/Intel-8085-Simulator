import React from "react";

const Log = ({
  logs,
  setMemory,
  memory_states,
  setRegisters,
  register_states,
}) => {
  return (
    <div className="logs-container">
      <div className="logs-container-title">Logs</div>
      <div className="log-elements">
        {logs.map((l, i) => (
          <div
            className="log-element"
            onClick={() => {
              setMemory(memory_states[i]);
              setRegisters(register_states[i]);
            }}
          >
            <span>
              <span className="log-line">Line {i + 1}</span>
              <span className={`${l.type}`}> {l.message}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Log;
