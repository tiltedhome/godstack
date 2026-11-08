// Turns the single-file build into an artifact page: the artifact host supplies
// <!doctype>, <html>, <head> and <body>, so we keep only title, styles, scripts and markup.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const html = readFileSync('dist-artifact/index.html', 'utf8')
const title = html.match(/<title>[\s\S]*?<\/title>/)[0]
const metas = [...html.matchAll(/<meta name="claude:[^"]*"[^>]*>/g)].map((m) => m[0])
const fonts = [...html.matchAll(/<link rel="(?:stylesheet|preconnect)"[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>/g)].map((m) => m[0])
const styles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/g)].map((m) => m[0])
const scripts = [...html.matchAll(/<script[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0])
const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '').trim()

const out = [title, ...metas, ...fonts, ...styles, body, ...scripts].join('\n')
mkdirSync('dist-artifact', { recursive: true })
writeFileSync('dist-artifact/godstack.html', out)
console.log(`dist-artifact/godstack.html ${(out.length / 1024).toFixed(1)} KiB`)
