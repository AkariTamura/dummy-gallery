<template>
  <button
    :type="type"
    class="base-button"
    :class="[variantClass, sizeClass, { 'is-block': block, 'is-loading': loading }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

defineEmits(['click']);

const variantClass = computed(() => `is-${props.variant}`);
const sizeClass = computed(() => `is-${props.size}`);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  background: #28a745;
  transition: opacity 0.15s ease;
}
.base-button:hover {
  opacity: 0.9;
}
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.base-button.is-block {
  width: 100%;
}

.base-button.is-primary {
  background: #28a745;
}
.base-button.is-secondary {
  background: #6c757d;
}
.base-button.is-danger {
  background: #dc3545;
}
.base-button.is-copy {
  background: #17a2b8;
}

.base-button.is-sm {
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
}
.base-button.is-md {
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 4px;
}
.base-button.is-lg {
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 6px;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
