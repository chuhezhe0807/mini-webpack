/// 期望的打包出来的文件应该有的内容

(function(modules) {
    function require(id) {
        // 由于使用文件路径可能是相对路劲并且可能是重复的，所以给每一个模块定义一个唯一的id
        // 根据传入的文件id获取其内容（该内容使用函数作为命名空间防止明明冲突）
        const [fn, mapping] = modules[id];
        const module = {
            exports: {}
        }

        function localRequire(filePath) {
            const id = mapping[filePath];
            return require(id);
        }
    
        fn(localRequire, module, module.exports);
    
        return module.exports;
    }
    
    require(1);
})({
    1: [
        function (require, module, exports) {
            const {foo} = require("./foo.js");
        
            console.log("main.js");
            foo();
        },
        {
            "./foo.js": 2
        }
    ],
    2: [
        function (require, module, exports) {
            function foo() {
                console.log("foo");
            }
        
            module.exports = {
                foo
            };
        },
        {}
    ], 
});