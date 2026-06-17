import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './design/global.css';
import { probe } from './utils/scoreClient';

createApp(App).use(createPinia()).mount('#app');
probe();
