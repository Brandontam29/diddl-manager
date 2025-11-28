import fs from "fs";

const keys = JSON.parse(fs.readFileSync("key-type-map.json", "utf8"));

const types = Array.from(new Set(Object.values(keys)));

console.log(types);
