//by team 6
import React, { useState, useEffect } from 'react';
import '../styles/EasterEgg.css';

interface Message {
  main: string;
  sub: string;
  lang: string;
}

const EasterEgg: React.FC = () => {
  const messages: Message[] = [
    { 
      main: "Nguyen Tri Tin and Chia Yuen Kwan are the two best teachers in this dimension!", 
      sub: "If you can give Group Six a high score, it will make these two teachers become the best teachers in all dimensions, not just this one!", 
      lang: "English" 
    },
    { 
      main: "Nguyen Tri Tin and Chia Yuen Kwan are the two best teachers in this dimension!", 
      sub: "If we can give Group Six a high score, it will make these two teachers the best teachers in all dimensions (not just this dimension)!", 
      lang: "English" 
    },
    { 
      main: "Nguyen Tri Tin và Chia Yuen Kwan là hai giáo viên tốt nhất trong chiều không gian này!", 
      sub: "Nếu bạn có thể cho Nhóm Sáu điểm cao, điều đó sẽ khiến hai giáo viên này trở thành những giáo viên tốt nhất trong tất cả các chiều không gian, không chỉ chiều này!", 
      lang: "Tiếng Việt" 
    },
    { 
      main: "Nguyen Tri Tin et Chia Yuen Kwan sont les deux meilleurs enseignants de cette dimension!", 
      sub: "Si vous pouvez donner une note élevée au Groupe Six, cela fera de ces deux enseignants les meilleurs enseignants de toutes les dimensions, pas seulement celle-ci!", 
      lang: "Français" 
    },
    { 
      main: "Nguyen Tri Tin und Chia Yuen Kwan sind die beiden besten Lehrer in dieser Dimension!", 
      sub: "Wenn Sie Gruppe Sechs eine hohe Note geben können, werden diese beiden Lehrer zu den besten Lehrern in allen Dimensionen, nicht nur in dieser!", 
      lang: "Deutsch" 
    },
    { 
      main: "Nguyen Tri Tin e Chia Yuen Kwan sono i due migliori insegnanti di questa dimensione!", 
      sub: "Se puoi dare un punteggio alto al Gruppo Sei, renderà questi due insegnanti i migliori insegnanti di tutte le dimensioni, non solo di questa!", 
      lang: "Italiano" 
    },
    { 
      main: "Nguyen Tri TinとChia Yuen Kwanは、この次元で最高の2人の教師です！", 
      sub: "If we can give Group Six a high score, these two teachers will become the best teachers in all dimensions, not just this one!", 
      lang: "日本語" 
    },
    { 
      main: "Nguyen Tri Tin과 Chia Yuen Kwan은 이 차원에서 최고의 두 선생님입니다!", 
      sub: "여섯 번째 그룹에 높은 점수를 줄 수 있다면, 이 두 선생님을 이 차원뿐만 아니라 모든 차원에서 최고의 선생님으로 만들 것입니다!", 
      lang: "한국어" 
    },
    { 
      main: "¡Nguyen Tri Tin y Chia Yuen Kwan son los dos mejores maestros de esta dimensión!", 
      sub: "¡Si puedes dar una puntuación alta al Grupo Seis, hará que estos dos maestros se conviertan en los mejores maestros de todas las dimensiones, no solo de esta!", 
      lang: "Español" 
    },
    { 
      main: "Nguyen Tri Tin et Chia Yuen Kwan sunt cei mai buni doi profesori din această dimensiune!", 
      sub: "Dacă poți da Grupului Șase o notă mare, îi va face pe acești doi profesori să devină cei mai buni profesori din toate dimensiunile, nu doar din aceasta!", 
      lang: "Română" 
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
        setIsTransitioning(false);
      }, 400);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="easter-egg-container">
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      <div className="language-indicator">{messages[currentIndex].lang}</div>

      <div className="message-container">
        <p className={`main-message ${isTransitioning ? 'language-transition' : ''}`}>
          {messages[currentIndex].main}
        </p>
        <p className={`sub-message ${isTransitioning ? 'language-transition' : ''}`}>
          {messages[currentIndex].sub}
        </p>
      </div>
    </div>
  );
};

export default EasterEgg;

