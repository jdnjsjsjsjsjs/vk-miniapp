import { useState } from 'react';
import { Panel, Div, Button, Card, Separator, Accordion } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon16Search } from '@vkontakte/icons';

export default function Guide({ id, goBack }) {
  const [openedFaq, setOpenedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const inputStyle = `
    .search-input::placeholder {
      color: #ceaeff;
      opacity: 1;
    }
  `;

  return (
    <>
    <style>{inputStyle}</style>
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

          <div style={{ position: 'relative', marginTop: 12 }}>
            <Icon16Search
              fill="#ceaeff"
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14,
                height: 14,
                pointerEvents: 'none'
              }}
            />

            <input
              className="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 12px 6px 34px',
                borderRadius: 999,
                border: '1px solid #ceaeff',
                outline: 'none',
                fontSize: 12,
                color: '#000'
              }}
            />
          </div>

          {[{
              id: 1,
              question: 'Что такое Ивановский Стиль?',
              answer: 'Ивановский стиль - это уникальный проект Комитета Ивановской области по молодёжной политике, миссия которого - помогать молодым людям найти и реализовать свои мечти и таланты в Ивановской области.'
            },{
              id: 2,
              question: 'Что такое капиталы?',
              answer: 'Заглушка текст текст текст'
            },{
              id: 3,
              question: 'Как получить капиталы?',
              answer: 'Заглушка текст текст текст'
            },{
              id: 4,
              question: 'Как обменять капиталы на артефакты?',
              answer: 'Заглушка текст текст текст'
            },{
              id: 5,
              question: 'Почему капиталы не поступили на баланс?',
              answer: 'Заглушка текст текст текст'
            },{
              id: 6,
              question: 'Почему кнопка покупки приза неактивна?',
              answer: 'Заглушка текст текст текст'
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
                      <CustomText
                        style={{
                          fontSize: 9,
                          color: '#6f6f6f',
                          lineHeight: '12px',
                          width: '100%',
                        }}
                      >
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
    </>
  );
}