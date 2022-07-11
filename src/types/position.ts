export interface Position {
  name: string
  description: string
  rate: string
  tags: {
    key: string
    values: string[]
  }[]
  similars: string[]
  key: string
  img: string
}
