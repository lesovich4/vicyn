function CountDown(name, seconds){
    this.name = name;
    this.seconds = seconds;

    let value = seconds;
    this.tick = () => {
        if(value === 0){
            value = seconds;
        }
        value --;
        reply(`${name}.callback`, value);
    };
}

var countDownMap = {};

setInterval(function(){
    Object.values(countDownMap).forEach(countDown => countDown.tick());
}, 1000);

const countDownFunctions = {
    setup(name, countDownSeconds) {
        countDownMap[name] = new CountDown(name, countDownSeconds);
    }
};

function reply(countDownMethodListener, ...countDownMethodArguments) {
    if (!countDownMethodListener) {
        throw new TypeError("reply - takes at least one argument");
    }
    postMessage({
        countDownMethodListener: countDownMethodListener,
        countDownMethodArguments: countDownMethodArguments,
    });
}

function defaultReply(message) {
    // do something
}

onmessage = (event) => {
    if (
        event.data instanceof Object &&
        Object.hasOwn(event.data, "countDownMethod") &&
        Object.hasOwn(event.data, "countDownMethodArguments")
    ) {
        countDownFunctions[event.data.countDownMethod].apply(
            self,
            event.data.countDownMethodArguments
        );
    } else {
        defaultReply(event.data);
    }
};