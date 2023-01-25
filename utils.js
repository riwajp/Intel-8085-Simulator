import codes_json from "./codes.json";
const dec = (hex) => {
  return parseInt(hex, 16);
};

const hex = (decimal) => {
  return decimal.toString(16).toUpperCase();
};

const isHex = (hex, size) => {
  return dec(hex) >= 0 && dec(hex) <= 65535 && hex.length <= size;
};

const inr = (hx) => {
  if (hx.toString().toUpperCase() == "FFFF") {
    return 0x0000;
  }
  if (hx.toString().toUpperCase() == "FF") {
    return 0x00;
  }

  return hex(dec(hx) + 1)
    .padStart(hx.length, "0")
    .toUpperCase();
};
const dcr = (hx, address = 0) => {
  if (hx.toString().toUpperCase() == "0") {
    if (address) {
      return 0xffff;
    }

    return 0xff;
  }

  return hex(dec(hx) - 1)
    .padStart(hx.length, "0")
    .toUpperCase();
};

const hexCode = (code) => {
  var opCodes = [];
  for (let c of codes_json) {
    let input_code_formatted = code.join("").toUpperCase();
    let json_code_formatted = c.label
      .replace("Data", "")
      .replace("Address", "")
      .replace("Port-address", "")
      .replace("Label", "")
      .split(" ")
      .join("")
      .toUpperCase();
    let index = input_code_formatted.indexOf(json_code_formatted);

    if (index != -1) {
      opCodes.push({
        command: code[0].toUpperCase(),
        opCode: c.opCode,
        data: input_code_formatted.replace(json_code_formatted, ""),
      });
    }
  }
  return opCodes.length ? opCodes[opCodes.length - 1] : 0;
};

const checkSyntax = (code, labels, iteration_number) => {
  const verify = (code, labels) => {
    let code_array = code.replace(/\s+/g, " ").trim().split(" ");

    let registers = ["A", "B", "C", "D", "E", "H", "L", "M"];
    let command = code_array[0];
    var error_message = "The given command doesn't exist.";

    if (command == "MVI") {
      if (
        registers.includes(code_array[1]) &&
        isHex(code_array[2], 2) &&
        code_array[2].length == 2
      ) {
        return code_array;
      } else {
        error_message = "The arguments must be a register and a 8-bit data";
      }
    }

    if (command == "MOV") {
      if (
        registers.includes(code_array[1]) &&
        registers.includes(code_array[2]) &&
        code_array.length == 3
      ) {
        return code_array;
      } else {
        error_message = "The arguments must be two registers.";
      }
    }

    if (command == "INX" || command == "DCX" || command == "DAD") {
      if (
        code_array.length == 2 &&
        (code_array[1] == "B" || code_array[1] == "D" || code_array[1] == "H")
      ) {
        return code_array;
      } else {
        error_message = "The arguments must be register pair (B, D or H).";
      }
    }
    if (command == "LXI") {
      if (
        code_array.length == 3 &&
        (code_array[1] == "B" ||
          code_array[1] == "D" ||
          code_array[1] == "H") &&
        isHex(code_array[2], 4) &&
        code_array[2].length == 4
      ) {
        return code_array;
      } else {
        error_message =
          "The arguments must be a register pair(B, D or H) and 16 bit data";
      }
    }
    if (command == "LDAX" || command == "STAX") {
      if (
        code_array.length == 2 &&
        (code_array[1] == "B" || code_array[1] == "D")
      ) {
        return code_array;
      } else {
        error_message = "The arguments must be register pair B or D.";
      }
    }

    if (
      command == "LHLD" ||
      command == "SHLD" ||
      command == "LDA" ||
      command == "STA"
    ) {
      if (
        code_array.length == 2 &&
        isHex(code_array[1], 4) &&
        code_array[1].length == 4
      ) {
        return code_array;
      } else {
        error_message = "The argument must be a 16-bit address.";
      }
    }

    if (command == "XCHG" || command == "CMA") {
      if (code_array.length == 1) {
        return code_array;
      } else {
        error_message = "The given command doesn't take any arguments.";
      }
    }

    if (
      command == "ADD" ||
      command == "ADC" ||
      command == "SUB" ||
      command == "SBB" ||
      command == "ANA" ||
      command == "XRA" ||
      command == "ORA" ||
      command == "CMP"
    ) {
      if (registers.includes(code_array[1]) && code_array.length == 2) {
        return code_array;
      } else {
        error_message = "The argument must be a register or memory.";
      }
    }

    if (command == "INR" || command == "DCR") {
      if (registers.includes(code_array[1]) && code_array.length == 2) {
        return code_array;
      } else {
        error_message = "The argumentt must be a register or memory.";
      }
    }
    if (
      command == "ADI" ||
      command == "SUI" ||
      command == "SBI" ||
      command == "ACI" ||
      command == "ANI" ||
      command == "ORI" ||
      command == "XRI" ||
      command == "CPI"
    ) {
      if (
        isHex(code_array[1], 2) &&
        code_array[1].length == 2 &&
        code_array.length == 2
      ) {
        return code_array;
      } else {
        error_message = "The argument must be a 8 bit data.";
      }
    }

    if (
      ["JMP", "JC", "JNC", "JZ", "JNZ", "JP", "JM", "JPE", "JPO"].includes(
        command
      )
    ) {
      if (code_array.length == 2) {
        if (
          iteration_number == 1 ||
          Object.keys(labels).includes(code_array[1])
        ) {
          return code_array;
        } else {
          error_message = "Given label not defined.";
        }
      } else {
        error_message = "The argument  must be a label.";
      }
    }
    if (command == "HLT") {
      return code_array;
    }
    return error_message;
  };
  return verify(code, labels);
};

const flagsStatus = (flags, acc) => {
  let binary_eqv = parseInt(acc, 16).toString(2).padStart(8, "0");
  if (acc.length == 3) {
    flags.C = 1;
    acc = acc.slice(1);
    binary_eqv = parseInt(acc, 16).toString(2).padStart(8, "0");
  } else {
    flags.C = 0;
  }
  if (dec(acc) == 0) {
    flags.Z = 1;
  } else {
    flags.Z = 0;
  }

  if (binary_eqv.charAt(0) == "0") {
    flags.S = 0;
  } else {
    flags.S = 1;
  }

  //always check parity at last cause removing carry and sign bits obtained due to add and subtract operations affect parity
  if (
    binary_eqv.split("").filter((e) => e == "1").length % 2 == 0 &&
    binary_eqv.split("").filter((e) => e == "1").length != 0
  ) {
    flags.P = 1;
  } else {
    flags.P = 0;
  }

  return { flags, acc: hex(acc) };
};

const format = (obj) => {
  for (let k of Object.keys(obj)) {
    obj[k] = obj[k].toString().toUpperCase().padStart(2, "0");
  }
  return obj;
};
export { hex, dec, isHex, inr, dcr, hexCode, checkSyntax, flagsStatus, format };
