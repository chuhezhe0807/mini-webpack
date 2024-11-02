import {SyncHook, AsyncParallelHook} from "tapable";

class List {
    getRoutes() {

    }
}

/**
 * 在 Tapable 中所有注册的事件可以分为同步、异步两种执行方式，正如名称表述的那样：
 *      同步表示注册的事件函数会同步进行执行。
 *      异步表示注册的事件函数会异步进行执行。      
 * 
 *      针对同步钩子来 tap 方法是唯一的注册事件的方法，通过 call 方法触发同步钩子的执行。
 *      异步钩子可以通过 tap、tapAsync、tapPromise三种方式来注册，
 *      同时可以通过对应的 call、callAsync、promise 三种方式来触发注册的函数
 * 
 * 同时异步钩子可以分为：
 *      异步串行钩子( AsyncSeries )：可以被串联（连续按照顺序调用）执行的异步钩子函数。
 *      异步并行钩子( AsyncParallel )：可以被并联（并发调用）执行的异步钩子函数。
 */
class Car {
    constructor() {
        this.hooks = {
            // Hook new 的时候传入的数组的值不重要，重要的是数组中对应字符串的个数
            accelerate: new SyncHook(["newSpeed"]),
            brake: new SyncHook(),
            calculateRoutes: new AsyncParallelHook([
                "source",
                "target",
                "routesList"
            ])
        }

        this.hooks.accelerate.intercept({
            // 每次调用 hook 实例的 tap() 方法注册回调函数时, 都会调用该方法,
            // 并且接受 tap 作为参数, 还可以对 tap 进行修改;
            register: (tapInfo) => {
              console.log(`${tapInfo.name} is doing its job`);

              return tapInfo; // may return a new tapInfo object
            },

            // 通过hook实例对象上的call方法时候触发拦截器
            call: (arg1, arg2, arg3) => {
              console.log('Starting to calculate routes');
            },

            // 在调用被注册的每一个事件函数之前执行
            tap: (tap) => {
              console.log(tap, 'tap');
            },

            // loop类型钩子中 每个事件函数被调用前触发该拦截器方法
            loop: (...args) => {
              console.log(args, 'loop');
            }
          });
    }

    /**
     * 同步方法
     * 
     * @param {*} newSpeed 
     */
    setSpeed(newSpeed) {
        // following call returns undefined even when you returned values.
        // 触发事件
        this.hooks.accelerate.call(newSpeed);
    }

    /**
     * 异步方法(Promise)
     * 
     * @param {*} source 
     * @param {*} target 
     * @returns 
     */
    useNavigationSystemPromise(source, target) {
        const routesList = new List();
        
        return this.hooks.calculateRoutes
            .promise(source, target, routesList)
            .then((res) => {
                console.log("当所有的注册的事件执行完成之后执行这里");
                // res is undefined for AsyncParallelHook
                return routesList.getRoutes();
            })
    }
    
    /**
     * 异步方法(传统的callback)
     * 
     * @param {*} source 
     * @param {*} target 
     * @param {*} callback 
     */
    useNavigationSystemAsync(source, target, callback) {
        const routesList = new List();

        this.hooks.calculateRoutes.callAsync(source, target, routes, (err) => {
            if(err) {
                return callback(err);
            }

            callback(null, routesList.getRoutes());
        });
    }
}

// 1、注册
const car = new Car();
car.hooks.accelerate.tap("test 1", (speed) => {
    console.log("test 1 accelerate..", speed);
});

car.hooks.accelerate.tap(
    {
        name: "test 2",
        before: "test 1" // test 2 事件函数会在 test 1 之前执行
    }, 
    (speed) => {
        console.log("test 2 accelerate..", speed);
    }
);

// car.hooks.calculateRoutes.tapPromise("test 2 promise", (source, target) => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             console.log("tap promise...", source, target);
//             resolve();
//         });
//     })
// })

// 2、触发
car.setSpeed(10);

// car.useNavigationSystemPromise(["1", "2", "3"], 1);