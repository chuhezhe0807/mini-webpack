import FS from "fs";
import PATH from "path";
import {parse} from "@babel/parser";
import traverse from "@babel/traverse";

/**
 * 创建资源
 * 
 * @param {string} filePath 文件路径
 * @returns 
 */
export function createAsset(filePath) {
    // 1、获取文件的内容
    const source = FS.readFileSync(filePath, {
        encoding: "utf-8"
    });
    
    // 2、获取依赖关系(使用抽象语法树)
    const ast = parse(source, {
        sourceType: "module"
    });

    const deps = []; // 依赖关系
    traverse.default(ast, {
        ImportDeclaration({node}) {
            deps.push(node.source.value);
        }
    })

    return {
        source, deps, filePath
    };
}


/**
 */

/**
 * 创建图（依赖关系图）
 * 
 * @returns {{filePath: string, source: string, deps: string[]}[]} queue 依赖关系图
 */
function createGraph() {
    const mainAsset = createAsset("./example/main.js");
    const queue = [mainAsset];

    for(const asset of queue) {
        asset.deps.forEach((relativePath) => {
            const asset = createAsset(PATH.resolve("./example", relativePath));
            queue.push(asset);
        });
    }

    return queue;
}

const graph = createGraph();
console.log(graph);