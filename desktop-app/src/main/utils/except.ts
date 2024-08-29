export function except<
    T extends Record<string, any>,
    K extends Array<keyof T>,
    R extends Pick<T, Exclude<keyof T, K[number]>>,
>(value: T, ...exceptions: K): R {
    const copy: Record<string, any> = {};
    for (const key in value) {
        if (!value.hasOwnProperty(key) || exceptions.includes(key)) continue;

        copy[key] = value[key];
    }

    return copy as R;
}

// const obj = { a: true, b: 1, c: 'test', d: false }
// const objExcept = except(obj, 'b', 'd')
// objExcept.a
// objExcept.b //err
