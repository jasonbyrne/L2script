export const forEachPromise = (arr: string[], callback: Function) => {
    let i = 0;
    const next = () => {
        if (arr.length && i < arr.length) {
            const value = callback(arr[i]);
            i++;
            if (value && value.then) {
                value.then(next);
            }
            else {
                next();
            }
        }
    }
    next();
};

export const generateName = () => {
    return `shape${Date.now()}_${Math.round(Math.random() * 10000)}`;
}
