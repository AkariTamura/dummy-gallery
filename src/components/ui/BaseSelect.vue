<template>
  <select
    class="base-select"
    :class="[sizeClass, { 'is-block': block }]"
    :value="modelValue"
    :disabled="disabled"
    @change="onChange"
  >
    <slot />
  </select>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, null], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const sizeClass = computed(() => `is-${props.size}`);

const onChange = (event) => {
  let value = event.target.value;
  if (props.modelModifiers.trim) value = value.trim();
  if (props.modelModifiers.number) {
    if (value === '') {
      value = '';
    } else {
      const n = Number.parseFloat(value);
      value = Number.isNaN(n) ? value : n;
    }
  }
  emit('update:modelValue', value);
};
</script>

<style scoped>
.base-select {
  padding: 6px 8px;
  border: 1px solid #bbb;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 13px;
  background: #fff;
}
.base-select.is-sm {
  padding: 4px 6px;
  font-size: 12px;
}
.base-select.is-md {
  padding: 6px 8px;
  font-size: 13px;
}
.base-select.is-lg {
  padding: 8px 10px;
  font-size: 14px;
  border-radius: 6px;
}
.base-select.is-block {
  width: 100%;
}
</style>
