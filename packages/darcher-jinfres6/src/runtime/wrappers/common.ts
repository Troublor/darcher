import BaseHook from "../hooks/BaseHook";
import Web3CallbackHook from "../hooks/Web3CallbackHook";
import FeathersJsHook from "../hooks/FeathersJsHook";
import SimpleTimeLimitHook from "../hooks/SimpleTimeLimitHook";

let hook: BaseHook = new BaseHook();
// let hook: BaseHook = new Web3CallbackHook();
// let hook: BaseHook = new FeathersJsHook();
// let hook: BaseHook = new SimpleTimeLimitHook();

export function getHook(): BaseHook {
    return hook;
}

export function setHook(h: BaseHook) {
    hook = h;
}