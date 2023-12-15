
import { authenticationService } from '../services/authentication-service';
import { baseUrl } from './base-url';

export interface createApplicantRequest {
    centerCode: string;
    visaCategoryCode: string;
    firstName: string;
    lastName: string;
    sex: string;
    dateOfBirth: string;
    passportNumber: string;
    passportExpiry: string;
    phoneCode: string;
    phoneNumber: string;
    ipAddress: string;
    emailId: string;
}

export interface applicant {
    arn: string;
    firstName: string;
    isPackagePurchaseMandatory: boolean;
    lastName: string;
    passportNumber: string;
}

export interface createApplicantResponse {
    applicantList: applicant[];
    error: any;
    status: any;
    urn: string;
}

export async function createApplicant(request: createApplicantRequest) {
    const { centerCode
        , visaCategoryCode
        , firstName
        , lastName
        , sex
        , dateOfBirth
        , passportNumber
        , passportExpiry
        , phoneCode
        , phoneNumber
        , ipAddress
        , emailId

    } = request;
    const body = {
        centerCode,
        countryCode: 'blr',
        feeEntryTypeCode: null as string,
        feeExemptionDetailsCode: null as string,
        applicantList: [
            {
                urn: '',
                arn: '',
                loginUser: authenticationService.username(),
                firstName,
                employerFirstName: '',
                middleName: '',
                lastName,
                employerLastName: '',
                salutation: '',
                gender: Number.parseInt(sex),
                nationalId: null as string,
                VisaToken: null as string,
                employerContactNumber: '',
                contactNumber: phoneNumber,
                dialCode: phoneCode,
                employerDialCode: '',
                passportNumber: passportNumber,
                confirmPassportNumber: '',
                passportExpirtyDate: passportExpiry,
                dateOfBirth,
                emailId: emailId ?? authenticationService.username().toLocaleUpperCase(),
                employerEmailId: '',
                nationalityCode: 'BLR',
                state: null as string,
                city: null as string,
                isEndorsedChild: false,
                applicantType: 0,
                addressline1: null as string,
                addressline2: null as string,
                pincode: null as string,
                referenceNumber: null as string,
                vlnNumber: null as string,
                applicantGroupId: 0,
                parentPassportNumber: '',
                parentPassportExpiry: '',
                dateOfDeparture: null as string,
                gwfNumber: '',
                entryType: '',
                eoiVisaType: '',
                passportType: '',
                vfsReferenceNumber: '',
                familyReunificationCerificateNumber: '',
                PVRequestRefNumber: '',
                PVStatus: '',
                PVStatusDescription: '',
                PVCanAllowRetry: true,
                PVisVerified: false,
                ipAddress
            }
        ],
        feeExemptionTypeCode: null as string,
        isEdit: false,
        isWaitlist: false,
        languageCode: 'ru-RU',
        loginUser: authenticationService.username(),
        missionCode: 'pol',
        visaCategoryCode
    };

    const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorize': authenticationService.accessToken()
    };

    const method = 'POST';

    const tokenUri = new URL('/appointment/applicants', baseUrl);

    const response = await fetch(tokenUri, {
        method,
        headers,
        body: JSON.stringify(body),
    });

    return response;
}