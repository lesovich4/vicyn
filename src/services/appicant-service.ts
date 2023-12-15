import { cacheService } from "./cache-service";

export interface allocation{
    id: number;
    text: string;
}

export const applicantService = {

    get firstName() {
        return cacheService.getJson<string>('applicantService.firstName');
    },
    set firstName(value: string) {
        cacheService.setJson<string>('applicantService.firstName', value);
    },

    get lastName() {
        return cacheService.getJson<string>('applicantService.lastName');
    },
    set lastName(value: string) {
        cacheService.setJson<string>('applicantService.lastName', value);
    },

    get sex() {
        return cacheService.getJson<string>('applicantService.sex');
    },
    set sex(value: string) {
        cacheService.setJson<string>('applicantService.sex', value);
    },

    get dateOfBirth() {
        return cacheService.getJson<string>('applicantService.dateOfBirth');
    },
    set dateOfBirth(value: string) {
        cacheService.setJson<string>('applicantService.dateOfBirth', value);
    },

    get passportNumber() {
        return cacheService.getJson<string>('applicantService.passportNumber');
    },
    set passportNumber(value: string) {
        cacheService.setJson<string>('applicantService.passportNumber', value);
    },

    get passportExpiry() {
        return cacheService.getJson<string>('applicantService.passportExpiry');
    },
    set passportExpiry(value: string) {
        cacheService.setJson<string>('applicantService.passportExpiry', value);
    },

    get phoneCode() {
        return cacheService.getJson<string>('applicantService.phoneCode');
    },
    set phoneCode(value: string) {
        cacheService.setJson<string>('applicantService.phoneCode', value);
    },

    get phoneNumber() {
        return cacheService.getJson<string>('applicantService.phoneNumber');
    },
    set phoneNumber(value: string) {
        cacheService.setJson<string>('applicantService.phoneNumber', value);
    },

    get emailId() {
        return cacheService.getJson<string>('applicantService.emailId');
    },
    set emailId(value: string) {
        cacheService.setJson<string>('applicantService.emailId', value);
    },

    get urn() {
        return cacheService.getJson<string>('applicantService.urn');
    },
    set urn(value: string) {
        cacheService.setJson<string>('applicantService.urn', value);
    },

    get allocation() {
        return cacheService.getJson<allocation>('applicantService.allocation');
    },
    set allocation(value: allocation) {
        cacheService.setJson('applicantService.allocation', value);
    },
}