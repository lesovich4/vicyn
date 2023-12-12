import { cacheService } from "./cache-service";

function setLastUpdated(value: Date) {
    cacheService.setJson('authenticationService.lastUpdated', value.toISOString());
};

export const AccessTokenLifetime = 30 * 60;

export const authenticationService = {
    get lastUpdated(): Date {
        return new Date(cacheService.getJson<string>('authenticationService.lastUpdated'));
    },

    get isExpiried(): boolean{
        const lastUpdated = this.lastUpdated;
        return lastUpdated.setSeconds(lastUpdated.getSeconds() + AccessTokenLifetime) <= new Date();
    },

    username(value?: string) {
        const key = 'authenticationService.username';
        if (value !== undefined) {
            cacheService.setJson(key, value);
        }

        return cacheService.getJson<string>(key);
    },

    password(value?: string) {
        const key = 'authenticationService.password';
        if (value !== undefined) {
            cacheService.setJson(key, value);
        }

        return cacheService.getJson<string>(key);
    },

    passwordEncrypted(value?: string) {
        const key = 'authenticationService.passwordEncrypted';
        if (value !== undefined) {
            cacheService.setJson(key, value);
        }

        return cacheService.getJson<string>(key);
    },

    isAuthenticated(value?: boolean) {
        const key = 'authenticationService.isAuthenticated';
        if (value !== undefined) {
            cacheService.setJson(key, value);
        }
        return cacheService.getJson<boolean>(key);
    },

    accessToken(value?: string) {
        const key = 'authenticationService.accessToken';
        if (value !== undefined) {
            cacheService.setJson(key, value);
            setLastUpdated(new Date());
        }

        return cacheService.getJson<string>(key);
    }
};