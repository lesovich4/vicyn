import { GetCentersResponse, getCenters } from "../api/get-centers";
import { GetVisaCategoriesResponse, getVisaCategories } from "../api/get-visa-categories";
import { GetVisaSubCategoriesResponse, getVisaSubCategories } from "../api/get-visa-sub-categories";
import { cacheService } from "./cache-service";


export const visaCenterService = {

    get selectedCenter() {
        return cacheService.getJson<string>('visaCenterService.selectedCenter');
    },
    set selectedCenter(value: string) {
        cacheService.setJson<string>('visaCenterService.selectedCenter', value);
    },

    get selectedVisaCategory() {
        return cacheService.getJson<string>('visaCenterService.selectedVisaCategory');
    },
    set selectedVisaCategory(value: string) {
        cacheService.setJson<string>('visaCenterService.selectedVisaCategory', value);
    },
    
    get selectedVisaSubCategory() {
        return cacheService.getJson<string>('visaCenterService.selectedVisaSubCategory');
    },
    set selectedVisaSubCategory(value: string) {
        cacheService.setJson<string>('visaCenterService.selectedVisaSubCategory', value);
    },

    async getCenters(skipCache: boolean = false) {
        const key = 'visaCenterService.centers';
        let centers = cacheService.getJson<GetCentersResponse[]>(key);
        const retrieve = skipCache || !centers;
        if (retrieve) {
            const response = await getCenters();
            centers = await response.json() as GetCentersResponse[];
            cacheService.setJson(key, centers);
        }

        return centers;
    },

    async getVisaCategories(centerCode: string, skipCache: boolean = false) {
        const key = `visaCenterService.visaCategories4${centerCode}`;
        let visaCategories = cacheService.getJson<GetVisaCategoriesResponse[]>(key);
        const retrive = skipCache || !visaCategories;
        if (retrive) {
            const response = await getVisaCategories(centerCode);
            visaCategories = await response.json() as GetVisaCategoriesResponse[];
            cacheService.setJson(key, visaCategories);
        }

        return visaCategories;
    },

    async getVisaSubCategories(centerCode: string, categoryCode: string, skipCache: boolean = false) {
        const key = `visaCenterService.visaSubCategories4${centerCode}&${categoryCode}`;
        let visaSubCategories = cacheService.getJson<GetVisaSubCategoriesResponse[]>(key);
        const retrive = skipCache || !visaSubCategories;
        if (retrive) {
            const response = await getVisaSubCategories(centerCode, categoryCode);
            visaSubCategories = await response.json() as GetVisaSubCategoriesResponse[];
            cacheService.setJson(key, visaSubCategories);
        }

        return visaSubCategories;
    }
}