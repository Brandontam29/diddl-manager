import fs from "fs";

const rawData = fs.readFileSync("structure-complete.json", "utf8");
const jsonData = JSON.parse(rawData) as Record<string, string[]>;

const obj = Object.keys(jsonData);

fs.writeFile("keys-2.json", JSON.stringify(obj), () => {});
