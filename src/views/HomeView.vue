<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '../i18n/index.js';

const router = useRouter();
const { t } = useI18n();
const projectSlug = ref('');

const goToProject = () => {
    if (projectSlug.value.trim()) {
        router.push(`/${projectSlug.value.trim()}`);
    }
};
</script>

<template>
    <div class="row justify-content-center align-items-center" style="height: 80vh;">
        <div class="col-md-6 col-lg-4">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h4 class="card-title text-center mb-4">{{ t('homeTitle') }}</h4>
                    <form @submit.prevent="goToProject">
                        <div class="mb-3">
                            <label for="slugInput" class="form-label">{{ t('projectIdentifier') }}</label>
                            <input 
                                type="text" 
                                class="form-control" 
                                id="slugInput" 
                                v-model="projectSlug"
                                :placeholder="t('projectPlaceholder')"
                                required
                            >
                        </div>
                        <button type="submit" class="btn btn-primary w-100">
                            {{ t('loadSchedule') }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>