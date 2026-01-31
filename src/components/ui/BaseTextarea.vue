<template>
  <textarea
    class="base-textarea"
    :class="[sizeClass, { 'is-block': block }]"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    :readonly="readonly"
    @input="onInput"
  ></textarea>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
  placeholder: { type: String, default: '' },
  rows: { type: [Number, String], default: 4 },
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
  emit('update:modelValue', value);
};
</script>

<style scoped>
.base-textarea {
  padding: 6px;
  border: 1px solid #bbb;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 13px;
  width: auto;
  resize: vertical;
}
.base-textarea.is-sm {
  padding: 4px 6px;
  font-size: 12px;
}
.base-textarea.is-md {
  padding: 6px;
  font-size: 13px;
}
.base-textarea.is-lg {
  padding: 8px;
  font-size: 14px;
  border-radius: 6px;
}
.base-textarea.is-block {
  width: 100%;
}
</style>
