import { PATHS } from '../constants'
import { sleep } from './helper'
import slugify from 'slugify'

let _data = []

export default async function getData(activePage = 1, tag) {
  // TODO: offset eklenecek yoksa 99'dan sonra patlar
  async function allData(pageOffset) {
    const response = await fetch(encodeURI(process.env.API_URL))
    const { records, offset } = await response.json()

    let filteredData = records.filter((row) => {
      return row.fields.createdDate && row.fields.public
    })

    _data = [..._data, ...filteredData]

    if (offset) {
      await sleep(300)
      await allData(offset)
    }
  }

  if (!_data.length) {
    await allData()
  }

  let filteredData = _data.map((item) => ({
    ...item,
    slug: slugify(item.fields.title, { lower: true, strict: true })
  }))

  if (tag) {
    const path = PATHS.find((path) => path.slug === tag)
    filteredData = filteredData.filter((row) => {
      return row.fields.tags.find((tag) => tag === path.title)
    })
  }

  return {
    allData: filteredData,
    totalData: filteredData.length,
    data: [...filteredData].splice(
      (activePage - 1) * process.env.PER_PAGE,
      process.env.PER_PAGE
    )
  }
}
