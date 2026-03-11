import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import medalIcon from './imgs/awards.png'
import coinsIcon from './imgs/coins.png'
import boxcalicon from './imgs/boxcalendar.png'
import cupsIcon from './imgs/cups.png'
import awardsIcon from './imgs/awards.png'
import lockIcon from './imgs/lock.png'

export default function Achievements({ id, goBack, balance, goToBalance, user, totalEarned }) {
    const achievements = [
        {
            id: 1,
            title: 'Первый вход',
            icon: <img src={boxcalicon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: true,
        },
        {
            id: 2,
            title: '10 очков',
            icon: <img src={coinsIcon} alt="" style={{ height: 60, width: 60 }} />,
            unlocked: totalEarned >= 10,
        },
        {
            id: 3,
            title: '100 очков',
            icon: <img src={cupsIcon} alt="" style={{ height: 60, width: 60 }} />,
            unlocked: totalEarned >= 100,
        },
        {
            id: 4,
            title: '1000 очков',
            icon: <img src={awardsIcon} alt="" style={{ height: 60, width: 60 }} />,
            unlocked: totalEarned >= 1000,
        },
        ];
    return (
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
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
                        const targetPoints = [0,10,100,1000][ach.id - 1];
                        const progress = Math.min(1, totalEarned / targetPoints);

                        return (
                            <Card
                                key={ach.id}
                                mode="shadow"
                                style={{
                                    borderRadius: 14,
                                    aspectRatio: '1 / 1',
                                    position: 'relative',
                                    backgroundColor: '#ffffff',
                                    overflow: 'hidden',
                                }}
                                >

                                {/* ИКОНКА ПО ЦЕНТРУ */}
                                <div
                                    style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -60%)',
                                    opacity: ach.unlocked ? 1 : 0,
                                    transition: 'opacity 0.3s'
                                    }}
                                >
                                    {ach.icon}
                                </div>

                                {/* НАЗВАНИЕ ВНИЗУ */}
                                <CustomText
                                    style={{
                                    position: 'absolute',
                                    bottom: 6,
                                    width: '100%',
                                    fontSize: 10,
                                    textAlign: 'center',
                                    }}
                                >
                                    {ach.title}
                                </CustomText>

                                {/* ПРОГРЕСС БАР */}
                                {!ach.unlocked && (
                                    <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 4,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: 50,
                                        height: 5,
                                        borderRadius: 3,
                                        backgroundColor: '#e0e0e0',
                                        overflow: 'hidden',
                                    }}
                                    >
                                    <div
                                        style={{
                                        width: `${progress * 100}%`,
                                        height: '100%',
                                        backgroundColor: '#8c64d7',
                                        borderRadius: 3,
                                        transition: 'width 0.3s',
                                        }}
                                    />
                                    </div>
                                )}

                                {/* ЗАМОК */}
                                {!ach.unlocked && (
                                    <img
                                    src={lockIcon}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        width: 60,
                                        height: 60,
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -60%)',
                                    }}
                                    />
                                )}

                                </Card>
                        );
                        })}
                </Div>
                </Div>
            </Div>
        </Panel>
    );
}