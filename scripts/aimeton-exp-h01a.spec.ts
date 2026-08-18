import { describe, expect, it } from 'vitest'
import { Context, FiberState } from '@deepseek-ai/cordis'

const CAPABILITY = 'aimetonLabCapability'

type Capability = {
  readonly provider: string
}

function deferred(): { readonly promise: Promise<void>; readonly resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

async function createReadyContext(): Promise<Context> {
  const ctx = new Context()
  const warmup = ctx.plugin(function aimetonInvariantWarmup() {})
  await warmup
  await warmup.dispose()
  return ctx
}

function capabilityProvider(provider: string, lifecycle: string[]) {
  return {
    name: `aimeton-provider-${provider}`,
    apply(ctx: Context) {
      lifecycle.push(`provider:${provider}:start`)
      ctx.provide(CAPABILITY, { provider } satisfies Capability)
      ctx.effect(() => () => {
        lifecycle.push(`provider:${provider}:stop`)
      }, `aimeton-provider-${provider}-lifecycle`)
    },
  }
}

describe('AIMETON LAB-H EXP-H01A Cordis lifecycle', () => {
  it('replaces a required capability provider without changing the consumer or leaking stale registrations', async () => {
    const ctx = await createReadyContext()
    const lifecycle: string[] = []
    const consumerStarts: string[] = []
    const consumerStops: string[] = []

    const consumer = {
      name: 'aimeton-capability-consumer',
      inject: [CAPABILITY],
      apply(consumerCtx: Context) {
        const capability = consumerCtx.get(CAPABILITY) as Capability | undefined
        if (capability === undefined) throw new Error('required capability missing inside active consumer')
        consumerStarts.push(capability.provider)
        consumerCtx.effect(() => () => {
          consumerStops.push(capability.provider)
        }, 'aimeton-consumer-lifecycle')
      },
    }

    const consumerFiber = ctx.plugin(consumer)
    expect(consumerFiber.state).toBe(FiberState.PENDING)

    for (const provider of ['A', 'B', 'C']) {
      const providerFiber = ctx.plugin(capabilityProvider(provider, lifecycle))
      await providerFiber
      await consumerFiber

      expect(consumerFiber.state).toBe(FiberState.ACTIVE)
      expect((ctx.get(CAPABILITY) as Capability | undefined)?.provider).toBe(provider)

      await providerFiber.dispose()

      expect(providerFiber.state).toBe(FiberState.DISPOSED)
      expect(consumerFiber.state).toBe(FiberState.PENDING)
      expect(ctx.get(CAPABILITY)).toBeUndefined()
    }

    expect(consumerStarts).toEqual(['A', 'B', 'C'])
    expect(consumerStops).toEqual(['A', 'B', 'C'])
    expect(lifecycle).toEqual([
      'provider:A:start',
      'provider:A:stop',
      'provider:B:start',
      'provider:B:stop',
      'provider:C:start',
      'provider:C:stop',
    ])

    await consumerFiber.dispose()
    expect(consumerFiber.state).toBe(FiberState.DISPOSED)
  })

  it('waits for asynchronous effect cleanup before reporting disposal complete', async () => {
    const ctx = await createReadyContext()
    const cleanupEntered = deferred()
    const releaseCleanup = deferred()
    let cleanupFinished = false

    const plugin = {
      name: 'aimeton-async-cleanup',
      apply(pluginCtx: Context) {
        pluginCtx.effect(() => async () => {
          cleanupEntered.resolve()
          await releaseCleanup.promise
          cleanupFinished = true
        }, 'aimeton-controlled-async-cleanup')
      },
    }

    const fiber = ctx.plugin(plugin)
    await fiber

    const disposal = fiber.dispose()
    await cleanupEntered.promise

    expect(fiber.state).toBe(FiberState.UNLOADING)
    expect(cleanupFinished).toBe(false)

    releaseCleanup.resolve()
    await disposal

    expect(cleanupFinished).toBe(true)
    expect(fiber.state).toBe(FiberState.DISPOSED)
  })

  it('proves Cordis lifecycle is not a security boundary for ambient sovereign references', async () => {
    const ctx = await createReadyContext()
    const sovereignState = { missionStatus: 'active' }
    const failure = new Error('lab plugin failed after ambient mutation')

    const plugin = function ambientAuthorityPlugin() {
      sovereignState.missionStatus = 'corrupted'
      throw failure
    }

    const fiber = ctx.plugin(plugin)
    await expect(fiber).rejects.toBe(failure)

    expect(fiber.state).toBe(FiberState.FAILED)
    expect(sovereignState.missionStatus).toBe('corrupted')

    await fiber.dispose()
    expect(fiber.state).toBe(FiberState.DISPOSED)
  })
})
