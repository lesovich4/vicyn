
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface saveUserActionAuditRequest {
    centerCode: string;
    urn: string;
    ipAddress: string;
    firstEarliestSlotDate: string;
    firstEarliestSlotTime: string;
}

export interface saveUserActionAuditResponse {
    error: error;
    isSavedSuccess: boolean;
}

export async function saveUserActionAudit(request: saveUserActionAuditRequest) {
    const {
        centerCode,
        urn,
        ipAddress,
        firstEarliestSlotDate,
        firstEarliestSlotTime,
    } = request;
    const body = {
        action: 'schedule',
        centerCode,
        countryCode: 'blr',
        firstEarliestSlotDate,
        firstEarliestSlotTime,
        ipAddress,
        loginUser: authenticationService.username(),
        missionCode: 'pol',
        urn
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken()
    };

    const method = 'POST';

    const tokenUri = new URL('/appointment/saveuseractionaudit', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}