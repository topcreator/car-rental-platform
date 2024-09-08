import 'dotenv/config'
import * as env from '@/config/env.config'

describe('Test configuration options', () => {
    it('should test configuration options', async () => {
        const SMTP_HOST = env.__env__('BC_SMTP_HOST', true)
        expect(!!SMTP_HOST).toBeTruthy()

        let res = true
        try {
            const UNKNOWN = env.__env__('BC_UNKNOWN', true)
            expect(!!UNKNOWN).toBeFalsy()
        } catch {
            res = false
        }
        expect(res).toBeFalsy()

        const PORT = env.__env__('BC_PORT', false, '4002')
        expect(!!PORT).toBeTruthy()

        const UNKNOWN = env.__env__('BC_UNKNOWN', false)
        expect(!!UNKNOWN).toBeFalsy()
    })
})
