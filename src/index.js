import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import bridge from '@vkontakte/vk-bridge';

import '@vkontakte/vkui/dist/vkui.css';
import { ConfigProvider, AdaptivityProvider, AppRoot } from '@vkontakte/vkui';

bridge.send('VKWebAppInit')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ConfigProvider>
        <AdaptivityProvider>
            <AppRoot>
                <App />
            </AppRoot>
        </AdaptivityProvider>
    </ConfigProvider>
);