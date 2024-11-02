/**
 * 
 */
export default class ChangeOutputPath {
    constructor() {}

    apply(hooks) {
        hooks.emitFile.tap("change output path", (context) => {
            console.log("change output path");
            context.changeOutputPath("./dist/bundle_changed.js");
        });
    }
}