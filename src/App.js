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

import image1 from './imgs/1.png'
import coinsIcon from './imgs/coins.png'
import coinIcon from './imgs/coin.png'
import giftImg from './imgs/gift.png'
import tasksIcon from './imgs/tasks.png'
import awardsIcon from './imgs/awards.png'
import cupsIcon from './imgs/cups.png'
import box1icon from './imgs/box1.png'
import box2icon from './imgs/box2.png'
import box3icon from './imgs/box3.png'

export default function App() {
  const images = [image1];
  
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

  const getPlaceStyles = (place) => {
    switch (place) {
      case 1:
        return { backgroundColor: '#8c64d7', color: '#fff' };
      case 2:
        return { backgroundColor: '#ceaeff', color: '#000' };
      case 3:
        return { backgroundColor: '#eaddff', color: '#000' };
      default:
        return { backgroundColor: '#f2f2f2', color: '#000' };
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowHeader(false);
      } else {
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

  const isUserInTop3 = (() => {
    if (!user || usersList.length === 0) return false;

    const sorted = [...usersList].sort(
      (a, b) => b.totalEarned - a.totalEarned
    );

    const index = sorted.findIndex(u => u.id === user.id);
    return index >= 0 && index < 3;
  })();

  return (
    <View activePanel={activePanel}>
      <Panel id="main">

        <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

        {/* Кастомный хедер */}
        <Div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: '#ceaeff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            zIndex: 1000,
            transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.25s ease',
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
              padding: '2px 18px 2px 2px',
              backgroundColor: '#f2f2f2',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
            <Text
              weight="3"
              style={{
                fontSize: 14,
                color: '#8c64d7',
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
            style={{ height: 310 }}
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
                  height: 310,
                  objectFit: 'cover',
                }}
              />
            ))}
          </Gallery>
        </Div>

        <Div style={{ 
          padding: '16px 16px 16px 16px',
          backgroundColor: '#ceaeff',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          position: 'relative',
          marginTop: '-40px',
          zIndex: 10,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
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
                padding: '8px 10px 20px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={goToBalance}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <Text weight="1" style={{ fontSize: 12, color: '#000', paddingBottom: 3 }}>
                    Баланс
                  </Text>
                  <Text weight="1" style={{ fontSize: 30, color: '#8c64d7' }}>
                    {balance}
                  </Text>
                </div>
                <img
                  src={coinsIcon}
                  alt="coins"
                  style={{ width: 80, height: 80, objectFit: 'contain', paddingLeft: '100px', position: 'absolute', right: 0, bottom: -4 }}
                />
              </div>
            </Card>

            {/* Награда за вход */}
            <Card
              mode="shadow"
              style={{
                borderRadius: 12,
                padding: '8px 10px 14px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
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
                <Text weight="1" style={{ fontSize: 12, color: '#000', paddingBottom: 3 }}>
                  Ежедневный вход
                </Text>

                <div
                  onClick={goToBalance}
                  style={{
                    display: 'flex',
                    padding: '3px 20px 3px 20px',
                    backgroundColor: canClaimGift ? '#8c64d7' : '#f2f2f2',
                    borderRadius: 999,
                    cursor: 'pointer',
                  }}
                >
                  <Text
                    weight="1"
                    style={{
                      fontSize: 12,
                      color: canClaimGift ? '#fff' : '#8c64d7',
                    }}
                  >
                    {canClaimGift ? 'получить' : giftTimeLeft}
                  </Text>
                </div>
              </div>

              <img
                src={giftImg}
                alt="gift"
                style={{ width: 90, height: 90, objectFit: 'contain', paddingLeft: '100px', position: 'absolute', right: -3, bottom: -11 }}
              />
            </Card>
          </div>
          
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              padding: '12px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            onClick={goToProfile}
          >
            <img
              src={awardsIcon}
              alt="awards"
              style={{
                position: 'absolute',
                top: -20,
                right: -30,
                width: 200,
                height: 200,
                objectFit: 'contain',
                pointerEvents: 'none',
                transform: 'rotate(15deg)',
              }}
            />

            <Text
              weight="1"
              style={{
                fontSize: 12,
                color: '#000',
                marginTop: 109,
                marginLeft: 4,
              }}
            >
              Достижения
            </Text>
          </Card>
        </Div>

        <Div
          style={{
            padding: '16px 16px 16px 16px',
            backgroundColor: '#ceaeff',
            display: 'grid',
            gridTemplateColumns: '5fr 2fr',
            gap: '12px',
          }}
        >
          <Card
            mode="shadow"
            style={{
                borderRadius: 12,
                padding: '8px 5px 0px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            onClick={goToTasks}
          >
            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                position: 'absolute',
                top: -5,
                right: -25,
                width: 220,
                height: 220,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div style={{ zIndex: 2 }}>
              {/* Заголовок */}
              <Text
                weight="1"
                style={{ fontSize: 12, color: '#000', paddingBottom: 3 }}
              >
                Задания
              </Text>

              {/* Последние задания */}
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, width: 210 }}>
                {lastTasks.length === 0 ? (
                  <Text weight='1' style={{ fontSize: 14, color: '#000', textAlign: 'center', marginTop: 35 }}>
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
                        borderRadius: 999,
                        backgroundColor: '#f7f7f7',
                        color: '#8c64d7',
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                          fontWeight: 600,
                        }}
                      >
                        {task.title}
                      </span>

                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#8c64d7' 
                      }}>
                        <img
                          src={coinIcon}
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
              padding: '12px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
            }}
            onClick={goToFavorites}
          >
            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                position: 'absolute',
                top: 0,
                right: -15,
                width: 150,
                height: 150,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'hidden',
              }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <Text weight="1" 
              style={{
                fontSize: 12,
                color: '#000',
                marginTop: 142,
                marginLeft: 4,
              }}>
                Избранное
              </Text>
            </div>
          </Card>
        </Div>

        <Div
          style={{
            padding: '16px 16px 16px 16px',
            backgroundColor: '#ceaeff',
          }}
        >
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '8px 18px 18px 18px',
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
                  top: isUserInTop3 ? 63 : 75,
                  left: isUserInTop3 ? 85 : 100,
                  transform: 'translate(-50%, -50%)',
                  width: isUserInTop3 ? 170 : 205,
                  height: isUserInTop3 ? 170 : 205,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />

            <div style={{ position: 'relative', marginLeft: isUserInTop3 ? 160 : 187 }}>
              {/* Заголовок */}
              <Text
                weight="1"
                style={{
                  fontSize: 12,
                  color: '#000',
                }}
              >
                Рейтинг
              </Text>

              {/* Таблица рейтинга */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                {usersList
                  .sort((a, b) => b.totalEarned - a.totalEarned)
                  .slice(0, 3)
                  .map((u, index) => {
                    const place = index + 1;
                    const PlaceStyle = getPlaceStyles(place);

                    return (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 12px',
                          borderRadius: 999,
                          backgroundColor: user && user.id === u.id ? '#f0edff' : '#f7f7f7',
                          fontWeight: user && user.id === u.id ? '700' : '600',
                          color: '#8c64d7',
                          fontSize: 11,
                          ...PlaceStyle,
                          
                        }}
                      >
                        <span>{index + 1}.</span>
                        <span>{u.first_name} {u.last_name}</span>
                        <span>{u.totalEarned}</span>
                      </div>
                    );
                  })}

                {/* Текущий пользователь */}
                {user && (() => {
                  const allSorted = [...usersList].sort((a, b) => b.totalEarned - a.totalEarned);
                  const currentIndex = allSorted.findIndex(u => u.id === user.id);
                  if (currentIndex >= 3) {
                    const currentUser = allSorted[currentIndex];
                    return (
                      <div
                        key={currentUser.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: 11,
                          ...getPlaceStyles(currentIndex + 1),
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

        <Div style={{ padding: '16px', backgroundColor: '#ceaeff' }}>
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '12px',
            }}
          >
            <Text weight="1" style={{ fontSize: 12, color: '#000', lineHeight: '16px' }}>
              Призы и награды
            </Text>

            <Text
              style={{
                fontSize: 10,
                color: '#000',
                lineHeight: '16px'
              }}
            >
              выбирай и получай за баллы
            </Text>
          </Card>
          {/* Карточки */}
          <Div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 3fr',
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
                cursor: 'pointer', 
                overflow: 'hidden',
                height: '120px',
              }} 
              onClick={() => goToShopWithFilter({ min: 0, max: 100 })}
            >
              <img
                src={box1icon}
                alt="box1"
                style={{
                  position: 'absolute',
                  right: -24,
                  bottom: -15,
                  width: 140,
                  height: 140,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text weight='1' style={{fontSize: 14, color: '#000', lineHeight: '14px' }} >до 100</Text>
              <Text style={{fontSize: 12, color: '#000', lineHeight: '14px' }}>баллов</Text>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', 
                overflow: 'hidden',
                height: '120px', }} 
              onClick={() => goToShopWithFilter({ min: 100, max: 500 })}
            >
              <img
                src={box2icon}
                alt="box2"
                style={{
                  position: 'absolute',
                  right: 3,
                  bottom: -31,
                  width: 180,
                  height: 180,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text weight='1' style={{fontSize: 14, color: '#000', lineHeight: '14px' }} >от 100</Text>
              <Text style={{fontSize: 12, color: '#000', lineHeight: '14px' }}>баллов</Text>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', 
                overflow: 'hidden',
                height: '120px', }} 
              onClick={() => goToShopWithFilter({ min: 500, max: 1000 })}
            >
              <img
                src={box3icon}
                alt="box3"
                style={{
                  position: 'absolute',
                  right: -5,
                  bottom: -27,
                  width: 190,
                  height: 190,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <Text weight='1' style={{fontSize: 14, color: '#000', lineHeight: '14px' }} >от 500</Text>
              <Text style={{fontSize: 12, color: '#000', lineHeight: '14px' }}>баллов</Text>
            </Card>
          </Div>
        </Div>

        <Div style={{ padding: '16px', backgroundColor: '#ceaeff' }}>
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
            }}
          >
            <Text weight="1" style={{ fontSize: 14, color: '#000' }}>
              Вопросы и ответы
            </Text>
            {/* Вопрос 1 */}
            <Accordion
              expanded={openedFaq === 1}
              onChange={() => setOpenedFaq(openedFaq === 1 ? null : 1)}
            >
              <Accordion.Summary>
                <Text weight="3" style={{ fontSize: 13, color: '#000' }}>
                  как получить баллы?
                </Text>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <Text style={{ fontSize: 11, color: '#000', lineHeight: '12px' }}>
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
                <Text weight="3" style={{ fontSize: 13, color: '#000' }}>
                  где посмотреть мои награды?
                </Text>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <Text style={{ fontSize: 11, color: '#000', lineHeight: '12px' }}>
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
                <Text weight="3" style={{ fontSize: 13, color: '#000' }}>
                  как обменять баллы на подарки?
                </Text>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <Text style={{ fontSize: 11, color: '#000', lineHeight: '12px' }}>
                    Выберите подарок и следуйте инструкции по обмену баллов.
                  </Text>
                </Div>
              </Accordion.Content>
            </Accordion>

            <Separator
              style={{ margin: '0 16px 0 16px' }}
            />
          </Card>
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