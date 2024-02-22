//存储副作用函数
const bucket = new Set()
//原始数据
const data = {text:"hello"}


let activeEffect


// 注册函数
function effect(fn){
    activeEffect = fn
    fn()
}



//原始数据的拷贝
const obj = new Proxy(data,{
    get(target,key){
        // target: {text: 'hello'}
        if(activeEffect){
            bucket.add(activeEffect)
        }
        console.log(target)
        //key=text
        console.log("key:"+key)

        return target[key]
    },
    set(target,key,newValue){
        //设置属性的值
        target[key]=newValue
        bucket.forEach(fn => fn())
        return true
     }
})

//注册副作用函数
effect(()=>{
    console.log("effect run")
    document.body.innerText = obj.text
})

setTimeout(() =>{
    obj.text = "vue3"
},1000)