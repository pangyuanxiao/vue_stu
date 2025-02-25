import { Dep, createDep } from './dep'
import { ComputedRefImpl } from './computed'
import { extend } from '@vue/shared'

export type EffectScheduler = (...args: any[]) => any

type KeyToDepMap = Map<any, Dep>
/**
 * 收集所有依赖的 WeakMap 实例：
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

export function track(target: object, key: unknown) {
  if (!activeEffect) return
  // 尝试从 targetMap 中，根据 target 获取 map
  let depsMap = targetMap.get(target)
  // 如果获取到的 map 不存在，则生成新的 map 对象，并把该对象赋值给对应的 value
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)

  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
  console.log('depsmap中的dep')
  console.log(depsMap)
  trackEffects(dep)
}

export function trackEffects(dep: Dep) {
  // activeEffect! ： 断言 activeEffect 不为 null
  dep.add(activeEffect!)
  console.log('收集依赖')
  console.log(activeEffect)
  console.log(dep)
  activeEffect!.effectdeps.push(dep)
}

export function trigger(target: object, key?: unknown) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep: Dep | undefined = depsMap.get(key)
  if (!dep) {
    return
  }
  triggerEffects(dep)
}

export function triggerEffects(dep: Dep) {
  // 把 dep 构建为一个数组
  const effects = Array.isArray(dep) ? dep : [...dep]
  // 依次触发
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

/**
 * effect 函数
 * @param fn 执行方法
 * @returns 以 ReactiveEffect 实例为 this 的执行函数
 */
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  // 生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)
  // 存在 options，则合并配置对象
  if (options) {
    extend(_effect, options)
  }
  if (!options || !options.lazy) {
    _effect.run()
  }
}

/**
 * 单例的，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  effectdeps: Dep[] = []
  /**
   * 存在该属性，则表示当前的 effect 为计算属性的 effect
   */
  computed?: ComputedRefImpl<T>
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}

  run() {
    cleanup(this)
    activeEffect = this
    return this.fn()
  }
  stop() {}
}

// cleanup 会清除 dep 中的依赖，是因为副作用函数和 dep 之间是双向关联的：
// 当 cleanup 遍历 effect.effectdeps 时，它会找到所有与该副作用函数相关的 dep。
// 然后，它会调用 dep.delete(effect)，将副作用函数从 dep 中移除。
function cleanup(effect) {
  const { effectdeps } = effect
  if (effectdeps.length) {
    console.log('当前effect的deps')
    console.log(effectdeps)
    for (let i = 0; i < effectdeps.length; i++) {
      console.log('删除依赖')
      console.log(effect)
      console.log(effectdeps[i])
      effectdeps[i].delete(effect)
      // 从依赖集合中移除当前 effect
    }
    effectdeps.length = 0 // 清空依赖数组
  }
}
