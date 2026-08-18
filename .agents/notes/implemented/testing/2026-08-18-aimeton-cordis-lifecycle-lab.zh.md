# Agent Note: AIMETON Cordis lifecycle lab contract

Status: implemented

[English](2026-08-18-aimeton-cordis-lifecycle-lab.md) | 中文

## Problem

AIMETON 正在评估 Cordis 作为动态运行时组合机制的技术供体。文档声明：插件卸载时其 effects 会被回收；必需服务丢失时依赖插件会停用；能力提供者可以在不重启进程的情况下替换；异步 disposer 会在清理完成后才结束。只有在固定 intake revision 的 vendored source 上得到实际测量，这些声明才能成为 AIMETON 的证据。实验还必须明确区分生命周期组合与安全隔离：任意 JavaScript 代码一旦拿到权威对象的可变引用，就可能在失败之前修改它。

## Decision

AIMETON LAB-H 分支保持 `vendor/cordis` 不变，并增加聚焦测试 `scripts/aimeton-exp-h01a.spec.ts`。测试使用仓库正常的 source-plane `@deepseek-ai/cordis` 映射，并验证三个合同：

1. 一个通过依赖注入获得能力的 consumer 在 A → B → C 多次 provider 替换过程中无需修改 consumer 代码；provider dispose 后服务消失，consumer 回到 `PENDING`，其已注册 cleanup 完成后才允许下一 provider 重新激活；
2. 受控异步 effect disposer 必须完全结束后 `fiber.dispose()` 才能 resolve；
3. 一个故意失败、同时闭包捕获外部 sovereign-state 对象的插件可以在失败前修改该对象，从而证明 Cordis lifecycle 本身不是 authority、transaction、rollback 或 sandbox 边界。

第三项是 AIMETON 采用 Cordis 时必须保留的负面保证。因此 Project/Mission/Truth/Authority/Cost/Time/Fencing 等 sovereign state 必须留在 AIMETON-owned API、值拷贝边界、授权 grant 或更强的 process/sandbox isolation 后面。普通 Cordis 插件不得获得可变权威对象的 ambient reference。

实验放在 `scripts/`，而不是 DeepSeek Harness 的 product package 中，因为 EXP-H01A 测量的是 donor runtime，并未给 DeepSeek Harness 增加新的产品能力。固定 intake revision 下的 vendored Cordis source 保持与 upstream 一致。

## Alternatives considered

**修改 `vendor/cordis` 的测试。** 拒绝。LAB-H 的目标是测量 donor，而不是形成 AIMETON 自己的 Cordis fork。修改 vendored source 或其原生测试会削弱 provenance，也会增加未来与 upstream 比较的困难。

**在 DeepSeek Harness 中创建 AIMETON production package。** 拒绝。EXP-H01A 是研究证据，不是已经采用的组件。在 adoption decision 之前创建产品包会错误暗示运行时承诺。

**只相信 Cordis 教程，不做可执行测试。** 拒绝。文档只是 M1/source evidence。AIMETON 还需要独立的可执行观察来证明 cleanup、provider replacement，以及 authority boundary 的负面结论。

## Consequences

- LAB-H 在不修改 donor source 的前提下获得可重复执行的证据。
- 每次未来 upstream rebase 后都可以重新运行 provider replacement/disposal 测试，检测兼容性漂移。
- 负面边界测试绿色意味着“Cordis 不隔离 ambient authoritative references”，绝不能误读为已经证明 sandbox 安全。
- 结果支持吸收 lifecycle/effect pattern，同时继续把 PluginAdmissionPolicy 和 sovereign state 放在普通 plugin realm 之外。
- 该测试完全 keyless，不调用 provider，不修改 production，也不产生付费操作。
