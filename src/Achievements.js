import { useState } from 'react';

import { Panel, Div, Button, Card, ModalRoot, ModalCard } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon24Cancel } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import medalIcon from './imgs/awards.png'
import kapustaIcon from './imgs/kapusta.png'
import lockIcon from './imgs/lock.png'
import coinsIcon from './imgs/morecoins.png'
import collectIcon from './imgs/collectionaire.png'
import boxcalIcon from './imgs/boxcalendar.png'

export default function Achievements({ id, goBack, balance, goToBalance, user, totalEarned, goToTasks }) {
    const [activeModal, setActiveModal] = useState(null);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

    const openAchievement = (ach) => {
        setSelectedAchievement(ach);
        setActiveModal('achievement');
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const achievements = [
        {
            id: 1,
            title: <> Срубил <s>капусту</s> щаницу </>,
            description: 'накопи 5000 капиталов',
            target: 5000,
            icon: kapustaIcon
        },
        {
            id: 2,
            title: 'Капитальный капитал',
            description: 'накопи 10000 капиталов',
            target: 10000,
            icon: coinsIcon
        },
        {
            id: 3,
            title: 'Артефакт Постоянства',
            description: 'заходи 10 дней подряд',
            target: 10,
            type: 'streak',
            icon: boxcalIcon
        },
        {
            id: 4,
            title: 'Коллекционер',
            description: 'собери 10 артефактов',
            target: 10,
            type: 'received',
            icon: collectIcon
        },
        {
            id: 5,
            title: 'На Стиле',
            description: 'подпишись на группу Ивановский Стиль',
            target: 1,
            type: 'vk_subscribed',
            icon: lockIcon
        }
        ];

    const ModalCloseButton = ({ onClick }) => (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                top: 10,
                right: 18,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
            }}
        >
            <Icon24Cancel width={16} height={16} fill="#000" />
        </div>
    );
    return (
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
            <ModalRoot activeModal={activeModal} onClose={closeModal}>
                {selectedAchievement && (
                    <ModalCard
                        id="achievement"
                        onClose={closeModal}
                        style={{ padding: 0 }}
                    >
                        <ModalCloseButton
                            onClick={() => {
                                setActiveModal(null);
                            }}
                        />
                        {(() => {
                            let value = totalEarned;

                            if (selectedAchievement.type === 'streak') {
                                value = user.max_streak_days;
                            } else if (selectedAchievement.type === 'received') {
                                value = user.received_count;  
                            } else if (selectedAchievement.type === 'vk_subscribed') {
                                value = user.vk_subscribed ? 1 : 0;
                            }

                            const unlocked = value >= (selectedAchievement.target ?? 1);
                            const progress = selectedAchievement.type === 'vk_subscribed' ? (value ? 100 : 0) : Math.min(100, (value / selectedAchievement.target) * 100);

                            return (
                                <Div style={{ textAlign: 'center', padding: 20, position: 'relative' }}>
                                    {/* Картинка */}
                                    <img
                                        src={unlocked ? selectedAchievement.icon : lockIcon}
                                        alt=""
                                        style={{ width: 130, height: 130, position: 'absolute', top: 0, right: '30%' }}
                                    />

                                    {/* Название */}
                                    <CustomText style={{ fontSize: 18, fontWeight: 400, marginBottom: 2, marginTop: 102 }}>
                                        {selectedAchievement.title}
                                    </CustomText>

                                    {/* Описание */}
                                    <CustomText style={{ fontSize: 10, color: '#555', marginBottom: 25 }}>
                                        {selectedAchievement.description}
                                    </CustomText>

                                    <CustomText
                                        style={{
                                            position: 'absolute',
                                            left: 22,
                                            top: '70%',
                                            transform: 'translateY(-50%)',
                                            fontSize: 10,
                                            color: '#000',
                                            fontWeight: 400
                                        }}
                                    >
                                        {selectedAchievement.type === 'streak'
                                            ? 'Дней подряд'
                                            : selectedAchievement.type === 'received'
                                            ? 'Собрано артефактов'
                                            : selectedAchievement.type === 'vk_subscribed'
                                            ? 'Подписан на группу'
                                            : 'Накоплено капиталов'}
                                    </CustomText>
                                    <CustomText
                                        style={{                                                position: 'absolute',
                                            right: 22,
                                            top: '70%',
                                            transform: 'translateY(-50%)',
                                            fontSize: 10,
                                            color: '#000',
                                            fontWeight: 700
                                        }}
                                    >
                                        {value} из {selectedAchievement.target}
                                    </CustomText>

                                    <div
                                        style={{
                                            position: 'relative',
                                            height: 8,
                                            backgroundColor: '#ddd',
                                            borderRadius: 4,
                                            overflow: 'hidden',
                                            marginBottom: 8
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${progress}%`,
                                                height: '100%',
                                                backgroundColor: '#8c64d7',
                                                transition: 'width 0.3s ease'
                                            }}
                                        />
                                    </div>

                                    <div
                                        onClick={goToTasks}
                                        style={{
                                            marginTop: 18,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: '2px 16px',
                                            backgroundColor: '#8c64d7',
                                            borderRadius: 999,
                                            cursor: 'pointer',
                                            width: '90%',
                                        }}
                                    >
                                        <CustomText weight="1" style={{ fontSize: 10, color: '#fff' }}>
                                            перейти к заданиям
                                        </CustomText>
                                    </div>
                                </Div>
                            );
                        })()}
                    </ModalCard>
                )}
            </ModalRoot>

            <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

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
                
                <div
                    onClick={goToBalance}
                    style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '2px 14px 2px 2px',
                        marginRight: 8,
                        backgroundColor: '#fff',
                        border: '1px solid #ceaeff',
                        borderRadius: 999,
                        cursor: 'pointer',
                    }}
                >
                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                    <CustomText
                        style={{
                            fontSize: 14,
                            color: '#8c64d7',
                            lineHeight: '18px',
                            fontWeight: 1000,
                        }}
                    >
                        {balance}
                    </CustomText>
                </div>
            </Div>

            <Div style={{ backgroundColor: '#ceaeff', padding: 0 }}>
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
                        margin: '10px 16px 8px 16px'
                    }}
                >
                    <CustomText
                        weight="1"
                        style={{
                            fontSize: 16,
                            color: '#000',
                        }}
                    >
                        Достижения
                    </CustomText>

                    <img
                        src={medalIcon}
                        alt="trophy"
                        style={{
                            width: 75,
                            height: 75,
                            objectFit: 'contain',
                            position: 'absolute',
                            right: -2,
                            transform: 'rotate(10deg)',
                        }}
                    />
                </Card>
                
                <Div style={{ padding: 0 }}>
                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 10,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    {achievements.map((ach) => {
                        let value = totalEarned;

                        if (ach.type === 'streak') {
                            value = user.max_streak_days;
                        } else if (ach.type === 'received') {
                            value = user.received_count;  
                        } else if (ach.type === 'vk_subscribed') {
                            value = user.vk_subscribed ? 1 : 0; 
                        }

                        const unlocked = value >= (ach.target ?? 1); 
                        const progress = ach.type === 'vk_subscribed' ? (value ? 100 : 0) : Math.min(100, (value / ach.target) * 100);

                        return (
                            <Card
                                key={ach.id}
                                mode="shadow"
                                onClick={() => openAchievement(ach)}
                                style={{
                                    borderRadius: 14,
                                    aspectRatio: '1 / 1.2',
                                    position: 'relative',
                                    backgroundColor: '#ffffff',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '45%',
                                        left: '50%',
                                        transform: 'translate(-50%, -60%)'
                                    }}
                                >
                                    {unlocked
                                        ? <img src={ach.icon} alt="" style={{ width: window.innerWidth > 768 ? 200 : 60, height: window.innerWidth > 768 ? 200 : 60 }} />
                                        : <img src={lockIcon} alt="" style={{ width: window.innerWidth > 768 ? 200 : 65, height: window.innerWidth > 768 ? 200 : 65 }} />}
                                </div>

                                {/* Кастомный прогресс-бар */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: window.innerWidth > 768 ? 12 : 6,
                                        left: 8,
                                        right: 8,
                                        height: window.innerWidth > 768 ? 7 : 5,
                                        backgroundColor: '#ddd',
                                        borderRadius: 3,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            backgroundColor: '#8c64d7', 
                                            transition: 'width 0.3s ease'
                                        }}
                                    />
                                </div>

                                <CustomText
                                    style={{
                                        position: 'absolute',
                                        bottom: window.innerWidth > 768 ? 24 : 15,
                                        width: '100%',
                                        fontSize: window.innerWidth > 768 ? 12 : 9,
                                        textAlign: 'center',
                                        lineHeight: 1,
                                    }}
                                >
                                    {ach.title}
                                </CustomText>
                            </Card>
                        );
                    })}
                </Div>
                </Div>
            </Div>
        </Panel>
    );
}