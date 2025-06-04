/**
 * 类型判断工具函数
 */

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

export function isObject(val: any): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}

export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

export function isArray(val: any): val is Array<any> {
  return Array.isArray(val)
}

export function isNull(val: unknown): val is null {
  return val === null
}

export function isUndefined(val: unknown): val is undefined {
  return typeof val === 'undefined'
}

export function isNullOrUndefined(val: unknown): val is null | undefined {
  return isNull(val) || isUndefined(val)
}

export function isDef<T = unknown>(val?: T): val is T {
  return !isUndefined(val)
}

export function isUnDef<T = unknown>(val?: T): val is T {
  return isUndefined(val)
}

export function isEmptyObject(val: any): boolean {
  return isObject(val) && Object.keys(val).length === 0
}

export function isExist(val: unknown): boolean {
  return val !== undefined && val !== null
}

export function isEmpty<T = unknown>(val: T): val is T {
  if (isNullOrUndefined(val)) {
    return true
  }
  if (isString(val) && val === '') {
    return true
  }
  if (isArray(val) && val.length === 0) {
    return true
  }
  if (isObject(val) && Object.keys(val).length === 0) {
    return true
  }

  return false
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}

export function isDate(val: unknown): val is Date {
  return Object.prototype.toString.call(val) === '[object Date]'
}

export function isRegExp(val: unknown): val is RegExp {
  return Object.prototype.toString.call(val) === '[object RegExp]'
}

export function isWindow(val: any): boolean {
  return typeof window !== 'undefined' && Object.prototype.toString.call(val) === '[object Window]'
}

export function isElement(val: unknown): boolean {
  return isObject(val) && !!val.tagName
}

export function isServer(): boolean {
  return typeof window === 'undefined'
}

export function isClient(): boolean {
  return !isServer()
}
