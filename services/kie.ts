/**
 * KIE.AI Service Layer
 * Docs: https://docs.kie.ai/
 * Base: https://api.kie.ai/api/v1
 *
 * API is async: createTask → get taskId → poll recordInfo until state = 'success'
 * Mock mode activates automatically when KIE_API_KEY is not set.
 */

const KIE_API_KEY = process.env.KIE_API_KEY
const KIE_BASE = 'https://api.kie.ai/api/v1'

const isRealMode = !!KIE_API_KEY

// ─── Core request helpers ────────────────────────────────────────────────────

async function createTask(model: string, input: object): Promise<string> {
  const res = await fetch(`${KIE_BASE}/jobs/createTask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, input }),
  })
  const data = await res.json()
  if (data.code !== 200) throw new Error(`KIE createTask error: ${data.msg}`)
  return data.data.taskId
}

async function getTaskResult(taskId: string): Promise<string | null> {
  const res = await fetch(`${KIE_BASE}/jobs/recordInfo?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${KIE_API_KEY}` },
  })
  const data = await res.json()
  if (data.code !== 200) throw new Error(`KIE recordInfo error: ${data.msg}`)

  const { state, resultJson } = data.data
  if (state === 'success' && resultJson) {
    const parsed = JSON.parse(resultJson)
    return parsed.resultUrls?.[0] ?? parsed.resultImageUrl ?? null
  }
  if (state === 'fail') throw new Error('KIE task failed')
  return null // still processing
}

/** Poll until done or timeout (max ~3 minutes) */
async function pollTask(taskId: string, intervalMs = 3000, maxAttempts = 60): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs))
    const url = await getTaskResult(taskId)
    if (url) return url
  }
  throw new Error('KIE task timed out')
}

// ─── Mock helpers ────────────────────────────────────────────────────────────

const MOCK_RESULTS = ['/demo/result-1.jpg', '/demo/result-2.jpg', '/demo/result-3.jpg']
function mockDelay(ms = 2000) { return new Promise(r => setTimeout(r, ms)) }

// ─── Public API ──────────────────────────────────────────────────────────────

export interface TaskInfo {
  taskId: string
  model: string
}

/**
 * Start remove-background task. Returns taskId for polling.
 * Model: recraft/remove-background
 * Input image: public URL, PNG/JPG/WEBP, max 5MB
 */
export async function startRemoveBackground(imageUrl: string): Promise<TaskInfo> {
  if (!isRealMode) {
    return { taskId: `mock_${Date.now()}`, model: 'recraft/remove-background' }
  }
  const taskId = await createTask('recraft/remove-background', { image: imageUrl })
  return { taskId, model: 'recraft/remove-background' }
}

/**
 * Start upscale task. Returns taskId for polling.
 * Model: recraft/crisp-upscale
 * Input image: public URL, JPEG/PNG/WEBP, max 10MB
 */
export async function startUpscale(imageUrl: string): Promise<TaskInfo> {
  if (!isRealMode) {
    return { taskId: `mock_${Date.now()}`, model: 'recraft/crisp-upscale' }
  }
  const taskId = await createTask('recraft/crisp-upscale', { image: imageUrl })
  return { taskId, model: 'recraft/crisp-upscale' }
}

/**
 * Poll task status.
 * Returns: { state, resultUrl }
 * state: 'waiting' | 'generating' | 'success' | 'fail'
 */
export async function checkTask(taskId: string): Promise<{
  state: string
  resultUrl?: string
}> {
  if (!isRealMode || taskId.startsWith('mock_')) {
    // Simulate: after 6 seconds mock is "done"
    const age = Date.now() - parseInt(taskId.replace('mock_', ''))
    if (age > 6000) {
      return { state: 'success', resultUrl: MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)] }
    }
    return { state: 'generating' }
  }

  const res = await fetch(`${KIE_BASE}/jobs/recordInfo?taskId=${taskId}`, {
    headers: { Authorization: `Bearer ${KIE_API_KEY}` },
  })
  const data = await res.json()
  if (data.code !== 200) return { state: 'fail' }

  const { state, resultJson } = data.data
  if (state === 'success' && resultJson) {
    const parsed = JSON.parse(resultJson)
    const resultUrl = parsed.resultUrls?.[0] ?? parsed.resultImageUrl ?? undefined
    return { state: 'success', resultUrl }
  }
  return { state: state ?? 'generating' }
}

/**
 * Run remove-background and wait for result.
 * Use only in server-side contexts with enough timeout.
 */
export async function removeBackground(imageUrl: string): Promise<string | null> {
  if (!isRealMode) {
    await mockDelay(2000)
    return MOCK_RESULTS[0]
  }
  const taskId = await createTask('recraft/remove-background', { image: imageUrl })
  return pollTask(taskId)
}

/**
 * Run upscale and wait for result.
 */
export async function upscaleImage(imageUrl: string): Promise<string | null> {
  if (!isRealMode) {
    await mockDelay(2500)
    return MOCK_RESULTS[1]
  }
  const taskId = await createTask('recraft/crisp-upscale', { image: imageUrl })
  return pollTask(taskId)
}

/**
 * Process project: run selected operations on all images.
 * Returns array of result URLs.
 */
export async function processProject(
  imageUrls: string[],
  operations: string[]
): Promise<{ resultImages: string[] }> {
  if (!isRealMode) {
    await mockDelay(3000)
    return { resultImages: MOCK_RESULTS }
  }

  const results: string[] = []
  for (const imageUrl of imageUrls) {
    if (operations.includes('remove_bg')) {
      const url = await removeBackground(imageUrl)
      if (url) results.push(url)
    }
    if (operations.includes('upscale')) {
      const url = await upscaleImage(imageUrl)
      if (url) results.push(url)
    }
  }
  return { resultImages: results }
}
