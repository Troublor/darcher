import {DAppStateRetriever} from "./interfaces";

export let retriever: DAppStateRetriever = null;

export default function setRetriever(_retriever: DAppStateRetriever) {
    retriever = _retriever;
}