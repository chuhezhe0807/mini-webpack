/// 期望的打包出来的文件应该有的内容

(function(modules) {
    function require(filePath) {
        // 根据传入的文件路径获取其内容（该内容使用函数作为命名空间防止明明冲突）
        const fn = modules[filePath];
        const module = {
            exports: {}
        }
    
        fn(require, module, module.exports);
    
        return module.exports;
    }
    
    require("./main.js");
})({
    "./foo.js": function (require, module, exports) {
        function foo() {
            console.log("foo");
        }
    
        module.exports = {
            foo
        };
    },
    "./main.js": function (require, module, exports) {
        const {foo} = require("./foo.js");
    
        console.log("main.js");
        foo();
    }
});