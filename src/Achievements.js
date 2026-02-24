import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import medalIcon from './imgs/awards.png'

export default function Balance({ id, goBack, balance, goToBalance, user }) {
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
                        marginBottom: 15,
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
                        Достижения
                    </CustomText>

                    {/* Картинка справа */}
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
                
                <Card
                    mode="shadow"
                    style={{
                        borderRadius: 10,
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        paddingTop: 15,
                    }}
                >
                    <CustomText>Здесь будет контент сейчас</CustomText>
                </Card>
            </Div>
        </Panel>
    );
}