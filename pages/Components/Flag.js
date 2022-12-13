import React from "react";

const Flag = ({ flags }) => {
  return (
    <div className="flag-container">
      <div className="flag-container">
        <div className="flag-container-title">Flags</div>
        <div className="flag-body">
          {Object.keys(flags ? flags : {}).map((f) => (
            <div>
              {f}: {flags[f]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Flag;
