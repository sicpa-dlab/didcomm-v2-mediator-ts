export default () => ({
  memoryHeapThresholdMb: process.env.HEALTH_MEMORY_HEAP_THRESHOLD_MB
    ? parseInt(process.env.HEALTH_MEMORY_HEAP_THRESHOLD_MB, 10)
    : 2048,
  memoryRSSThresholdMb: process.env.HEALTH_MEMORY_RSS_THRESHOLD_MB
    ? parseInt(process.env.HEALTH_MEMORY_RSS_THRESHOLD_MB, 10)
    : 2048,
})
