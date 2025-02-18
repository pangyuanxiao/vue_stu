import { mutableHandlers } from './baseHandlers'
import { isObject } from '@vue/shared'

//用于标记是否为reactive
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive'
}

/**
 * 响应性 Map 缓存对象
 * key：target
 * val：proxy
 */
export const reactiveMap = new WeakMap<object, any>()

// export const enum ReactiveFlags {
//   IS_REACTIVE = '__v_isReactive'
// }

export function reactive(target: object) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

function createReactiveObject(
  target: object,
  baseHandlers: ProxyHandler<any>,
  proxyMap: WeakMap<object, any>
) {
  // 如果该实例已经被代理，则直接读取即可
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  // 未被代理则生成 proxy 实例
  const proxy = new Proxy(target, baseHandlers)
  // 为 Reactive 增加标记
  proxy[ReactiveFlags.IS_REACTIVE] = true

  // 缓存代理对象
  proxyMap.set(target, proxy)
  return proxy
}

/**
 * 将指定数据变为 reactive 数据
 */
export const toReactive = <T extends unknown>(value: T): T => {
  return isObject(value) ? reactive(value as object) : value
}

/**
 * 判断一个数据是否为 Reactive
 */
export function isReactive(value): boolean {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
