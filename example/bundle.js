/// 期望的打包出来的文件应该有的内容


function require(filePath) {
    // 文件路径和其内容的映射
    const map = {
        "./foo.js": foojs,
        "./main.js": mainjs
    }

    // 根据传入的文件路径获取其内容（该内容使用函数作为命名空间防止明明冲突）
    const fn = map[filePath];
    const module = {
        exports: {}
    }

    fn(require, module, module.exports);

    return module.exports;
}

require("./main.js");

// 创建函数作为命名空间防止冲突
function mainjs(require, module, exports) {
    const {foo} = require("./foo.js");

    console.log("main.js");
    foo();
}

function foojs(require, module, exports) {
    function foo() {
        console.log("foo");
    }

    module.exports = {
        foo
    };
}