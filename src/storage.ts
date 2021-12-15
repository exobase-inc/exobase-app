

const storeInterface = <T> (key: string) => ({
  get: (defaultValue: T | null = null): T | null => {
    const record = localStorage.getItem(key)
    if (!record) {
      return defaultValue
    }
    try {
      return JSON.parse(record) as T
    } catch {
      return defaultValue
    }
  },
  set: (value: T) => {
    const record = JSON.stringify(value)
    localStorage.setItem(key, record)
  },
  remove: () => {
    localStorage.removeItem(key)
  }
})

const storage = {
  token: storeInterface<{ idToken: string, exp: number, email: string, didToken: string }>('exo.token'),
  latestUser: storeInterface<{ email: string }>('exo.latest-user')
}

export default storage