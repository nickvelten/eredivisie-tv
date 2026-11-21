import { expect, test } from '@playwright/test'

// Every page type: loads, has exactly one h1, a canonical, and no console errors
const PAGES = [
  '/',
  '/eredivisie-op-tv-vandaag',
  '/eredivisie-op-tv-morgen',
  '/programma',
  '/uitslagen',
  '/stand',
  '/topscorers',
  '/statistieken',
  '/clubs',
  '/club/ajax',
  '/vergelijk',
  '/eerste-divisie',
  '/knvb-beker',
  '/widget-insluiten',
  '/eredivisie-dit-weekend',
  '/stand/thuis',
  '/stand/uit',
  '/stand/vorm',
  '/restprogramma',
  '/standcalculator',
  '/zender/espn-1',
  '/gids',
  '/gids/eredivisie-kijken-zonder-ziggo',
  '/speelronde/1',
  '/en',
  '/en/fixtures',
  '/en/table',
  '/en/top-scorers',
  '/en/club/ajax',
]

for (const path of PAGES) {
  test(`renders ${path}`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text())
    })
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1)
    expect(errors).toEqual([])
  })
}

test('first match, player and duel pages work', async ({ page }) => {
  const index = await (await page.request.get('/api/zoek-index')).json()
  const match = index.find((i: { type: string }) => i.type === 'wedstrijd')
  const player = index.find((i: { type: string }) => i.type === 'speler')
  for (const href of [match.href, player.href, '/duel/ajax-feyenoord']) {
    const res = await page.goto(href)
    expect(res?.status(), href).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
  }
})

test('old numeric match URLs redirect to the slug', async ({ request }) => {
  const index = await (await request.get('/api/zoek-index')).json()
  const match = index.find((i: { type: string }) => i.type === 'wedstrijd')
  const id = match.href.match(/(\d+)$/)[1]
  const res = await request.get(`/wedstrijd/${id}`, { maxRedirects: 0 })
  expect(res.status()).toBe(308)
  expect(res.headers().location).toContain(match.href)
})

test('old club URLs redirect to the short slug', async ({ request }) => {
  const res = await request.get('/club/ajax-amsterdam', { maxRedirects: 0 })
  expect(res.status()).toBe(308)
  expect(res.headers().location).toMatch(/\/club\/ajax$/)
  expect((await request.get('/api/ics/club/psv-eindhoven')).status()).toBe(200)
})

test('unknown pages return 404 inside the site layout', async ({ page }) => {
  const res = await page.goto('/bestaat-niet')
  expect(res?.status()).toBe(404)
  await expect(page.locator('header')).toBeVisible()
})

test('search finds a club', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Zoek club of speler' }).click()
  await page.getByRole('combobox', { name: 'Zoeken' }).fill('feyenoord')
  await expect(page.getByRole('option').first()).toContainText('Feyenoord')
})

test('links start the new page at the top', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.locator('footer a[href^="/club/"]').first().click()
  await page.waitForURL(/\/club\//)
  // The URL changes before the new page has rendered; wait for the reset
  await expect(page.locator('h1')).toContainText('op TV')
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBe(0)
})

test('sitemaps and robots', async ({ request }) => {
  for (const path of ['/sitemap.xml', '/speler/sitemap.xml', '/robots.txt']) {
    expect((await request.get(path)).status(), path).toBe(200)
  }
})

test('Dutch and English pages point at each other with hreflang', async ({ page }) => {
  await page.goto('/stand')
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://eredivisie.tv/en/table')
  await page.goto('/en/table')
  await expect(page.locator('link[rel="alternate"][hreflang="nl"]')).toHaveAttribute('href', 'https://eredivisie.tv/stand')
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1)
})

test('English match page renders', async ({ page }) => {
  const index = await (await page.request.get('/api/zoek-index')).json()
  const match = index.find((i: { href: string }) => i.href.startsWith('/wedstrijd/'))
  const res = await page.goto(match.href.replace('/wedstrijd/', '/en/match/'))
  expect(res?.status()).toBe(200)
  await expect(page.locator('h1')).toContainText(' vs ')
})

test.describe('English-speaking visitor', () => {
  test.use({ locale: 'en-US' })
  test('sees a dismissible hint to the English page', async ({ page }) => {
    await page.goto('/stand')
    const hint = page.getByRole('link', { name: 'View this page in English →' })
    await expect(hint).toHaveAttribute('href', '/en/table')
    await page.getByRole('button', { name: 'Dismiss' }).click()
    await expect(hint).toHaveCount(0)
  })
})
