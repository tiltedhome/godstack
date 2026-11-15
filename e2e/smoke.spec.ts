import { expect, test } from '@playwright/test'
const url=new URL('../dist/index.html',import.meta.url).href
test('the complete hearing, second reading and notes work without errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 await page.goto(url)
 await expect(page.locator('h1')).toContainText('Who authorized')
 for(let i=0;i<24;i++)await page.locator('#next').click()
 await expect(page.locator('#story')).toContainText('The summons was unchanged')
 await expect(page.locator('#loop-label')).toContainText('READING 2')
 await page.locator('#notes').click();await expect(page.locator('dialog')).toBeVisible()
 await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible()
 await expect(page.locator('#notes')).toBeFocused()
 expect(errors).toEqual([])
})
test('deep links, chapter selection and keyboard navigation agree',async({page})=>{
 await page.goto(url+'#body/2');await expect(page.locator('#story')).toContainText('her father')
 await page.keyboard.press('ArrowRight');await expect(page.locator('#beat-index')).toHaveText('PASSAGE 3 OF 3')
 await page.getByRole('button',{name:'Chapter 6: Our children',exact:true}).click();await expect(page.locator('h1')).toContainText('modelled us')
 await page.reload();await expect(page.locator('#chapter-index')).toContainText('06')
})
test('mobile layout, muted default and reduced motion remain usable',async({page},testInfo)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(url)
 await expect(page.locator('#sound')).toHaveAttribute('aria-pressed','false')
 await expect(page.locator('#autoplay')).toHaveAttribute('aria-pressed','false')
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.locator('#pluck').click();await expect(page.locator('canvas')).toBeVisible()
 await page.screenshot({path:`test-results/${testInfo.project.name}.png`,fullPage:true})
})
test('automatic reading pauses inside field notes',async({page})=>{
 // Keep virtual time focused on reading timers, not thousands of rendered frames.
 await page.emulateMedia({reducedMotion:'reduce'})
 await page.goto(url);await page.locator('#autoplay').click();await page.locator('#notes').click()
 const before=await page.locator('#story').textContent()
 await page.clock.install();await page.clock.runFor(60000)
 expect(await page.locator('#story').textContent()).toBe(before)
 await page.locator('#close-notes').click();await page.clock.runFor(60000)
 expect(await page.locator('#story').textContent()).not.toBe(before)
})

test('every engraving and passage remains readable',async({page},testInfo)=>{
 await page.goto(url)
 for(let chapter=0;chapter<8;chapter++){
  await page.locator('.chapter-nav button').nth(chapter).click()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await expect(page.locator('#story')).toBeVisible()
  await page.screenshot({path:`test-results/${testInfo.project.name}-chapter-${chapter+1}.png`,fullPage:true})
 }
})
