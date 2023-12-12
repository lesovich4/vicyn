import { getToken, getTokenResponse } from '../api/get-token';
import { authenticationService } from '../services/authentication-service';
import { formatTime } from '../utils/date-time';
import * as ko from 'knockout';
import { Failed, Ok } from '../utils/elements';
import { ReservationWorkerClient } from '../workers/reservation-worker-client';
import { encryptPassword } from '../utils/encrypt-password';

function getMessage() {
    const isLiveToken = authenticationService.isAuthenticated() && !authenticationService.isExpiried;

    const messageBuilder = [];

    const time = formatTime(authenticationService.lastUpdated);
    messageBuilder.push(time);
    messageBuilder.push('&nbsp;');

    messageBuilder.push(isLiveToken ? Ok : Failed);
    messageBuilder.push('<hr/>');

    if (isLiveToken) {
        messageBuilder.push('Access Token is Live');
    }

    return messageBuilder.join('');
}

export class TokenViewModel {
    username = ko.observable(authenticationService.username());
    password = ko.observable(authenticationService.password());
    enablePulling = ko.observable(false);
    isAuthenticated = ko.observable(authenticationService.isAuthenticated());
    accessToken = ko.observable(authenticationService.accessToken());
    message = ko.observable(getMessage());

    workerClient: ReservationWorkerClient;

    constructor(workerClient: ReservationWorkerClient) {
        this.workerClient = workerClient;

        this.workerClient.observables.tokenUpdated.subscribe(response => {
            const { isAuthenticated, accessToken } = response;
            this.updateState({ isAuthenticated, accessToken });
        });

        this.username.subscribe(authenticationService.username);
        this.password.subscribe(password => {
            const passwordEncrypted = encryptPassword(password);
            authenticationService.password(password);
            authenticationService.passwordEncrypted(passwordEncrypted);

        });
        this.enablePulling.subscribe(value => {
            if (value) {
                this.workerClient.startPullingTokens();
            }
            else {
                this.workerClient.stopPullingTokens();
            }
        });
        this.isAuthenticated.subscribe(authenticationService.isAuthenticated);
        this.accessToken.subscribe(authenticationService.accessToken);
    }

    getToken() {
        const username = this.username();
        const encryptedPassword = encryptPassword(this.password());
        getToken({ encryptedPassword, username })
            .then(response => response.json() as Promise<getTokenResponse>)
            .then(token => {
                this.updateState(token);
            })
            .catch(_ => {
                this.updateState({ isAuthenticated: false, accessToken: '' });
            });
    }

    removeAccessToken() {
        this.updateState({ isAuthenticated: false, accessToken: '' });
    }

    private updateState(state: { isAuthenticated: boolean; accessToken: string; }) {
        const { isAuthenticated, accessToken } = state;
        this.isAuthenticated(isAuthenticated);
        this.accessToken(accessToken);
        this.message(getMessage());
    }
}