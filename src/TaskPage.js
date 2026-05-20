import { useState, useEffect } from 'react';
import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';
import API_URL from './config';

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
    const [selectedFiles, setSelectedFiles] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myAnswer, setMyAnswer] = useState(null);

    useEffect(() => {
        if (!user?.id || !task?.id) return;

        fetch(`${API_URL}/api/tasks/${task.id}/my-answer/${user.id}`)
            .then(res => res.json())
            .then(setMyAnswer)
            .catch(() => {});
    }, [task, user]);
    const allFiles = Object.values(selectedFiles).flat();

    const isFileMissing = task.require_file === 1 && allFiles.length === 0;

    if (!task) return null;
    const requiresText = task.question.includes('[answer]');

    const isAnswerEmpty = requiresText && !answer.trim();
    const isFormValid = !isFileMissing && !isAnswerEmpty;

    const submitTask = async () => {

        if (isSubmitting) return;
        if (requiresText && !answer.trim()) return;

        if (task.require_file === 1 && selectedFiles.length === 0) {
            alert('Необходимо загрузить файл');
            return;
        }

        setIsSubmitting(true);

        try {

            if (task.require_file === 1) {

                const formData = new FormData();
                formData.append('userId', user.id);
                formData.append('answer', requiresText ? answer : '');
                Object.values(selectedFiles).flat().forEach(file => {
                    formData.append('files', file);
                });

                await fetch(
                    `${API_URL}/api/tasks/${task.id}/answer-with-file`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

            } else {

                await fetch(
                    `${API_URL}/api/tasks/${task.id}/answer`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            answer: requiresText ? answer : null
                        })
                    }
                );

            }

            setAnswer('');
            setSelectedFiles([]);

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
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid #ceaeff;
            outline: none;
            font-size: 12px;
            color: #000;
            background-color: #fff;
        }

        .answer-input::placeholder {
            color: #ceaeff;
            opacity: 1;
        }
    `;

    function renderQuestion() {
        const parts = task.question.split(/(\[answer\]|\[file\])/g);
        return parts.map((part, index) => {
            if (part === '[answer]') {
                return (
                    <div key={index} style={{ position: 'relative', width: 'fit-content', marginTop: 4, marginBottom: 4 }}>
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
                                    top: -2,
                                    right: 0,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: 'red',
                                    pointerEvents: 'none'
                                }}
                            />
                        )}
                    </div>
                );
            }

            if (part === '[file]' && task.require_file === 1) {
                const inputId = `fileInput_${index}`;
                const filesForThisBlock = selectedFiles[index] || [];

                return (
                    <div key={index} style={{ display: 'inline-block', position: 'relative', marginTop: 4, marginBottom: 4 }}>

                        <div
                            onClick={() => document.getElementById(inputId).click()}
                            style={{
                                width: '100px',
                                backgroundColor: '#8c64d7',
                                borderRadius: 999,
                                padding: '2px 0',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <CustomText style={{ color: '#fff', fontSize: 10 }}>
                                выбери файл
                            </CustomText>
                        </div>

                        <input
                            id={inputId}
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                                const newFiles = Array.from(e.target.files);

                                setSelectedFiles(prev => {
                                    const existing = prev[index] || [];
                                    const combined = [...existing, ...newFiles];

                                    if (combined.length > 5) {
                                        alert('Максимум 5 файлов на один блок');
                                    }

                                    return {
                                        ...prev,
                                        [index]: combined.slice(0, 5)
                                    };
                                });
                            }}
                        />

                        {/* Файлы ТОЛЬКО для этого блока */}
                        {filesForThisBlock.map((file, i) => (
                            <CustomText
                                key={i}
                                style={{ fontSize: 12, color: '#8c64d7', marginTop: 4 }}
                            >
                                {file.name}
                            </CustomText>
                        ))}

                    </div>
                );
            }

            return (
                <CustomText
                    key={index}
                    style={{
                        fontSize: 12,
                        color: '#000',
                        whiteSpace: 'pre-line',
                    }}
                >
                    {part}
                </CustomText>
            );
        });
    }

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
                                padding: '5px 7px 5px 7px',
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
                                padding: '5px',
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

                        <CustomText style={{ fontSize: 12, color: '#000', whiteSpace: 'pre-line' }}>
                            {renderQuestion()}
                        </CustomText>
                    </div>

                    {myAnswer?.status === 'rejected' && myAnswer?.admin_comment && (
                    <Card
                        mode="shadow"
                        style={{
                        borderRadius: 10,
                        padding: 12,
                        backgroundColor: '#fff',
                        border: '1px solid #ceaeff'
                        }}
                    >
                        <CustomText
                        style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: '#000'
                        }}
                        >
                        Комментарий администратора
                        </CustomText>

                        <CustomText
                        style={{
                            fontSize: 12,
                            color: '#000',
                            whiteSpace: 'pre-line'
                        }}
                        >
                        {myAnswer.admin_comment}
                        </CustomText>
                    </Card>
                    )}

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