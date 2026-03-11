import { useState } from 'react';
import { Panel, Div, Button, Card, Textarea } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import coinIcon from './imgs/coin.png';

export default function TaskPage({ id, goBack, task, balance, goToBalance, user }) {

    const [answer, setAnswer] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!task) return null;

    const submitTask = async () => {

        if (isSubmitting) return;
        if (!answer.trim()) return;

        if (task.require_file === 1 && !selectedFile) {
            alert('Необходимо загрузить файл');
            return;
        }

        setIsSubmitting(true);

        try {

            if (task.require_file === 1) {

                const formData = new FormData();
                formData.append('userId', user.id);
                formData.append('answer', answer);
                formData.append('file', selectedFile);

                await fetch(
                    `http://localhost:3001/api/tasks/${task.id}/answer-with-file`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

            } else {

                await fetch(
                    `http://localhost:3001/api/tasks/${task.id}/answer`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            answer
                        })
                    }
                );

            }

            setAnswer('');
            setSelectedFile(null);

            goBack();

        } catch (err) {
            console.error('Ошибка отправки', err);
        }

        setIsSubmitting(false);
    };

    return (
        <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
            
            <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

            {/* Хедер */}
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

            {/* Контент */}
            <Div style={{ padding: 12 }}>

                <Card
                    mode="shadow"
                    style={{
                        borderRadius: 12,
                        padding: 20,
                        backgroundColor: '#ffffff',
                    }}
                >
                    <CustomText weight="2" style={{ fontSize: 18 }}>
                        {task.title}
                    </CustomText>

                    <CustomText
                        style={{
                            marginTop: 8,
                            color: '#666',
                            paddingBottom: 16
                        }}
                    >
                        {task.question}
                    </CustomText>

                    <CustomText
                        style={{
                            fontSize: 18,
                            color: '#8c64d7',
                            fontWeight: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 16
                        }}
                    >
                        {task.reward}
                        <img src={coinIcon} alt="" style={{ width: 26 }} />
                    </CustomText>

                    {/* Ответ */}
                    <Textarea
                        placeholder="Введите ответ"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                    />

                    {/* Файл */}
                    {task.require_file === 1 && (
                        <div style={{ marginTop: 12 }}>

                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />

                            {selectedFile && (
                                <div style={{ marginTop: 6, fontSize: 12, color: '#8c64d7' }}>
                                    Выбран файл: {selectedFile.name}
                                </div>
                            )}

                        </div>
                    )}

                    {/* Кнопка отправки */}
                    <Button
                        size="l"
                        mode="primary"
                        loading={isSubmitting}
                        style={{ marginTop: 16 }}
                        onClick={submitTask}
                    >
                        Отправить
                    </Button>

                </Card>

            </Div>
        </Panel>
    );
}