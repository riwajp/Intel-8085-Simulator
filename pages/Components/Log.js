import React from "react";

const Log = ({ logs }) => {
  return (
    <div className="logs-container">
      <div className="logs-container-title">Logs</div>
      <div className="log-elements">
        {logs.map((l, i) => (
          <div className="log-element">
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
