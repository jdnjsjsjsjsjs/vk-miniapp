import { useState } from 'react';
import { Panel, Div, Button, Card, Separator, Accordion } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

export default function Guide({ id, goBack }) {
  const [openedFaq, setOpenedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
      {/* HEADER */}
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
        {/* Блок карточки "Справочник" */}
        <Card mode="shadow" style={{ marginBottom: 16, borderRadius: 10, padding: 12 }}>
          <CustomText weight="1" style={{ fontSize: 15, color: '#000', marginLeft: 10 }}>
            Справочник
          </CustomText>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск..."
            style={{
                width: '95%',
                boxSizing: 'border-box',
                padding: '5px 10px',
                margin: '12px auto 0 auto',
                borderRadius: 8,
                border: '1px solid #e0e0e0',
                outline: 'none',
                fontSize: 12,
                display: 'block',
            }}
        />

          {[{
              id: 1,
              question: 'Как получить капиталы?',
              answer: 'Капиталы начисляются за выполнение заданий и активность в приложении.'
            },{
              id: 2,
              question: 'Где посмотреть мои достижения?',
              answer: 'Твои достижения в профиле!'
            },{
              id: 3,
              question: 'Как обменять капиталы на подарки?',
              answer: 'Выберите подарок и следуйте инструкции по обмену капиталов.'
            },{
              id: 4,
              question: 'Как получить капиталы?',
              answer: 'Капиталы начисляются за выполнение заданий и активность в приложении.'
            },{
              id: 5,
              question: 'Где посмотреть мои достижения?',
              answer: 'Твои достижения в профиле!'
            },{
              id: 6,
              question: 'Как обменять капиталы на подарки?',
              answer: 'Выберите подарок и следуйте инструкции по обмену капиталов.'
            },{
              id: 7,
              question: 'Как получить капиталы?',
              answer: 'Капиталы начисляются за выполнение заданий и активность в приложении.'
            },{
              id: 8,
              question: 'Где посмотреть мои достижения?',
              answer: 'Твои достижения в профиле!'
            },{
              id: 9,
              question: 'Как обменять капиталы на подарки?',
              answer: 'Выберите подарок и следуйте инструкции по обмену капиталов.'
            }]
            .filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(faq => (
              <div key={faq.id}>
                <Accordion
                  expanded={openedFaq === faq.id}
                  onChange={() => setOpenedFaq(openedFaq === faq.id ? null : faq.id)}
                >
                  <Accordion.Summary>
                    <CustomText weight="3" style={{ fontSize: window.innerWidth < 768 ? 10 : 13, color: '#000' }}>
                      {faq.question}
                    </CustomText>
                  </Accordion.Summary>
                  <Accordion.Content>
                    <Div>
                      <CustomText style={{ fontSize: window.innerWidth < 768 ? 9 : 11, color: '#000', lineHeight: '12px' }}>
                        {faq.answer}
                      </CustomText>
                    </Div>
                  </Accordion.Content>
                </Accordion>
                <Separator style={{ margin: '0 16px' }} />
              </div>
            ))}
        </Card>
      </Div>
    </Panel>
  );
}