export interface CacheObj {
    [key: string]: string;
};

export interface CacheSource {
    set(cache: CacheObj): void;
    get(): CacheObj;
}

let _source: CacheSource = {
    set: (cache: CacheObj) => { },
    get: () => { return {}; },
};

export const cacheService = {

    setupSource(source: CacheSource) {
        _source = source;
    },

    getJson<T>(key: string): T {
        const cache = _source.get();
        const value = cache[key];
        if (value === undefined) {
            return null as T;
        }

        const json = JSON.parse(value);

        return json as T;
    },

    setJson<T>(key: string, value: T): void {
        const json = JSON.stringify(value);
        const cache = _source.get();
        cache[key] = json;
        _source.set(cache);
    },
};