const map = new Map();
const weakmap = new WeakMap();

//立即执行的函数表达式
(function(){
    const foo = {foo:1};
    const bar = {bar:2};
    
    map.set(foo,1);
    weakmap.set(bar,2);
})()

// let keys = Array.from(map.keys());

// // 输出所有键
// keys.forEach(key => {
//   console.log(key);
// });

//这里就访问不到weakmap
let keysWm = Array.from(weakmap.keys());

// 输出所有键
keysWm.forEach(key => {
  console.log(key);
});