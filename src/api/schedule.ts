
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface scheduleRequest {
    centerCode: string;
    urn: string;
    allocationId: number;
}

export interface scheduleResponse {
    DigitalSignature: {};
    IsAppointmentBooked: boolean;
    IsPaymentRequired: boolean;
    RequestRefNo: number;
    URL: string;
    error: error;
}

export async function schedule(request: scheduleRequest) {
    const {
        centerCode,
        urn,
        allocationId,
    } = request;
    const body = {
        missionCode: 'pol',
        countryCode: 'blr',
        centerCode,
        loginUser: authenticationService.username(),
        urn,
        notificationType: 'none',
        paymentdetails: {
            paymentmode: 'Vac',
            RequestRefNo: '',
            clientId: '',
            merchantId: '',
            amount: 0,
            currency: 'BYN'
        },
        allocationId: allocationId.toString(),
        CanVFSReachoutToApplicant: true
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken(),
        'Route': 'blr/ru/pol'
    };

    const method = 'POST';

    const tokenUri = new URL('/appointment/schedule', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}