import styles from "../styles/Home.module.css";
import { memo, useState } from "react";
import codes_json from "../codes";

import Memory from "./Components/Memory";
import Registers from "./Components/Registers";
import { inr, hexCode, isHex, checkSyntax } from "../utils";
import CodeEditor from "./Components/CodeEditor";
import Log from "./Components/Log";
import Flag from "./Components/Flag";
import Tools from "./Components/Tools";
export default function Home() {
  const [registers, setRegisters] = useState({
    A: "00",
    B: "00",
    C: "00",
    D: "00",
    E: "00",
    H: "00",
    L: "00",
  });

  const [current_address, setCurrentAddress] = useState("6969");
  const [memory, setMemory] = useState({});
  const [logs, setLogs] = useState([]);
  //load the program into the memory============================================================
  const load = (code) => {
    let code_lines_separated = code.split("\n");

    var address = current_address;
    let memory_temp = memory;

    for (let i in code_lines_separated) {
      var line = checkSyntax(code_lines_separated[i]);

      if (!Array.isArray(line)) {
        return `Error on line ${parseInt(i) + 1}: ${line}`;
      }
      let hex_code = hexCode(line);
      console.log(hex_code);

      memory[address] = hex_code.opCode;
      address = inr(address);
      if (hex_code.opCode == "EF") {
        return memory_temp;
      }

      if (hex_code.data != "") {
        memory[address] = hex_code.data.substring(0, 2);

        address = inr(address);
        if (hex_code.data.length == 4) {
          memory[address] = hex_code.data.substring(2, 5);
          address = inr(address);
        }
      }
    }
    setMemory(memory_temp);
    return `You missed HLT!`;
  };

  //Execute the code ============================================================
  const execute = (code) => {
    let logs_temp = [];
    let memory = load(code.toUpperCase().trim());
    if (typeof memory != "object") {
      setLogs([{ type: "error", message: memory }]);
      console.log(memory);
      return;
    }
    let registers_temp = registers;

    var program_counter = current_address;
    while (memory[program_counter] != "EF") {
      try {
        var code = memory[program_counter].toUpperCase();
      } catch {
        console.log("Did you miss HLT?");
        return;
      }
      let code_text = codes_json.filter((c) => c.opCode == code)[0].label;

      let code_text_array = code_text.split(" ");

      //mvi==============================================================================================
      if (code_text_array[0] == "MVI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] != "M") {
          registers_temp = {
            ...registers_temp,
            [code_text_array[1]]: memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored given data ${memory[program_counter]} in register ${code_text_array[1]}.`,
          });
        } else if (code_text_array[1] == "M") {
          memory = {
            ...memory,
            [registers_temp["H"] + registers_temp["L"]]:
              memory[program_counter],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored given data ${
              memory[program_counter]
            } in memory address pointed by HL i.e. ${
              registers_temp["H"] + registers_temp["L"]
            }.`,
          });
        }
        program_counter = inr(program_counter);
      }
      //========================================================================================================

      //mov=====================================================================================================

      if (code_text_array[0] == "MOV") {
        program_counter = inr(program_counter);

        if (code_text_array[1] != "M") {
          if (code_text_array[2] != "M") {
            registers_temp = {
              ...registers_temp,
              [code_text_array[1]]: registers_temp[code_text_array[2]],
            };
            logs_temp.push({
              type: "success",
              code: code_text_array.join(" "),
              message: `Moved the data of register ${code_text_array[2]} i.e ${
                registers_temp[code_text_array[2]]
              } into register ${code_text_array[1]}`,
            });
          } else {
            register_temp = {
              ...registers_temp,
              [code_text_array[1]]:
                memory[[registers_temp["H"] + registers_temp["L"]]],
            };

            logs_temp.push({
              type: "success",
              code: code_text_array.join(" "),
              message: `Moved the data (${
                memory[[registers_temp["H"] + registers_temp["L"]]]
              }) of memory location pointed by HL(${
                registers_temp["H"] + registers_temp["L"]
              }) into register ${code_text_array[1]}`,
            });
          }
        } else {
          memory = {
            ...memory,
            [registers_temp["H"] + registers_temp["L"]]:
              registers_temp[code_text_array[2]],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Moved the data stored by register ${
              code_text_array[2]
            } i.e ${
              registers_temp[code_text_array[2]]
            } into memory location pointed by HL i.e. ${
              registers_temp["H"] + registers_temp["L"]
            }`,
          });
        }
      }

      //XCHG============================================================
      if (code_text_array[0] == "XCHG") {
        program_counter = inr(program_counter);
        registers_temp = {
          ...registers_temp,
          H: registers_temp["D"],
          L: registers_temp["E"],
          D: registers_temp["H"],
          E: registers_temp["L"],
        };

        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Exchanged the data between DE and HL register.`,
        });
      }

      //LXI==================================================================
      if (code_text_array[0] == "LXI") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          registers_temp = {
            ...registers_temp,
            B: memory[program_counter],
            C: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into BC register pair.`,
          });
        }
        if (code_text_array[1] == "D") {
          registers_temp = {
            ...registers_temp,
            D: memory[program_counter],
            E: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into DE register pair.`,
          });
        }
        if (code_text_array[1] == "H") {
          registers_temp = {
            ...registers_temp,
            H: memory[program_counter],
            L: memory[inr(program_counter)],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the given data ${memory[program_counter]}${
              memory[inr(program_counter)]
            } into HL register pair.`,
          });
        }

        program_counter = inr(inr(program_counter));
      }
      //LDAX==============================================================
      if (code_text_array[0] == "LDAX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          registers_temp = {
            ...registers_temp,
            A: memory[registers_temp["B"] + registers_temp["C"]],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the data stored in memory location pointed by register BC(${
              registers_temp["B"] + registers_temp["C"]
            }) i.e. ${
              memory[registers_temp["B"] + registers_temp["C"]]
            } into register 
            A`,
          });
        }

        if (code_text_array[1] == "D") {
          registers_temp = {
            ...registers_temp,
            A: memory[registers_temp["D"] + registers_temp["E"]],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Loaded the data stored in memory location pointed by register DE(${
              registers_temp["D"] + registers_temp["E"]
            }) i.e. ${
              memory[registers_temp["D"] + registers_temp["E"]]
            } into register 
            A`,
          });
        }
      }

      if (code_text_array[0] == "LHLD") {
        program_counter = inr(program_counter);

        registers_temp = {
          ...registers_temp,
          L: memory[memory[program_counter] + memory[inr(program_counter)]],
          H: memory[
            inr(memory[program_counter] + memory[inr(program_counter)])
          ],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Loaded the data stored in given memory location (${
            memory[program_counter] + memory[inr(program_counter)]
          }) i.e ${
            memory[memory[program_counter] + memory[inr(program_counter)]]
          } in L and data stored in given memory location (${inr(
            memory[program_counter] + memory[inr(program_counter)]
          )}) i.e ${
            memory[inr(memory[program_counter] + memory[inr(program_counter)])]
          } in H.`,
        });

        program_counter = inr(inr(program_counter));
      }

      if (code_text_array[0] == "LDA") {
        program_counter = inr(program_counter);
        registers_temp = {
          ...registers_temp,
          A: memory[memory[program_counter] + memory[inr(program_counter)]],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Loaded the data stored in given memory location ${
            memory[program_counter] + memory[inr(program_counter)]
          } i.e ${
            memory[memory[program_counter] + memory[inr(program_counter)]]
          } into register A.`,
        });
        program_counter = inr(inr(program_counter));
      }

      if (code_text_array[0] == "STAX") {
        program_counter = inr(program_counter);
        if (code_text_array[1] == "B") {
          memory = {
            ...memory,
            [registers_temp["B"] + registers_temp["C"]]: registers_temp["A"],
          };
          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored th data in register A(${
              registers_temp["A"]
            } into memory location pointed by BC register pair i.e ${
              registers_temp["B"] + registers_temp["C"]
            }.)`,
          });
        }

        if (code_text_array[1] == "D") {
          memory = {
            ...memory,
            [registers_temp["D"] + registers_temp["E"]]: registers_temp["A"],
          };

          logs_temp.push({
            type: "success",
            code: code_text_array.join(" "),
            message: `Stored th data in register A(${
              registers_temp["A"]
            } into memory location pointed by DE register pair i.e ${
              registers_temp["D"] + registers_temp["E"]
            }.)`,
          });
        }
      }

      if (code_text_array[0] == "SHLD") {
        program_counter = inr(program_counter);
        memory = {
          ...memory,
          [memory[program_counter] + memory[inr(program_counter)]]:
            registers_temp["L"],
          [memory[inr(memory[program_counter] + memory[inr(program_counter)])]]:
            registers_temp["H"],
        };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Stored the content of register L(${
            registers_temp["L"]
          }) into given memory location ${
            memory[program_counter] + memory[inr(program_counter)]
          } and content of register H(${
            registers_temp["L"]
          } in memory location ${inr(
            memory[program_counter] + memory[inr(program_counter)]
          )}).`,
        });
        program_counter = inr(inr(program_counter));
      }
      if (code_text_array[0] == "STA") {
        program_counter = inr(program_counter);
        memory = { ...memory, [memory[program_counter]]: registers_temp["A"] };
        logs_temp.push({
          type: "success",
          code: code_text_array.join(" "),
          message: `Stored the content of register A i.e ${registers_temp["A"]} into given memory location ${memory[program_counter]}`,
        });

        program_counter = inr(inr(program_counter));
      }
    }
    setMemory(memory);
    setRegisters(registers_temp);
    setLogs(logs_temp);
  };

  return (
    <div className="body-container">
      <div className="main-container">
        <CodeEditor execute={(code) => execute(code)} />
        <Memory memory={memory} />

        <Registers registers={registers} />

        <Tools />
      </div>
      <div className="bottom-container">
        <Log logs={logs} />
        <Flag />
      </div>
    </div>
  );
}
