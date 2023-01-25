import React, { useEffect } from "react";
import test_codes from "../../testCodes.json";

function Test({ execute }) {
  useEffect(async () => {
    let errors = [];
    for (let code_index in test_codes) {
      let current_case = test_codes[code_index];

      let { registers, flags } = await execute(current_case.code);

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
    }
    console.log(errors);
    console.log(
      `${errors.filter((e) => e.type == 1).length} flag errors, ${
        errors.filter((e) => e.type == 2).length
      } registers errors.`
    );
  }, []);

  return <div>Test</div>;
}

export default Test;
