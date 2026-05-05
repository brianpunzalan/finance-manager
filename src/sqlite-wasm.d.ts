declare module '@sqlite.org/sqlite-wasm' {
  interface Sqlite3Static {
    capi: {
      sqlite3_deserialize(
        db: number,
        schema: string,
        data: ArrayBuffer,
        dbSize: number,
        bufSize: number,
        flags: number
      ): number
      SQLITE_DESERIALIZE_FREEONCLOSE: number
    }
    oo1: {
      DB: new () => {
        pointer: number
        exec(opts: {
          sql: string
          rowMode: string
          callback: (row: Record<string, string | number | null>) => void
        }): void
        close(): void
      }
    }
  }
  export default function sqlite3InitModule(opts: {
    print: (...args: unknown[]) => void
    printErr: (...args: unknown[]) => void
  }): Promise<Sqlite3Static>
}
