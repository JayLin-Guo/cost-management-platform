/**
 * 中国法定节假日数据
 */

interface Holiday {
  name: string
  date: string // YYYY-MM-DD
}

// 2024年节假日数据
const holidays2024: Holiday[] = [
  { name: '元旦', date: '2024-01-01' },
  { name: '春节', date: '2024-02-10' },
  { name: '春节', date: '2024-02-11' },
  { name: '春节', date: '2024-02-12' },
  { name: '春节', date: '2024-02-13' },
  { name: '春节', date: '2024-02-14' },
  { name: '春节', date: '2024-02-15' },
  { name: '春节', date: '2024-02-16' },
  { name: '春节', date: '2024-02-17' },
  { name: '清明节', date: '2024-04-04' },
  { name: '清明节', date: '2024-04-05' },
  { name: '清明节', date: '2024-04-06' },
  { name: '劳动节', date: '2024-05-01' },
  { name: '劳动节', date: '2024-05-02' },
  { name: '劳动节', date: '2024-05-03' },
  { name: '劳动节', date: '2024-05-04' },
  { name: '劳动节', date: '2024-05-05' },
  { name: '端午节', date: '2024-06-10' },
  { name: '中秋节', date: '2024-09-15' },
  { name: '中秋节', date: '2024-09-16' },
  { name: '中秋节', date: '2024-09-17' },
  { name: '国庆节', date: '2024-10-01' },
  { name: '国庆节', date: '2024-10-02' },
  { name: '国庆节', date: '2024-10-03' },
  { name: '国庆节', date: '2024-10-04' },
  { name: '国庆节', date: '2024-10-05' },
  { name: '国庆节', date: '2024-10-06' },
  { name: '国庆节', date: '2024-10-07' },
]

// 获取节假日信息
export function getHoliday(date: Date): Holiday | null {
  const dateStr = date.toISOString().split('T')[0]
  return holidays2024.find((h) => h.date === dateStr) || null
}

export default {
  getHoliday,
}
