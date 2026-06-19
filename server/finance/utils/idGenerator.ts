export type IdGenerator = () => string;

export const createSequentialIdGenerator = (prefix: string): IdGenerator => {
    let nextId = 1;

    return () => {
        const id = `${prefix}_${nextId}`;
        nextId += 1;
        return id;
    };
};
