/**
 * Context type is passed to all wrapper functions in the first argument to included some context information
 */
export default interface Context {
    // this property refers to the function object that current code block are inside.
    fn?: Function,
}