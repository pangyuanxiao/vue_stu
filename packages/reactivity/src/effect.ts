export function track(target: object, key: unknown) {
  console.log(`收集依赖`)
}

export function trigger(target: object, key?: unknown) {
  console.log(`触发依赖`)
}

/**
 * effect 函数
 * @param fn 执行方法
 * @returns 以 ReactiveEffect 实例为 this 的执行函数
 */
export function effect<T = any>(fn: () => T) {
  // 生成 ReactiveEffect 实例
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

/**
 * 单例的，当前的 effect
 */
export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}

  run() {
    activeEffect = this
    return this.fn()
  }
}
