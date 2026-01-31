<template>
  <input
    :type="type"
    class="base-input"
    :class="[sizeClass, { 'is-block': block }]"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    @input="onInput"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  size: { type: String, default: 'md' },
  block: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const sizeClass = computed(() => `is-${props.size}`);

const onInput = (event) => {
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
.base-input {
  padding: 6px;
  border: 1px solid #bbb;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 13px;
}
.base-input.is-sm {
  padding: 4px 6px;
  font-size: 12px;
}
.base-input.is-md {
  padding: 6px;
  font-size: 13px;
}
.base-input.is-lg {
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
}
.base-input.is-block {
  width: 100%;
}
</style>
