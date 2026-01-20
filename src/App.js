import bridge from '@vkontakte/vk-bridge';
import { useState, useEffect } from 'react';
import { View, 
  Panel,
  Div, 
  Gallery,
  Card,
  Text,
  Accordion,
  Separator } from '@vkontakte/vkui';

import Balance from './Balance';
import Gift from './Gift';
import Tasks from './Tasks';
import Rating from './Rating';
import Shop from './Shop';
import Profile from './Profile';

import { Icon28CoinsOutline, 
  Icon28ListOutline, 
  Icon28CupOutline,
  Icon28GhostSimpleOutline,
  Icon28HangerOutline,
  Icon28GiftOutline,
  Icon28Hearts2Outline } from '@vkontakte/icons';
import image1 from './imgs/1.jpg'
import image2 from './imgs/2.jpg'

export default function App() {
  const images = [image1, image2];
  
  const [activePanel, setActivePanel] = useState('main');
  const [openedFaq, setOpenedFaq] = useState(null);
  const balance = 1234;
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // скролл вниз
        setShowHeader(false);
      } else {
        // скролл вверх
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userInfo = await bridge.send('VKWebAppGetUserInfo');
        setUser(userInfo);
      } catch (error) {
        console.error('Ошибка получения данных пользователя', error);
      }
    }

    fetchUser();
  }, []);

  const goBack = () => setActivePanel('main');
  const goToBalance = () => setActivePanel('balance');
  const goToGift = () => setActivePanel('gift');
  const goToTasks = () => setActivePanel('tasks');
  const goToRating = () => setActivePanel('rating');
  const goToShop = () => setActivePanel('shop');
  const goToProfile = () => setActivePanel('profile');

  const cardStyle = {
    borderRadius: 14,
    padding: '16px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  };

  const cardText = {
    fontSize: 14,
    color: '#311f68',
  };

  return (
    <View activePanel={activePanel}>
      <Panel id="main">

        <Div style={{ height: 32, backgroundColor: '#ffffff' }} />

        {/* Кастомный хедер */}
        <Div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 1000,
            boxShadow: '0 15px 15px rgba(0,0,0,0.08)',
            transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.25s ease',
            borderBottom: '1px solid #bdbdbd',
          }}
        >
          {/* Аватар */}
          {user?.photo_200 && (
            <img
              src={user.photo_200}
              alt="avatar"
              onClick={goToProfile}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 12,
                cursor: 'pointer',
              }}
            />
          )}
        </Div>

        { /* Галерея с 2 картинками сверху */ }
        <Div style={{ padding: 0 }}>
          <Gallery
            slideWidth="100%"
            bullets="light"
            style={{ height: 400 }}
            timeout={4000}
            looped
          >
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Slide ${i + 1}`}
                style={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                }}
              />
            ))}
          </Gallery>
        </Div>

        <Div style={{ 
          padding: '16px 16px 16px 16px',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '12px',
         }}>
          <Card
            mode="shadow"
            style={{
              flex: 1,
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
            onClick={goToBalance}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon28CoinsOutline width={28} height={28} color='#311f68' />
              <div>
                <Text weight="3" style={{ fontSize: 14, color: '#311f68' }}>
                  Баланс
                </Text>
                <Text weight="3" style={{ fontSize: 18, color: '#4000ff' }}>
                  1234
                </Text>
              </div>
            </div>
          </Card>

          <Card
            mode="shadow"
            style={{
              flex: 1,
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
            onClick={goToGift}
          >
            <Text weight="medium" style={{ fontSize: 14, color: '#311f68' }}>
              Награда за вход
            </Text>
            <Text weight="medium" style={{ fontSize: 18, color: '#4000ff' }}>
              +100
            </Text>
          </Card>
        </Div>

        <Div
          style={{
            padding: '0 16px 16px 16px',
            backgroundColor: '#ffffff',
          }}
        >
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
              cursor: 'pointer',
            }}
            onClick={goToTasks}
          >
            {/* Иконка */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Icon28ListOutline width={28} height={28} color="#311f68" />
            </div>

            {/* Заголовок */}
            <Text
              weight="3"
              style={{
                marginTop: 8,
                textAlign: 'center',
                fontSize: 16,
                color: '#311f68',
              }}
            >
              Список заданий
            </Text>

            {/* Картинка */}
            <div style={{ marginTop: 12 }}>
              <img
                src={image2} // пока используем одну из уже импортированных картинок
                alt="Tasks preview"
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: 12,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </Card>
        </Div>

        <Div
          style={{
            padding: '0 16px 16px 16px',
            backgroundColor: '#ffffff',
          }}
        >
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
              cursor: 'pointer',
            }}
            onClick={goToRating}
          >
            {/* Иконка */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Icon28CupOutline width={28} height={28} color="#311f68" />
            </div>

            {/* Заголовок */}
            <Text
              weight="3"
              style={{
                marginTop: 8,
                textAlign: 'center',
                fontSize: 16,
                color: '#311f68',
              }}
            >
              Рейтинг лучших
            </Text>

            {/* Картинка */}
            <div style={{ marginTop: 12 }}>
              <img
                src={image1} // пока используем одну из уже импортированных картинок
                alt="Tasks preview"
                style={{
                  width: '100%',
                  height: '200px',
                  borderRadius: 12,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
          </Card>
        </Div>

        <Div style={{ padding: '16px 16px 24px 16px', backgroundColor: '#ffffff' }}>
          {/* Заголовок */}
          <Text weight="3" style={{ marginLeft: 10, fontSize: 20, color: '#311f68' }}>
            Призы и подарки
          </Text>

          {/* Подзаголовок */}
          <Text
            style={{
              marginLeft: 10,
              marginTop: 4,
              fontSize: 14,
              color: '#6d6d6d',
            }}
          >
            Выбирай и забирай за баллы
          </Text>

          {/* Карточки */}
          <Div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: 12,
              padding: 0,
            }}
          >
            {/* Шапки */}
            <Card mode="shadow" style={cardStyle} onClick={goToShop}>
              <Icon28GhostSimpleOutline color="#311f68" />
              <Text style={cardText}>Шапки</Text>
            </Card>

            {/* Толстовки */}
            <Card mode="shadow" style={cardStyle} onClick={goToShop}>
              <Icon28HangerOutline color="#311f68" />
              <Text style={cardText}>Толстовки</Text>
            </Card>

            {/* Аксессуары */}
            <Card mode="shadow" style={cardStyle} onClick={goToShop}>
              <Icon28GiftOutline color="#311f68" />
              <Text style={cardText}>Аксессуары</Text>
            </Card>

            {/* Пожертвования */}
            <Card mode="shadow" style={cardStyle} onClick={goToShop}>
              <Icon28Hearts2Outline color="#311f68" />
              <Text style={cardText}>Пожертвования</Text>
            </Card>
          </Div>
        </Div>

        <Div style={{ padding: '16px', backgroundColor: '#ffffff' }}>
          <Text weight="3" style={{ marginBottom: 16, textAlign: 'center', fontSize: 20, color: '#311f68' }}>
            Вопросы и ответы
          </Text>
          <Separator
            style={{ margin: '0 16px 0 16px' }}
          />
          {/* Вопрос 1 */}
          <Accordion
            expanded={openedFaq === 1}
            onChange={() => setOpenedFaq(openedFaq === 1 ? null : 1)}
            style={{ marginTop: 12 }}
          >
            <Accordion.Summary>
              <Text weight="medium" style={{ fontSize: 16, color: '#311f68' }}>
                Как получить баллы?
              </Text>
            </Accordion.Summary>
            <Accordion.Content>
              <Div>
                <Text style={{ fontSize: 14, color: '#311f68' }}>
                  Баллы начисляются за выполнение заданий и активность в приложении.
                </Text>
              </Div>
            </Accordion.Content>
          </Accordion>

          <Separator
            style={{ margin: '0 16px 0 16px' }}
          />

          {/* Вопрос 2 */}
          <Accordion
            expanded={openedFaq === 2}
            onChange={() => setOpenedFaq(openedFaq === 2 ? null : 2)}
          >
            <Accordion.Summary>
              <Text weight="medium" style={{ fontSize: 16, color: '#311f68' }}>
                Где посмотреть мои награды?
              </Text>
            </Accordion.Summary>
            <Accordion.Content>
              <Div>
                <Text style={{ fontSize: 14, color: '#311f68' }}>
                  Награды отображаются в разделе Призы и подарки.
                </Text>
              </Div>
            </Accordion.Content>
          </Accordion>

          <Separator
            style={{ margin: '0 16px 0 16px' }}
          />

          {/* Вопрос 3 */}
          <Accordion
            expanded={openedFaq === 3}
            onChange={() => setOpenedFaq(openedFaq === 3 ? null : 3)}
          >
            <Accordion.Summary>
              <Text weight="medium" style={{ fontSize: 16, color: '#311f68' }}>
                Как обменять баллы на подарки?
              </Text>
            </Accordion.Summary>
            <Accordion.Content>
              <Div>
                <Text style={{ fontSize: 14, color: '#311f68' }}>
                  Выберите подарок и следуйте инструкции по обмену баллов.
                </Text>
              </Div>
            </Accordion.Content>
          </Accordion>

          <Separator
            style={{ margin: '0 16px 0 16px' }}
          />
        </Div>
      </Panel>

      {/* Панель Баланс */}
      <Balance id="balance" goBack={goBack} balance={balance} />

      {/* Панель подарок за вход*/}
      <Gift id="gift" goBack={goBack} />

      {/* Панель Список заданий */}
      <Tasks id="tasks" goBack={goBack} />

      {/* Панель Рейтинг */}
      <Rating id="rating" goBack={goBack} />

      {/* Панель Магазина */}
      <Shop id="shop" goBack={goBack} />

      {/* Панель профиля */}
      <Profile id="profile" goBack={goBack} user={user} />
    </View>
  )
}