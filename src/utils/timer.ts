// 答题计时 composable：越快越加分，超时自动 onExpire 不扣分
import { ref, onUnmounted } from 'vue';

export interface TimerOptions {
  duration: number;        // 总秒数
  onExpire?: () => void;   // 超时回调（不扣分，调用方自行决定跳转）
  warnAt?: number;         // 警告秒数（剩余时间 ≤ 该值进入 warn 状态）
}

export function useTimer(opts: TimerOptions) {
  const remaining = ref(opts.duration);
  const running = ref(false);
  const expired = ref(false);
  let intervalId: number | null = null;
  let startTime = 0;
  let elapsedAtStart = 0;

  function start() {
    if (running.value || expired.value) return;
    running.value = true;
    startTime = Date.now();
    elapsedAtStart = opts.duration - remaining.value;
    intervalId = window.setInterval(tick, 100);
  }
  function tick() {
    const elapsed = elapsedAtStart + (Date.now() - startTime) / 1000;
    remaining.value = Math.max(0, opts.duration - elapsed);
    if (remaining.value <= 0) {
      stop();
      expired.value = true;
      opts.onExpire?.();
    }
  }
  function stop() {
    running.value = false;
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
  }
  function reset() {
    stop();
    remaining.value = opts.duration;
    expired.value = false;
  }

  /** 速度奖励：剩余越多分越高，按 ceiling 整数化 */
  function speedBonus(maxBonus: number): number {
    if (expired.value) return 0;
    const ratio = remaining.value / opts.duration;
    return Math.ceil(maxBonus * ratio);
  }

  onUnmounted(stop);
  return { remaining, running, expired, start, stop, reset, speedBonus };
}
