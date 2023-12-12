
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface createMapVasRequest {
    urn: string;
}

export interface createMapVasResponse {
    error: error;
}

export async function createMapVas(request: createMapVasRequest) {
    const {
        urn,
    } = request;
    const body = {
        applicants: [] as {}[],
        countryCode: 'blr',
        loginUser: authenticationService.username(),
        missionCode: 'pol',
        urn
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken()
    };

    const method = 'POST';

    const tokenUri = new URL('/vas/mapvas', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}