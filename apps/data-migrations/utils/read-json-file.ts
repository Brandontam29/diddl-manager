/**
 * Reads a JSON file from the disk and parses it into a typed object.
 * * @param path - The relative or absolute path to the JSON file.
 * @returns The parsed JSON data as type T.
 * @throws Error if the file is missing or the JSON is malformed.
 */
export async function readJsonFile<T>(path: string): Promise<T> {
    const file = Bun.file(path);

    // Check if file exists to provide a cleaner error message
    const exists = await file.exists();
    if (!exists) {
        throw new Error(`File not found at path: ${path}`);
    }

    try {
        // Bun's .json() method is highly optimized
        return await file.json();
    } catch (error) {
        if (error instanceof Error)
            throw new Error(`Failed to parse JSON from ${path}: ${error.message}`);

        throw new Error(`Failed to parse JSON from ${path}`);
    }
}
