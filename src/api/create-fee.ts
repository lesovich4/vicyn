
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface createFeeRequest {
    centerCode: string;
    urn: string;
}

export interface createFeeResponse {
    error: error;
}

export async function createFee(request: createFeeRequest) {
    const {
        centerCode,
        urn,
    } = request;
    const body = {
        centerCode,
        countryCode: 'blr',
        languageCode: 'ru-RU',
        loginUser: authenticationService.username(),
        missionCode: 'pol',
        urn
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken()
    };

    const method = 'POST';

    const tokenUri = new URL('/appointment/fees', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}