import { Condition, EbayListing } from '@/types'

const EBAY_API_URL = 'https://api.ebay.com/ws/api.dll'

function getHeaders(callName: string) {
  return {
    'X-EBAY-API-SITEID': '0',
    'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
    'X-EBAY-API-CALL-NAME': callName,
    'X-EBAY-API-APP-NAME': process.env.EBAY_APP_ID ?? '',
    'X-EBAY-API-DEV-NAME': process.env.EBAY_DEV_ID ?? '',
    'X-EBAY-API-CERT-NAME': process.env.EBAY_CERT_ID ?? '',
    'Content-Type': 'text/xml',
  }
}

function token() {
  return process.env.EBAY_USER_TOKEN ?? ''
}

// Simple XML value extractor — avoids a full XML parser dependency
function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'g')
  const results: string[] = []
  let match
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

function extract(xml: string, tag: string): string {
  return extractAll(xml, tag)[0] ?? ''
}

function mapCondition(ebayCondition: string): Condition {
  const c = ebayCondition.toLowerCase()
  if (c.includes('new') || c.includes('like new')) return 'excellent'
  if (c.includes('very good') || c.includes('good')) return 'good'
  if (c.includes('acceptable')) return 'fair'
  if (c.includes('parts') || c.includes('not working')) return 'parts'
  return 'good'
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function fetchActiveListings(): Promise<EbayListing[]> {
  // Fetch up to 200 active listings (pagination could be added later)
  const body = `<?xml version="1.0" encoding="utf-8"?>
<GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${token()}</eBayAuthToken>
  </RequesterCredentials>
  <ActiveList>true</ActiveList>
  <StartTimeFrom>${new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()}</StartTimeFrom>
  <StartTimeTo>${new Date().toISOString()}</StartTimeTo>
  <Pagination>
    <EntriesPerPage>200</EntriesPerPage>
    <PageNumber>1</PageNumber>
  </Pagination>
  <DetailLevel>ReturnAll</DetailLevel>
  <GranularityLevel>Fine</GranularityLevel>
</GetSellerListRequest>`

  const res = await fetch(EBAY_API_URL, {
    method: 'POST',
    headers: getHeaders('GetSellerList'),
    body,
  })

  const xml = await res.text()

  // Extract each <Item> block
  const itemBlocks = extractAll(xml, 'Item')

  return itemBlocks.map((item) => {
    const itemId = extract(item, 'ItemID')
    const title = extract(item, 'Title')
    const currentPrice = extract(item, 'CurrentPrice') || extract(item, 'BuyItNowPrice') || extract(item, 'StartPrice')
    const priceCents = Math.round(parseFloat(currentPrice || '0') * 100)
    const description = stripHtml(extract(item, 'Description'))
    const conditionDisplayName = extract(item, 'ConditionDisplayName')
    const condition = mapCondition(conditionDisplayName)

    // Collect all picture URLs
    const pictureUrls = extractAll(item, 'PictureURL')
    // Also try GalleryURL as fallback
    const galleryUrl = extract(item, 'GalleryURL')
    const imageUrls = pictureUrls.length > 0 ? pictureUrls : (galleryUrl ? [galleryUrl] : [])

    const ebayUrl = `https://www.ebay.com/itm/${itemId}`

    return { itemId, title, priceCents, description: description || null, imageUrls, condition, ebayUrl }
  }).filter((l) => l.itemId && l.title)
}

export async function checkListingActive(itemId: string): Promise<boolean> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<GetItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${token()}</eBayAuthToken>
  </RequesterCredentials>
  <ItemID>${itemId}</ItemID>
  <DetailLevel>ItemReturnDescription</DetailLevel>
</GetItemRequest>`

  const res = await fetch(EBAY_API_URL, {
    method: 'POST',
    headers: getHeaders('GetItem'),
    body,
  })

  const xml = await res.text()
  const listingStatus = extract(xml, 'ListingStatus')
  return listingStatus === 'Active'
}
