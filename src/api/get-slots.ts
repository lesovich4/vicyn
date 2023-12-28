
import { applicantService } from '../services/appicant-service';
import { authenticationService } from '../services/authentication-service';
import { formatDateDDMMYYYY } from '../utils/date-time';
import { baseUrl } from './base-url';
import { error } from './models/error';

export interface getSlotsRequest {
    centerCode: string;
    visaCategoryCode: string;
    fromDate: Date;
    toDate: Date;
}
export interface timeSlot {
    allocationId: number;
    remainingSeats: number;
    slotType: string;
    startTimetick: number;
    timeSlot: string;
    totalSeats: number;
}
export interface group {
    timeSlots: timeSlot[];
    visaGroupName: string;
}
export interface counter {
    allocationCategory: string;
    categoryCode: string;
    groups: group[];
}
export interface getSlotsResponse {
    center: string;
    counters: counter[];
    date: string;
    error: error;
    isWeekend: boolean;
    mission: string;
    visacategory: string;
}

export async function getSlots(request: getSlotsRequest) {
    const { centerCode, visaCategoryCode, fromDate, toDate } = request;
    const query = new URLSearchParams();
    query.append('countryCode', 'blr');
    query.append('missionCode', 'pol');
    query.append('centerCode', centerCode);
    query.append('loginUser', authenticationService.username());
    query.append('visaCategoryCode', visaCategoryCode);
    query.append('languageCode', 'ru-RU');
    query.append('applicantsCount', '1');
    query.append('days', '180');
    query.append('fromDate', formatDateDDMMYYYY(fromDate));
    query.append('slotType', '2');
    query.append('toDate', formatDateDDMMYYYY(toDate));
    query.append('urn', applicantService.urn);
    query.append('payCode', '');
    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': authenticationService.accessToken()
    };

    const method = 'GET';

    const tokenUri = new URL(`/appointment/slots?${query.toString()}`, baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
    });

    return response;
}