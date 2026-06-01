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
              answer: 'Капиталы - это ресурсы, которые можно копить выполняя задания и обменивать на ценные призы (артефакты).'
            },{
              id: 3,
              question: 'Как получить капиталы?',
              answer: `1) Участвуй во Всероссийских и окружные форумах (капиталы даются как за подачу заявки, так и за участие).\n
                      2) Подавай заявку на конкурс Росмолодёжь.Гранты (капиталы даются как за подачу заявки, так и за победу).\n
                      3) Участвуй в региональных и флагманских мероприятиях Комитета Ивановской области по молодежной политике.\n
                      4) Обменивайся опытом (публикуй полезные посты для молодых людей региона о возможности принять участие в форумах/грантовых конкурсах; очно выступай с презентацией для своих друзей, одноклассников или одногруппников).\n
                      5) Выполняй дополнительные задания, которые мы публикуем в разделе "Задания". Не забывай почаще заходить в приложение, чтобы узнать о новых заданиях и следи за новостями на станице Вконтакте.`
            },{
              id: 4,
              question: 'Как обменять капиталы на подарки?',
              answer: 'Чтобы обменять капиталы на артефакты нужно зайти в раздел "Магазин", выбрать подарок, добавить его в корзину, оплатить и следовать инструкции для получения. '
            },{
              id: 5,
              question: 'Почему капиталы не поступили на баланс?',
              answer: 'Капиталы могут не сразу поступать на баланс. Это связано с проверкой твоих выполненных заданий. Наши сотрудники бережно проверяют каждое твое задание вручную. Если спустя неделю капиталы так и не поступили - напиши нам в сообщения группы Ивановского стиля.'
            },{
              id: 6,
              question: 'Почему кнопка покупки приза неактивна?',
              answer: 'Кнопка покупки артефакта может быть неактивна в том случае, если все артефакты разобрали. Советуем почаще заходить в раздел "Артефакты" и смотреть за обновлением витрины.'
            },{
              id: 7,
              question: 'Я не нашел ответа на свой вопрос',
              answer: 'Мы с радостью ответим в Сообщения группы.'
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
                          whiteSpace: 'pre-line',
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