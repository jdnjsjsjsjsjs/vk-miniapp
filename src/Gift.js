import { Panel, PanelHeader, Div, Text, Button } from '@vkontakte/vkui';

export default function Gift({ id, goBack }) {
    return (
        <Panel id={id}>
            <PanelHeader onClick={goBack}>Ежедневный вход</PanelHeader>
            <Div style={{ 
                textAlign: 'center',
                backgroundColor: '#ffffff',
                padding: '32px 0 0 0', 
            }}>
                <Text weight="medium" style={{ 
                    fontSize: 18,
                    color: '#311f68' 
                }}>
                    Заготовочное окно для награды за вход
                </Text>
                <Button
                    mode="primary"
                    style={{ 
                        marginTop: 20,
                        color: '#ffffff',
                        backgroundColor: '#311f68'
                    }}
                    onClick={goBack}
                >
                    Назад
                </Button>
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
