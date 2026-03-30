/**
 * @param {string} id - 삽입될 요소의 ID (main-header, main-footer)
 * @param {string} fileName - 불러올 파일명 (header.html, footer.html)
 */

/**
 * 헤더 / 푸터 로드
 */
 function loadComponent(id, fileName) {
    const element = document.getElementById(id);
    if (!element) return;

    const isSubPage = window.location.pathname.includes('/works/');
    const filePath = isSubPage ? `../components/${fileName}` : `./components/${fileName}`;

    fetch(filePath)
        .then(res => res.text())
        .then(data => {
            element.innerHTML = data;

            if (id === 'main-header') {
                initHeader();
            }
        })
        .catch(err => console.error(err));
}

/**
 * 헤더 인터랙션 초기화
 */
function initHeader() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = [];
    const isMainPage = !window.location.pathname.includes('/works/');

    // 1. 상세페이지 처리 (Works 고정)
    if (!isMainPage) {
        navLinks.forEach(link => {
            if (link.getAttribute('href').includes('target=works')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        return;
    }

    // 2. 섹션 데이터 수집
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href.includes('target=')) return;
        const id = href.split('target=')[1];
        const section = document.getElementById(id);
        if (section) sections.push({ link, section, id });
    });

    // 핵심 플래그: 초기 로딩이나 클릭 이동 중에는 Observer가 동작하지 않도록 차단
    let isBlockObserver = true; 

    // 3. IntersectionObserver 설정 (Works 감지 실패 해결)
    const observerOptions = {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // 화면 정중앙에 걸릴 때만 활성화
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        // 플래그가 true이면 스크롤 감지 로직 자체를 실행 안 함 (깜빡임 방지)
        if (isBlockObserver) return;

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                navLinks.forEach(l => {
                    const linkId = l.getAttribute('href').split('target=')[1];
                    l.classList.toggle('active', linkId === targetId);
                });
            }
        });
    }, observerOptions);

    sections.forEach(s => observer.observe(s.section));

    // 4. 클릭 시 이동 (번쩍임 방지 로직 강화)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href.includes('target=')) return;

            e.preventDefault();
            const id = href.split('target=')[1];
            const targetEl = document.getElementById(id);

            if (targetEl) {
                isBlockObserver = true; // 락 걸기 (중간 섹션 활성화 차단)
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active'); // 클릭한 것만 즉시 활성화

                window.scrollTo({
                    top: targetEl.offsetTop - 80, // 헤더 높이만큼 보정
                    behavior: 'smooth'
                });

                // 스크롤 종료 후 락 해제 (사용자가 다시 직접 스크롤 할 때부터 감지 시작)
                setTimeout(() => { isBlockObserver = false; }, 800);
            }
        });
    });

    // 5. [중요] 초기 로드 및 상세페이지에서 복귀 시 처리
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('target');

    // 초기 상태에서 모든 active 제거 후 시작
    navLinks.forEach(l => l.classList.remove('active'));

    if (targetId) {
        // 파라미터가 있는 경우 (상세페이지에서 클릭해서 왔을 때)
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            const match = sections.find(s => s.id === targetId);
            if (match) match.link.classList.add('active');

            // 즉시 이동 후 락 해제
            window.scrollTo({ top: targetEl.offsetTop - 80, behavior: 'auto' });
            setTimeout(() => { isBlockObserver = false; }, 500);
        }
    } else {
        // 일반 메인 진입 시: 강제로 불 켜지 말고, 락만 풀어서 Observer가 판단하게 합니다.
        setTimeout(() => { 
            isBlockObserver = false; 
        }, 100);
    }
    window.addEventListener('scroll', () => {
        // 1. 스크롤 위치가 맨 위(예: 50px 미만)일 때
        if (window.scrollY < 50) {
            // 2. 모든 메뉴의 active를 제거 (또는 첫 번째 메뉴가 Identity라면 그것도 제거)
            navLinks.forEach(l => l.classList.remove('active'));
        }
    });
}


/**
 * 실행
 */
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('main-header', 'header.html');
    loadComponent('main-footer', 'footer.html');
});



