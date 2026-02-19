import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';
import bridge from '@vkontakte/vk-bridge';

import coinIcon from './imgs/coin.png'
import cupsIcon from './imgs/cups.png'

export default function Balance({ id, goBack, balance, goToBalance }) {
    const [user, setUser] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const currentUserRef = useRef(null);
    const [isUserVisible, setIsUserVisible] = useState(true);
    
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

    useEffect(() => {
        const element = currentUserRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsUserVisible(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.2,
            }
        );

        observer.observe(element);

        return () => observer.unobserve(element);
    }, [usersList, user]);

    return (
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
            <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />
                        
            {/* Кастомный хедер */}
            <Div
                style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                zIndex: 1000,
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
                        color: '#ceaeff',
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
                        padding: '2px 18px 2px 2px',
                        backgroundColor: '#f2f2f2',
                        borderRadius: 999,
                        cursor: 'pointer',
                    }}
                >
                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                    <CustomText
                        weight="1"
                        style={{
                            fontSize: 14,
                            color: '#8c64d7',
                            lineHeight: '18px',
                        }}
                    >
                        {balance}
                    </CustomText>
                </div>
            </Div>

            <Div style={{ padding: '10px', backgroundColor: '#ceaeff' }}>
                <Card
                    mode="shadow"
                    style={{
                        borderRadius: 10,
                        padding: '20px 15px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#ffffff',
                        marginBottom: 20,
                    }}
                >
                    {/* Текст */}
                    <CustomText
                        weight="1"
                        style={{
                            fontSize: 16,
                            color: '#000',
                        }}
                    >
                        Рейтинг пользователей
                    </CustomText>

                    {/* Картинка справа */}
                    <img
                        src={cupsIcon}
                        alt="trophy"
                        style={{
                            width: 75,
                            height: 75,
                            objectFit: 'contain',
                            position: 'absolute',
                            right: 10,
                        }}
                    />
                </Card>
                
                <Card
                    mode="shadow"
                    style={{
                        borderRadius: 10,
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        paddingTop: 15,
                    }}
                >
                    {/* Таблица рейтинга */}
                    {usersList.map((u, index) => {
                        const isCurrentUser = user && user.id === u.id; // предполагаем, что в базе vkId = user.id
                        return (
                            <Card
                                key={u.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '2px 13px',
                                    marginBottom: 8,
                                    borderRadius: 999,

                                    backgroundColor:
                                        index === 0 ? '#8c64d7' :
                                        index === 1 ? '#ceaeff' :
                                        index === 2 ? '#eaddff' :
                                        '#ffffff',

                                    color:
                                        index === 0 ? '#ffffff' :
                                        '#000000',

                                    border: isCurrentUser
                                        ? '1px solid #8c64d7'
                                        : index > 2
                                            ? '1px solid #eaddff'
                                            : 'none',
                                }}
                            >
                                <div ref={isCurrentUser ? currentUserRef : null}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <CustomText weight={isCurrentUser ? "1" : "2"} style={{ fontSize: 12, width: 30 }}>
                                        {index + 1}.
                                    </CustomText>
                                    <CustomText
                                        weight={isCurrentUser ? "1" : "2"}
                                        style={{
                                            fontSize: 12,
                                            width: 30,
                                            flex: 1,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {u.last_name} {u.first_name}
                                    </CustomText>
                                    <CustomText weight="1" style={{ fontSize: 12 }}>
                                        {u.totalEarned}
                                    </CustomText>
                                </div>
                            </Card>
                        );
                    })}
                </Card>

                {!isUserVisible && user && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 15,
                            left: 20,
                            right: 20,
                            zIndex: 2000,
                        }}
                    >
                        {usersList
                            .filter(u => u.id === user.id)
                            .map((u, index) => {
                                const position = usersList.findIndex(x => x.id === user.id);

                                return (
                                    <Card
                                        key="sticky-user"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 13px',
                                            borderRadius: 999,
                                            backgroundColor: '#ffffff',
                                            border: '2px solid #8c64d7',
                                            boxShadow: '0 6px 30px rgba(0,0,0,0.15)',
                                        }}
                                    >
                                        <CustomText style={{ fontSize: 12, width: 30 }}>
                                            {position + 1}.
                                        </CustomText>

                                        <CustomText
                                            weight="1"
                                            style={{
                                                fontSize: 12,
                                                flex: 1,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {u.last_name} {u.first_name}
                                        </CustomText>

                                        <CustomText style={{ fontSize: 12, fontWeight: 1000 }}>
                                            {u.totalEarned}
                                        </CustomText>
                                    </Card>
                                );
                            })}
                    </div>
                )}
            </Div>
        </Panel>
    );
}