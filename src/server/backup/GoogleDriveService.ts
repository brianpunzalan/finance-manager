const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'

let accessToken: string | null = null

function loadGis(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById('gis-script')) { resolve(); return }
    const s = document.createElement('script')
    s.id = 'gis-script'
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = () => resolve()
    document.head.appendChild(s)
  })
}

export const GoogleDriveService = {
  isConfigured(): boolean {
    return Boolean(CLIENT_ID)
  },

  async requestAccessToken(): Promise<string> {
    if (!CLIENT_ID) throw new Error('Google client ID not configured')
    await loadGis()

    return new Promise((resolve, reject) => {
      const client = (window as unknown as Record<string, unknown> & {
        google: { accounts: { oauth2: { initTokenClient: (cfg: unknown) => { requestAccessToken: () => void } } } }
      }).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp: { access_token?: string; error?: string }) => {
          if (resp.error) { reject(new Error(resp.error)); return }
          accessToken = resp.access_token ?? null
          resolve(resp.access_token ?? '')
        },
      })
      client.requestAccessToken()
    })
  },

  async ensureToken(): Promise<string> {
    if (accessToken) return accessToken
    return GoogleDriveService.requestAccessToken()
  },

  async uploadFile(blob: Blob, filename: string): Promise<string> {
    const token = await GoogleDriveService.ensureToken()

    const metadata = {
      name: filename,
      parents: ['appDataFolder'],
    }

    const form = new FormData()
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    form.append('file', blob)

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    )

    if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`)
    const data = (await res.json()) as { id: string }
    return data.id
  },

  async listFiles(): Promise<Array<{ id: string; name: string; createdTime: string }>> {
    const token = await GoogleDriveService.ensureToken()
    const res = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,createdTime)&orderBy=createdTime desc",
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error(`Drive list failed: ${res.status}`)
    const data = (await res.json()) as { files: Array<{ id: string; name: string; createdTime: string }> }
    return data.files
  },
}
