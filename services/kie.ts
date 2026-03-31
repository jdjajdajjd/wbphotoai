/**
 * KIE.AI Service Layer
 *
 * TODO: Replace mock implementations with real KIE.ai API calls.
 * Real endpoints: https://api.kie.ai/v1/...
 * Set KIE_API_KEY in .env to enable real API calls.
 *
 * Mock mode is used when KIE_API_KEY is not set.
 */

const KIE_API_KEY = process.env.KIE_API_KEY
const KIE_BASE_URL = process.env.KIE_BASE_URL || 'https://api.kie.ai/v1'

const isRealMode = !!KIE_API_KEY

async function kieRequest(endpoint: string, body: object) {
  const response = await fetch(`${KIE_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`KIE API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

// Mock delay to simulate async processing
function mockDelay(ms = 1500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock result images
const MOCK_RESULT_IMAGES = [
  '/demo/result-1.jpg',
  '/demo/result-2.jpg',
  '/demo/result-3.jpg',
]

export interface ProcessResult {
  success: boolean
  resultUrl?: string
  error?: string
}

export interface GenerateTextResult {
  success: boolean
  text?: string
  error?: string
}

/**
 * Remove background from product image.
 * TODO: Map to real KIE.ai endpoint: POST /remove-background
 */
export async function removeBackground(imageUrl: string): Promise<ProcessResult> {
  if (!isRealMode) {
    await mockDelay(2000)
    return { success: true, resultUrl: '/demo/result-1.jpg' }
  }
  // TODO: replace with real endpoint
  const result = await kieRequest('/remove-background', { imageUrl })
  return { success: true, resultUrl: result.outputUrl }
}

/**
 * Upscale and enhance image quality.
 * TODO: Map to real KIE.ai endpoint: POST /upscale
 */
export async function upscaleImage(imageUrl: string): Promise<ProcessResult> {
  if (!isRealMode) {
    await mockDelay(2500)
    return { success: true, resultUrl: '/demo/result-2.jpg' }
  }
  // TODO: replace with real endpoint
  const result = await kieRequest('/upscale', { imageUrl, scale: 2 })
  return { success: true, resultUrl: result.outputUrl }
}

/**
 * Generate a marketplace-ready product cover/banner.
 * TODO: Map to real KIE.ai endpoint: POST /generate-cover
 */
export async function generateMarketplaceCover(
  imageUrl: string,
  prompt: string
): Promise<ProcessResult> {
  if (!isRealMode) {
    await mockDelay(3000)
    return { success: true, resultUrl: '/demo/result-3.jpg' }
  }
  // TODO: replace with real endpoint
  const result = await kieRequest('/generate-cover', { imageUrl, prompt })
  return { success: true, resultUrl: result.outputUrl }
}

/**
 * Generate SEO product title for marketplace.
 * TODO: Map to real KIE.ai endpoint: POST /generate-title
 */
export async function generateTitle(productData: {
  category?: string
  description?: string
  keywords?: string[]
}): Promise<GenerateTextResult> {
  if (!isRealMode) {
    await mockDelay(1500)
    return {
      success: true,
      text: `${productData.category || 'Товар'} — купить с доставкой по России | лучшая цена`,
    }
  }
  // TODO: replace with real endpoint
  const result = await kieRequest('/generate-title', productData)
  return { success: true, text: result.title }
}

/**
 * Generate SEO product description for marketplace.
 * TODO: Map to real KIE.ai endpoint: POST /generate-description
 */
export async function generateDescription(productData: {
  title?: string
  category?: string
  features?: string[]
}): Promise<GenerateTextResult> {
  if (!isRealMode) {
    await mockDelay(2000)
    return {
      success: true,
      text: `Высококачественный товар категории "${productData.category || 'Общее'}". Отличается надёжностью и удобством использования. Подходит для ежедневного использования. Быстрая доставка по всей России.`,
    }
  }
  // TODO: replace with real endpoint
  const result = await kieRequest('/generate-description', productData)
  return { success: true, text: result.description }
}

/**
 * Process a full project with all selected operations.
 * Returns array of result image URLs.
 */
export async function processProject(
  imageUrls: string[],
  operations: string[]
): Promise<{ resultImages: string[]; generatedTitle?: string; generatedDescription?: string }> {
  if (!isRealMode) {
    await mockDelay(3000)
    return {
      resultImages: MOCK_RESULT_IMAGES,
      generatedTitle: operations.includes('gen_title')
        ? 'Качественный товар — купить онлайн | WBPhotoAI'
        : undefined,
      generatedDescription: operations.includes('gen_description')
        ? 'Отличный продукт для вашего магазина. Профессиональные фото, высокое качество.'
        : undefined,
    }
  }

  const results: string[] = []
  for (const imageUrl of imageUrls) {
    if (operations.includes('remove_bg')) {
      const r = await removeBackground(imageUrl)
      if (r.resultUrl) results.push(r.resultUrl)
    }
    if (operations.includes('upscale')) {
      const r = await upscaleImage(imageUrl)
      if (r.resultUrl) results.push(r.resultUrl)
    }
    if (operations.includes('cover')) {
      const r = await generateMarketplaceCover(imageUrl, 'marketplace product cover')
      if (r.resultUrl) results.push(r.resultUrl)
    }
  }

  return { resultImages: results }
}
