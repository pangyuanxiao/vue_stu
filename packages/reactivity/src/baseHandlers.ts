import { track, trigger, ITERATE_KEY } from './effect'
import { ReactiveFlags, toRaw, reactive } from './reactive'
import { isObject, hasChanged, hasOwn } from '@vue/shared'
import { TriggerOpTypes, TrackOpTypes } from './operations'

// import { MAP_KEY_ITERATE_KEY } from './effect'

const get = /*#__PURE__*/ createGetter()
const shallowGet = /*#__PURE__*/ createGetter(false, true)

/**
 * 创建 getter 回调方法
 */
function createGetter(isReadonly = false, shallow = false) {
  return function get(target: object, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.RAW) {
      return target
    }
    // 利用 Reflect 得到返回值
    const res = Reflect.get(target, key, receiver)
    // 收集依赖
    track(target, TrackOpTypes.GET, key)

    if (shallow) {
      return res
    }

    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      //return isReadonly ? readonly(res) : reactive(res)
      return reactive(res)
    }

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
