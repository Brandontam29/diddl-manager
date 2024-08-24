import { accessSync } from 'fs';
import { access } from 'fs/promises';

const isExists = async (path: string) => {
    try {
        await access(path);
        return true;
    } catch (err) {
        return false;
    }
};

export const isExistsSync = (path: string) => {
    try {
        accessSync(path);
        return true;
    } catch (err) {
        return false;
    }
};

export default isExists;
