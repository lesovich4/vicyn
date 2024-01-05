import { publicIpv4 } from "public-ip";
import { checkIsSlotAvailable, checkIsSlotAvailableResponse } from "../api/check-is-slot-available";
import { getToken } from "../api/get-token";
import { allocation, applicantService } from "../services/appicant-service";
import { authenticationService, AccessTokenLifetime } from "../services/authentication-service";
import { CacheObj, CacheSource, cacheService } from "../services/cache-service";
import { visaCenterService } from "../services/visa-center-service";
import { createApplicant, createApplicantResponse } from "../api/create-applicant";
import { getSlots, getSlotsResponse } from "../api/get-slots";
import { schedule, scheduleResponse } from "../api/schedule";
import { CountDown } from "../utils/count-down";
import { getRanges } from "../services/slots-utils";

let _cache: CacheObj = {};
let _source: CacheSource = {
    set: (cache: CacheObj) => {
        reply('cacheUpdated', cache);
        _cache = cache;
    },
    get: () => _cache,
};
cacheService.setupSource(_source);


var countDownMap: { [key: string]: CountDown } = {};

setInterval(function () {
    Object.values(countDownMap).forEach(countDown => countDown.tick());
}, 1000);

class Sheduler {

    enabled: boolean = false;

    async createApplicant() {

        const ipAddress = await publicIpv4();
        try {
            const response = await createApplicant({
                firstName: applicantService.firstName,
                lastName: applicantService.lastName,
                sex: applicantService.sex,
                dateOfBirth: applicantService.dateOfBirth,
                passportNumber: applicantService.passportNumber,
                passportExpiry: applicantService.passportExpiry,
                phoneCode: applicantService.phoneCode,
                phoneNumber: applicantService.phoneNumber,
                emailId: applicantService.emailId,
                centerCode: visaCenterService.selectedCenter,
                visaCategoryCode: visaCenterService.selectedVisaSubCategory,
                ipAddress,
                nationalId: applicantService.nationalId,
                visaToken: applicantService.visaToken,
            });
            const data = await response.json() as createApplicantResponse;
            applicantService.urn = data.urn;

            reply('applicantCreated', data);
        }
        catch {
            reply('applicantCreated', null);
        }
    }

    async getSlots() {
        try {

            const ranges = getRanges();
            const allocations: allocation[] = [];

            for (let i = 0; i < ranges.length; i++) {
                const { fromDate, toDate } = ranges[i];
                const response = await getSlots({
                    centerCode: visaCenterService.selectedCenter,
                    visaCategoryCode: visaCenterService.selectedVisaSubCategory,
                    fromDate,
                    toDate,
                });
                const data = await response.json() as getSlotsResponse[];

                data.forEach(item => {
                    if (!item.counters) {
                        return;
                    }
                    item.counters.forEach(counter => {
                        counter.groups.forEach(group => {
                            group.timeSlots.forEach(timeSlot => {
                                allocations.push({
                                    id: timeSlot.allocationId,
                                    text: `${item.date} - ${timeSlot.timeSlot}`,
                                });
                            });
                        });
                    });
                });

                reply('getSlotsUpdated', data);
            }
            if (allocations.length > 0) {
                const allocation = allocations[Math.floor(Math.random() * allocations.length)];
                applicantService.allocation = allocation;
                reply('allocationUpdated', allocation);
            }
            else {
                reply('allocationUpdated', null);
            }

        }
        catch {
            reply('allocationUpdated', null);
            reply('getSlotsUpdated', null);
        }

    }
    async schedule() {
        try {
            const response = await schedule({
                allocationId: applicantService.allocation.id,
                centerCode: visaCenterService.selectedCenter,
                urn: applicantService.urn
            });
            const data = await response.json() as scheduleResponse;

            reply('scheduleUpdated', data);
        }
        catch {
            reply('scheduleUpdated', null);
        }

    }

    async process() {
        if (!this.enabled) {
            return;
        }

        if (!applicantService.urn) {
            await this.createApplicant();
        }

        if (!applicantService.allocation) {
            await this.getSlots();
        }

        await this.schedule();
    }
}

const scheduler = new Sheduler();

const methods = {
    setCache(cache: CacheObj) {
        _cache = cache;
    },

    startPullingToken() {
        console.log(`Pulling token with ${AccessTokenLifetime} seconds interval.`);
        countDownMap.getToken = new CountDown('getToken', 5, async () => {
            if (authenticationService.isAuthenticated() && !authenticationService.isExpiried) {
                return;
            }

            const username = authenticationService.username();
            const encryptedPassword = authenticationService.passwordEncrypted();
            const captchaResponse = authenticationService.captchaResponse();
            const response = await getToken({ username, encryptedPassword, captchaResponse });
            const token = await response.json();

            const { isAuthenticated, accessToken } = token;

            authenticationService.isAuthenticated(isAuthenticated);
            authenticationService.accessToken(accessToken);

            reply('tokenUpdated', token);
        });
    },

    stopPullingToken() {
        if (countDownMap.getToken !== undefined) {
            delete countDownMap.getToken;
        }
    },

    startSlotCheking(pullInterval: number) {
        console.log(`Pulling slots with ${pullInterval} seconds interval.`);
        countDownMap.slotCheking = new CountDown('slotCheking', pullInterval, async () => {

            if (!authenticationService.isAuthenticated() || authenticationService.isExpiried) {
                return;
            }

            const vacCode = visaCenterService.selectedCenter;
            const visaCategoryCode = visaCenterService.selectedVisaSubCategory;

            if (!vacCode || !visaCategoryCode) {
                return;
            }

            try {
                const response = await checkIsSlotAvailable({ vacCode, visaCategoryCode });
                const data = await response.json() as checkIsSlotAvailableResponse;

                reply('slotChekingUpdated', data);
                if (data.earliestDate !== null) {
                    scheduler.process();
                }
            }
            catch {
                reply('slotChekingUpdated', null);
            }

        });
    },

    stopSlotCheking() {
        if (countDownMap.slotCheking !== undefined) {
            delete countDownMap.slotCheking;
        }
    },

    enableScheduler() {
        scheduler.enabled = true;
    },

    disableScheduler() {
        scheduler.enabled = false;
    },

    schedule() {
        scheduler.process();
    },
};

type Methods = keyof typeof methods;

function reply(method: string, methodArgument: {}) {
    postMessage({
        method,
        methodArgument,
    });
}

function defaultReply(message: {}) {
    // do something
}

onmessage = (event) => {
    if (
        event.data instanceof Object &&
        Object.hasOwn(event.data, "method") &&
        Object.hasOwn(event.data, "methodArguments")
    ) {
        methods[event.data.method as Methods].apply(
            self,
            event.data.methodArguments
        );
    } else {
        defaultReply(event.data);
    }
};