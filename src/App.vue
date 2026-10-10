<script setup>
</script>

<template>
  <div id="app">
    <div id="main" class="p-0" style="margin-left: 0 !important; min-height: 100vh;">
        <router-view />
    </div>
  </div>
</template>

<style>
body {
    background-color: var(--bg-2);
    color: var(--fg-body);
    margin: 0;
    padding: 0;
}
</style>
