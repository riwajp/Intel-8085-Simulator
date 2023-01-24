import React, { useState } from "react";
import test_codes from "../../testCodes.json";

function Test({ execute, registers, flags }) {
  let errors = [];

  const [code_index, setCodeIndex] = useState(0);
  if (code_index >= 1) {
    let current_case = test_codes[code_index - 1];

    let err = 0;
    for (let key in flags) {
      if (current_case.flags[key] != flags[key]) {
        err = 1;
      }
    }

    for (let key in registers) {
      if (current_case.registers[key] != registers[key]) {
        err = 2;
      }
    }

    if (err != 0) {
      let err_details = {
        type: err,
        expected: [current_case.registers, current_case.flags],
        obtained: [registers, flags],
      };
      errors.push(err_details);
      console.log(err_details, current_case.code);
    }

    console.log(
      `${errors.filter((e) => e.type == 1).length} flag errors, ${
        errors.filter((e) => e.type == 2).length
      } registers errors.`
    );
  }
  if (code_index < test_codes.length) {
    let current_case = test_codes[code_index];

    execute(current_case.code);

    setCodeIndex((code_index) => ++code_index);
  }
  return <div>Test</div>;
}

export default Test;
