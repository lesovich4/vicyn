import { baseUrl } from './base-url';

export interface getTokenRequest {
    username: string;
    encryptedPassword: string;
    captchaResponse: string;
}

export interface getTokenResponse {
    accessToken: string;
    isAuthenticated: boolean;
    [key: string]: any;
}

export async function getToken(request: getTokenRequest) {
    const body = new URLSearchParams();
    const { username, encryptedPassword, captchaResponse } = request;
    body.append('username', username);
    body.append('password', encryptedPassword);
    body.append('missioncode', 'pol');
    body.append('countrycode', 'blr');
    body.append('captcha_version', 'v2');
    body.append('captcha_api_key', captchaResponse);

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    };

    const method = 'POST';

    const tokenUri = new URL('user/login', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body,
    });

    return response;
}