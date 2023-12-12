import * as forge from 'node-forge';

export function encryptPassword(password: string){
    const Ne = forge.pki.publicKeyFromPem('-----BEGIN PUBLIC KEY-----'
        + 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpigN3/5Ti/WJk51pbPQdpCe96\n  TPVoeMAk/cUlAPpYh8zGpr6zssbM11Je1SoQTiuipxIL+c0oGXti8vLzln3yfS+N\n  56wuSh0Hyt1Z+waSx6IDFlfzImEtq8m1osS32B83HRiFZbeKB8QIRJhZil1pJSzM\n  sg0Y0QmDyv1yR4FzIQIDAQAB'
        + '-----END PUBLIC KEY-----');
    const result = window.btoa(Ne.encrypt(password));

    return result;
}