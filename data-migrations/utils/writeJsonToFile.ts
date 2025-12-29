import fs from "fs";

function writeJsonToFile(filePath: string, data: any) {
    // Convert the JavaScript object to a JSON string
    const jsonData = JSON.stringify(data);

    // Write the JSON data to the specified file
    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
            return;
        }
        console.log(`
┌────────────────────────────────────────┐
│                                        │
│        DATA WRITTEN SUCCESSFULLY       │
│                                        │
└────────────────────────────────────────┘
`);
    });
}
export default writeJsonToFile;
