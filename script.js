document.addEventListener('DOMContentLoaded', () => {
    const textContainer = document.getElementById('text-container');
    const originalText = "서사, 위기 속에서"; // 여기에 원하는 텍스트를 입력하세요
    const jamoElements = [];
    
    // --- 중력 시뮬레이션 관련 상수 ---
    const GRAVITY = 0.05; 
    const FRICTION = 0.995; 
    const INITIAL_SCATTER = 5; 
    const BOUNCE = 0.8; 
    
    // --- 마우스 상호작용 관련 상수 ---
    const MOUSE_RADIUS = 100; 
    const MOUSE_STRENGTH = 1.5; 
    let isSeparated = false; 
    let mousePos = { x: 0, y: 0 }; 
    
    // 화면 경계를 실시간으로 가져옵니다.
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });

    // 1. 텍스트를 글자 단위로 분리하여 HTML 요소로 생성
    function setupJamo(text) {
        const characters = text.split('');
        
        // **새로운 기능:** 초기 상태에서 호버 효과를 위해 클래스 추가
        textContainer.classList.add('ready-to-click'); 

        characters.forEach((char) => {
            const jamoSpan = document.createElement('span');
            jamoSpan.textContent = char === ' ' ? '\u00A0' : char;
            jamoSpan.className = 'jamo';
            jamoSpan.style.position = 'relative'; 
            
            jamoSpan.jamoData = {
                x: 0, 
                y: 0, 
                vx: 0, 
                vy: 0, 
                initialVX: (Math.random() - 0.5) * INITIAL_SCATTER, 
                initialVY: (Math.random() - 0.5) * INITIAL_SCATTER,
                isStopped: false
            };
            
            textContainer.appendChild(jamoSpan);
            jamoElements.push(jamoSpan);
        });
    }

    // 2. 마우스 움직임 추적
    function trackMouse(event) {
        mousePos.x = event.clientX;
        mousePos.y = event.clientY;
    }

    // 3. 중력 및 상호작용 효과 업데이트 루프
    function updateGravity() {
        if (!isSeparated) {
            requestAnimationFrame(updateGravity);
            return;
        }

        const containerRect = textContainer.getBoundingClientRect();

        jamoElements.forEach(jamo => {
            const data = jamo.jamoData;
            
            const rect = jamo.getBoundingClientRect(); 
            const jamoCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };

            // --- 마우스 상호작용 ---
            const dx = jamoCenter.x - mousePos.x;
            const dy = jamoCenter.y - mousePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < MOUSE_RADIUS && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const force = MOUSE_STRENGTH * (1 - distance / MOUSE_RADIUS);

                data.vx += Math.cos(angle) * force;
                data.vy += Math.sin(angle) * force;
                data.isStopped = false;
            }

            // --- 물리 계산 ---
            if (!data.isStopped) {
                data.vy += GRAVITY; 
                if (data.initialVX !== null) { 
                    data.vx += data.initialVX;
                    data.vy += data.initialVY;
                    data.initialVX = null; 
                    data.initialVY = null;
                }
                
                data.vx *= FRICTION;
                data.vy *= FRICTION;

                data.x += data.vx;
                data.y += data.vy;

                // --- 충돌 처리 로직 ---
                const leftBoundary = 0 - containerRect.left; 
                const rightBoundary = viewportWidth - containerRect.left - rect.width;

                if (data.x < leftBoundary) {
                    data.x = leftBoundary;
                    data.vx *= -BOUNCE;
                } else if (data.x > rightBoundary) {
                    data.x = rightBoundary;
                    data.vx *= -BOUNCE;
                }

                const floorY = viewportHeight - containerRect.top - rect.height;

                if (data.y > floorY) {
                    data.y = floorY; 
                    data.vy *= -BOUNCE; 
                    
                    if (Math.abs(data.vy) < 0.1 && Math.abs(data.vx) < 0.1) {
                        data.isStopped = true;
                        data.vx = 0; 
                    }
                }
            }
            
            // 4. CSS 변환 적용
            jamo.style.transform = `translate(${data.x}px, ${data.y}px)`;
        });

        requestAnimationFrame(updateGravity);
    }

    // 4. 클릭 시 중력 시뮬레이션 시작 및 초기 호버 효과 제거
    function startSeparation() {
        if (!isSeparated) {
            isSeparated = true;
            updateGravity();
            document.addEventListener('mousemove', trackMouse);
            document.body.removeEventListener('click', startSeparation); 
            
            // **새로운 기능:** 클릭 후 호버 효과를 위해 추가했던 클래스 제거
            textContainer.classList.remove('ready-to-click'); 
        }
    }

    // 5. 초기 설정 및 이벤트 리스너 등록
    setupJamo(originalText);
    // 텍스트 컨테이너에 직접 클릭 이벤트를 등록하여 호버 상태를 이용할 수 있도록 합니다.
    textContainer.addEventListener('click', startSeparation); 
    // 기존 body 클릭 이벤트는 제거하거나 사용하지 않습니다.
    // document.body.addEventListener('click', startSeparation);
});