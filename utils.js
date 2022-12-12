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
export { hex, dec, isHex, inr };
