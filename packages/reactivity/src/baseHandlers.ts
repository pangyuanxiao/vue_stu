import { track, trigger, ITERATE_KEY } from './effect'
import { ReactiveFlags, toRaw } from './reactive'
import { hasChanged, hasOwn } from '@vue/shared'
import { TriggerOpTypes, TrackOpTypes } from './operations'

// export const MAP_KEY_ITERATE_KEY = Symbol(__DEV__ ? 'Map key iterate' : '')

const get = createGetter()

/**
 * 创建 getter 回调方法
 */
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.RAW) {
      return target
    }
    // 利用 Reflect 得到返回值
    const res = Reflect.get(target, key, receiver)
    // 收集依赖
    track(target, TrackOpTypes.GET, key)

    return res
  }
}

/**
 * setter 回调方法
 */
const set = createSetter()

/**
 * 创建 setter 回调方法
 */
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ) {
    let oldValue = (target as any)[key]
    const hadKey = hasOwn(target, key)
    // 利用 Reflect.set 设置新值
    const result = Reflect.set(target, key, value, receiver)
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, key, TriggerOpTypes.ADD)
      } else if (hasChanged(value, oldValue)) {
        // 触发依赖
        trigger(target, key, TriggerOpTypes.SET)
      }
    }

    return result
  }
}

function ownKeys(target: object): (string | symbol)[] {
  track(
    target,
    TrackOpTypes.ITERATE,
    Array.isArray(target) ? 'length' : ITERATE_KEY
  )
  return Reflect.ownKeys(target)
}

/**
 * 响应性的 handler
 */
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  ownKeys
}
