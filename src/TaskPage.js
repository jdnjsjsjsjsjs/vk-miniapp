import { useState } from 'react';
import { Panel, Div, Button, Textarea, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import coinIcon from './imgs/coin.png';

function formatDeadline(expiresAt) {
    if (!expiresAt) return 'бессрочно';

    const date = new Date(expiresAt);

    const day = date.getDate();

    const months = [
        'января','февраля','марта','апреля','мая','июня',
        'июля','августа','сентября','октября','ноября','декабря'
    ];

    return `до ${day} ${months[date.getMonth()]}`;
}

export default function TaskPage({ id, goBack, task, balance, goToBalance, user }) {

    const [answer, setAnswer] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAnswerEmpty = !answer.trim();
    const isFileMissing = task.require_file === 1 && !selectedFile;

    const isFormValid = !isAnswerEmpty && !isFileMissing;

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

    const inputStyle = `
        .answer-input {
            width: 100px;
            box-sizing: border-box;
            padding: 4px 6px;
            border-radius: 999px;
            border: 1px solid #ceaeff;
            outline: none;
            font-size: 12px;
            color: #ceaeff;
            background-color: #fff;
        }

        .answer-input::placeholder {
            color: #ceaeff;
            opacity: 1;
        }
    `;

    return (
        <>
        <style>{inputStyle}</style>
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
            <Div
                style={{
                    padding: '12px',
                    backgroundColor: '#ceaeff'
                }}
            >
                {/* Контент */}
                <Card
                    mode="shadow"
                    style={{
                        borderRadius: 10,
                        padding: '20px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#ffffff',
                        gap: 12,
                    }}
                >        
                    {/* Название задания */}
                    <CustomText style={{ fontSize: 20, fontWeight: 700 }}>
                        {task.title}
                    </CustomText>

                    {/* Блоки награды и срока */}
                    <div style={{ display: 'flex', gap: 6 }}>
                        {/* Награда */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                border: '1px solid #ceaeff',
                                padding: '5px 10px 5px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 70,
                                maxWidth: 'auto',
                                alignItems: 'center',
                            }}
                        >
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Награда
                            </CustomText>

                            <div style={{ display: 'flex', alignItems: 'center'}}>
                                <CustomText style={{ fontSize: 16, color: '#8c64d7', fontWeight: 1000 }}>
                                    {task.reward}
                                </CustomText>
                                <img src={coinIcon} alt="" style={{ width: 24 }} />
                            </div>
                        </div>

                        {/* Срок */}
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 12,
                                border: '1px solid #ceaeff',
                                padding: '5px 10px 5px 10px',
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 120,
                                alignItems: 'center',
                            }}
                        >
                            <CustomText style={{ fontSize: 12, color: '#000' }}>
                                Срок выполнения
                            </CustomText>

                            <CustomText style={{ fontSize: 12, color: '#8c64d7', fontWeight: 700 }}>
                                {formatDeadline(task.expires_at)}
                            </CustomText>
                        </div>
                    </div>

                    {/* Блок описания */}
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 12,
                            border: '1px solid #ceaeff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            padding: 10,
                        }}
                    >
                        <CustomText style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>
                            Как выполнить?
                        </CustomText>

                        <CustomText style={{ fontSize: 12, color: '#000' }}>
                            {task.question}
                        </CustomText>

                        {/* Поле ответа */}
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <input
                                type="text"
                                placeholder="напиши..."
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className="answer-input"
                            />
                            {isAnswerEmpty && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -4,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: 'red'
                                    }}
                                />
                            )}
                        </div>

                        {/* Файл */}
                        {task.require_file === 1 && (
                            <div style={{ display: 'inline-block', position: 'relative', marginTop: 8 }}>
                                <div
                                    onClick={() => document.getElementById('fileInput').click()}
                                    style={{
                                        width: '100px',
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
                                        выбери файл
                                    </CustomText>
                                </div>

                                <input
                                    id="fileInput"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    style={{ display: 'none' }}
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />
                                {selectedFile && (
                                    <CustomText style={{ fontSize: 12, color: '#8c64d7', marginTop: 4 }}>
                                        {selectedFile.name}
                                    </CustomText>
                                )}

                                {isFileMissing && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -4,
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: 'red'
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Кнопка отправки */}
                    <div
                        onClick={() => {
                            if (isFormValid) submitTask();
                        }}
                        style={{
                            backgroundColor: isFormValid ? '#8c64d7' : '#ceaeff',
                            borderRadius: 999,
                            padding: '2px 0',
                            textAlign: 'center',
                            cursor: isFormValid ? 'pointer' : 'default'
                        }}
                    >
                        <CustomText style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>
                            {isFormValid ? 'выполнить' : 'не всё выполнено'}
                        </CustomText>
                    </div>
                </Card>
            </Div>
        </Panel>
        </>
    );
}