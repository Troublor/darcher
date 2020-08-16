// this file lists all the runtime wrapper function names

import {INSTRU_PREFIX} from "../common";
import {$T$_CallF, $T$_CallM} from "./call";
import {$T$_Member} from "./member";
import {$T$_FinishFn, $T$_StartFn} from "./fnBody";
import {$T$_Identifier} from "./identifier";
import {$T$_ArrayExpression} from "./array";
import {$T$_This} from "./this";
import {$T$_ObjectExpression} from "./object";
import {$T$_Binary, $T$_Logical, $T$_Unary, $T$_UpdateM, $T$_UpdateV} from "./operation";

interface WrapperFnMapping {
    name: string
    fn: CallableFunction
}

const WrapperNames = {
    CallF: {
        name: INSTRU_PREFIX + "CallF",
        fn: $T$_CallF,
    },
    CallM: {
        name: INSTRU_PREFIX + "CallM",
        fn: $T$_CallM,
    },
    Member: {
        name: INSTRU_PREFIX + "Member",
        fn: $T$_Member,
    },
    StartFn: {
        name: INSTRU_PREFIX + "StartFn",
        fn: $T$_StartFn,
    },
    FinishFn: {
        name: INSTRU_PREFIX + "FinishFn",
        fn: $T$_FinishFn,
    },
    Identifier: {
        name: INSTRU_PREFIX + "Identifier",
        fn: $T$_Identifier,
    },
    ArrayExpression: {
        name: INSTRU_PREFIX + "ArrayExpression",
        fn: $T$_ArrayExpression,
    },
    ThisExpression: {
        name: INSTRU_PREFIX + "This",
        fn: $T$_This,
    },
    ObjectExpression: {
        name: INSTRU_PREFIX + "ObjectExpression",
        fn: $T$_ObjectExpression,
    },
    UpdateV: {
        name: INSTRU_PREFIX + "UpdateV",
        fn: $T$_UpdateV,
    },
    UpdateM: {
        name: INSTRU_PREFIX + "UpdateM",
        fn: $T$_UpdateM,
    },
    UnaryExpression: {
        name: INSTRU_PREFIX + "Unary",
        fn: $T$_Unary,
    },
    BinaryExpression: {
        name: INSTRU_PREFIX + "Binary",
        fn: $T$_Binary,
    },
    LogicalExpression: {
        name: INSTRU_PREFIX + "Logical",
        fn: $T$_Logical,
    }
};

export default WrapperNames;