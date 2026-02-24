import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

export default function Settings({ id, goBack }) {

  return (
    <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
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
                style={{ color: '#ceaeff' }}
            >
                Назад
            </Button>
        </Div>

        <Div style={{ backgroundColor: '#ceaeff' }}>
            <Card mode="shadow" style={{ marginBottom: 16, borderRadius: 10, padding: 13 }}>
                <CustomText weight="1" style={{ fontSize: 15, color: '#000' }}>Настройки</CustomText>

                <CustomText weight="3" style={{ fontSize: 10, color: '#000', marginBottom: 15 }}>Здесь будут настройки</CustomText>

                <div
                    style={{
                        marginTop: 8,
                        width: '100%',
                        backgroundColor: '#8c64d7',
                        borderRadius: 999,
                        padding: '2px 0',
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <CustomText
                        weight="1"
                        style={{
                            color: '#ffffff',
                            fontSize: 10,
                        }}
                    >
                        применить
                    </CustomText>
                </div>
            </Card>
        </Div>
    </Panel>
  );
}