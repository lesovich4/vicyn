import { baseUrl } from "./base-url";

export interface GetVisaSubCategoriesResponse{
    id: number;
    name: string;
    centerCode: string;
    code: string,
}

export async function getVisaSubCategories(centerCode: string, categoryCode: string) {
    const xhr = new XMLHttpRequest();

    const method = 'GET';
    const uri = new URL(`/master/subvisacategory/pol/blr/${centerCode}/${categoryCode}/ru-RU`, baseUrl);
    const headers = {
        'Route': 'blr/ru/pol'
    };

    const response = await fetch(uri, {
        method,
        headers
    });

    return response;
}