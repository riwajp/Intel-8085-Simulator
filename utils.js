import codes_json from "./codes.json";
const dec = (hex) => {
  return parseInt(hex, 16);
};

const hex = (decimal) => {
  return decimal.toString(16);
};

const isHex = (hex, size) => {
  return dec(hex) >= 0 && dec(hex) <= 65535 && hex.length <= size;
};

const inr = (hx) => {
  return hex(dec(hx) + 1);
};

const hexCode = (code) => {
  var opCodes = [];
  for (let c of codes_json) {
    let input_code_formatted = code.join("").toUpperCase();
    let json_code_formatted = c.label
      .replace("Data", "")
      .replace("Address", "")
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

  console.log(opCodes);

  return opCodes.length ? opCodes[opCodes.length - 1] : 0;
};

const checkSyntax = (code) => {
  console.log(code);

  let code_array = code.replace(/\s+/g, " ").split(" ");

  console.log(code_array);
  let registers = ["A", "B", "C", "D", "E", "H", "L", "M"];
  let command = code_array[0];
  var error_message = "The given command doesn't exist.";

  console.log(command);

  if (command == "MVI") {
    if (registers.includes(code_array[1]) && isHex(code_array[2], 2)) {
      return code_array;
    } else {
      error_message = "The arguments must be a register and a 8-bit data";
    }
  }

  if (command == "MOV") {
    if (
      registers.includes(code_array[1]) &&
      registers.includes(code_array[2])
    ) {
      return code_array;
    } else {
      error_message = "The arguments must be two registers.";
    }
  }

  if (command == "LXI") {
    if (code_array[1] == "B" || code_array[1] == "D" || code_array[1] == "H") {
      return code_array;
    } else {
      error_message = "The arguments must be register pair (B, D or H).";
    }
  }

  if (command == "LDAX" || command == "STAX") {
    if (code_array[1] == "B" || code_array[1] == "D") {
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
    if (isHex(code_array[1], 4)) {
      return code_array;
    } else {
      error_message = "The argument must be a 16-bit address.";
    }
  }

  if (command == "HLT") {
    return code_array;
  }

  return error_message;
};
export { hex, dec, isHex, inr, hexCode, checkSyntax };
