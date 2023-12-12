import { baseUrl } from "./base-url";

export interface GetCentersResponse{
    id: number;
    centerName: string;
    isoCode: string;
}

export async function getCenters() {
    const xhr = new XMLHttpRequest();

    const method = 'GET';
    const uri = new URL('/master/center/pol/blr/ru-RU', baseUrl);
    const headers = {
        'Route': 'blr/ru/pol'
    };

    const response = await fetch(uri, {
        method,
        headers
    });

    return response;
}