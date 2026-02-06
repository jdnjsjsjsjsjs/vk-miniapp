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
import AdminTasks from './AdminTasks';
import Favorites from './Favorites';

import image1 from './imgs/1.jpg'
import image2 from './imgs/2.jpg'
import coinsIcon from './imgs/coins.png'
import giftImg from './imgs/gift.png'
import tasksIcon from './imgs/tasks.png'
import awardsIcon from './imgs/awards.png'
import cupsIcon from './imgs/cups.png'
import box1icon from './imgs/box1.png'
import box2icon from './imgs/box2.png'
import box3icon from './imgs/box3.png'

export default function App() {
  const images = [image1, image2];
  
  const [activePanel, setActivePanel] = useState('main');
  const [openedFaq, setOpenedFaq] = useState(null);
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [canClaimGift, setCanClaimGift] = useState(false);
  const [giftTimeLeft, setGiftTimeLeft] = useState('00:00:00');
  const [usersList, setUsersList] = useState([]);
  const [lastTasks, setLastTasks] = useState([]);
  const [shopFilter, setShopFilter] = useState(null);

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

        await fetch(`http://localhost:3001/api/user/${userInfo.id}/updateName`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: userInfo.first_name,
            last_name: userInfo.last_name
          })
        });
      } catch (error) {
        console.error('Ошибка получения данных пользователя', error);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      const res = await fetch(`http://localhost:3001/api/user/${user.id}`);
      const data = await res.json();

      setUser(prev => (
        {
          ...prev,
          role: data.role
        }
      ));

      setBalance(data.balance);
      setTotalEarned(data.totalEarned);

      const today = new Date().toISOString().slice(0, 10);
      const canClaim = data.last_gift_date !== today;

      setCanClaimGift(canClaim);

      if (!canClaim) {
        setGiftTimeLeft(calculateTimeLeft());
      } else {
        setGiftTimeLeft('00:00:00');
      }
    }

    fetchAll();
  }, [user]);

  useEffect(() => {
    if (canClaimGift) return;

    const interval = setInterval(() => {
      setGiftTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [canClaimGift]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users');
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error('Ошибка получения списка пользователей', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchLastTasks() {
      try {
        const res = await fetch(`http://localhost:3001/api/tasks/${user.id}`);
        const data = await res.json();

        // сортируем по дате создания (НОВЫЕ СВЕРХУ)
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setLastTasks(sorted.slice(0, 3));
      } catch (e) {
        console.error('Ошибка загрузки заданий для превью', e);
      }
    }

    fetchLastTasks();
  }, [user]);

  function calculateTimeLeft() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;

    if (diff <= 0) return '00:00:00';

    const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
    const minutes = String(Math.floor(diff / 1000 / 60) % 60).padStart(2, '0');
    const seconds = String(Math.floor(diff / 1000) % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  const goBack = () => {
    setShopFilter(null);
    setActivePanel('main');
  };
  const goToBalance = () => setActivePanel('balance');
  const goToGift = () => setActivePanel('gift');
  const goToRating = () => setActivePanel('rating');
  const goToShopWithFilter = (filter) => {
    setShopFilter(filter);
    setActivePanel('shop');
  };
  const goToProfile = () => setActivePanel('profile');
  const goToFavorites = () => setActivePanel('favorites');
  const goToTasks = () => {
    if (user?.role === 'admin') {
      setActivePanel('adminTasks');
    } else {
      setActivePanel('tasks');
    }
  }

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, balance, totalEarned]);

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

          {/* Баланс-капсула */}
          <div
            onClick={goToBalance}
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              backgroundColor: '#f2f2f2',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <img src={coinsIcon} alt="coins" style={{ height: 25, width: 25 }} />
            <Text
              weight="3"
              style={{
                fontSize: 14,
                color: '#4000ff',
                lineHeight: '18px',
              }}
            >
              {balance}
            </Text>
          </div>
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
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
         }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Баланс */}
            <Card
              mode="shadow"
              style={{
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
                <img
                  src={coinsIcon}
                  alt="coins"
                  style={{ width: 45, height: 45, objectFit: 'contain' }}
                />
                <div>
                  <Text weight="3" style={{ fontSize: 14, color: '#311f68' }}>
                    Баланс
                  </Text>
                  <Text weight="3" style={{ fontSize: 18, color: '#4000ff' }}>
                    {balance}
                  </Text>
                </div>
              </div>
            </Card>

            {/* Награда за вход */}
            <Card
              mode="shadow"
              style={{
                borderRadius: 12,
                padding: '14px 16px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={goToGift}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  zIndex: 2,
                }}
              >
                <Text weight="medium" style={{ fontSize: 14, color: '#311f68' }}>
                  Награда за вход
                </Text>

                <Text
                  weight="medium"
                  style={{
                    fontSize: 18,
                    color: canClaimGift ? '#00a650' : '#4000ff',
                    marginTop: 4,
                  }}
                >
                  {canClaimGift ? 'Забрать!' : giftTimeLeft}
                </Text>
              </div>

              <img
                src={giftImg}
                alt="gift"
                style={{
                  position: 'absolute',
                  right: -35,
                  bottom: -35,
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
            </Card>
          </div>
          
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              padding: '16px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={goToProfile}
          >
            <img
              src={awardsIcon}
              alt="awards"
              style={{
                position: 'absolute',
                top: -50,
                left: -65,
                width: 200,
                height: 200,
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
            />

            <Text
              weight="3"
              style={{
                fontSize: 18,
                color: '#311f68',
                textAlign: 'center',
              }}
            >
              Мои достижения
            </Text>

            <Text
              style={{
                marginTop: 6,
                fontSize: 14,
                color: '#6d6d6d',
                textAlign: 'center',
              }}
            >
              Статистика и прогресс
            </Text>
          </Card>
        </Div>

        <Div
          style={{
            padding: '0 16px 16px 16px',
            backgroundColor: '#ffffff',
            display: 'grid',
            gridTemplateColumns: '4fr 1fr',
            gap: '12px',
          }}
        >
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={goToTasks}
          >
            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                position: 'absolute',
                top: -18,
                right: -18,
                width: 150,
                height: 150,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Заголовок */}
              <Text
                weight="3"
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#311f68',
                }}
              >
                Список заданий
              </Text>

              {/* Последние задания */}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {lastTasks.length === 0 ? (
                  <Text style={{ fontSize: 13, color: '#999', textAlign: 'center' }}>
                    Заданий пока нет
                  </Text>
                ) : (
                  lastTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 8,
                        backgroundColor: '#f7f7f7',
                        color: '#311f68',
                        fontSize: 13,
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                        }}
                      >
                        {task.title}
                      </span>

                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: 15,
                        fontWeight: 400,
                        color: '#311f68' 
                      }}>
                        <img
                          src={coinsIcon}
                          alt="coins"
                          style={{ width: 25, height: 25, objectFit: 'contain' }}
                        />
                        {task.reward}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>

          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
            onClick={goToFavorites}
          >
            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                position: 'absolute',
                top: -40,
                right: -50,
                width: 150,
                height: 150,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <Text weight="3" style={{ fontSize: 18, color: '#311f68' }}>
                Избранные задания
              </Text>
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
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={goToRating}
          >
            <img
                src={cupsIcon}
                alt="cups"
                style={{
                  position: 'absolute',
                  top: '18%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                  opacity: 0.8,
                  zIndex: 1,
                  pointerEvents: 'none',
                }}
              />

            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Заголовок */}
              <Text
                weight="3"
                style={{
                  marginTop: 30,
                  textAlign: 'center',
                  fontSize: 18,
                  color: '#311f68',
                  paddingBottom: '16px',
                }}
              >
                Рейтинг
              </Text>

              {/* Таблица рейтинга */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {usersList
                  .sort((a, b) => b.totalEarned - a.totalEarned)
                  .slice(0, 3) // топ-3
                  .map((u, index) => (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '6px 12px',
                        borderRadius: 8,
                        backgroundColor: user && user.id === u.id ? '#f0edff' : '#f7f7f7',
                        fontWeight: user && user.id === u.id ? '600' : '400',
                        color: '#311f68',
                      }}
                    >
                      <span>{index + 1}.</span>
                      <span>{u.first_name} {u.last_name}</span>
                      <span>{u.totalEarned}</span>
                    </div>
                  ))}

                {/* Текущий пользователь */}
                {user && (() => {
                  const allSorted = [...usersList].sort((a, b) => b.totalEarned - a.totalEarned);
                  const currentIndex = allSorted.findIndex(u => u.id === user.id);
                  if (currentIndex >= 3) { // если не в топ-3, показываем отдельной строкой
                    const currentUser = allSorted[currentIndex];
                    return (
                      <div
                        key={currentUser.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          borderRadius: 8,
                          backgroundColor: '#f0edff',
                          fontWeight: 600,
                          marginTop: 6,
                          color: '#311f68',
                        }}
                      >
                        <span>{currentIndex + 1}.</span>
                        <span>{currentUser.first_name} {currentUser.last_name}</span>
                        <span>{currentUser.totalEarned}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
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
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginTop: 12,
              padding: 0,
            }}
          >

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer', 
                overflow: 'hidden' }} 
              onClick={() => goToShopWithFilter({ min: 0, max: 100 })}
            >
              <img
                src={box1icon}
                alt="box1"
                style={{
                  position: 'absolute',
                  right: -35,
                  bottom: -50,
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text style={cardText}>До 100 баллов</Text>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer', 
                overflow: 'hidden' }} 
              onClick={() => goToShopWithFilter({ min: 100, max: 500 })}
            >
              <img
                src={box2icon}
                alt="box2"
                style={{
                  position: 'absolute',
                  right: -35,
                  bottom: -45,
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text style={cardText}>От 100 до 500 баллов</Text>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer', 
                overflow: 'hidden' }} 
              onClick={() => goToShopWithFilter({ min: 500, max: 1000 })}
            >
              <img
                src={box3icon}
                alt="box3"
                style={{
                  position: 'absolute',
                  right: -35,
                  bottom: -50,
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text style={cardText}>От 500 баллов</Text>
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
      <Balance id="balance" goBack={goBack} balance={balance} goToTasks={goToTasks} />

      {/* Панель подарок за вход*/}
      <Gift id="gift" goBack={goBack} balance={balance} goToBalance={goToBalance} />

      {/* Панель Список заданий */}
      <Tasks id="tasks" goBack={goBack} balance={balance} goToBalance={goToBalance} user={user} />

      {/* Панель Админка заданий */}
      <AdminTasks id="adminTasks" goBack={goBack} user={user} goToBalance={goToBalance} balance={balance} />

      {/* Панель Рейтинг */}
      <Rating id="rating" goBack={goBack} balance={balance} goToBalance={goToBalance} />

      {/* Панель Магазина */}
      <Shop id="shop" goBack={goBack} balance={balance} goToBalance={goToBalance} user={user} initialFilter={shopFilter} />

      {/* Панель профиля */}
      <Profile id="profile" goBack={goBack} user={user} balance={balance} totalEarned={totalEarned} goToBalance={goToBalance} />

      {/* Панель избранных заданий */}
      <Favorites id="favorites" goBack={goBack} balance={balance} goToBalance={goToBalance} user={user} />
    </View>
  )
}