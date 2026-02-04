import { useEffect, useState } from 'react';
import { Panel, Div, Text, Button, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

import coinsIcon from './imgs/coins.png'

export default function Balance({ id, goBack, balance, goToBalance }) {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    
    useEffect(() => {
        bridge.send('VKWebAppGetUserInfo')
            .then(u => setUser(u))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        fetch('http://localhost:3001/api/users') // endpoint для всех пользователей
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => b.totalEarned - a.totalEarned);
                setUsersList(sorted);
            });
    }, []);

    return (
        <Panel id={id}>
            <Div style={{ height: 32, backgroundColor: '#ffffff' }} />
                        
            {/* Кастомный хедер */}
            <Div
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                zIndex: 1000,
                boxShadow: '0 15px 15px rgba(0,0,0,0.08)',
                borderBottom: '1px solid #bdbdbd',
                }}
            >
                {/* Кнопка назад */}
                <Button
                    mode="tertiary"
                    size="l"
                    before={<Icon28ChevronBack />}
                    onClick={goBack}
                    style={{
                        paddingLeft: 0,
                        paddingRight: 8,
                        marginRight: 4,
                        color: '#311f68',
                    }}
                >
                    Назад
                </Button>
                            
                {/* Баланс-капсула */}
                <div
                    onClick={goToBalance}
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        backgroundColor: '#f2f2f2',
                        borderRadius: 999,
                        cursor: 'pointer',
                    }}
                >
                    <img src={coinsIcon} alt="coins" style={{ height: 25, width: 25 }} />
                    <Text
                        weight="3"
                        style={{
                            fontSize: 14,
                            color: '#4000ff',
                            lineHeight: '18px',
                        }}
                    >
                        {balance}
                    </Text>
                </div>
            </Div>

            <Div style={{ paddingTop: 64, paddingBottom: 32, backgroundColor: '#ffffff' }}>
                <Text weight="3" style={{ fontSize: 20, color: '#311f68', textAlign: 'center', marginBottom: 16 }}>
                    Рейтинг пользователей
                </Text>

                {/* Таблица рейтинга */}
                {usersList.map((u, index) => {
                    const isCurrentUser = user && user.id === u.id; // предполагаем, что в базе vkId = user.id
                    return (
                        <Card
                            key={u.id}
                            mode="shadow"
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 16px',
                                marginBottom: 8,
                                borderRadius: 12,
                                backgroundColor: isCurrentUser ? '#f0edff' : '#ffffff',
                            }}
                        >
                            <Text weight="3" style={{ fontSize: 16, color: '#311f68', width: 30 }}>
                                {index + 1}.
                            </Text>
                            <Text weight="3" style={{ fontSize: 16, color: '#311f68', flex: 1 }}>
                                {u.last_name} {u.first_name}
                            </Text>
                            <Text weight="3" style={{ fontSize: 16, color: '#4000ff' }}>
                                {u.totalEarned}
                            </Text>
                        </Card>
                    );
                })}
            </Div>

            <Div 
                style={{
                    backgroundColor: '#ffffff',
                    minHeight: '100vh',
                    color: '#fff',
                }}
            >
                {/* Контент будет здесь */}
            </Div>
        </Panel>
    );
}