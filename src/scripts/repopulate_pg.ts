import fs from 'fs'
import path from 'path'

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && vals.length > 0) {
        env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '')
    }
})

const BASE_URL = 'http://localhost:3000' // Use localhost 3000 directly as confirmed by netstat
const SECRET = env['CRON_SECRET'] || 'sk_internal_9k8d7f6g5h4j3s2a1'

async function triggerSync(path: string) {
    console.log(`\n--- Starting sync: ${path} ---`)
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SECRET}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) {
            const err = await res.text()
            console.error(`Error ${res.status}: ${err}`)
            return false
        }

        const data = await res.json()
        console.log(`Success:`, JSON.stringify(data, null, 2))
        return true
    } catch (error: any) {
        console.error(`Fetch error: ${error.message}`)
        return false
    }
}

async function main() {
    console.log('--- REPOPULATING POSTGRESQL ---')
    console.log('Target URL:', BASE_URL)

    const steps = [
        '/api/synchro/brut',
        '/api/synchro/rh',
        '/api/synchro/ad'
    ]

    for (const step of steps) {
        const ok = await triggerSync(step)
        if (!ok) {
            console.error(`Step ${step} failed. Aborting.`)
            process.exit(1)
        }
    }

    console.log('\n--- ALL SYNC STEPS COMPLETED ---')
}

main()
