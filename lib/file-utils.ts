import { promises as fs } from 'fs'
import path from 'path'

export async function readJsonFile(filename: string) {
  const filePath = path.join(process.cwd(), 'Data', filename)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function writeJsonFile(filename: string, data: any) {
  const filePath = path.join(process.cwd(), 'Data', filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
} 