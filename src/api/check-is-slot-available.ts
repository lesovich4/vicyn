
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface checkIsSlotAvailableRequest {
    vacCode: string;
    visaCategoryCode: string;
}

export interface earliestSlot {
    applicant: string;
    date: string;
}

export interface checkIsSlotAvailableResponse {
    earliestDate: string;
    earliestSlotLists: earliestSlot[];
    error: error | null;
}

export async function checkIsSlotAvailable(request: checkIsSlotAvailableRequest) {
    const { vacCode, visaCategoryCode } = request;
    const body = {
        countrycode: 'blr',
        loginUser: authenticationService.username(),
        missioncode: 'pol',
        payCode: '',
        roleName: 'Individual',
        vacCode,
        visaCategoryCode,
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken()
    };

    const method = 'POST';

    const tokenUri = new URL('/appointment/CheckIsSlotAvailable', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}