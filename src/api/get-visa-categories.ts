import { makeUniqueQueryParameterName, makeUniqueQueryParameterValue } from "../utils/random-string";
import { baseUrl } from "./base-url";

export interface GetVisaCategoriesResponse{
    id: number;
    name: string;
    centerCode: string;
    code: string,
}

export async function getVisaCategories(centerCode: string) {
    const xhr = new XMLHttpRequest();

    const method = 'GET';
    const pName = makeUniqueQueryParameterName(2);
    const pValue = makeUniqueQueryParameterValue(2);
    const uri = new URL(`master/visacategory/pol/blr/${centerCode}/ru-RU?${pName}=${pValue}`, baseUrl);
    const headers = {
        'Route': 'blr/ru/pol'
    };

    const response = await fetch(uri, {
        method,
        headers
    });

    return response;
}