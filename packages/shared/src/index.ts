/**
 * 判断是否为一个数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为一个对象
 */
export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'

/**
 * 对比两个数据是否发生了改变
 * obj.is Returns true if the values are the same value, false otherwise.
 */
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

/**
 * 是否为一个 function
 */
export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

/**
 * Object.assign
 */
export const extend = Object.assign

/**
 * 只读的空对象
 */
export const EMPTY_OBJ: { readonly [key: string]: any } = {}
