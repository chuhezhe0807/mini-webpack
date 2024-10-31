/**
 * JSON 文件的loader
 * 
 * @param {*} source 
 */
export function jsonLoader(source) {
    this.addDeps();
    return `export default ${JSON.stringify(source)};`;
}