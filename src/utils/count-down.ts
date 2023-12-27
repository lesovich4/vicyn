
export class CountDown {
    name: string;
    seconds: number;
    callback: Function;
    private value: number = 0;

    constructor(name: string, seconds: number, callback: Function) {
        this.name = name;
        this.seconds = seconds;
        this.callback = callback;
    }

    tick() {
        if (this.value === 0) {
            this.callback();
            this.value = this.seconds;
        }
        this.value--;
    };
}
