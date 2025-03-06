import { mutableHandlers } from './baseHandlers'
import { isObject } from '@vue/shared'

//用于标记是否为reactive
export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

export interface Target {
  [ReactiveFlags.SKIP]?: boolean
  [ReactiveFlags.IS_REACTIVE]?: boolean
  [ReactiveFlags.IS_READONLY]?: boolean
  [ReactiveFlags.IS_SHALLOW]?: boolean
  [ReactiveFlags.RAW]?: any
}

/**
 * 响应性 Map 缓存对象
 * key：target
 * val：proxy
 */
export const reactiveMap = new WeakMap<object, any>()

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

export function toRaw<T>(observed: T): T {
  //如果 `observed` 存在并且有 `ReactiveFlags.RAW` 属性，则递归调用 `toRaw` 继续获取原始值
  const raw = observed && (observed as Target)[ReactiveFlags.RAW]
  //如果没有 `ReactiveFlags.RAW` 属性，则返回 `observed` 本身，表示它已经是原始值
  return raw ? toRaw(raw) : observed
}
