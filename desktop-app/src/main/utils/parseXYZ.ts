import fs from 'fs';

const parseXYZ = (filePath: string) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter((line) => line.trim() !== '');
  // Read the number of atoms from the first line
  const numberOfAtoms = Number.parseInt(lines[0].trim(), 10);

  // Initialize arrays to store atom information
  const atoms: string[] = [];
  const coordinates: { x: number; y: number; z: number }[] = [];

  // Read atomic symbols and coordinates
  for (let i = 2; i < lines.length; i++) {
    const elements = lines[i].trim().split(/\s+/);
    const atomSymbol = elements[0];
    const [x, y, z] = elements.slice(1, 4).map(Number.parseFloat);
    atoms.push(atomSymbol);
    coordinates.push({ x, y, z });
  }

  return { numberOfAtoms, atoms, coordinates };
};

export default parseXYZ;
