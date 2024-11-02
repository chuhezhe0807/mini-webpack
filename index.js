import FS from "fs";
import PATH from "path";
import EJS from "ejs";
import { SyncHook } from "tapable";
import {transformFromAst} from "babel-core";
import {parse} from "@babel/parser";
import traverse from "@babel/traverse";

import ChangeOutputPath from "./plugin/ChangeOutputPath.js";
import { jsonLoader } from "./loader/JsonLoader.js";

let id = 0; // 文件模块的id，不重复，自增
const webpackConfig = {
    module: {
        rules: [
            {
              test: /\.json$/,
              use: [jsonLoader],
            }
        ]
    },
    plugins: [
        new ChangeOutputPath()
    ]
};

const hooks = {
    emitFile: new SyncHook(["context"])
}

/**
 * 创建资源
 * 
 * @param {string} filePath 文件路径
 * @returns 
 */
export function createAsset(filePath) {
    // 1、获取文件的内容
    let source = FS.readFileSync(filePath, {
        encoding: "utf-8"
    });

    // loader就是把非js的文件转换成js
    // 转换（执行loader） 因为babel只认识javaScript，所以需要在解析ast之前调用loader将原文件转换为js
    // webpack 也只能理解javascript
    const loaders = webpackConfig.module.rules;
    // loader上下文对象，可以添加函数或者添加依赖到loader中去使用
    const loaderContext = {
        addDeps() {
            console.log("add dependencies.");
        }
    };
    loaders.forEach(({test, use}) => {
        if(test.test(filePath)) {
            if(Array.isArray(use)) {
                // loader的执行顺序是从后往前
                use.reverse().forEach((fn) => {
                    source = fn.call(loaderContext, source);
                });
            }
        }
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
    });

    const {code} = transformFromAst(ast, null, {
        // 设置预设为 "env",去加载 babel-preset-env 插件，所以一定要安装 babel-preset-env 包
        // babel-preset-env 是一个智能预设，可以让使用者不需要主动去关心目标环境有哪些js语法需要转换
        presets: ["env"] 
    });

    return {
        code, deps, filePath, mapping: {}, id: id++
    };
}

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
            const child = createAsset(PATH.resolve("./example", relativePath));
            asset.mapping[relativePath] = child.id;
            queue.push(child);
        });
    }

    return queue;
}

function build(graph) {
    const template = FS.readFileSync("./bundle.ejs", {encoding: "utf-8"});
    const data = graph.map(({code, filePath, mapping, id}) => ({code, filePath, mapping, id}));
    const code = EJS.render(template, {data});

    let outputPath = "./dist/bundle.js";
    const context = {
        changeOutputPath(path) {
            outputPath = path;
        }
    }

    hooks.emitFile.call(context);
    FS.writeFileSync(outputPath, code);
}

/**
 * 初始化plugins，调用每一个plugin的apply方法
 * webpack 插件本质上就是注册事件，触发事件
 */
function initPlugins() {
    const plugins = webpackConfig.plugins;

    plugins.forEach((plugin) => {
        plugin.apply(hooks);
    });
}

initPlugins();
const graph = createGraph();
build(graph);