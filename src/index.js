
import ko from 'knockout';
import './style.css';
import { MainViewModel } from './models/main-view-model';
import { ReservationWorkerClient } from './workers/reservation-worker-client';
import { cacheService } from './services/cache-service';

const worker = new ReservationWorkerClient();

const localStorageCacheSource = {
    setLocalStorage: (cache) => localStorage.setItem('__cache', JSON.stringify(cache)),
    getLocalStorage: () => JSON.parse(localStorage.getItem('__cache') || '{}'),
    set: (cache) => {
        localStorageCacheSource.setLocalStorage(cache);
        worker.setCache(cache);
    },
    get: () => localStorageCacheSource.getLocalStorage(),
};
cacheService.setupSource(localStorageCacheSource);

worker.setCache(localStorageCacheSource.getLocalStorage());
worker.observables.cacheUpdated.subscribe(localStorageCacheSource.setLocalStorage);

ko.applyBindings(new MainViewModel(worker));